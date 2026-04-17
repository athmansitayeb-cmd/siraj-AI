import express from "express";
import User from "../models/User.js";
import { setUserPlan, invalidateUserPlanCache } from "../core/entitlements.js";
import { getPayPalAccessToken } from "../core/paypalAuth.js";
import fetch from "node-fetch";

const router = express.Router();

const BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/**
 * 🔥 VERIFY PAYPAL SIGNATURE
 */
async function verifyWebhook(req, eventBody) {
  try {
    const accessToken = await getPayPalAccessToken();

    const payload = {
      auth_algo: req.headers["paypal-auth-algo"],
      cert_url: req.headers["paypal-cert-url"],
      transmission_id: req.headers["paypal-transmission-id"],
      transmission_sig: req.headers["paypal-transmission-sig"],
      transmission_time: req.headers["paypal-transmission-time"],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: eventBody
    };

    const res = await fetch(
      `${BASE_URL}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();

    console.log("[WEBHOOK VERIFY]", data.verification_status);

    return data.verification_status === "SUCCESS";
  } catch (err) {
    console.error("[VERIFY ERROR]", err);
    return false;
  }
}

/**
 * 🔥 FIND USER
 */
async function findUser(subscriptionId, resource) {
  // 1. أفضل حالة
  if (resource?.custom_id) {
    return await User.findById(resource.custom_id);
  }

  // 2. fallback
  if (subscriptionId) {
    const user = await User.findOne({
      paypalSubscriptionId: subscriptionId
    });

    if (user) return user;
  }

  console.warn("[FIND USER FAIL]", {
    subscriptionId,
    resource
  });

  return null;
}

/**
 * 🚀 WEBHOOK MAIN
 */
router.post("/webhook", express.raw({ type: "*/*" }), async (req, res) => {
  try {
    console.log("🔥 WEBHOOK HIT");

    const event =
      req.body instanceof Buffer
        ? JSON.parse(req.body.toString("utf8"))
        : req.body;

    if (!event?.id || !event?.event_type) {
      return res.sendStatus(400);
    }

    console.log("[PAYPAL EVENT]", event.event_type);
    console.log("FULL EVENT:", JSON.stringify(event, null, 2));

    const resource = event.resource || {};

    const subscriptionId =
      resource?.id ||
      resource?.billing_agreement_id ||
      resource?.subscription_id;

    const verified = await verifyWebhook(req, event);

    if (!verified) {
      console.warn("[WEBHOOK REJECTED]");
      return res.sendStatus(401);
    }

    const user = await findUser(subscriptionId, resource);

    if (!user) {
      console.warn("[WEBHOOK] user not found");
      return res.sendStatus(200);
    }

    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await setUserPlan(user._id, "pro", req.app.locals.redis);
        await invalidateUserPlanCache(user._id, req.app.locals.redis);

        await User.findByIdAndUpdate(user._id, {
          subscriptionStatus: "active",
          paypalSubscriptionId: subscriptionId
        });

        console.log("[PLAN -> PRO]", user._id);
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
        await setUserPlan(user._id, "free", req.app.locals.redis);
        await invalidateUserPlanCache(user._id, req.app.locals.redis);

        await User.findByIdAndUpdate(user._id, {
          subscriptionStatus: "cancelled"
        });

        console.log("[PLAN -> FREE]", user._id);
        break;

      default:
        console.log("[IGNORED EVENT]", event.event_type);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("[WEBHOOK ERROR]", err);
    return res.sendStatus(500);
  }
});

export default router;
