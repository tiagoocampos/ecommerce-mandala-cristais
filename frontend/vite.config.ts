import path from "path"
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Metadados de compartilhamento (og:image, og:url...) precisam de URL absoluta.
// Ordem: VITE_SITE_URL (.env / painel da Vercel) → domínio de produção da Vercel → vazio (dev local).
function siteUrlPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), "")
  const vercelDomain = env.VERCEL_PROJECT_PRODUCTION_URL
  const siteUrl = (env.VITE_SITE_URL || (vercelDomain ? `https://${vercelDomain}` : "")).replace(/\/+$/, "")

  return {
    name: "site-url",
    transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", siteUrl),
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), siteUrlPlugin(mode)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ['drier-motivate-seldom.ngrok-free.dev']
  }
}))