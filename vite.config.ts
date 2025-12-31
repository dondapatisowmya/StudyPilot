import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Removed explicit process.env definitions and env loading to comply with 
  // guidelines and fix the process.cwd() reference error.
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});