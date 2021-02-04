/* global document */
(function() {
    var targets = document.querySelectorAll('pre');
    var main = document.querySelector('#main');

    var footer = document.querySelector('#footer');
    var pageTitle = document.querySelector('#page-title');
    var pageTitleHeight = 0;

    var footerHeight = footer.getBoundingClientRect().height;

    if (pageTitle) {
        pageTitleHeight = pageTitle.getBoundingClientRect().height;

        // Adding margin (Outer height)
        pageTitleHeight += 45;
    }

    // subtracted 20 for extra padding.
    // eslint-disable-next-line no-undef
    var divMaxHeight = window.innerHeight - pageTitleHeight - footerHeight - 80;

    setTimeout(function() {
        targets.forEach(function(item) {
            var innerHTML = item.innerHTML;
            var divElement = document.createElement('div');

            divElement.style.maxHeight = divMaxHeight + 'px';
            divElement.style.marginTop = '2rem';
            divElement.innerHTML = innerHTML;
            // item.removeChild();
            item.innerHTML = '';
            item.appendChild(divElement);
        });

        // eslint-disable-next-line no-undef
        main.style.minHeight = window.innerHeight - footerHeight - 15 + 'px';

        // See if we have to move something into view
        // eslint-disable-next-line no-undef
        var location = window.location.href.split('#')[1];

        if (location && location.length > 0) {
            try {
                var element = document.querySelector('#'.concat(decodeURI(location)));

                element.scrollIntoView();
            } catch (error) {
                console.log(error);
            }
        }
    }, 300);
})();
