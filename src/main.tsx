import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// PWA cleanup — safe version sans boucle
const PWA_CLEANUP_KEY = "finalglow-pwa-cleanup-v1";

const bootApp = async () => {
  try {
    const alreadyCleaned = localStorage.getItem(PWA_CLEANUP_KEY) === "done";
    
    if (!alreadyCleaned) {
      // Cleanup service workers
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      // Cleanup caches
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      // Marque comme fait — PAS de reload pour éviter la boucle
      localStorage.setItem(PWA_CLEANUP_KEY, "done");
    }
  } catch {
    // continue même si cleanup échoue
  }

  // Monte TOUJOURS l'app
  createRoot(document.getElementById("root")!).render(<App />);
};

void bootApp();
