import fetch from "node-fetch";
import User from "../models/User.js";
import { setUserPlan } from "./entitlements.js";
import { getPayPalAccessToken } from "./paypalAuth.js";

const BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/**
 * 🔥 VERIFY SUBSCRIPTION EXISTS IN PAYPAL
 */
export async function getSubscription(subscriptionId) {
  const token = await getPayPalAccessToken();

  const res = await fetch(
    `${BASE_URL}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  return { ok: res.ok, data };
}

/**
 * 🔥 SYNC USER FROM PAYPAL (single source of truth)
 */
export async function syncUserFromPayPal(userId) {
  const user = await User.findById(userId);
  if (!user?.paypalSubscriptionId) return null;

  const sub = await getSubscription(user.paypalSubscriptionId);

  if (!sub.ok) {
    await User.findByIdAndUpdate(userId, {
      plan: "free",
      subscriptionStatus: "invalid"
    });

    return null;
  }

  const status = sub.data.status;

  let plan = "free";

  if (status === "ACTIVE") plan = "pro";

  await setUserPlan(userId, plan);

  await User.findByIdAndUpdate(userId, {
    subscriptionStatus: status.toLowerCase()
  });

  return sub.data;
}
