import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="h-screen w-full bg-black text-yellow-400 flex flex-col items-center justify-center relative overflow-hidden">

      {/* Glow background */}
      <div className="absolute w-[600px] h-[600px] bg-yellow-500/10 blur-[120px] rounded-full" />

      {/* Title */}
      <motion.h1
        className="text-6xl md:text-7xl font-extrabold text-center z-10"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        SIRAJ ULTRA AI
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-gray-300 mt-6 text-center max-w-xl z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        A next-generation artificial intelligence system designed to amplify thinking,
        accelerate creation, and automate intelligence workflows.
      </motion.p>

      {/* Features */}
      <motion.div
        className="flex gap-6 mt-10 text-sm text-yellow-200 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span>⚡ Fast AI Engine</span>
        <span>🧠 Smart Memory</span>
        <span>🔐 Secure System</span>
      </motion.div>

      {/* CTA */}
      <motion.div
        className="flex gap-6 mt-12 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >

        <Link to="/login">
          <button className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-bold hover:scale-105 transition">
            Login
          </button>
        </Link>

        <Link to="/register">
          <button className="px-6 py-3 border border-yellow-400 text-yellow-400 rounded-xl font-bold hover:bg-yellow-400 hover:text-black transition">
            Create Account
          </button>
        </Link>

      </motion.div>

      {/* Footer mini */}
      <p className="absolute bottom-6 text-xs text-gray-500">
        SIRAJ SYSTEM · v1.0
      </p>

    </div>
  );
}
