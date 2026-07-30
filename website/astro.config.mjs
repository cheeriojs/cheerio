import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import { rehypeExternalLinks } from './src/plugins/rehype-external-links.ts';
import { remarkAdmonitions } from './src/plugins/remark-admonitions.ts';
import { remarkInternalLinks } from './src/plugins/remark-internal-links.ts';
import { remarkLiveCode } from './src/plugins/remark-live-code.ts';
import { remarkPageTitle } from './src/plugins/remark-page-title.ts';

export default defineConfig({
  site: 'https://cheerio.js.org',
  integrations: [mdx(), react(), sitemap()],
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: '*.github.com' },
      { protocol: 'https', hostname: 'images.opencollective.com' },
      { protocol: 'https', hostname: 'hasdata.com' },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        // Runs first, so it sees the document before anything rewrites it.
        remarkPageTitle,
        remarkDirective,
        remarkAdmonitions,
        remarkInternalLinks,
        remarkLiveCode,
      ],
      rehypePlugins: [rehypeExternalLinks],
    }),
  },
});
