import express from "express";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import User from "../models/User.js";
import { invalidateUserPlanCache } from "../core/entitlements.js";
import { PLANS } from "../core/pricing.js";
import { getPayPalAccessToken } from "../core/paypalAuth.js";

const router = express.Router();

const BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/**
 * CREATE SUBSCRIPTION
 */
router.post("/create", async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("PLAN:", req.body.plan);
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { plan } = req.body;
    const selected = PLANS[plan];

    if (!selected?.paypalPlanId) {
      return res.status(400).json({ error: "invalid_plan" });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${BASE_URL}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        plan_id: selected.paypalPlanId,
        custom_id: decoded.id,
        application_context: {
          brand_name: "SIRAJ AI",
          user_action: "SUBSCRIBE_NOW",
          return_url: "https://siraj.software/dashboard?success=1",
          cancel_url: "https://siraj.software/upgrade"
        }
      }),
    });

    const data = await response.json();

    console.log("SUB CREATED FULL:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("[PAYPAL SUB ERROR]", data);
      return res.status(500).json({ error: "subscription_failed" });
    }

    const approveLink = data.links?.find(l => l.rel === "approve")?.href;

    // نخزن subscription ID فقط
    await User.findByIdAndUpdate(decoded.id, {
      paypalSubscriptionId: data.id,
      plan: "pending"
    });

    return res.json({
      subscriptionId: data.id,
      approveLink
    });

  } catch (err) {
    console.error("[SUB EXCEPTION]", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

/**
 * CANCEL SUBSCRIPTION
 */
router.post("/cancel", async (req, res) => {
  console.log("🔥 CANCEL HIT");

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    // ✅ الحالة الجديدة: لا يوجد اشتراك
    if (!user?.paypalSubscriptionId) {
      await User.findByIdAndUpdate(decoded.id, {
        plan: "free",
        subscriptionStatus: "cancelled"
      });

      return res.json({
        ok: true,
        message: "already_cancelled_or_no_subscription"
      });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${BASE_URL}/v1/billing/subscriptions/${user.paypalSubscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          reason: "user_request"
        })
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return res.status(500).json({
        error: "cancel_failed",
        details: text
      });
    }

    await setUserPlan(decoded.id, "free", req.app.locals.redis);

    await User.findByIdAndUpdate(decoded.id, {
      plan: "free",
      subscriptionStatus: "cancelled",
      paypalSubscriptionId: null
    });

    return res.json({ ok: true });

  } catch (err) {
    console.error("[CANCEL ERROR]", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;
