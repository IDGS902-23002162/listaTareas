import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Convierte la app en PWA (Progressive Web App):
    // - Genera el service worker automaticamente (offline + cache).
    // - Genera/injecta el manifest.webmanifest (icono, nombre, colores).
    // registerType: 'autoUpdate' hace que el service worker se actualice
    // solo cuando hay una nueva version, sin que el usuario tenga que hacer nada.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'favicon.svg'],
      manifest: {
        name: 'Tareas App',
        short_name: 'Tareas',
        description: 'Aplicación de gestión de tareas con Firebase, instalable y offline',
        theme_color: '#7d6052',
        background_color: '#ffffff',
        display: 'standalone', // se abre como app independiente sin barra del navegador
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: true // Permite probar el Service Worker y la instalación en modo desarrollo (npm run dev)
      },
      workbox: {
        // Cachea automaticamente todo lo que Vite genera en el build (JS, CSS, HTML, imagenes)
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})