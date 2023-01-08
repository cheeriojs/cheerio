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
          sidebarPath: require.resolve('./sidebars.js'),
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
          src: 'img/logo.svg',
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
          { to: '/blog', label: 'Blog', position: 'left' },
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

  plugins: [
    [
      'docusaurus-plugin-typedoc',

      {
        // TypeDoc options
        entryPoints: ['../src/batteries.ts'],
        tsconfig: '../tsconfig.json',
        readme: 'none',
        excludePrivate: true,

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
