import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <>
      <div className="relative min-h-screen bg-[#07111F] text-white overflow-hidden">

        {/* Background glow */}
        <div className="absolute inset-0">
          <div className="absolute w-[600px] h-[600px] bg-yellow-400/10 blur-[160px] rounded-full top-[-200px] left-[-200px]" />
          <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-[180px] rounded-full bottom-[-200px] right-[-200px]" />
        </div>

        {/* NAV */}

        {/* HERO */}
        <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold leading-tight max-w-4xl"
          >
            Build intelligent systems with{" "}
            <span className="text-yellow-400">SIRAJ AI</span>
          </motion.h1>

          <p className="mt-6 text-gray-400 max-w-2xl text-lg">
            A modern AI automation platform designed to think, execute, and scale workflows intelligently across your applications.
          </p>

          {/* CTA */}
          <div className="mt-10 flex gap-4">
            <Link
              to="/try"
              className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:scale-105 transition"
            >
              Start Free
            </Link>

            <Link
              to="/features"
              className="px-6 py-3 border border-white/20 rounded-xl hover:bg-white/10 transition"
            >
              View Features
            </Link>
          </div>

          {/* TRUST LINE */}
          <p className="mt-8 text-xs text-gray-600">
            Trusted by developers building AI workflows & automation systems
          </p>

          {/* DEMO BOX */}
          <div className="mt-16 w-full max-w-4xl">
            <div className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur">

              <div className="text-left text-sm text-gray-400 mb-3">
                Live AI Preview
              </div>

              <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
                AI Demo Interface (Coming Soon)
              </div>

            </div>
          </div>

          {/* FEATURES GRID */}
          <div className="mt-20 grid md:grid-cols-3 gap-6 max-w-5xl w-full">

            <div className="border border-white/10 p-6 rounded-xl bg-white/5">
              <h3 className="text-white font-semibold mb-2">AI Automation</h3>
              <p className="text-gray-400 text-sm">
                Automate workflows and reduce manual operations using intelligent agents.
              </p>
            </div>

            <div className="border border-white/10 p-6 rounded-xl bg-white/5">
              <h3 className="text-white font-semibold mb-2">Smart Reasoning</h3>
              <p className="text-gray-400 text-sm">
                Context-aware AI that understands user intent and adapts dynamically.
              </p>
            </div>

            <div className="border border-white/10 p-6 rounded-xl bg-white/5">
              <h3 className="text-white font-semibold mb-2">API Ready</h3>
              <p className="text-gray-400 text-sm">
                Easily integrate SIRAJ into your apps, dashboards, and backend systems.
              </p>
            </div>

          </div>

        </main>

        {/* FOOTER */}
        <footer className="relative z-10 mt-24 text-center text-xs text-gray-600 py-8 border-t border-white/10">
          © {new Date().getFullYear()} SIRAJ AI — Built for intelligent automation
        </footer>

      </div>
    </>
  );
}
