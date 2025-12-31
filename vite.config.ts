import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from the project root.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Robust mapping for the API_KEY used by the Gemini SDK.
      // This checks common variable names used in Netlify/Local environments.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY || env.VITE_GEMINI_API_KEY || '')
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});