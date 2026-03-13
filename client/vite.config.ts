import path from 'path';
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'https://sed-platform-09d3.onrender.com',
            changeOrigin: true,
            secure: false,
            // Keep the `/api` prefix when proxying so backend routes like
            // `/api/test` match the server's route definitions.
            // (Previously the config removed `/api` which caused 404s.)
          }
        }
      },
      plugins: [react(), splitVendorChunkPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 1000, // Increase limit to 1000KB
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler') || id.includes('react-router-dom')) {
                  return 'vendor-react';
                }
                if (id.includes('@radix-ui') || id.includes('class-variance-authority')) {
                  return 'vendor-ui';
                }
                return 'vendor-other';
              }
            },
          },
        },
      }
    };
});
