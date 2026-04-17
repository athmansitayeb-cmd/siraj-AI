import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getUserPlan } from "../core/entitlements.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // ===== AUTH =====
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "unauthorized" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "invalid token" });
    }

    const userId = decoded.id;

    // ===== USER =====
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "not found" });
    }

    // ===== PLAN =====
    const plan = await getUserPlan(userId, req.app.locals.redis);
    // ===== RESPONSE =====
    return res.json({
      user: {
        id: user._id,
        email: user.email,
        plan
      }
    });

  } catch (e) {
    console.error("[DASHBOARD ERROR]", e);
    res.status(500).json({ error: "failed" });
  }
});

export default router;
