import { randomUUID } from "node:crypto";
import express from "express";
import Workspace from "../models/Workspace.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  async (req, res) => {
    try {
      const workspaces = await Workspace.find({
        userId: req.user.id
      }).sort({ createdAt: -1 });

      res.json(workspaces);

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "failed_to_load_workspaces"
      });
    }
  }
);


// CREATE

router.post("/create", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const intent = req.body?.intent;

    if (!intent) {
      return res.status(400).json({ error: "missing_intent" });
    }

    // 🔥 مهم: منع التكرار
    const existing = await Workspace.findOne({
      userId,
      intent,
      state: "active"
    }).sort({ createdAt: -1 });

if (existing) {
  const now = Date.now();
  const last = existing.lastSessionAt?.getTime?.() || 0;

  const DUPLICATE_WINDOW = 60 * 1000; // 60 ثانية

  if (now - last < DUPLICATE_WINDOW) {

    return res.json({
      _id: existing._id,
      conversationId: existing.conversationId,
      intent: existing.intent,
      version: existing.version
    });
  }

  existing.lastSessionAt = new Date();
  existing.version += 1;
  await existing.save();

  return res.json({
    _id: existing._id,
    conversationId: existing.conversationId,
    intent: existing.intent,
    version: existing.version
  });
}

const conversationId = randomUUID();

const slug = intent
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const workspace = await Workspace.create({
  userId,
  intent,
  conversationId,
  state: "active",
  funnelState: "workspace_created",
  version: 1,
  lastSessionAt: new Date(),

  seo: {
    indexable: true,
    slug,
    title: `Workspace - ${intent}`,
    description: `AI workspace for ${intent}`
  }
});

    return res.json({
      _id: workspace._id,
      conversationId: workspace.conversationId,
      intent: workspace.intent
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "workspace_create_failed" });
  }
});

// GET
router.get(
  "/:id",
  verifyToken,
  async (req, res) => {
    try {

      const workspace =
        await Workspace.findById(req.params.id);

      if (!workspace) {
        return res.status(404).json({
          error: "workspace_not_found"
        });
      }

      if (
        workspace.userId.toString() !==
        req.user.id
      ) {
        return res.status(403).json({
          error: "forbidden"
        });
      }

      res.json(workspace);

    } catch {

      res.status(500).json({
        error: "workspace_fetch_failed"
      });

    }
  }
);

export default router;
