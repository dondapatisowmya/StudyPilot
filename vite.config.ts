import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from the project root.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Safely inject the API key for browser consumption.
      // Netlify or local .env provides either API_KEY or VITE_API_KEY.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY || '')
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});