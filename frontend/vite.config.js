import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Development-only proxy target. Keep provider secrets in the backend .env.
  const env = loadEnv(mode, process.cwd(), 'FLAREX_');
  const backend = env.FLAREX_DEV_API_TARGET || 'http://127.0.0.1:8000';
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: { '/api': backend, '/health': backend },
    },
  };
});
