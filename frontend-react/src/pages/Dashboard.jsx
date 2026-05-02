import { Link } from "react-router-dom";

export default function Dashboard() {
  const token = localStorage.getItem("siraj_token");

  if (!token) {
    return <div className="text-white p-10">Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex flex-col items-center justify-center px-6">

      {/* LOGO */}
      <div className="flex flex-col items-center">
        <img
          src="/logo.svg"
          alt="SIRAJ Logo"
          className="w-28 h-28 mb-4 drop-shadow-[0_0_25px_rgba(255,215,0,0.7)]"
        />

        <h1 className="text-4xl font-bold text-yellow-400 tracking-[0.3em]">
          SIRAJ
        </h1>
      </div>

      {/* STATUS */}
      <p className="mt-4 text-gray-400 text-center">
        Command Center Active
      </p>

      {/* ACTIONS */}
      <div className="mt-8 flex gap-3">
        <Link
          to="/chat"
          className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-bold hover:scale-105 transition"
        >
          Open AI
        </Link>

        <Link
          to="/upgrade"
          className="px-6 py-3 border border-yellow-400 text-yellow-400 rounded-xl hover:bg-yellow-400 hover:text-black transition"
        >
          Upgrade
        </Link>
      </div>

      {/* FOOTER */}
      <p className="mt-10 text-xs text-gray-600">
        SIRAJ AI • Control Center v2
      </p>

    </div>
  );
}
