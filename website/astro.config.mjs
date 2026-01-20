import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkDirective from 'remark-directive';
import { remarkAdmonitions } from './src/plugins/remark-admonitions.ts';
import { remarkFixTypedocLinks } from './src/plugins/remark-fix-typedoc-links.ts';
import { remarkLiveCode } from './src/plugins/remark-live-code.ts';
import { rehypeExternalLinks } from './src/plugins/rehype-external-links.ts';

export default defineConfig({
  site: 'https://cheerio.js.org',
  integrations: [mdx(), react(), sitemap()],
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unavatar.io',
      },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [
      remarkDirective,
      remarkAdmonitions,
      remarkFixTypedocLinks,
      remarkLiveCode,
    ],
    rehypePlugins: [rehypeExternalLinks],
  },
});
