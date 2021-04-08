/* global document */
(function() {
    function setNavbarMainContentHeight() {
        var heading = document.querySelector('#navbar-heading');
        var searchBox = document.querySelector('#search-box');
        var sidebarMainContent = document.querySelector('#sidebar-main-content');

        var heightToSubtract = 32;

        if (heading) {
            heightToSubtract += heading.getBoundingClientRect().height;
        }

        if (searchBox) {
            heightToSubtract += searchBox.getBoundingClientRect().height;
        }

        // eslint-disable-next-line no-undef
        sidebarMainContent.style.height += window.innerHeight - heightToSubtract + 'px';
    }

    setNavbarMainContentHeight();
    // eslint-disable-next-line no-undef
    window.addEventListener('resize', setNavbarMainContentHeight);
})();
