import User from "../models/User.js";
import { syncUserFromPayPal } from "./paypalBilling.js";

export async function reconcileAllUsers() {
  const users = await User.find({
    paypalSubscriptionId: { $ne: null }
  });

  for (const u of users) {
    await syncUserFromPayPal(u._id.toString());
  }

  console.log("[RECONCILE DONE]");
}
