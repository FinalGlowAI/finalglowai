import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Librairies React core
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // UI et animations
          "vendor-ui": ["framer-motion", "lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          // Data fetching
          "vendor-query": ["@tanstack/react-query"],
          // Formulaires
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          // Supabase
          "vendor-supabase": ["@supabase/supabase-js"],
          // Recharts (graphiques)
          "vendor-charts": ["recharts"],
        },
      },
    },
  },
}));
