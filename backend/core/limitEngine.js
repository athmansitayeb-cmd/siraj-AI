// ================= LIMIT ENGINE (SIRAJ CORE v2) =================

export function buildLimitEngine({ redis, plan = "free", userId }) {
  const isGuest = typeof userId === "string" && userId.startsWith("guest_");

const CONFIG = {
  guest: {
    rpm: 60,
    daily: 30,
    maxMessageLength: 800,
    guestLimit: 15
  },
  free: {
    rpm: 30,
    daily: 120,
    maxMessageLength: 800
  },
  pro: {
    rpm: 120,
    daily: 2000,
    maxMessageLength: 2000
  }
};

  const limits = isGuest ? CONFIG.guest : (CONFIG[plan] || CONFIG.free);

  const keys = {
    rate: `rl:${userId}`,
    daily: `daily:${userId}`,
    guest: `guest_limit:${userId}`,
    last: `last:${userId}`
  };

  const safeRedis = !!redis;

  const fail = (reason, extra = {}) => ({
    ok: false,
    reason,
    ...extra
  });

  const ok = (meta = {}) => ({
    ok: true,
    ...meta
  });

  // ================= MESSAGE VALIDATION =================
  async function checkMessage(msg) {
    if (typeof msg !== "string") {
      return fail("invalid_input");
    }

    if (msg.length < 2) {
      return fail("too_short");
    }

    if (msg.length > limits.maxMessageLength) {
      return fail("message_too_long", {
        limit: limits.maxMessageLength
      });
    }

    return ok();
  }

  // ================= GUEST LIMIT =================
  async function checkGuest() {
    if (!isGuest || !safeRedis) return ok();

    const count = await redis.incr(keys.guest);

    if (count === 1) {
      await redis.expire(keys.guest, 86400);
    }

    if (count > limits.guestLimit) {
      return fail("guest_limit_reached", {
        limit: limits.guestLimit,
        current: count
      });
    }

    return ok({ current: count });
  }

  // ================= RATE LIMIT =================
  async function checkRate() {
    if (!safeRedis) return ok();

    const count = await redis.incr(keys.rate);

    if (count === 1) {
      await redis.expire(keys.rate, 60);
    }

    if (count > limits.rpm) {
      return fail("rate_limited", {
        limit: limits.rpm,
        current: count
      });
    }

    return ok({ current: count });
  }

  // ================= DAILY LIMIT =================
  async function checkDaily() {
    if (!safeRedis) return ok();

    const count = await redis.incr(keys.daily);

    if (count === 1) {
      await redis.expire(keys.daily, 60 * 60 * 24);
    }

    if (count > limits.daily) {
      return fail("daily_limit_reached", {
        limit: limits.daily,
        current: count
      });
    }

    return ok({ current: count });
  }

  // ================= MASTER RUN =================
  async function run(msg) {
    const m = await checkMessage(msg);
    if (!m.ok) return m;

    const g = await checkGuest();
    if (!g.ok) return g;

    const r = await checkRate();
    if (!r.ok) return r;

    const d = await checkDaily();
    if (!d.ok) return d;

    return ok({
      limits,
      meta: {
        rpm: limits.rpm,
        daily: limits.daily
      }
    });
  }

  return {
    run,
    checkMessage,
    checkGuest,
    checkRate,
    checkDaily
  };
}
