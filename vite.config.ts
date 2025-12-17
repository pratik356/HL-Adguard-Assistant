import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Debug log to check if variables are actually loaded by Vite
  console.log("--> VITE ENV LOADED:", {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL ? "Exists (starts with " + env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 5) + ")" : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Exists" : "MISSING"
  });

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: ['hl-guard.vercel.app'],
    },
    plugins: [react()],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'], // Allow NEXT_PUBLIC_ vars to be exposed via import.meta.env
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});