import MainLayout from "../layout/MainLayout";
import Background from "../components/ui/Background";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <MainLayout>
      <Background />

      <div className="text-center py-20 space-y-10">
        <motion.h1
          className="text-7xl font-extrabold text-yellow-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          SIRAJ ULTRA AI
        </motion.h1>

        <p className="text-gray-300 text-lg">
          Next Generation Artificial Intelligence System
        </p>

        <div className="flex justify-center gap-6">
          <Link to="/chat"><Button>Start AI</Button></Link>
          <Link to="/login"><Button>Login</Button></Link>
        </div>
      </div>
    </MainLayout>
  );
}
