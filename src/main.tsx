import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const PWA_CLEANUP_KEY = "finalglow-pwa-cleanup-v1";

const cleanupLegacyPwa = async () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  let didCleanup = false;

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length > 0) {
      await Promise.all(registrations.map((registration) => registration.unregister()));
      didCleanup = true;
    }
  }

  if ("caches" in window) {
    const cacheKeys = await caches.keys();
    if (cacheKeys.length > 0) {
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      didCleanup = true;
    }
  }

  return didCleanup;
};

const bootApp = async () => {
  try {
    const alreadyCleaned = window.localStorage.getItem(PWA_CLEANUP_KEY) === "done";

    if (!alreadyCleaned) {
      const cleaned = await cleanupLegacyPwa();
      window.localStorage.setItem(PWA_CLEANUP_KEY, "done");

      if (cleaned) {
        window.location.replace(`${window.location.pathname}${window.location.search}${window.location.hash}`);
        return;
      }
    }
  } catch {
    // continue boot even if cache cleanup fails
  }

  createRoot(document.getElementById("root")!).render(<App />);
};

void bootApp();
