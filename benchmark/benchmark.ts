import fs from 'node:fs/promises';
import { Script } from 'node:vm';
import { Bench } from 'tinybench';
import type { Element } from 'domhandler';
import type { Cheerio } from '../src/cheerio.js';
import type { CheerioAPI } from '../src/load.js';
import { JSDOM } from 'jsdom';
import { load } from '../src/load-parse.js';

const documentDir = new URL('documents/', import.meta.url);
const jQuerySrc = await fs.readFile(
  new URL('../node_modules/jquery/dist/jquery.slim.js', import.meta.url),
  'utf8',
);
const jQueryScript = new Script(jQuerySrc);
const filterIndex = process.argv.indexOf('--filter') + 1;
const benchmarkFilter = filterIndex >= 0 ? process.argv[filterIndex] : '';

const cheerioOnly = process.argv.includes('--cheerio-only');

type SuiteOptions<T> = T extends void
  ? {
      test(this: void, $: CheerioAPI): void;
      setup?: (this: void, $: CheerioAPI) => T;
    }
  : {
      test(this: void, $: CheerioAPI, data: T): void;
      setup(this: void, $: CheerioAPI): T;
    };

async function benchmark<T = void>(
  name: string,
  fileName: string,
  options: SuiteOptions<T>,
): Promise<void> {
  if (!name.includes(benchmarkFilter)) {
    return;
  }
  const markup = await fs.readFile(new URL(fileName, documentDir), 'utf8');

  console.log(`Test: ${name} (file: ${fileName})`);

  const bench = new Bench();
  const { test, setup } = options;

  // Add Cheerio test
  const $ = load(markup);
  const setupData = setup?.($) as T;

  bench.add('cheerio', () => {
    test($, setupData);
  });

  // Add JSDOM test
  if (!cheerioOnly) {
    const dom = new JSDOM(markup, { runScripts: 'outside-only' });

    jQueryScript.runInContext(dom.getInternalVMContext());

    const setupData = setup?.(dom.window['$'] as CheerioAPI) as T;

    bench.add('jsdom', () => test(dom.window['$'] as CheerioAPI, setupData));
  }

  await bench.run();

  console.table(bench.table());
}

await benchmark('Select all', 'jquery.html', {
  test: ($) => $('*').length,
});
await benchmark('Select some', 'jquery.html', {
  test: ($) => $('li').length,
});

/*
 * Manipulation Tests
 */
const DIVS_MARKUP = '<div>'.repeat(50);
await benchmark<Cheerio<Element>>('manipulation - append', 'jquery.html', {
  setup: ($) => $('body'),
  test: (_, $body) => $body.append(DIVS_MARKUP),
});

// JSDOM used to run out of memory on these tests
await benchmark<Cheerio<Element>>(
  'manipulation - prepend - highmem',
  'jquery.html',
  {
    setup: ($) => $('body'),
    test: (_, $body) => $body.prepend(DIVS_MARKUP),
  },
);
await benchmark<Cheerio<Element>>(
  'manipulation - after - highmem',
  'jquery.html',
  {
    setup: ($) => $('body'),
    test: (_, $body) => $body.after(DIVS_MARKUP),
  },
);
await benchmark<Cheerio<Element>>(
  'manipulation - before - highmem',
  'jquery.html',
  {
    setup: ($) => $('body'),
    test: (_, $body) => $body.before(DIVS_MARKUP),
  },
);

await benchmark<Cheerio<Element>>('manipulation - remove', 'jquery.html', {
  setup: ($) => $('body'),
  test($, $lis) {
    const child = $('<div>');
    $lis.append(child);
    child.remove();
  },
});

await benchmark('manipulation - replaceWith', 'jquery.html', {
  setup($) {
    $('body').append('<div id="foo">');
  },
  test($) {
    $('#foo').replaceWith('<div id="foo">');
  },
});

