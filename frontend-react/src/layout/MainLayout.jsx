import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

export default function MainLayout() {

  const location = useLocation();

  const [mobileSidebar, setMobileSidebar] = useState(false);

  const showWorkspace =
    location.pathname === "/chat" ||
    location.pathname === "/dashboard";

  return (
     <div className="h-screen text-white flex flex-col overflow-hidden app-bg">

      {/* NAVBAR */}
      <Navbar
        openSidebar={() => setMobileSidebar(true)}
      />

      {showWorkspace ? (

        <div className="flex flex-1 overflow-hidden relative">

          {/* ================= DESKTOP SIDEBAR ================= */}
          <div className="hidden lg:flex">
            <Sidebar />
          </div>

          {/* ================= MOBILE SIDEBAR ================= */}
          <AnimatePresence>

            {mobileSidebar && (
              <>
                {/* overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileSidebar(false)}
                  className="
                    fixed inset-0 bg-[#07111F]/70 backdrop-blur-sm
                    z-40 lg:hidden
                  "
                />

                {/* drawer */}
                <motion.div
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="
                    fixed left-0 top-0 h-full
                    z-50 lg:hidden
                  "
                >
                  <Sidebar closeSidebar={() => setMobileSidebar(false)} />
                </motion.div>
              </>
            )}

          </AnimatePresence>

          {/* ================= MAIN ================= */}
          <motion.main
            className="flex-1 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Outlet />
          </motion.main>

          {/* ================= RIGHT PANEL ================= */}
          <div className="
            hidden 2xl:flex
            w-80 border-l border-white/10
            bg-white/[0.02]
            backdrop-blur-2xl
            flex-col p-5
          ">

            <div className="mb-8">
              <h2 className="text-xs text-yellow-400 tracking-[0.3em]">
                AI SYSTEM
              </h2>
            </div>

            <div className="space-y-4">

              {/* CARD */}
              <div className="
                rounded-3xl border border-white/10
                bg-white/[0.03]
                p-5
              ">
                <div className="text-xs text-gray-500 mb-2">
                  Active Agent
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

                  <div className="text-sm font-medium">
                    SIRAJ Core
                  </div>
                </div>
              </div>

              {/* CARD */}
              <div className="
                rounded-3xl border border-white/10
                bg-white/[0.03]
                p-5
              ">
                <div className="text-xs text-gray-500 mb-2">
                  Memory System
                </div>

                <div className="text-sm">
                  Persistent Context Enabled
                </div>
              </div>

              {/* CARD */}
              <div className="
                rounded-3xl border border-white/10
                bg-white/[0.03]
                p-5
              ">
                <div className="text-xs text-gray-500 mb-2">
                  Runtime Status
                </div>

                <div className="text-green-400 text-sm">
                  Operational
                </div>
              </div>

            </div>

          </div>

        </div>

      ) : (

        <motion.div
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Outlet />
        </motion.div>

      )}

    </div>
  );
}
