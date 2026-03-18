import SibApiV3Sdk from "sib-api-v3-sdk";
import "dotenv/config";

(async () => {
  try {
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      sender: { name: "SIRAJ AI", email: "a1e7b3001@smtp-brevo.com" },
      to: [{ email: "athmansitayeb@gmail.com", name: "Athman" }],
      subject: "اختبار البريد عبر Brevo API",
      textContent: "نجح الإرسال عبر Brevo API!"
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("تم الإرسال بنجاح:", data);
  } catch (err) {
    console.error("فشل الإرسال عبر API:", err);
  }
})();

