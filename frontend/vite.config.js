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
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@stores": path.resolve(__dirname, "src/stores"),
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
