import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json" with { type: "json" };
import path from 'path'

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), 'VUE_APP_')

  return {
    root: 'src/',
    plugins: [
      vue(), 
      crx({ manifest })
    ],

    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          preview: path.resolve(__dirname, "src/preview/index.html"),
          offscreen: path.resolve(__dirname, "src/offscreen/index.html"),
          sidePanel: path.resolve(__dirname, "src/sidePanel/index.html"),
        },
        output: {
          assetFileNames: 'assets/[name]-[hash].[ext]',
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js'
        }
      }
    },
    define: {
      '__APP_ENV__': JSON.stringify({
        baseURL: env.VUE_APP_API_BASE_URL,
        url: env.VUE_APP_URL,
        domain: env.VUE_APP_DOMAIN
      }),
      '__APP_TITLE__': '"Agentic Record Tool"'
    }
  }}
)
