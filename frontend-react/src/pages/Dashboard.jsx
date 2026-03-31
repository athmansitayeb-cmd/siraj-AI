import MainLayout from "../layout/MainLayout";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { Link } from "react-router-dom";

export default function Dashboard() {

  const token = !!localStorage.getItem("siraj_token");

  return (
    <MainLayout>
      <div className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-black text-yellow-400">

        {/* Background 3D */}
        <Canvas className="absolute inset-0 z-0">
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Sphere args={[1.5, 32, 32]} scale={2}>
            <MeshDistortMaterial
              color="#facc15"
              attach="material"
              distort={0.6}
              speed={2}
            />
          </Sphere>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>

        {/* Main content */}
        <motion.div
          className="z-10 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
        >
          <h1 className="text-7xl font-extrabold">SIRAJ ULTRA AI</h1>

          <p className="text-gray-300 text-lg mt-4">
            Next Generation Artificial Intelligence System
          </p>

          {/* 🔥 عبارة تحفيزية */}
          <p className="text-yellow-300 mt-6 text-md italic">
            Build faster. Think deeper. Let AI amplify your intelligence.
          </p>

          {/* 🔥 زرار يظهر فقط إذا ما كاش token */}
          {!token && (
            <motion.div
              className="flex gap-6 mt-10 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
            >

              {/* 🔥 زر تسجيل الدخول */}
              <Link to="/login">
                <button className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-bold hover:scale-105 transition">
                  Login
                </button>
              </Link>

              {/* 🔥 زر إنشاء حساب */}
              <Link to="/register">
                <button className="px-6 py-3 border border-yellow-400 text-yellow-400 rounded-xl font-bold hover:bg-yellow-400 hover:text-black transition">
                  Create Account
                </button>
              </Link>

            </motion.div>
          )}

        </motion.div>

      </div>
    </MainLayout>
  );
}
