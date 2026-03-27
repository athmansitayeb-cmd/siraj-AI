// testForgotPassword.js
import axios from "axios";

const BASE_URL = "https://siraj.software";
const TEST_EMAIL = "athmansitayeb@gmail.com"; // غيره لبريد موجود
const NEW_PASSWORD = "athmane0671228275";

async function testForgotPassword() {
  try {
    console.log("1️⃣ إرسال طلب إعادة التعيين...");
    const forgotRes = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
      email: TEST_EMAIL
    });
    console.log("Response:", forgotRes.data);

    // انتظر قليلاً ليصلك البريد الإلكتروني، أو ضع رابط البريد هنا مباشرة
    const resetLink = await getResetLinkFromEmail(); // دالة افتراضية

    if (!resetLink) {
      console.error("❌ لم يتم الحصول على الرابط من البريد");
      return;
    }

    console.log("2️⃣ استخدام رابط إعادة التعيين:", resetLink);

    const token = resetLink.split("/reset-password/")[1];

    console.log("3️⃣ تحديث كلمة المرور...");
    const resetRes = await axios.post(`${BASE_URL}/api/auth/reset-password/${token}`, {
      password: NEW_PASSWORD
    });
    console.log("Response:", resetRes.data);

    console.log("✅ تم اختبار ميزة Forgot Password بنجاح!");
  } catch (err) {
    console.error("❌ خطأ:", err.response?.data || err.message);
  }
}

// دالة وهمية لالتقاط رابط البريد (يمكن تعديلها حسب طريقة استلامك للبريد)
async function getResetLinkFromEmail() {
  // طريقة بسيطة: ضع الرابط هنا مباشرة أثناء الاختبار
  return "https://siraj.software/reset-password/ضع_التوكن_هنا";
}

testForgotPassword();
