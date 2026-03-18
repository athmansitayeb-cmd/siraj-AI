import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Sphere } from "@react-three/drei";
import { motion } from "framer-motion";
import MainLayout from "../layout/MainLayout";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center text-center py-10 gap-10">

        <motion.h1
          className="text-6xl font-extrabold text-yellow-400 drop-shadow-lg"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          SIRAJ AI
        </motion.h1>

        <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-2xl">
          <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Stars radius={50} depth={30} count={5000} factor={4} fade speed={1} />
            <Sphere args={[2, 64, 64]}>
              <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
            </Sphere>
            <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        <div className="flex gap-6">
          <Link to="/chat" className="btn">Open Chat</Link>
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn">Register</Link>
        </div>
      </div>
    </MainLayout>
  );
}
