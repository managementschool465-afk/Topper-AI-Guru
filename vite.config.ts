import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * 🚀 GYAN GURU - PRODUCTION VITE CONFIGURATION
 * * ✅ FIXES: 
 * 1. White Screen: base: './' का उपयोग ताकि असेट्स पाथ सही रहें।
 * 2. Mobile Load: Terser minification से फाइल साइज छोटा किया।
 * 3. AI Support: Gemini API Key को ब्राउज़र के लिए सेफ बनाया।
 */

export default defineConfig(({ mode }) => {
  // .env फाइल से वेरिएबल्स लोड करें
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // GitHub Pages और मोबाइल PWA के लिए रिलेटिव पाथ अनिवार्य है
    base: './',

    plugins: [
      react(),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        // '@' का उपयोग करके क्लीन इम्पोर्ट्स (जैसे: '@/components/...')
        '@': path.resolve(__dirname, './src'),
      },
    },

    define: {
      // API Key को सुरक्षित तरीके से डिफाइन करना
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ""),
    },

    server: {
      host: '0.0.0.0', // मोबाइल टेस्टिंग के लिए लोकल नेटवर्क पर उपलब्ध
      port: 3000,
      strictPort: true,
      hmr: {
        overlay: true, // एरर होने पर स्क्रीन पर दिखेगा
      },
      allowedHosts: true,
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // कोड को छोटा (Minify) करने के लिए 'terser' सबसे बेहतरीन है
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // लाइव होने पर console.log हटा देगा
          drop_debugger: true,
        },
      },
      // चंकिंग (Chunking) ताकि बड़ी फाइल्स लोड होने में अटके नहीं
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-ui': ['motion', 'lucide-react'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false, // प्रोडक्शन में सोर्स मैप की जरूरत नहीं
    },

    // अगर आप 'esbuild' इस्तेमाल कर रहे हैं तो वॉर्निंग्स कम करें
    optimizeDeps: {
      include: ['react', 'react-dom', 'motion', 'lucide-react'],
    },
  };
});
