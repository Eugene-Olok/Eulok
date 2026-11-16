import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const configuredSiteUrl =
  process.env.PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  process.env.CF_PAGES_URL ||
  'https://company-os-3ox.pages.dev';

// https://astro.build/config
export default defineConfig({
  site: configuredSiteUrl.replace(/\/+$/, ''),
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
      dedupe: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'lucide-react',
      ],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'lucide-react',
      ],
    },
  },
});
