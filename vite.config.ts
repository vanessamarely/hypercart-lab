import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";
// Removed GitHub Spark imports for standalone operation

import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH ? `/${process.env.VITE_BASE_PATH}/` : '/',
  plugins: [
    react(),
    tailwindcss(),
    // Removed GitHub Spark plugins for standalone operation
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    // Optimize for Vercel deployment
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      // Ensure external dependencies are handled correctly
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-avatar']
        }
      }
    }
  },
  optimizeDeps: {
    // Pre-bundle these dependencies for better performance
    include: ['react', 'react-dom', 'react-router-dom']
  }
});
