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
router.post(
  "/create",
  verifyToken,
  async (req, res) => {
    try {

      const userId = req.user.id;
const intent = req.body?.intent;

if (!intent) {
  return res.status(400).json({
    error: "missing_intent"
  });
}

      const workspace = await Workspace.create({
        userId,
        intent,
        funnelState: "workspace_created"
      });

      res.json(workspace);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: "workspace_create_failed"
      });

    }
  }
);

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
