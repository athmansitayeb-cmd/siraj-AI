import { buildPaywall } from "../core/paywall.js";
import { isPro } from "../core/paywall.js";

export function checkPlan(req, res, next) {
  const user = req.user;

  if (isPro(user)) return next();

  return res.status(403).json(
    buildPaywall("rate_limited", {
      userId: user._id
    })
  );
}
