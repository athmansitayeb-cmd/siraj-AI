import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("siraj_token");
  const navigate = useNavigate();

  return (
    <div className="w-full px-6 py-4 border-b border-white/10 flex justify-between items-center">

      <Link to="/dashboard" className="text-lg font-bold text-yellow-400">
        SIRAJ AI
      </Link>

      <div className="flex gap-4">

        <Link to="/chat" className="hover:text-yellow-300">
          Chat
        </Link>

        {token ? (
          <button
            onClick={() => {
              localStorage.removeItem("siraj_token");
              navigate("/login", { replace: true });
            }}
            className="text-red-400 hover:text-red-500"
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="text-yellow-400 hover:text-yellow-300">
            Login
          </Link>
        )}

      </div>

    </div>
  );
}
