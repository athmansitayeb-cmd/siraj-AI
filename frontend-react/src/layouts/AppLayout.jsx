import { Outlet } from "react-router-dom";
import { useUI } from "../ui/context/UIContext";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AppLayout() {
 const { state } = useUI();

 return (
 <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">

 <Navbar />

 <div className="flex">

 {state.sidebarOpen && (
 <Sidebar />
 )}

 <main className="flex-1 overflow-hidden">
 <Outlet />
 </main>

 {state.rightPanelOpen && (
 <aside className="w-80 border-l border-[var(--border)]/20">
 RIGHT PANEL
 </aside>
 )}

 </div>

 </div>
 );
}
