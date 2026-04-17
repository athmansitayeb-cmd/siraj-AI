import MainLayout from "../layout/MainLayout";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [daily, setDaily] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= LOAD USER =================
  const loadUser = () => {
    api.get("/dashboard")
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };

  // ================= LOAD DAILY VERSE =================
  const loadDaily = () => {
    fetch("https://siraj.software/api/daily-verse")
      .then(r => r.json())
      .then(setDaily)
      .catch(() => setDaily(null));
  };

  useEffect(() => {
    loadUser();
    loadDaily();
  }, []);

  return (
    <MainLayout>
      <div className="min-h-[90vh] flex flex-col items-center justify-center bg-black text-yellow-400 px-4">

        {/* ================= TITLE ================= */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold">
            سِراج
          </h1>

          <p className="text-gray-400 mt-2">
            لست هنا لتضييع الوقت…
          </p>
        </motion.div>

        {/* ================= DAILY VERSE ================= */}
        {daily && (
          <motion.div
            className="max-w-xl w-full bg-black/60 border border-yellow-400 rounded-2xl p-6 text-center shadow-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-gray-400 text-sm mb-2">
              آية اليوم
            </div>

            <div className="text-xl font-bold leading-loose text-yellow-300">
              {daily.verse}
            </div>

            <div className="mt-4 text-gray-300 leading-relaxed">
              {daily.tafsir}
            </div>

            <div className="mt-6 text-yellow-400 font-bold text-lg">
              {daily.message}
            </div>
          </motion.div>
        )}

{user?.plan !== "pro" && (
  <div className="mt-6 text-sm text-gray-500 leading-loose border-t border-white/10 pt-4">
    هذا التوجيه لك اليوم فقط…  
    لكنك بدون متابعة، ستعود لنفس الدائرة.

    <br /><br />

    <a href="/upgrade" className="text-yellow-400 underline">
      فعّل المتابعة المستمرة
    </a>
  </div>
)}

        {/* ================= USER STATE ================= */}
        {!loading && user && (
          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-gray-400 text-sm">
              حالتك الآن
            </div>

            <div className="mt-2 text-white">
              {user.plan === "pro"
          ? "في طريق ثابت 👍"
          : "ما زلت تحاول… بدون نظام واضح"}
            </div>
          </motion.div>
        )}

        {/* ================= ACTION ================= */}
        <motion.div
          className="mt-12 flex gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <a href="/chat">
            <button className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-bold hover:scale-105 transition">
              ادخل إلى سِراج
            </button>
          </a>
        </motion.div>

      </div>
    </MainLayout>
  );
}
