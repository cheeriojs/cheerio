// @ts-check

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// eslint-disable-next-line n/no-unpublished-require
const packageJson = require('../package.json');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: packageJson.name,
  tagline: packageJson.description,
  url: packageJson.homepage,
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  organizationName: 'cheeriojs', // Usually your GitHub org/user name.
  projectName: 'cheerio', // Usually your repo name.

  /*
   * Even if you don't use internalization, you can use this field to set useful
   * metadata like html lang. For example, if your site is Chinese, you may want
   * to replace "en" with "zh-Hans".
   */
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          editUrl: 'https://github.com/cheeriojs/cheerio/tree/main/website/',
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/cheeriojs/cheerio/tree/main/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Cheerio',
        logo: {
          alt: 'Cheerio Logo',
          src: 'img/orange-c.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Tutorial',
          },
          {
            to: 'docs/api/',
            label: 'API',
            position: 'left',
          },
          // { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/cheeriojs/cheerio',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
              {
                label: 'API',
                to: 'docs/api/',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/cheerio',
              },
              /*
               * {
               *   label: 'Discord',
               *   href: 'https://discordapp.com/invite/docusaurus',
               * },
               * {
               *   label: 'Twitter',
               *   href: 'https://twitter.com/docusaurus',
               * },
               */
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'Attribution',
                href: '/attribution',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/cheeriojs/cheerio',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} The Cheerio contributors`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: 'NRR2XU4QSP',
        apiKey: '40f62d369f1e54db758fbc13076de406',
        indexName: 'cheerio',
      },
    }),

  themes: ['@docusaurus/theme-live-codeblock'],

  plugins: [
    [
      'docusaurus-plugin-typedoc',

      {
        // TypeDoc options
        entryPoints: ['../src/batteries.ts'],
        tsconfig: '../tsconfig.json',
        plugin: ['./typedoc/typedoc-plugin-class-fns-to-methods.cjs'],
        readme: 'none',
        excludePrivate: true,

        externalSymbolLinkMappings: {
          typescript: {
            Promise:
              'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
            URL: 'https://developer.mozilla.org/en-US/docs/Web/API/URL',
          },
          domhandler: {
            Document: 'https://domhandler.js.org/classes/Document.html',
            Element: 'https://domhandler.js.org/classes/Element.html',
            Node: 'https://domhandler.js.org/classes/Node.html',

            AnyNode: 'https://domhandler.js.org/types/AnyNode.html',
            ChildNode: 'https://domhandler.js.org/types/ChildNode.html',
            ParentNode: 'https://domhandler.js.org/types/ParentNode.html',

            DomHandlerOptions:
              'https://domhandler.js.org/interfaces/DomHandlerOptions.html',
          },
          parse5: {
            ParserOptions:
              'https://parse5.js.org/interfaces/parse5.ParserOptions.html',
          },
        },

        // Plugin options
        sidebar: {
          // Always display the API entry last
          position: Number.MAX_SAFE_INTEGER,
        },
      },
    ],
  ],
};

module.exports = config;
