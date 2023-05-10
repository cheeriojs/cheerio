// @ts-check

// @ts-ignore
const { themes } = require('prism-react-renderer');

// eslint-disable-next-line n/no-unpublished-require
const packageJson = require('../package.json');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: packageJson.name,
  tagline: packageJson.description,
  url: packageJson.homepage,
  baseUrl: '/',
  trailingSlash: false,
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
        gtag: {
          trackingID: 'G-PZHRH775FB',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      announcementBar: {
        id: 'announcementBar-not-yet-done-1', // Increment on change
        content:
          "Cheerio's website is still a work-in-progress, and covers Cheerio's next release that isn't available yet. <a href='https://github.com/cheeriojs/cheerio/discussions/3002'>We would love your help in making this website better!</a>",
      },
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
              {
                label: 'GitHub',
                href: 'https://github.com/cheeriojs/cheerio',
              },
              /*
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
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} The Cheerio contributors`,
      },
      metadata: [
        {
          name: 'keywords',
          content: `${packageJson.keywords.join(', ')}, nodejs`,
        },
      ],
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
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
      'client-redirects',
      /** @type {import('@docusaurus/plugin-client-redirects').Options} */
      ({
        fromExtensions: ['html'],
        redirects: [
          // Classes
          ...['Cheerio', 'Document', 'Element', 'Node'].map((name) => ({
            from: `/classes/${name}.html`,
            to: `/docs/api/classes/${name}`,
          })),

          // Interfaces
          ...[
            'CheerioAPI',
            'CheerioOptions',
            'HTMLParser2Options',
            'Parse5Options',
          ].map((name) => ({
            from: `/interfaces/${name}.html`,
            to: `/docs/api/interfaces/${name}`,
          })),

          // Type aliases and functions

          // `Parse5Options` is now an interface.
          {
            from: '/types/Parse5Options.html',
            to: '/docs/api/interfaces/Parse5Options',
          },

          {
            /*
             * Type aliases and functions are all part of the `api` page. We
             * unfortunately can't redirect to a specific function, so we
             * redirect to the top of the page.
             */
            from: [
              ...[
                'AcceptedElems',
                'AcceptedFilters',
                'AnyNode',
                'BasicAcceptedElems',
                'FilterFunction',
                'ParentNode',
                'SelectorType',
              ].map((name) => `/types/${name}.html`),

              ...[
                'contains',
                'default',
                'html',
                'load',
                'merge',
                'parseHTML',
                'root',
                'text',
                'xml',
              ].map((name) => `/functions/${name}.html`),
            ],
            to: `/docs/api/`,
          },
        ],
      }),
    ],
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
