import { Outlet } from "react-router-dom";
import { useUI } from "../ui/context/UIContext";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  const { state } = useUI();

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--text)]">

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
  );
}
