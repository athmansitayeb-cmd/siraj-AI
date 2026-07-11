
import express from "express";

const router = express.Router();

router.post("/login", async (req, res) => {

  const {
    email,
    password
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "missing_fields"
    });
  }

  // fake auth
  return res.json({
    ok: true,
    token: "demo_token"
  });

});

export default router;
