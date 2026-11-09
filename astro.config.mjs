import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://eulok.com',
  integrations: [react()],
  devToolbar: {
    enabled: false,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  vite: {
    server: {
      hmr: false,
      ws: false,
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'lucide-react',
        'framer-motion',
      ],
      exclude: ['@astrojs/react'],
    },
  },
});
