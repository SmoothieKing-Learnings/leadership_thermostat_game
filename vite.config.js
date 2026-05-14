import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative base — the same build works whether the iframe is served from a root path,
  // a sub-path, a CDN, or a custom domain. Override at build time with
  // `VITE_BASE_PATH=/some/path/ npm run build` if an absolute prefix is required.
  base: process.env.VITE_BASE_PATH ?? './',
})
