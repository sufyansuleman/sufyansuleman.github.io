// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://sufyansuleman.github.io',
  output: 'static',
  trailingSlash: 'always',
  redirects: { '/cv/': '/about/' },

  vite: {
    plugins: [tailwindcss()]
  },

  markdown: { shikiConfig: { theme: 'github-dark-high-contrast' } },
  integrations: [sitemap(), mdx(), icon()]
});
