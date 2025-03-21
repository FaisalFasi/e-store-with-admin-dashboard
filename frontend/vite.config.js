import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true, // Automatically open the report in the browser
      filename: "bundle-analysis.html", // Output file
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1000, // Increase the warning limit if needed
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Base alias for src/
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8800",
      },
    },
  },
});
