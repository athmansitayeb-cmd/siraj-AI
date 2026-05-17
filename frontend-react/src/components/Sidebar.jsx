import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import {
  Sparkles,
  Plus,
  MessageSquare,
  LayoutDashboard,
  History,
  Search,
  Pencil,
  Trash2,
  RefreshCcw
} from "lucide-react";

export default function Sidebar({ closeSidebar }) {

  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const token = localStorage.getItem("siraj_token");

  const activeId =
    localStorage.getItem("siraj_conversation");

  // ================= LOAD =================
  const load = async () => {

    if (!token) return;

    try {

      setLoading(true);

      const res = await fetch(
        "https://siraj.software/api/conversation",
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setConversations(data);
      }

    } catch (e) {

      console.error(e);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    load();
  }, []);

  // ================= FILTER =================
  const filtered = useMemo(() => {

    return conversations.filter((c) =>
      (c.title || "")
        .toLowerCase()
        .includes(query.toLowerCase())
    );

  }, [conversations, query]);

  // ================= SORT =================
  const sorted = [...filtered].sort(
    (a, b) =>
      new Date(b.updatedAt) -
      new Date(a.updatedAt)
  );

  const recent = sorted.slice(0, 6);
  const older = sorted.slice(6);

  // ================= NEW CHAT =================
  const newChat = () => {

    const id = crypto.randomUUID();

    localStorage.setItem(
      "siraj_conversation",
      id
    );

    window.location.href = "/chat";
  };

  // ================= OPEN =================
  const openConversation = (id) => {

    localStorage.setItem(
      "siraj_conversation",
      id
    );

    if (closeSidebar) {
      closeSidebar();
    }

    window.location.href = "/chat";
  };

  // ================= RENAME =================
  const rename = async (id, oldTitle) => {

    const newTitle = window.prompt(
      "Rename chat:",
      oldTitle
    );

    if (!newTitle) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, title: newTitle }
          : c
      )
    );

    await fetch(
      `https://siraj.software/api/conversation/${id}/title`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + token
        },
        body: JSON.stringify({
          title: newTitle
        })
      }
    );
  };

  // ================= DELETE =================
  const removeConversation = async (id) => {

    setConversations((prev) =>
      prev.filter((c) => c.id !== id)
    );

    await fetch(
      `https://siraj.software/api/conversation/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization:
            "Bearer " + token
        }
      }
    );
  };

  // ================= NAV =================
  const item = (to, label, icon) => (

    <Link
      to={to}
      onClick={() => closeSidebar?.()}
      className={`
        flex items-center gap-3
        px-4 py-3 rounded-2xl
        text-sm transition-all
        ${
          location.pathname.includes(to)
            ? "bg-yellow-400 text-black font-semibold shadow-lg shadow-yellow-400/10"
            : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
        }
      `}
    >

      {icon}

      <span>{label}</span>

    </Link>
  );

  // ================= ITEM =================
  const renderItem = (c) => {

    const isActive = activeId === c.id;

    return (
      <div
        key={c.id}
        className={`
          group relative
          rounded-2xl border transition-all
          ${
            isActive
              ? "bg-white/[0.08] border-yellow-400/30"
              : "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/10"
          }
        `}
      >

        <div className="flex items-center justify-between p-3">

          {/* LEFT */}
          <button
            onClick={() => openConversation(c.id)}
            className="flex-1 text-left min-w-0"
          >

            <div className="flex items-center gap-2">

              <div
                className="
                  w-8 h-8 rounded-xl
                  bg-white/[0.05]
                  border border-white/10
                  flex items-center justify-center
                  shrink-0
                "
              >
                <MessageSquare
                  size={14}
                  className="text-gray-300"
                />
              </div>

              <div className="min-w-0">

                <div className="text-sm text-white truncate">
                  {c.title || "New Chat"}
                </div>

                <div className="text-[10px] text-gray-600 mt-1">
                  {c.updatedAt
                    ? new Date(
                        c.updatedAt
                      ).toLocaleDateString()
                    : ""}
                </div>

              </div>

            </div>

          </button>

          {/* ACTIONS */}
          <div
            className="
              opacity-0 group-hover:opacity-100
              flex items-center gap-2
              ml-2 transition
            "
          >

            <button
              onClick={() =>
                rename(c.id, c.title)
              }
              className="
                w-7 h-7 rounded-lg
                hover:bg-white/10
                text-yellow-400
                flex items-center justify-center
                transition
              "
            >
              <Pencil size={13} />
            </button>

            <button
              onClick={() =>
                removeConversation(c.id)
              }
              className="
                w-7 h-7 rounded-lg
                hover:bg-red-500/10
                text-red-400
                flex items-center justify-center
                transition
              "
            >
              <Trash2 size={13} />
            </button>

          </div>

        </div>

      </div>
    );
  };

  return (
    <aside
      className="
        w-80 h-full
        border-r border-white/10
        bg-[#050505]/95
        backdrop-blur-2xl
        flex flex-col
        p-4
      "
    >

      {/* TOP */}
      <div className="mb-6">

        {/* LOGO */}
        <div className="flex items-center gap-3 mb-5">

          <div
            className="
              w-11 h-11 rounded-2xl
              bg-yellow-400/10
              border border-yellow-400/20
              flex items-center justify-center
              shadow-lg shadow-yellow-400/10
            "
          >
            <Sparkles
              size={18}
              className="text-yellow-400"
            />
          </div>

          <div>

            <h1
              className="
                text-yellow-400 font-bold
                tracking-[0.35em]
                text-sm
              "
            >
              SIRAJ
            </h1>

            <div className="text-[10px] text-gray-600 mt-1">
              Neural Workspace
            </div>

          </div>

        </div>

        {/* BUTTON */}
        <button
          onClick={newChat}
          className="
            w-full mb-5
            bg-yellow-400 text-black
            rounded-2xl py-3
            text-sm font-semibold
            hover:scale-[1.02]
            active:scale-95
            transition-all
            flex items-center justify-center gap-2
            shadow-xl shadow-yellow-400/10
          "
        >

          <Plus size={16} />

          <span>New Chat</span>

        </button>

        {/* SEARCH */}
        <div className="relative mb-5">

          <Search
            size={14}
            className="
              absolute left-3 top-1/2
              -translate-y-1/2
              text-gray-500
            "
          />

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search chats..."
            className="
              w-full pl-10 pr-3 py-3
              rounded-2xl
              bg-white/[0.04]
              border border-white/10
              outline-none
              text-sm text-white
              placeholder-gray-500
              focus:border-yellow-400/30
            "
          />

        </div>

        {/* NAV */}
        <div className="space-y-2">

          {item(
            "/chat",
            "AI Chat",
            <MessageSquare size={16} />
          )}

          {item(
            "/dashboard",
            "Dashboard",
            <LayoutDashboard size={16} />
          )}

        </div>

      </div>

      {/* HEADER */}
      <div
        className="
          flex items-center justify-between
          px-2 mb-4
        "
      >

        <div
          className="
            flex items-center gap-2
            text-xs tracking-wider
            text-gray-600
          "
        >

          <History size={13} />

          <span>RECENT CHATS</span>

        </div>

        <button
          onClick={load}
          className="
            w-7 h-7 rounded-lg
            hover:bg-white/10
            text-gray-500
            flex items-center justify-center
            transition
          "
        >
          <RefreshCcw size={13} />
        </button>

      </div>

      {/* LIST */}
      <div
        className="
          flex-1 overflow-y-auto
          pr-1 space-y-2
        "
      >

        {loading && (
          <div className="space-y-2 px-2">

            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="
                  h-14 rounded-2xl
                  bg-white/[0.04]
                  animate-pulse
                "
              />
            ))}

          </div>
        )}

        {!loading && recent.length > 0 && (
          <>
            <div className="text-[10px] text-gray-600 px-2 mb-2 tracking-widest">
              RECENT
            </div>

            {recent.map(renderItem)}
          </>
        )}

        {!loading && older.length > 0 && (
          <>
            <div className="text-[10px] text-gray-600 px-2 mt-5 mb-2 tracking-widest">
              OLDER
            </div>

            {older.map(renderItem)}
          </>
        )}

        {!loading &&
          conversations.length === 0 && (
            <div
              className="
                text-center text-gray-600
                text-sm mt-10
              "
            >
              No chats yet
            </div>
          )}

      </div>

      {/* FOOTER */}
      <div
        className="
          pt-4 mt-4
          border-t border-white/10
        "
      >

        <div
          className="
            rounded-2xl
            bg-white/[0.03]
            border border-white/10
            p-4
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <div className="text-xs text-gray-500">
                AI SYSTEM
              </div>

              <div className="text-sm text-white mt-1">
                Operational
              </div>

            </div>

            <div className="flex items-center gap-2">

              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

              <div className="text-xs text-green-400">
                Online
              </div>

            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}
