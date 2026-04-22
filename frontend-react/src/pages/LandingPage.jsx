import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="h-screen w-full bg-black text-yellow-400 relative overflow-hidden flex items-center justify-center px-6">

      {/* Soft ambient background (very subtle) */}
      <motion.div
        className="absolute w-[700px] h-[700px] bg-yellow-500/10 blur-[160px] rounded-full"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* LOGO = PRIMARY FOCUS (only moving element) */}
      <motion.div
        className="absolute flex items-center justify-center pointer-events-none select-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0.08, 0.14, 0.08],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <img
          src="/logo.svg"
          alt="SIRAJ"
          className="w-[520px] h-[520px] siraj-core"
        />
      </motion.div>

      {/* CONTENT */}
      <div className="relative z-10 text-center flex flex-col items-center max-w-3xl">

        {/* Title */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold leading-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-yellow-400">سِراج</span>
          <br />
          <span className="text-white text-2xl md:text-3xl font-light">
            نورٌ يوقظك… لتعود إلى الله عن بصيرة
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-gray-300 mt-6 leading-loose text-sm md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          ليس تطبيقًا عاديًا…  
          بل مرآة تكشف حقيقتك،  
          وتذكير يعيدك حين تغفل،  
          وصوت يضعك أمام نفسك بلا تزييف.
        </motion.p>

        {/* Features */}
        <motion.div
          className="flex flex-col md:flex-row gap-6 mt-8 text-sm text-yellow-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span>⏳ يوقظك حين تغفل</span>
          <span>⚖️ يجعلك تواجه نفسك</span>
          <span>📖 طريقه واضح أساسه القرآن</span>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="flex gap-4 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link to="/login">
            <button className="px-7 py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:scale-105 transition">
              تسجيل الدخول
            </button>
          </Link>

          <Link to="/register">
            <button className="px-7 py-3 border border-yellow-400 text-yellow-400 rounded-xl font-semibold hover:bg-yellow-400 hover:text-black transition">
              إنشاء حساب
            </button>
          </Link>
        </motion.div>

        {/* Footer */}
        <p className="absolute bottom-6 text-xs text-gray-500">
          سِراج · نظام يوقظك لتعود
        </p>

      </div>
    </div>
  );
}
