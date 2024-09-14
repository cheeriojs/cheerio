// @ts-check

// @ts-ignore
const { themes } = require('prism-react-renderer');

const packageJson = require('../package.json');

/** @type {import('@docusaurus/types').Config} */
const config = {
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  /*
   * Even if you don't use internalization, you can use this field to set useful
   * metadata like html lang. For example, if your site is Chinese, you may want
   * to replace "en" with "zh-Hans".
   */
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  // GitHub pages deployment config.
  organizationName: 'cheeriojs', // Usually your GitHub org/user name.
  plugins: [
    [
      'client-redirects',
      /** @type {import('@docusaurus/plugin-client-redirects').Options} */
      ({
        fromExtensions: ['html'],
        redirects: [
          // Classes
          {
            from: `/classes/Cheerio.html`,
            to: `/docs/api/classes/Cheerio`,
          },

          // Interfaces
          ...['CheerioAPI', 'CheerioOptions', 'HTMLParser2Options'].map(
            (name) => ({
              from: `/interfaces/${name}.html`,
              to: `/docs/api/interfaces/${name}`,
            }),
          ),

          // Type aliases and functions

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
            to: '/docs/api',
          },
        ],
      }),
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        // TypeDoc options
        entryPoints: ['../src/index.ts'],
        excludePrivate: true,
        externalSymbolLinkMappings: {
          domhandler: {
            AnyNode: 'https://domhandler.js.org/types/AnyNode.html',
            ChildNode: 'https://domhandler.js.org/types/ChildNode.html',
            Document: 'https://domhandler.js.org/classes/Document.html',

            DomHandlerOptions:
              'https://domhandler.js.org/interfaces/DomHandlerOptions.html',
            Element: 'https://domhandler.js.org/classes/Element.html',
            Node: 'https://domhandler.js.org/classes/Node.html',

            ParentNode: 'https://domhandler.js.org/types/ParentNode.html',
          },
          parse5: {
            ParserOptions:
              'https://parse5.js.org/interfaces/parse5.ParserOptions.html',
          },
        },
        outputFileStrategy: 'members',

        plugin: ['typedoc-plugin-mdn-links'],

        readme: 'none',

        // Plugin options
        sidebar: {
          // Always display the API entry last
          position: Number.MAX_SAFE_INTEGER,
          pretty: true,
        },
        tsconfig: '../tsconfig.typedoc.json',
      },
    ],
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        blog: {
          editUrl: 'https://github.com/cheeriojs/cheerio/tree/main/website/',
          showReadingTime: true,
        },
        docs: {
          editUrl: 'https://github.com/cheeriojs/cheerio/tree/main/website/',
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
        },
        gtag: {
          trackingID: 'G-PZHRH775FB',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  projectName: 'cheerio', // Usually your repo name.
  tagline: packageJson.description,

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        apiKey: '9d30ee79d65ccc63b95e693124e05405',
        appId: 'NRR2XU4QSP',
        indexName: 'crawler_cheerio',
      },
      announcementBar: {
        content:
          "Cheerio 1.0 is out! <a href='/blog/cheerio-1.0'>Learn more about what's new</a>",
        id: 'announcementBar-1.0-1', // Increment on change
      },
      footer: {
        copyright: `Copyright © ${new Date().getFullYear()} The Cheerio contributors`,
        links: [
          {
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
              {
                label: 'API',
                to: 'docs/api',
              },
            ],
            title: 'Docs',
          },
          {
            items: [
              {
                href: 'https://stackoverflow.com/questions/tagged/cheerio',
                label: 'Stack Overflow',
              },
              {
                href: 'https://github.com/cheeriojs/cheerio',
                label: 'GitHub',
              },
              /*
               * {
               *   label: 'Twitter',
               *   href: 'https://twitter.com/docusaurus',
               * },
               */
            ],
            title: 'Community',
          },
          {
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                href: '/attribution',
                label: 'Attribution',
              },
            ],
            title: 'More',
          },
        ],
        style: 'dark',
      },
      metadata: [
        {
          content: `${packageJson.keywords.join(', ')}, nodejs`,
          name: 'keywords',
        },
      ],
      navbar: {
        items: [
          {
            docId: 'intro',
            label: 'Tutorial',
            position: 'left',
            type: 'doc',
          },
          {
            label: 'API',
            position: 'left',
            to: 'docs/api',
          },
          { label: 'Blog', position: 'left', to: '/blog' },
          {
            href: 'https://github.com/cheeriojs/cheerio',
            label: 'GitHub',
            position: 'right',
          },
        ],
        logo: {
          alt: 'Cheerio Logo',
          src: 'img/orange-c.svg',
        },
        title: 'Cheerio',
      },
      prism: {
        darkTheme: themes.dracula,
        theme: themes.github,
      },
    }),

  themes: ['@docusaurus/theme-live-codeblock'],

  title: packageJson.name,

  trailingSlash: false,

  url: packageJson.homepage,
};

module.exports = config;
