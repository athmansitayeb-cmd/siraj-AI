import User from "../models/User.js";

/**
 * 🔥 GET PLAN (DB + Redis cache صحيح)
 */
export async function getUserPlan(userId, redis) {
  try {

    // ================= GLOBAL GUARD =================
    if (!userId || typeof userId !== "string") {
      return "free";
    }

    // guest / socket users
    if (userId.startsWith("guest_")) {
      return "free";
    }

    // invalid ObjectId protection
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return "free";
    }

    let cached = null;

    if (redis) {
      cached = await redis.get(`plan:${userId}`);
      if (cached) return cached;
    }

    const user = await User.findById(userId).select("plan subscriptionStatus");

    let plan = user?.plan || "free";

    if (user?.subscriptionStatus === "cancelled") {
      plan = "free";
    }

    if (redis) {
      await redis.set(`plan:${userId}`, plan);
    }

    return plan;

  } catch (err) {
    console.error("[GET PLAN ERROR]", err);
    return "free";
  }
}

/**
 * 🔥 SET PLAN (clean write-through)
 */
export async function setUserPlan(userId, plan, redis) {
  try {
    await User.findByIdAndUpdate(userId, {
      plan,
      updatedAt: new Date()
    });

    if (redis) {
      await redis.set(`plan:${userId}`, plan);
    }

    console.log("[PLAN UPDATED]", { userId, plan });

  } catch (err) {
    console.error("[SET PLAN ERROR]", err);
  }
}

/**
 * 🧨 FORCE INVALIDATION
 */
export async function invalidateUserPlanCache(userId, redis) {
  try {
    if (redis) {
      await redis.del(`plan:${userId}`);
    }
  } catch (err) {
    console.error("[CACHE INVALIDATION ERROR]", err);
  }
}
