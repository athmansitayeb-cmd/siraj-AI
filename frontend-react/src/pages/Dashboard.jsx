import MainLayout from "../layout/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/dashboard")
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const isPro = user?.plan === "pro";

  return (
    <MainLayout>
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

        {/* TITLE */}
        <h1 className="text-4xl font-bold text-yellow-400">SIRAJ</h1>

        {/* STATUS */}
        <p className="mt-4 text-gray-400 text-center">
          {isPro ? "Pro Mode Active" : "Free Mode"}
        </p>

        {/* ACTIONS */}
        <div className="mt-8 flex gap-3">
          <Link
            to="/chat"
            className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-bold"
          >
            Open AI
          </Link>

          {!isPro && (
            <Link
              to="/upgrade"
              className="px-6 py-3 border border-yellow-400 text-yellow-400 rounded-xl"
            >
              Upgrade
            </Link>
          )}
        </div>

        {/* SMALL INFO */}
        <p className="mt-10 text-xs text-gray-600">
          Command Center v1
        </p>

      </div>
    </MainLayout>
  );
}
