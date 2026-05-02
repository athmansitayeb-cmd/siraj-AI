import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const isAuth = !!localStorage.getItem("siraj_token");

  const logout = () => {
    localStorage.removeItem("siraj_token");
    localStorage.removeItem("siraj_user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="w-full px-6 py-4 border-b border-white/10 flex justify-between items-center">

      <Link to="/" className="text-lg font-bold text-yellow-400">
        SIRAJ AI
      </Link>

      <div className="flex gap-5 text-sm">

        <Link to="/features">Features</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/docs">Docs</Link>

        {isAuth && <Link to="/chat">Chat</Link>}
        {isAuth && <Link to="/dashboard">Dashboard</Link>}

        {!isAuth ? (
          <Link className="text-yellow-400" to="/login">Login</Link>
        ) : (
          <button className="text-red-400" onClick={logout}>
            Logout
          </button>
        )}

      </div>

    </div>
  );
}
