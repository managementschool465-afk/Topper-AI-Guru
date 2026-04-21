import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

/**
 * Vite Configuration
 * 
 * ✅ WHITE SCREEN FIX:
 * 1. 'base: "./"' ensure karta hai ki assets (JS/CSS) kisi bhi path par sahi se load hon.
 * 2. GEMINI_API_KEY ko client-side access ke liye define kiya gaya hai.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // Relative path assets fix for iframe/deployment
    base: './',
    
    plugins: [
      react(), 
      tailwindcss()
    ],
    
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    
    server: {
      // Platform communication setup
      host: '0.0.0.0',
      port: 3000,
      
      // HMR AI Studio mein disabled hoti hai flickering rokne ke liye
      hmr: process.env.DISABLE_HMR !== 'true',
      
      // Allowed hosts check disable (needed for shared URLs)
      allowedHosts: true
    },
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      minify: 'terser',
      sourcemap: false
    }
  };
});
