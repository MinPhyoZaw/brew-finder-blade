import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // automatically updates installed app
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Local Cuisine',
        short_name: 'Cuisine',
        description: 'Find nearby restaurants by location.',
        theme_color: '#f21111',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true, // ensures new version activates immediately
      }
    })
  ],
  // Pre-bundle heavy deps for faster dev cold-start and consistent dev performance
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      '@supabase/supabase-js',
      'lucide-react',
      '@react-google-maps/api'
    ],
    esbuildOptions: {
      // Target modern syntax in the dev pre-bundle to reduce transform cost
      target: 'es2020'
    }
  },
  base: '/',
  build: {
    target: 'es2020',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor.firebase';
            if (id.includes('supabase')) return 'vendor.supabase';
            if (id.includes('lucide-react')) return 'vendor.icons';
            if (id.includes('react')) return 'vendor.react';
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
    reportCompressedSize: true,
    terserOptions: {
      compress: {
        passes: 2,
        drop_console: true,
      },
    },
  },
});
