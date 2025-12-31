import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from the project root.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Required to use process.env.API_KEY in the client side as per instructions.
      // We look for API_KEY (standard) or VITE_GEMINI_API_KEY (common pattern).
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_GEMINI_API_KEY),
      'process.env': env
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});