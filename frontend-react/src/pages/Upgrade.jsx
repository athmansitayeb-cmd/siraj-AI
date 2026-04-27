import MainLayout from "../layout/MainLayout";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Upgrade() {
  const [loading, setLoading] = useState(false);

  const upgrade = async (plan) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("siraj_token");

      const res = await fetch(
        "https://siraj.software/api/paypal/subscription/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify({ plan })
        }
      );

      const data = await res.json();

      if (data.approveLink) {
        window.location.href = data.approveLink;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

        {/* TITLE */}
        <motion.div
          className="text-center max-w-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-yellow-400">
            Upgrade to PRO
          </h1>

          <p className="mt-4 text-gray-400">
            Unlock continuous guidance, memory, and deeper contextual understanding.
          </p>
        </motion.div>

        {/* CARDS */}
        <motion.div
          className="mt-10 grid md:grid-cols-2 gap-6 max-w-3xl w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >

          {/* FREE */}
          <div className="border border-white/10 rounded-2xl p-6">
            <h2 className="text-gray-400 mb-4">Free Plan</h2>

            <ul className="text-sm text-gray-500 space-y-2">
              <li>Basic chat access</li>
              <li>Limited context memory</li>
              <li>No long-term tracking</li>
            </ul>
          </div>

          {/* PRO */}
          <div className="border border-yellow-400 rounded-2xl p-6 bg-yellow-400/5">
            <h2 className="text-yellow-400 mb-4 font-bold">PRO Plan</h2>

            <ul className="text-sm text-yellow-200 space-y-2">
              <li>Persistent memory</li>
              <li>Adaptive guidance system</li>
              <li>Deeper contextual reasoning</li>
            </ul>
          </div>

        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-10 flex gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={() => upgrade("pro_monthly")}
            disabled={loading}
            className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-bold"
          >
            Monthly $5
          </button>

          <button
            onClick={() => upgrade("pro_yearly")}
            disabled={loading}
            className="px-6 py-3 border border-yellow-400 text-yellow-400 rounded-xl"
          >
            Yearly $40
          </button>
        </motion.div>

        {/* SOFT NOTE */}
        <p className="mt-10 text-xs text-gray-600 text-center max-w-md">
          PRO is designed for users who want structured guidance and continuity, not just isolated answers.
        </p>

      </div>
    </MainLayout>
  );
}
