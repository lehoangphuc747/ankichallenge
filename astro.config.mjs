// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
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

  integrations: [sitemap(), react(), mdx()]
});