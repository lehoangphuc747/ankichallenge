// @ts-check
// Cấu hình Astro cho site tĩnh, deploy lên Cloudflare Pages.
// Admin /api/checkin chỉ hoạt động khi dev local (không có trên production).

import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // Static output: build ra HTML/CSS/JS tĩnh để deploy lên Cloudflare Pages
  output: 'static',

  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        // Ignore changes in public/data to prevent page reload when JSON files are updated
        ignored: ['**/public/data/**']
      }
    }
  },

  integrations: [sitemap(), react(), mdx()]
});
