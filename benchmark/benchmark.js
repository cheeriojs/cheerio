#!/usr/bin/env node

var Suites = require('./suite');
var suites = new Suites();

var regexIdx = process.argv.indexOf('--regex') + 1;
if (regexIdx > 0) {
  if (regexIdx === process.argv.length) {
    console.error('Error: the "--regex" option requires a value');
    process.exit(1);
  }
  suites.filter(process.argv[regexIdx]);
}
if (process.argv.indexOf('--cheerio-only') >= 0) {
  suites.cheerioOnly();
}

suites.add('Select all', 'jquery.html', {
  test: function($) { $('*').length; }
});
suites.add('Select some', 'jquery.html', {
  test: function($) { $('li').length; }
});

/*
 * Manipulation Tests
 */
suites.add('manipulation - append', 'jquery.html', {
  setup: function($) {
    return $('body');
  },
  test: function($, $body) {
    $body.append(new Array(50).join('<div>'));
  }
});

// These tests run out of memory in jsdom
suites.add('manipulation - prepend - highmem', 'jquery.html', {
  setup: function($) {
    return $('body');
  },
  test: function($, $body) {
    $body.prepend(new Array(50).join('<div>'));
  }
});
suites.add('manipulation - after - highmem', 'jquery.html', {
  setup: function($) {
    return $('body');
  },
  test: function($, $body) {
    $body.after(new Array(50).join('<div>'));
  }
});
suites.add('manipulation - before - highmem', 'jquery.html', {
  setup: function($) {
    return $('body');
  },
  test: function($, $body) {
    $body.before(new Array(50).join('<div>'));
  }
});

suites.add('manipulation - remove', 'jquery.html', {
  setup: function($) {
    return $('body');
  },
  test: function($, $lis) {
    var child = $('<div>');
    $lis.append(child);
    child.remove();
  }
});

suites.add('manipulation - replaceWith', 'jquery.html', {
  setup: function($) {
    $('body').append('<div id="foo">');
  },
  test: function($, $lis) {
    $('#foo').replaceWith('<div id="foo">');
  }
});

suites.add('manipulation - empty', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.empty();
  }
});
suites.add('manipulation - html', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.html();
    $lis.html('foo');
  }
});
suites.add('manipulation - html render', 'jquery.html', {
  setup: function($) {
    return $('body');
  },
  test: function($, $lis) {
    $lis.html();
  }
});
suites.add('manipulation - html independent', 'jquery.html', {
  setup: function() {
    return '<div class="foo"><div id="bar">bat<hr>baz</div> </div>'
        + '<div class="foo"><div id="bar">bat<hr>baz</div> </div>'
        + '<div class="foo"><div id="bar">bat<hr>baz</div> </div>'
        + '<div class="foo"><div id="bar">bat<hr>baz</div> </div>'
        + '<div class="foo"><div id="bar">bat<hr>baz</div> </div>'
        + '<div class="foo"><div id="bar">bat<hr>baz</div> </div>';
  },
  test: function($, content) {
    $(content).html();
  }
});
suites.add('manipulation - text', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.text();
    $lis.text('foo');
  }
});


/*
 * Traversing Tests
 */
suites.add('traversing - Find', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.find('li').length;
  }
});
suites.add('traversing - Parent', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.parent('div').length;
  }
});
suites.add('traversing - Parents', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.parents('div').length;
  }
});
suites.add('traversing - Closest', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.closest('div').length;
  }
});
suites.add('traversing - next', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.next().length;
  }
});
suites.add('traversing - nextAll', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.nextAll('li').length;
  }
});
suites.add('traversing - nextUntil', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.nextUntil('li').length;
  }
});
suites.add('traversing - prev', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.prev().length;
  }
});
suites.add('traversing - prevAll', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.prevAll('li').length;
  }
});
suites.add('traversing - prevUntil', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.prevUntil('li').length;
  }
});
suites.add('traversing - siblings', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.siblings('li').length;
  }
});
suites.add('traversing - Children', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.children('a').length;
  }
});
suites.add('traversing - Filter', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.filter('li').length;
  }
});
suites.add('traversing - First', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.first().first().length;
  }
});
suites.add('traversing - Last', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.last().last().length;
  }
});
suites.add('traversing - Eq', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.eq(0).eq(0).length;
  }
});


/*
 * Attributes Tests
 */
suites.add('attributes - Attributes', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.attr('foo', 'bar');
    $lis.attr('foo');
    $lis.removeAttr('foo');
  }
});
suites.add('attributes - Single Attribute', 'jquery.html', {
  setup: function($) {
    return $('body');
  },
  test: function($, $lis) {
    $lis.attr('foo', 'bar');
    $lis.attr('foo');
    $lis.removeAttr('foo');
  }
});
suites.add('attributes - Data', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.data('foo', 'bar');
    $lis.data('foo');
  }
});
suites.add('attributes - Val', 'jquery.html', {
  setup: function($) {
    return $('select,input,textarea,option');
  },
  test: function($, $lis) {
    $lis.each(function() {
      $(this).val();
      $(this).val('foo');
    });
  }
});

suites.add('attributes - Has class', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.hasClass('foo');
  }
});
suites.add('attributes - Toggle class', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.toggleClass('foo');
  }
});
suites.add('attributes - Add Remove class', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.addClass('foo');
    $lis.removeClass('foo');
  }
});
