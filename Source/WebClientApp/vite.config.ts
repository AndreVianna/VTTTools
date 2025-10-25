import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isStandalone = process.env.VITE_STANDALONE === 'true' || mode === 'standalone';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@services': resolve(__dirname, 'src/services'),
        '@store': resolve(__dirname, 'src/store'),
        '@types': resolve(__dirname, 'src/types'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@config': resolve(__dirname, 'src/config'),
      },
    },
    define: {
      __ASPIRE_HEALTH__: JSON.stringify(true),
      __STANDALONE_MODE__: JSON.stringify(isStandalone),
    },
    server: {
      // Conditional proxy configuration based on mode
      proxy: isStandalone ? {
        // Standalone mode - proxy to local WebApp
        '/api': {
          target: 'https://localhost:7001',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('🔧 Proxy error (this is expected in standalone mode):', err.message);
            });
          },
        },
        '/health': {
          target: 'https://localhost:7001',
          changeOrigin: true,
          secure: false,
        },
      } : {
        // Aspire development mode - use actual service URLs
        '/api/auth': {
          target: 'https://localhost:7050',
          changeOrigin: true,
          secure: false,
        },
        '/api/assets': {
          target: 'https://localhost:7171',
          changeOrigin: true,
          secure: false,
        },
        '/api/adventures': {
          target: 'https://localhost:7172',
          changeOrigin: true,
          secure: false,
        },
        '/api/library': {
          target: 'https://localhost:7172',
          changeOrigin: true,
          secure: false,
        },
        '/api/scenes': {
          target: 'https://localhost:7172',
          changeOrigin: true,
          secure: false,
        },
        '/api/sessions': {
          target: 'https://localhost:7173',
          changeOrigin: true,
          secure: false,
        },
        '/api/resources': {
          target: 'https://localhost:7174',
          changeOrigin: true,
          secure: false,
        },
        '/signalr': {
          target: 'https://localhost:7173',
          ws: true,
          changeOrigin: true,
          secure: false,
        },
        '/health': {
          target: 'https://localhost:7050',
          changeOrigin: true,
          secure: false,
        },
      },
      },
    build: {
      target: 'esnext',
      minify: 'esbuild', // Use esbuild instead of terser for faster builds
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            canvas: ['konva', 'react-konva'],
            ui: ['@mui/material', '@mui/icons-material'],
            state: ['@reduxjs/toolkit', 'react-redux'],
          },
        },
      },
    },
  };
});