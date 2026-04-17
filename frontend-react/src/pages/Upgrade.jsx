import MainLayout from "../layout/MainLayout";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Upgrade() {
  const [loading, setLoading] = useState(false);

  const upgrade = async (plan = "pro_monthly") => {
    try {
      setLoading(true);

      const token = localStorage.getItem("siraj_token");

      const res = await fetch("https://siraj.software/api/paypal/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ plan })
      });

      const data = await res.json();

      if (data.approveLink) {
        window.location.href = data.approveLink;
      } else {
        console.error(data);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[90vh] flex flex-col items-center justify-center bg-black text-yellow-400 px-4">

        {/* ================= TITLE ================= */}
        <motion.div
          className="text-center mb-10 max-w-xl"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold">
            هل تريد أن تبقى كما أنت؟
          </h1>

          <p className="text-gray-400 mt-4 leading-loose">
            سِراج في الوضع المجاني يعطيك التذكير…  
            لكن بدون متابعة، بدون عمق، وبدون التزام حقيقي.
          </p>
        </motion.div>

        {/* ================= COMPARISON ================= */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 max-w-3xl w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >

          {/* FREE */}
          <div className="border border-gray-700 rounded-2xl p-6 text-center">
            <h2 className="text-xl mb-4 text-gray-400">الخطة المجانية</h2>

            <ul className="space-y-3 text-sm text-gray-400">
              <li>⚠️ استخدام محدود</li>
              <li>⚠️ بدون ذاكرة متقدمة</li>
              <li>⚠️ بدون متابعة حقيقية</li>
              <li>⚠️ نتائج سطحية</li>
            </ul>
          </div>

          {/* PRO */}
          <div className="border-2 border-yellow-400 rounded-2xl p-6 text-center bg-yellow-400/5">
            <h2 className="text-xl mb-4 text-yellow-300 font-bold">سِراج PRO</h2>

            <ul className="space-y-3 text-sm text-yellow-200">
              <li>✔️ متابعة مستمرة لك</li>
              <li>✔️ ذاكرة تفهمك وتتطور معك</li>
              <li>✔️ توجيه أعمق حسب حالتك</li>
              <li>✔️ تجربة حقيقية وليست سطحية</li>
            </ul>
          </div>

        </motion.div>

        {/* ================= CTA ================= */}
        <motion.div
          className="mt-10 flex flex-col md:flex-row gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >

          <button
            onClick={() => upgrade("pro_monthly")}
            disabled={loading}
            className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-bold hover:scale-105 transition"
          >
            اشتراك شهري — $5
          </button>

          <button
            onClick={() => upgrade("pro_yearly")}
            disabled={loading}
            className="px-6 py-3 border border-yellow-400 rounded-xl font-bold hover:bg-yellow-400 hover:text-black transition"
          >
            اشتراك سنوي — $40
          </button>

        </motion.div>

        {/* ================= PSYCHOLOGICAL HOOK ================= */}
        <motion.div
          className="mt-10 text-center text-gray-500 text-sm max-w-md leading-loose"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          القرار ليس في السعر…  
          القرار: هل ستبقى تدور في نفس المكان…  
          أم تبدأ فعلاً؟
        </motion.div>

      </div>
    </MainLayout>
  );
}
