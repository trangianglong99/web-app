import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: "0.0.0.0", // Allow external connections
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  define: {
    // Make environment variables available
    "process.env": process.env,
  },
});
