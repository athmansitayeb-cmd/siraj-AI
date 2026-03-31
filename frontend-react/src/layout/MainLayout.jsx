import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen bg-black text-yellow-400 overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1">

        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <motion.div
          className="flex-1 overflow-y-auto p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>

      </div>
    </div>
  );
}
