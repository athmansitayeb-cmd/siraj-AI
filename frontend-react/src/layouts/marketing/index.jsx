import { Link, Outlet } from "react-router-dom";

export default function MarketingLayout() {
 return (
 <div className="min-h-screen relative overflow-hidden">

 {/* GRID BACKGROUND */}
 <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,#2563eb22_1px,transparent_1px),linear-gradient(to_bottom,#2563eb22_1px,transparent_1px)] bg-[size:42px_42px]" />

 {/* TOP BAR */}
 <header className="sticky top-0 z-20 border-b backdrop-blur-xl"
 style={{ borderColor: "var(--border)", background: "rgba(7,17,31,0.72)" }}>

 <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

 <Link to="/" className="text-xl font-black tracking-[0.25em]">
 SIRAJ
 </Link>

 <div className="flex items-center gap-5 text-sm text-muted">
 <Link to="/ai">AI</Link>
 <Link to="/features">Features</Link>
 <Link to="/docs">Docs</Link>
 <Link to="/pricing">Pricing</Link>
 </div>

 </div>
 </header>

 {/* CONTENT */}
 <Outlet />

 </div>
 );
}
