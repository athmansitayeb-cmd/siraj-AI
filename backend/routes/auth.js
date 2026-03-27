import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import fetch from "node-fetch";
import "dotenv/config";

const router = express.Router();

/* ============================
   1. Register
============================ */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: "جميع الحقول مطلوبة" });

    const existing = await User.findOne({ email });

    if (existing)
      return res.status(400).json({ msg: "البريد مسجل مسبقاً" });

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "خطأ في السيرفر" });
  }
});

/* ============================
   2. Login
============================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "جميع الحقول مطلوبة" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ msg: "البريد غير موجود" });

    const isMatch = await user.comparePassword(password);

    if (!isMatch)
      return res.status(401).json({ msg: "كلمة المرور خاطئة" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "خطأ في السيرفر" });
  }
});

/* ============================
   3. Forgot Password
============================ */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ msg: "البريد مطلوب" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ msg: "البريد غير موجود" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const htmlContent = `
<html>
  <body>
    <h2>Password Reset Request</h2>
    <p>Click below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>This link expires in 15 minutes.</p>
  </body>
</html>
`;

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: "SIRAJ AI", email: "no-reply@siraj.software" },
        to: [{ email: user.email, name: user.name }],
        subject: "Reset Password - SIRAJ AI",
        htmlContent
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo API error:", errorText);
      return res.status(500).json({ msg: "فشل إرسال البريد" });
    }

    res.json({ msg: "تم إرسال رابط إعادة التعيين" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "خطأ في السيرفر" });
  }
});

/* ============================
   4. Reset Password
============================ */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ msg: "كلمة المرور مطلوبة" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(404).json({ msg: "المستخدم غير موجود" });

    user.password = password;
    await user.save();

    res.json({ msg: "تم تحديث كلمة المرور بنجاح" });

  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "الرابط غير صالح أو منتهي" });
  }
});

export default router;
