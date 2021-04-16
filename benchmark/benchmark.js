'use strict';

const Suites = require('./suite');
const suites = new Suites();

const regexIdx = process.argv.indexOf('--regex') + 1;
if (regexIdx > 0) {
  if (regexIdx === process.argv.length) {
    throw new Error('Error: the "--regex" option requires a value');
  }
  suites.filter(process.argv[regexIdx]);
}
if (process.argv.indexOf('--cheerio-only') >= 0) {
  suites.cheerioOnly();
}

suites.add('Select all', 'jquery.html', {
  test($) {
    return $('*').length;
  },
});
suites.add('Select some', 'jquery.html', {
  test($) {
    return $('li').length;
  },
});

/*
 * Manipulation Tests
 */
suites.add('manipulation - append', 'jquery.html', {
  setup($) {
    return $('body');
  },
  test($, $body) {
    $body.append(new Array(50).join('<div>'));
  },
});

// These tests run out of memory in jsdom
suites.add('manipulation - prepend - highmem', 'jquery.html', {
  setup($) {
    return $('body');
  },
  test($, $body) {
    $body.prepend(new Array(50).join('<div>'));
  },
});
suites.add('manipulation - after - highmem', 'jquery.html', {
  setup($) {
    return $('body');
  },
  test($, $body) {
    $body.after(new Array(50).join('<div>'));
  },
});
suites.add('manipulation - before - highmem', 'jquery.html', {
  setup($) {
    return $('body');
  },
  test($, $body) {
    $body.before(new Array(50).join('<div>'));
  },
});

suites.add('manipulation - remove', 'jquery.html', {
  setup($) {
    return $('body');
  },
  test($, $lis) {
    const child = $('<div>');
    $lis.append(child);
    child.remove();
  },
});

suites.add('manipulation - replaceWith', 'jquery.html', {
  setup($) {
    $('body').append('<div id="foo">');
  },
  test($) {
    $('#foo').replaceWith('<div id="foo">');
  },
});

suites.add('manipulation - empty', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    $lis.empty();
  },
});
suites.add('manipulation - html', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    $lis.html();
    $lis.html('foo');
  },
});
suites.add('manipulation - html render', 'jquery.html', {
  setup($) {
    return $('body');
  },
  test($, $lis) {
    $lis.html();
  },
});
suites.add('manipulation - html independent', 'jquery.html', {
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
suites.add('manipulation - text', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    $lis.text();
    $lis.text('foo');
  },
});

/*
 * Traversing Tests
 */
suites.add('traversing - Find', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.find('li').length;
  },
});
suites.add('traversing - Parent', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.parent('div').length;
  },
});
suites.add('traversing - Parents', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.parents('div').length;
  },
});
suites.add('traversing - Closest', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.closest('div').length;
  },
});
suites.add('traversing - next', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.next().length;
  },
});
suites.add('traversing - nextAll', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.nextAll('li').length;
  },
});
suites.add('traversing - nextUntil', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.nextUntil('li').length;
  },
});
suites.add('traversing - prev', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.prev().length;
  },
});
suites.add('traversing - prevAll', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.prevAll('li').length;
  },
});
suites.add('traversing - prevUntil', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.prevUntil('li').length;
  },
});
suites.add('traversing - siblings', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.siblings('li').length;
  },
});
suites.add('traversing - Children', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.children('a').length;
  },
});
suites.add('traversing - Filter', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.filter('li').length;
  },
});
suites.add('traversing - First', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.first().first().length;
  },
});
suites.add('traversing - Last', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.last().last().length;
  },
});
suites.add('traversing - Eq', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    return $lis.eq(0).eq(0).length;
  },
});

/*
 * Attributes Tests
 */
suites.add('attributes - Attributes', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    $lis.attr('foo', 'bar');
    $lis.attr('foo');
    $lis.removeAttr('foo');
  },
});
suites.add('attributes - Single Attribute', 'jquery.html', {
  setup($) {
    return $('body');
  },
  test($, $lis) {
    $lis.attr('foo', 'bar');
    $lis.attr('foo');
    $lis.removeAttr('foo');
  },
});
suites.add('attributes - Data', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    $lis.data('foo', 'bar');
    $lis.data('foo');
  },
});
suites.add('attributes - Val', 'jquery.html', {
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

suites.add('attributes - Has class', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    $lis.hasClass('foo');
  },
});
suites.add('attributes - Toggle class', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    $lis.toggleClass('foo');
  },
});
suites.add('attributes - Add Remove class', 'jquery.html', {
  setup($) {
    return $('li');
  },
  test($, $lis) {
    $lis.addClass('foo');
    $lis.removeClass('foo');
  },
});
