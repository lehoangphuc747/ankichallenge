// @ts-check
// Cấu hình Astro cho site hybrid (static pages + dynamic API routes), deploy lên Cloudflare Pages.
// Admin /api/checkin chỉ hoạt động khi dev local (không có trên production).

import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Server output: hỗ trợ API routes động để deploy lên Cloudflare Pages
  output: 'server',
  adapter: cloudflare(),

  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        // Ignore changes in public/data to prevent page reload when JSON files are updated
        ignored: ['**/public/data/**']
      }
    }
  },

  integrations: [sitemap(), react()]
});
