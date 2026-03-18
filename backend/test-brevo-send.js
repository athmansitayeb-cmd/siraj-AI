import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function testEmail() {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  let info = await transporter.sendMail({
    from: `"Test Siraj" <${process.env.SMTP_USER}>`,
    to: "athman.sitayeb@gmail.com", // ضع بريدك للتجربة
    subject: "اختبار SMTP Brevo",
    text: "هذه رسالة اختبارية من السيرفر لتأكيد عمل SMTP."
  });

  console.log("Message sent: %s", info.messageId);
}

testEmail().catch(console.error);
