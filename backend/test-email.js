import 'dotenv/config';
import nodemailer from 'nodemailer';

(async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { family: 4 },
    });

    const testEmail = process.env.SMTP_USER; // يمكنك تغييره لأي بريد تختبر عليه
    const frontendURL = process.env.FRONTEND_URL || 'https://siraj.software';
    const resetLink = `${frontendURL}/reset-password/test-token`;

    const info = await transporter.sendMail({
      from: `"SIRAJ AI" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: "اختبار إرسال البريد - SIRAJ AI",
      html: `
        <h2>اختبار البريد</h2>
        <p>هذا اختبار لإرسال البريد من السيرفر.</p>
        <a href="${resetLink}">رابط إعادة تعيين (اختبار)</a>
      `,
    });

    console.log("تم الإرسال بنجاح:", info.messageId);
    process.exit(0);
  } catch (err) {
    console.error("فشل الإرسال:", err);
    process.exit(1);
  }
})();
