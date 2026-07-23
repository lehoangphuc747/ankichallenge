// @ts-check
// Cấu hình Astro cho site hybrid (static pages + dynamic API routes), deploy lên Cloudflare Pages.
// Data được lưu trong Cloudflare KV, truy cập qua /api/data/* endpoints.

import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Server output: hỗ trợ API routes động để deploy lên Cloudflare Pages
  output: 'server',
  // Cloudflare adapter hỗ trợ SSR và API routes động trên Cloudflare Pages
  adapter: cloudflare(),

  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        // Ignore generated and frequently updated folders to reduce watcher churn.
        ignored: ['**/public/data/**', '**/output/**', '**/tmp/**']
      }
    }
  },

  integrations: [sitemap(), react()]
});
