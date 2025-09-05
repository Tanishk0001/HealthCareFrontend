// frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

export default defineConfig(async () => {
  // portable __dirname for ESM
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // dynamic import ESM-only plugins
  let runtimeErrorOverlay: any = null;
  let cartographerPlugin: any = null;

  try {
    const mod = await import("@replit/vite-plugin-runtime-error-modal");
    runtimeErrorOverlay = mod.default ?? mod;
  } catch (e) {
    // not installed locally — ok
  }

  try {
    const mod = await import("@replit/vite-plugin-cartographer");
    cartographerPlugin = (mod.cartographer ?? mod.default ?? mod);
  } catch (e) {
    // not installed locally — ok
  }

  const plugins: any[] = [react()];

  if (runtimeErrorOverlay) {
    try { plugins.push(runtimeErrorOverlay()); } catch { plugins.push(runtimeErrorOverlay); }
  }

  // only enable cartographer when running on Replit (REPL_ID present)
  if (process.env.NODE_ENV !== "production" && !!process.env.REPL_ID && cartographerPlugin) {
    try { plugins.push(cartographerPlugin()); } catch { plugins.push(cartographerPlugin); }
  }

  // === Adjust this path if your shared code is NOT at repo-root/shared ===
  // If shared lives at repo root: path.resolve(__dirname, "..", "shared")
  // If shared lives inside frontend folder: path.resolve(__dirname, "shared")
  // If shared lives in backend: use ../../backend/shared OR prefer relative imports there.
  const SHARED_PATH = path.resolve(__dirname, "..", "shared");

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": SHARED_PATH,
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },

    // The frontend source root (your index.html should be inside `client/`)
    root: path.resolve(__dirname, "client"),

    // Build output: ensure backend expects the same folder.
    // With root = frontend/client, outDir will be frontend/client/dist
    build: {
      outDir: path.resolve(__dirname, "client", "dist"),
      emptyOutDir: true,
    },

    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
      // OPTIONAL: add a dev-time proxy if you prefer not to use CORS
      // proxy: {
      //   "/api": {
      //     target: "http://localhost:5000",
      //     changeOrigin: true,
      //     secure: false,
      //   },
      //   "/ws": { target: "ws://localhost:5000", ws: true }
      // }
    },
  };
});
