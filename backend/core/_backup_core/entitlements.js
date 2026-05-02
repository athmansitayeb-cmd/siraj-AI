import User from "../models/User.js";

/**
 * 🔥 GET PLAN (DB + Redis cache صحيح)
 */
export async function getUserPlan(userId, redis) {
  try {
    let cached = null;

    // 1. Redis cache
    if (redis) {
      cached = await redis.get(`plan:${userId}`);
      if (cached) return cached;
    }

    // 2. DB source of truth
    const user = await User.findById(userId).select("plan subscriptionStatus");

    let plan = user?.plan || "free";

    // override لو الاشتراك ملغى
    if (user?.subscriptionStatus === "cancelled") {
      plan = "free";
    }

    // 3. cache result
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
 * 🧨 FORCE INVALIDATION (جديد مهم)
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
