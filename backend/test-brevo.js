import nodemailer from "nodemailer";
import "dotenv/config";

(async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // استخدم true إذا كان المنفذ 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: { rejectUnauthorized: false }
    });

    const info = await transporter.sendMail({
      from: `"SIRAJ AI" <${process.env.SMTP_USER}>`,
      to: "athmansitayeb@gmail.com", // غيّر للبريد الذي تريد الاختبار عليه
      subject: "اختبار بريد Brevo",
      text: "نجح الإرسال مع Brevo SMTP!"
    });

    console.log("تم الإرسال بنجاح:", info.messageId);
  } catch (err) {
    console.error("فشل الإرسال:", err);
  }
})();
