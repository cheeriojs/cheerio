import Suites from './suite'; // eslint-disable-line n/file-extension-in-import
import type { Cheerio } from '../src/cheerio.js';
import type { Element } from 'domhandler';

const suites = new Suites();

const regexIdx = process.argv.indexOf('--regex') + 1;
if (regexIdx > 0) {
  if (regexIdx === process.argv.length) {
    throw new Error('Error: the "--regex" option requires a value');
  }
  suites.filter(process.argv[regexIdx]);
}
if (process.argv.includes('--cheerio-only')) {
  suites.cheerioOnly();
}

suites.add<void>('Select all', 'jquery.html', {
  setup() {
    return;
  },
  test($) {
    return $('*').length;
  },
});
suites.add<void>('Select some', 'jquery.html', {
  setup() {
    return;
  },
  test($) {
    return $('li').length;
  },
});

/*
 * Manipulation Tests
 */
suites.add<Cheerio<Element>>('manipulation - append', 'jquery.html', {
  setup($) {
    return $('body');
  },
  test(_, $body) {
    $body.append('<div>'.repeat(50));
  },
});

// These tests run out of memory in jsdom
suites.add<Cheerio<Element>>(
  'manipulation - prepend - highmem',
  'jquery.html',
  {
    setup($) {
      return $('body');
    },
    test(_, $body) {
      $body.prepend('<div>'.repeat(50));
    },
  }
);
suites.add<Cheerio<Element>>('manipulation - after - highmem', 'jquery.html', {
  setup($) {
    return $('body');
  },
  test(_, $body) {
    $body.after('<div>'.repeat(50));
  },
});
suites.add<Cheerio<Element>>('manipulation - before - highmem', 'jquery.html', {
  setup($) {
    return $('body');
  },
  test(_, $body) {
    $body.before('<div>'.repeat(50));
  },
});

suites.add<Cheerio<Element>>('manipulation - remove', 'jquery.html', {
  setup($) {
    return $('body');
  },
  test($, $lis) {
    const child = $('<div>');
    $lis.append(child);
    child.remove();
  },
});

suites.add<void>('manipulation - replaceWith', 'jquery.html', {
  setup($) {
    $('body').append('<div id="foo">');
  },
  test($) {
    $('#foo').replaceWith('<div id="foo">');
  },
});

suites.add<Cheerio<Element>>('manipulation - empty', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    $lis.empty();
  },
});
suites.add<Cheerio<Element>>('manipulation - html', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    $lis.html();
    $lis.html('foo');
  },
});
suites.add<Cheerio<Element>>('manipulation - html render', 'jquery.html', {
  setup($) {
    return $('body');
  },
  test(_, $lis) {
    $lis.html();
  },
});
suites.add<string>('manipulation - html independent', 'jquery.html', {
  setup() {
    return (
      '<div class="foo"><div id="bar">bat<hr>baz</div> </div>' +
      '<div class="foo"><div id="bar">bat<hr>baz</div> </div>' +
      '<div class="foo"><div id="bar">bat<hr>baz</div> </div>' +
      '<div class="foo"><div id="bar">bat<hr>baz</div> </div>' +
      '<div class="foo"><div id="bar">bat<hr>baz</div> </div>' +
      '<div class="foo"><div id="bar">bat<hr>baz</div> </div>'
    );
  },
  test($, content) {
    $(content).html();
  },
});
suites.add<Cheerio<Element>>('manipulation - text', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    $lis.text();
    $lis.text('foo');
  },
});

/*
 * Traversing Tests
 */
suites.add<Cheerio<Element>>('traversing - Find', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.find('li').length;
  },
});
suites.add<Cheerio<Element>>('traversing - Parent', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.parent('div').length;
  },
});
suites.add<Cheerio<Element>>('traversing - Parents', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.parents('div').length;
  },
});
suites.add<Cheerio<Element>>('traversing - Closest', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.closest('div').length;
  },
});
suites.add<Cheerio<Element>>('traversing - next', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.next().length;
  },
});
suites.add<Cheerio<Element>>('traversing - nextAll', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.nextAll('li').length;
  },
});
suites.add<Cheerio<Element>>('traversing - nextUntil', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.nextUntil('li').length;
  },
});
suites.add<Cheerio<Element>>('traversing - prev', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.prev().length;
  },
});
suites.add<Cheerio<Element>>('traversing - prevAll', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.prevAll('li').length;
  },
});
suites.add<Cheerio<Element>>('traversing - prevUntil', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.prevUntil('li').length;
  },
});
suites.add<Cheerio<Element>>('traversing - siblings', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.siblings('li').length;
  },
});
suites.add<Cheerio<Element>>('traversing - Children', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.children('a').length;
  },
});
suites.add<Cheerio<Element>>('traversing - Filter', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.filter('li').length;
  },
});
suites.add<Cheerio<Element>>('traversing - First', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.first().first().length;
  },
});
suites.add<Cheerio<Element>>('traversing - Last', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.last().last().length;
  },
});
suites.add<Cheerio<Element>>('traversing - Eq', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    return $lis.eq(0).eq(0).length;
  },
});

/*
 * Attributes Tests
 */
suites.add<Cheerio<Element>>('attributes - Attributes', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    $lis.attr('foo', 'bar');
    $lis.attr('foo');
    $lis.removeAttr('foo');
  },
});
suites.add<Cheerio<Element>>('attributes - Single Attribute', 'jquery.html', {
  setup($) {
    return $('body');
  },
  test(_, $lis) {
    $lis.attr('foo', 'bar');
    $lis.attr('foo');
    $lis.removeAttr('foo');
  },
});
suites.add<Cheerio<Element>>('attributes - Data', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    $lis.data('foo', 'bar');
    $lis.data('foo');
  },
});
suites.add<Cheerio<Element>>('attributes - Val', 'jquery.html', {
  setup($) {
    return $('select,input,textarea,option');
  },
  test($, $lis) {
    $lis.each(function () {
      $(this).val();
      $(this).val('foo');
    });
  },
});

suites.add<Cheerio<Element>>('attributes - Has class', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    $lis.hasClass('foo');
  },
});
suites.add<Cheerio<Element>>('attributes - Toggle class', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    $lis.toggleClass('foo');
  },
});
suites.add<Cheerio<Element>>('attributes - Add Remove class', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test(_, $lis) {
    $lis.addClass('foo');
    $lis.removeClass('foo');
  },
});
