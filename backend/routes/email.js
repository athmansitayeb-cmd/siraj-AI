// routes/email.js
import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/send", async (req, res) => {
  const { to, subject, htmlContent } = req.body;

  if (!to || !subject || !htmlContent) {
    return res.status(400).json({ msg: "الحقول مطلوبة" });
  }

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "SIRAJ", email: process.env.SMTP_USER },
        to: [{ email: to }],
        subject,
        htmlContent
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ msg: "✅ Email sent via API", data: response.data });
  } catch (err) {
    console.error("BREVO API ERROR:", err.response?.data || err.message);
    res.status(500).json({ msg: "خطأ في إرسال البريد عبر API" });
  }
});

export default router;
