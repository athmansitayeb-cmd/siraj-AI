import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sparkles,
  Plus,
  LayoutDashboard,
  Bot,
  User,
  Settings
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const [workspaces, setWorkspaces] = useState([]);

  const token = localStorage.getItem("siraj_token");

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function loadWorkspaces() {
    if (!token) return;

    try {
      const res = await fetch(
        "https://siraj.software/api/workspace",
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      const data = await res.json();
      setWorkspaces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("workspace load failed", err);
    }
  }

  const isActive = (path) =>
    location.pathname === path;

  return (
    <aside
      className="
        hidden lg:flex
        w-72 h-screen
        flex-col
        border-r
        bg-[var(--bg)]
      "
    >

      {/* HEADER */}
      <div className="p-5 border-b">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10">
            <Sparkles size={18} style={{ color: "var(--primary)" }} />
          </div>

          <div>
            <h1 className="font-bold tracking-[0.3em] text-sm">
              SIRAJ
            </h1>
            <p className="text-xs text-muted">
              Neural Workspace
            </p>
          </div>

        </div>

      </div>

      {/* ACTIONS */}
      <div className="p-4 space-y-3">

        <Link
          to="/intent"
          className="
            flex items-center gap-2
            btn-primary w-full justify-center
          "
        >
          <Plus size={16} />
          New Workspace
        </Link>

        <Link
          to="/dashboard"
          className={`
            flex items-center gap-2 px-3 py-2 rounded-xl text-sm
            ${isActive("/dashboard")
              ? "bg-blue-500/10 text-blue-500"
              : "text-muted"}
          `}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <Link
          to="/intent"
          className={`
            flex items-center gap-2 px-3 py-2 rounded-xl text-sm
            ${isActive("/intent")
              ? "bg-purple-500/10 text-purple-400"
              : "text-muted"}
          `}
        >
          <User size={16} />
          Personal Assistant
        </Link>

      </div>

      {/* WORKSPACES */}
      <div className="flex-1 overflow-auto px-4">

        <div className="text-[10px] text-muted mb-3 tracking-widest">
          WORKSPACES
        </div>

        {workspaces.length === 0 && (
          <div className="text-xs text-muted">
            No workspaces yet
          </div>
        )}

        <div className="space-y-2">

          {workspaces.map((w) => (
            <Link
              key={w._id}
              to={`/chat/${w._id}`}
              className="
                flex items-center gap-2
                px-3 py-2 rounded-xl text-sm
                hover:bg-blue-500/10
              "
            >
              <Bot size={14} />
              <span className="truncate">
                {w.intent}
              </span>
            </Link>
          ))}

        </div>

      </div>

      {/* FOOTER */}
      <div className="p-4 border-t">

        <div className="flex items-center justify-between text-xs">

          <span className="text-muted">
            SYSTEM
          </span>

          <span className="text-green-500">
            ONLINE
          </span>

        </div>

      </div>

    </aside>
  );
}
