import { Link, useLocation } from "react-router-dom";
import {
Sparkles,
ArrowRight,
Menu,
LayoutDashboard,
MessageSquare,
FileText,
Blocks,
CreditCard,
LogOut,
} from "lucide-react";

import { PrimaryButton } from "./ui/primitives";
import { useAuth } from "../auth/AuthContext";

export default function Navbar({ openSidebar }) {
const location = useLocation();

const { isAuthenticated, logout } = useAuth();

const showWorkspace =
location.pathname.includes("/chat") ||
location.pathname.includes("/dashboard");

const navItem = (to, label, icon) => {
const Icon = icon;

const active =
 location.pathname === to ||
 location.pathname.startsWith(to + "/");

return (
 <Link
 to={to}
 className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 ${
 active
 ? "bg-white text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
 : "text-slate-500 hover:text-slate-900 hover:bg-white/70"
 }`}
 >
 <Icon size={16} />
 {label}
 </Link>
);

};

return (
<header className="sticky top-0 z-50 backdrop-blur-2xl border-b border-slate-200/60 bg-white/70">
<div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">

 <Link to="/" className="flex items-center gap-3">
 <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-[var(--text)]">
 <Sparkles size={18} />
 </div>

 <div>
 <div className="text-sm font-black tracking-[0.35em] text-slate-900">
 SIRAJ
 </div>

 <div className="text-[11px] text-slate-400">
 Autonomous Intelligence
 </div>
 </div>
 </Link>

 <div className="hidden lg:flex items-center gap-2 p-1.5 rounded-[22px] bg-slate-100/70 border border-slate-200/60">
 {navItem("/features", "Features", Blocks)}
 {navItem("/pricing", "Pricing", CreditCard)}
 {navItem("/docs", "Docs", FileText)}

 {isAuthenticated && (
 <>
 {navItem("/intent", "Workspace", MessageSquare)}
 {navItem("/dashboard", "Dashboard", LayoutDashboard)}
 </>
 )}
 </div>

 <div className="flex items-center gap-3">

 {showWorkspace && (
 <button
 onClick={openSidebar}
 className="lg:hidden w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700"
 >
 <Menu size={18} />
 </button>
 )}

 {!isAuthenticated ? (
 <Link to="/login">
 <PrimaryButton>
 <div className="flex items-center gap-2">
 Launch Platform
 <ArrowRight size={16} />
 </div>
 </PrimaryButton>
 </Link>
 ) : (
 <button
 onClick={logout}
 className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-red-500 transition-all"
 >
 <LogOut size={16} />
 Logout
 </button>
 )}
 </div>
 </div>
</header>

);
}
