import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-black text-yellow-400 flex flex-col">

      <Navbar />

      <motion.div
        className="flex-1 p-4 overflow-y-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Outlet />
      </motion.div>

    </div>
  );
}