await benchmark<Cheerio<Element>>('manipulation - empty', 'jquery.html', {
  setup: ($) => $('li'),
  test(_, $lis) {
    $lis.empty();
  },
});
await benchmark<Cheerio<Element>>('manipulation - html', 'jquery.html', {
  setup: ($) => $('li'),
  test(_, $lis) {
    $lis.html();
    $lis.html('foo');
  },
});
await benchmark<Cheerio<Element>>('manipulation - html render', 'jquery.html', {
  setup: ($) => $('body'),
  test(_, $lis) {
    $lis.html();
  },
});

const HTML_INDEPENDENT_MARKUP =
  '<div class="foo"><div id="bar">bat<hr>baz</div> </div>'.repeat(6);
await benchmark('manipulation - html independent', 'jquery.html', {
  test: ($) => $(HTML_INDEPENDENT_MARKUP).html(),
});
await benchmark<Cheerio<Element>>('manipulation - text', 'jquery.html', {
  setup: ($) => $('li'),
  test(_, $lis) {
    $lis.text();
    $lis.text('foo');
  },
});

/*
 * Traversing Tests
 */
await benchmark<Cheerio<Element>>('traversing - Find', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.find('li').length,
});
await benchmark<Cheerio<Element>>('traversing - Parent', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.parent('div').length,
});
await benchmark<Cheerio<Element>>('traversing - Parents', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.parents('div').length,
});
await benchmark<Cheerio<Element>>('traversing - Closest', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.closest('div').length,
});
await benchmark<Cheerio<Element>>('traversing - next', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.next().length,
});
await benchmark<Cheerio<Element>>('traversing - nextAll', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.nextAll('li').length,
});
await benchmark<Cheerio<Element>>('traversing - nextUntil', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.nextUntil('li').length,
});
await benchmark<Cheerio<Element>>('traversing - prev', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.prev().length,
});
await benchmark<Cheerio<Element>>('traversing - prevAll', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.prevAll('li').length,
});
await benchmark<Cheerio<Element>>('traversing - prevUntil', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.prevUntil('li').length,
});
await benchmark<Cheerio<Element>>('traversing - siblings', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.siblings('li').length,
});
await benchmark<Cheerio<Element>>('traversing - Children', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.children('a').length,
});
await benchmark<Cheerio<Element>>('traversing - Filter', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.filter('li').length,
});
await benchmark<Cheerio<Element>>('traversing - First', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.first().first().length,
});
await benchmark<Cheerio<Element>>('traversing - Last', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.last().last().length,
});
await benchmark<Cheerio<Element>>('traversing - Eq', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.eq(0).eq(0).length,
});

/*
 * Attributes Tests
 */
await benchmark<Cheerio<Element>>('attributes - Attributes', 'jquery.html', {
  setup: ($) => $('li'),
  test(_, $lis) {
    $lis.attr('foo', 'bar');
    $lis.attr('foo');
    $lis.removeAttr('foo');
  },
});
await benchmark<Cheerio<Element>>(
  'attributes - Single Attribute',
  'jquery.html',
  {
    setup: ($) => $('body'),
    test(_, $lis) {
      $lis.attr('foo', 'bar');
      $lis.attr('foo');
      $lis.removeAttr('foo');
    },
  },
);
await benchmark<Cheerio<Element>>('attributes - Data', 'jquery.html', {
  setup: ($) => $('li'),
  test(_, $lis) {
    $lis.data('foo', 'bar');
    $lis.data('foo');
  },
});
await benchmark<Cheerio<Element>>('attributes - Val', 'jquery.html', {
  setup: ($) => $('select,input,textarea,option'),
  test($, $lis) {
    $lis.each(function () {
      $(this).val();
      $(this).val('foo');
    });
  },
});

await benchmark<Cheerio<Element>>('attributes - Has class', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.hasClass('foo'),
});
await benchmark<Cheerio<Element>>('attributes - Toggle class', 'jquery.html', {
  setup: ($) => $('li'),
  test: (_, $lis) => $lis.toggleClass('foo'),
});
await benchmark<Cheerio<Element>>(
  'attributes - Add Remove class',
  'jquery.html',
  {
    setup: ($) => $('li'),
    test(_, $lis) {
      $lis.addClass('foo');
      $lis.removeClass('foo');
    },
  },
);
