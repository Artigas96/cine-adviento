import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' hace que funcione en GitHub Pages (https://usuario.github.io/repo/)
// sin tener que hardcodear el nombre del repositorio.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
