import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

export const sendEmail = async ({ to, subject, htmlContent }) => {
  const url = "https://api.brevo.com/v3/smtp/email";

  const body = {
    sender: { name: "SIRAJ", email: process.env.SMTP_USER },
    to: [{ email: to }],
    subject,
    htmlContent
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Brevo API error: ${res.status} ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
    return null;
  }
};
