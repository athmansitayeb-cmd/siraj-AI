import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          oauth: ["@react-oauth/google"],
          motion: ["framer-motion"],
          particles: ["react-tsparticles", "tsparticles"],
          axios: ["axios"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
