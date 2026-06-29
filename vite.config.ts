import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/3d-portfolio/", // 👈 Add this line (matching your folder name '3d-portfolio')
});