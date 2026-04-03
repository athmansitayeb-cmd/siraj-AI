import axios from "axios";

export const sendEmail = async ({ to, subject, htmlContent }) => {
  try {
    console.log("BREVO KEY LOADED:", !!process.env.BREVO_API_KEY);

    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "SIRAJ",
          email: "no-reply@siraj.software"
        },
        to: [
          {
            email: to
          }
        ],
        subject,
        htmlContent
      },
      {
        headers: {
          "api-key": String(process.env.BREVO_API_KEY).trim(),
          "Content-Type": "application/json"
        }
      }
    );

    return res.data;
  } catch (err) {
    console.error("EMAIL_ERROR:", err.response?.data || err.message);
    return null;
  }
};
