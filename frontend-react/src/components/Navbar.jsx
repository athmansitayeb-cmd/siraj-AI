import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Gem,
  Zap,
  LogOut,
  Wifi
} from "lucide-react";

export default function Navbar({ openSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuth = !!localStorage.getItem("siraj_token");

  const showWorkspace =
    location.pathname.includes("/chat") ||
    location.pathname.includes("/dashboard");

  const logout = () => {
    localStorage.removeItem("siraj_token");
    localStorage.removeItem("siraj_user");
    navigate("/login", { replace: true });
  };

  const active = (path) => location.pathname.includes(path);

  return (
    <header className="
      sticky top-0 z-50 w-full h-16
      border-b border-white/10
      bg-[#07111F]/40 backdrop-blur-2xl
      flex items-center justify-between
      px-4 md:px-6
    ">

      {/* LEFT */}
      <div className="flex items-center gap-3">

        {/* MOBILE SIDEBAR BUTTON */}
        {showWorkspace && (
          <button
            onClick={openSidebar}
            className="
              lg:hidden w-10 h-10 rounded-2xl
              bg-white/[0.05] border border-white/10
              flex items-center justify-center
              hover:bg-white/[0.08]
              active:scale-95 transition
            "
          >
            <Menu size={18} />
          </button>
        )}

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 text-yellow-400 font-bold tracking-[0.25em] text-sm">
          <div className="w-8 h-8 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
            <Sparkles size={14} />
          </div>
          <span>SIRAJ</span>
        </Link>

      </div>

      {/* CENTER NAV */}
      <div className="
        hidden md:flex items-center gap-2
        bg-white/[0.03] border border-white/10
        rounded-2xl px-2 py-2
        backdrop-blur-xl
      ">

        <Link to="/features" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition">
          <Gem size={14} /> Features
        </Link>

        <Link to="/pricing" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition">
          <Zap size={14} /> Pricing
        </Link>

        <Link to="/docs" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition">
          <FileText size={14} /> Docs
        </Link>

        {isAuth && (
          <>
            <Link
              to="/chat"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition
                ${active("/chat")
                  ? "bg-yellow-400 text-black font-semibold shadow-[0_0_25px_rgba(255,215,0,0.35)]"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.05]"}
              `}
            >
              <MessageSquare size={14} /> Chat
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition
                ${active("/dashboard")
                  ? "bg-yellow-400 text-black font-semibold shadow-[0_0_25px_rgba(255,215,0,0.35)]"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.05]"}
              `}
            >
              <LayoutDashboard size={14} /> Dashboard
            </Link>
          </>
        )}

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        {/* STATUS */}
        {isAuth && (
          <div className="
            hidden lg:flex items-center gap-2
            px-3 py-2 rounded-xl
            border border-white/10
            bg-white/[0.03]
          ">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping" />
            </div>

            <span className="text-xs text-gray-300 flex items-center gap-1">
              <Wifi size={12} /> AI Online
            </span>
          </div>
        )}

        {/* AUTH */}
        {!isAuth ? (
          <Link
            to="/login"
            className="
              px-4 py-2 rounded-xl
              bg-yellow-400 text-black
              text-sm font-semibold
              hover:scale-105 active:scale-95 transition
              shadow-[0_0_25px_rgba(255,215,0,0.35)]
            "
          >
            Launch App
          </Link>
        ) : (
          <button
            onClick={logout}
            className="
              flex items-center gap-2
              px-4 py-2 rounded-xl
              text-red-400 text-sm
              border border-red-500/20
              bg-red-500/5
              hover:bg-red-500/10
              transition
            "
          >
            <LogOut size={14} />
            Logout
          </button>
        )}

      </div>

    </header>
  );
}
