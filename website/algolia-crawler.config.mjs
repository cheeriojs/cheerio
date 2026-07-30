/**
 * Algolia Crawler configuration for cheerio.js.org — app `NRR2XU4QSP`, index
 * `crawler_cheerio`, which is what the DocSearch box in the navbar queries.
 *
 * This file is the source of truth. `npm run sync:crawler` pushes it to
 * Algolia, and CI does that automatically whenever this file lands on `main`,
 * so the dashboard should never be edited by hand. Use `-- --dry-run` to print
 * the payload without sending it.
 *
 * The crawler's `apiKey` is deliberately absent: it is an Algolia *write* key
 * and must not live in a public repo. Syncing uses a partial update, so the
 * value already stored in the dashboard is left untouched.
 */

export const crawlerId = 'e44e1737-35b7-4dbc-8d59-873d3fdc729c';

export const config = {
  appId: 'NRR2XU4QSP',
  indexPrefix: 'crawler_',
  rateLimit: 8,
  maxDepth: 10,
  maxUrls: 5000,
  schedule: 'every 1 day at 3:00 pm',
  startUrls: ['https://cheerio.js.org/'],
  // Astro emits a sitemap index, not the flat /sitemap.xml Docusaurus used to.
  sitemaps: ['https://cheerio.js.org/sitemap-index.xml'],
  renderJavaScript: false,
  ignoreCanonicalTo: true,
  // GitHub Pages 301s extension-less URLs (/docs/intro -> /docs/intro/) via a
  // plain-http hop, so http:// must be in scope or those redirects are dropped
  // and the crawl finds nothing beyond the homepage.
  discoveryPatterns: ['https://cheerio.js.org/**', 'http://cheerio.js.org/**'],
  actions: [
    {
      indexName: 'cheerio',
      pathsToMatch: ['https://cheerio.js.org/**', 'http://cheerio.js.org/**'],
      recordExtractor: ({ $, helpers, url }) => {
        // lvl0 is the sidebar group owning the current page ("Basics",
        // "Classes", ...). The sidebar is rendered twice (desktop + mobile
        // drawer), so only the first match counts.
        const active = $('aside nav a[aria-current="page"]').first();
        const lvl0 =
          active.closest('details').children('summary').first().text().trim() ||
          active.closest('div').children('h3').first().text().trim() ||
          (url.pathname.startsWith('/blog') ? 'Blog' : 'Documentation');

        const recordProps = {
          lvl0: { selectors: '', defaultValue: lvl0 },
          // Must stay a single selector: docsearch matches every entry in an
          // array, not the first that hits, so a fallback list yields one
          // duplicate record per selector (`head > title` also drags in a
          // " | Cheerio" suffix). Every page has exactly one `main header h1`.
          lvl1: 'main header h1',
          lvl2: 'article h2',
          lvl3: 'article h3',
          content: 'article p, article li',
        };

        // Typedoc nests four heading levels deep and repeats generic
        // "Parameters"/"Returns" headings once per member — the Cheerio class
        // page alone has 795 of them, which exceeds the per-page record limit
        // and fails extraction for the most important page in the docs.
        // Stopping at h3 keeps one record per member; their prose still
        // aggregates into it.
        if (!url.pathname.startsWith('/docs/api/')) {
          recordProps.lvl4 = 'article h4';
          recordProps.lvl5 = 'article h5, article td:first-child';
          recordProps.lvl6 = 'article h6';
          recordProps.content = 'article p, article li, article td:last-child';
        }

        return helpers.docsearch({
          recordProps,
          indexHeadings: true,
          aggregateContent: true,
          recordVersion: 'v3',
        });
      },
    },
  ],
  safetyChecks: { beforeIndexPublishing: { maxLostRecordsPercentage: 30 } },
  initialIndexSettings: {
    cheerio: {
      attributesForFaceting: ['type', 'lang', 'language', 'version'],
      attributesToRetrieve: [
        'hierarchy',
        'content',
        'anchor',
        'url',
        'url_without_anchor',
        'type',
      ],
      attributesToHighlight: ['hierarchy', 'content'],
      attributesToSnippet: ['content:10'],
      camelCaseAttributes: ['hierarchy', 'content'],
      searchableAttributes: [
        'unordered(hierarchy.lvl0)',
        'unordered(hierarchy.lvl1)',
        'unordered(hierarchy.lvl2)',
        'unordered(hierarchy.lvl3)',
        'unordered(hierarchy.lvl4)',
        'unordered(hierarchy.lvl5)',
        'unordered(hierarchy.lvl6)',
        'content',
      ],
      distinct: true,
      attributeForDistinct: 'url',
      customRanking: [
        'desc(weight.pageRank)',
        'desc(weight.level)',
        'asc(weight.position)',
      ],
      ranking: [
        'words',
        'filters',
        'typo',
        'attribute',
        'proximity',
        'exact',
        'custom',
      ],
      highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
      highlightPostTag: '</span>',
      minWordSizefor1Typo: 3,
      minWordSizefor2Typos: 7,
      allowTyposOnNumericTokens: false,
      minProximity: 1,
      ignorePlurals: true,
      advancedSyntax: true,
      attributeCriteriaComputedByMinProximity: true,
      removeWordsIfNoResults: 'allOptional',
    },
  },
};
