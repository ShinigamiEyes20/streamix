import { defineConfig, loadEnv } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import Sitemap from "vite-plugin-sitemap";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = env.VITE_SITE_URL || "https://streamix.vercel.app";
  const tmdbToken = env.TMDB_READ_ACCESS_TOKEN || env.VITE_TMDB_READ_ACCESS_TOKEN;

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          globPatterns: [
            "**/*.{js,jsx,css,html,ico,png,jpg,jpeg,webp,svg,woff,woff2,ttf,eot,xml,txt}",
          ],
        },
      }),
      Sitemap({
        hostname: siteUrl,
        dynamicRoutes: [
          "/movies",
          "/tv-shows",
          "/popular",
          "/about",
          "/disclaimer",
        ],
        readable: true,
        robots: [
          { userAgent: "*", allow: "/", disallow: "/api/", crawlDelay: 2 },
        ],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      },
    },
    build: {
      target: "es2022",
      outDir: "dist",
      assetsDir: "assets",
    },
    server: {
      proxy: {
        "/api": {
          target: "https://api.themoviedb.org/3",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (tmdbToken) {
                proxyReq.setHeader("Accept", "application/json");
                proxyReq.setHeader("Authorization", `Bearer ${tmdbToken}`);
              }
            });
          },
        },
      },
    },
  };
});
