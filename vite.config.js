import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Rutas específicas del proyecto antiguo
      '^/assignments.*': {
        target: 'https://back-end-casilleros.onrender.com', // <-- Sin slash final
        changeOrigin: true,
        secure: false,
      },
      '^/bitacora.*': {
        target: 'https://back-end-casilleros.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '^/horarios.*': {
        target: 'https://back-end-casilleros.onrender.com',
        changeOrigin: true,
        secure: false,
      },

      // === IMPORTANTE: Proxy para todo el namespace /manto ===
      '/manto': {
        target: 'https://back-end-casilleros.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/manto/, '/manto')
      },

      // Imágenes subidas
      '/uploads': {
        target: 'https://back-end-casilleros.onrender.com', 
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
