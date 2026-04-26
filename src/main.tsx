import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const PWA_CLEANUP_KEY = "finalglow-pwa-cleanup-v2";

const renderApp = () => {
  try {
    createRoot(document.getElementById("root")!).render(<App />);
  } catch (err) {
    console.error("[BOOT] Render failed:", err);
    showRecovery("The app failed to start. Tap reset to recover.");
  }
};

const showRecovery = (message: string) => {
  const root = document.getElementById("root");
  if (!root) return;
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0A0A0A;color:#fff;font-family:system-ui,sans-serif;padding:24px;text-align:center;">
      <div style="max-width:340px;">
        <h1 style="font-size:20px;margin:0 0 12px;">FinalGlow AI</h1>
        <p style="font-size:14px;opacity:.8;margin:0 0 20px;">${message}</p>
        <button id="fg-reset" style="background:linear-gradient(135deg,#D4AF37,#F5E6A8);color:#0A0A0A;border:0;padding:14px 22px;border-radius:14px;font-weight:600;font-size:14px;cursor:pointer;">Reset & Reload</button>
      </div>
    </div>`;
  document.getElementById("fg-reset")?.addEventListener("click", async () => {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      try { localStorage.clear(); sessionStorage.clear(); } catch {}
    } finally {
      const url = new URL(window.location.href);
      url.searchParams.set("_v", Date.now().toString());
      window.location.replace(url.toString());
    }
  });
};

const bootApp = async () => {
  let didCleanup = false;
  try {
    const alreadyCleaned = localStorage.getItem(PWA_CLEANUP_KEY) === "done";

    if (!alreadyCleaned) {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        if (regs.length > 0) didCleanup = true;
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        if (keys.length > 0) didCleanup = true;
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      localStorage.setItem(PWA_CLEANUP_KEY, "done");

      // If we removed an old SW/cache, force one cache-busting reload so
      // the freshly-fetched bundle takes over instead of the cached one.
      if (didCleanup) {
        const url = new URL(window.location.href);
        if (!url.searchParams.has("_v")) {
          url.searchParams.set("_v", Date.now().toString());
          window.location.replace(url.toString());
          return;
        }
      }
    }
  } catch {
    // continue even if cleanup fails
  }

  renderApp();
};

window.addEventListener("error", (e) => {
  console.error("[BOOT] window error:", e.error || e.message);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[BOOT] unhandled rejection:", e.reason);
});

void bootApp();
