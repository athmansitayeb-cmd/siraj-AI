import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'replace-underscore',
      enforce: 'pre',
      transform(code, id) {
        // تطبيق على ملفات react-hook-form فقط
        if (id.includes('node_modules/react-hook-form/dist')) {
          return code.replace(/function _\(([^)]*)\)\{throw Error\([^}]*\)\}/g, 'function _($1){return ""}');
        }
        return code;
      }
    }
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    target: "esnext",
    chunkSizeWarningLimit: 1500
  }
});
