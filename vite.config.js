import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Rutas específicas del proyecto antiguo (si aún las usas)
      '^/assignments.*': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '^/bitacora.*': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '^/horarios.*': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },

      // === IMPORTANTE: Proxy para todo el namespace /manto ===
      '/manto': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        // Esto es clave: reescribe /manto/... → /manto/...
        rewrite: (path) => path.replace(/^\/manto/, '/manto')
      },

      // Imágenes subidas
      '/uploads': {
        target: 'http://127.0.0.1:5000',  // Mejor usar el mismo que Flask
        changeOrigin: true,
        secure: false,
      },
    }
  }
})