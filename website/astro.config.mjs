import { readFileSync } from 'node:fs';
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

/*
 * The live editors install cheerio from npm. Pin them to the version this site
 * documents, so the examples can't drift from the docs when a new release ships.
 */
const cheerioVersion = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
).version;

export default defineConfig({
  site: 'https://cheerio.js.org',
  integrations: [mdx(), react(), sitemap()],
  // `extract` moved from Advanced to Basics; keep the published URL working.
  redirects: {
    '/docs/advanced/extract': '/docs/basics/extract/',
  },
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
    define: {
      __CHEERIO_VERSION__: JSON.stringify(cheerioVersion),
    },
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
