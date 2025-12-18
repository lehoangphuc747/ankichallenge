// @ts-check
// Cấu hình Astro với Node adapter để chạy server routes (như /api/checkin) khi dev.
// Khi build production: output: 'server' + node adapter sẽ tạo server Node.js.
// Tuy nhiên khi deploy static lên Cloudflare Pages, bạn chỉ upload folder `dist/client`.

import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// Node adapter để chạy server routes khi dev (hỗ trợ fs/path)
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),

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
