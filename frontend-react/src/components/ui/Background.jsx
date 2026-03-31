import { Canvas } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, OrbitControls } from "@react-three/drei";

export default function Background() {
  return (
    <Canvas className="absolute inset-0 z-0">
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <Sphere args={[1.5, 64, 64]} scale={2}>
        <MeshDistortMaterial color="#facc15" attach="material" distort={0.5} speed={2} />
      </Sphere>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
    </Canvas>
  );
}
