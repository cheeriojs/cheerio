/* global document */
var accordionLocalStorageKey = 'accordion-id';

// eslint-disable-next-line no-undef
var localStorage = window.localStorage;

/**
 *
 * @param {string} value
 */
function copy(value) {
    const el = document.createElement('textarea');
    const editedValue = value.replace(/JAVASCRIPT\nCopied!$/, '');

    el.value = editedValue;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

function showTooltip(id) {
    var tooltip = document.getElementById(id);

    tooltip.classList.add('show-tooltip');
    setTimeout(function() {
        tooltip.classList.remove('show-tooltip');
    }, 3000);
}

/* eslint-disable-next-line */
function copyFunction(id) {
    // selecting the pre element
    var code = document.getElementById(id);

    // selecting the ol.linenums
    var element = code.querySelector('.linenums');

    if (!element) {
        // selecting the code block
        element = code.querySelector('code');
    }

    // copy
    copy(element.innerText);

    // show tooltip
    showTooltip('tooltip-' + id);
}

(function() {
    // capturing all pre element on the page
    var allPre = document.getElementsByTagName('pre');


    var i, classList;

    for ( i = 0; i < allPre.length; i++) {
        // get the list of class in current pre element
        classList = allPre[i].classList;
        var id = 'pre-id-' + i;

        // tooltip
        var tooltip = '<div class="tooltip" id="tooltip-' + id + '">Copied!</div>';

        // template of copy to clipboard icon container
        var copyToClipboard = '<div class="code-copy-icon-container" onclick="copyFunction(\'' + id + '\')"><div><svg class="sm-icon" alt="click to copy"><use xlink:href="#copy-icon"></use></svg>' + tooltip + '<div></div>';

        // extract the code language
        var langName = classList[classList.length - 1].split('-')[1];

        if ( langName === undefined ) { langName = 'JavaScript'; }

        // if(langName != undefined)
        var langNameDiv = '<div class="code-lang-name-container"><div class="code-lang-name">' + langName.toLocaleUpperCase() + '</div></div>';
        // else langNameDiv = '';

        // appending everything to the current pre element
        allPre[i].innerHTML += '<div class="pre-top-bar-container">' + langNameDiv + copyToClipboard + '</div>';
        allPre[i].setAttribute('id', id);
    }
})();


/**
 * Function to set accordion id to localStorage.
 * @param {string} id Accordion id
 */
function setAccordionIdToLocalStorage(id) {
    /**
     * @type {object}
     */
    var ids = JSON.parse(localStorage.getItem(accordionLocalStorageKey));

    ids[id] = id;
    localStorage.setItem(accordionLocalStorageKey, JSON.stringify(ids));
}

/**
 * Function to remove accordion id from localStorage.
 * @param {string} id Accordion id
 */
function removeAccordionIdFromLocalStorage(id) {
    /**
     * @type {object}
     */
    var ids = JSON.parse(localStorage.getItem(accordionLocalStorageKey));

    delete ids[id];
    localStorage.setItem(accordionLocalStorageKey, JSON.stringify(ids));
}

/**
 * Function to get all accordion ids from localStorage.
 *
 * @returns {object}
 */
function getAccordionIdsFromLocalStorage() {
    /**
     * @type {object}
     */
    var ids = JSON.parse(localStorage.getItem(accordionLocalStorageKey));

    return ids || {};
}


function toggleAccordion(element, isImmediate) {
    var currentNode = element;
    var isCollapsed = currentNode.classList.contains('collapsed');
    var currentNodeUL = currentNode.querySelector('.accordion-content');

    if (isCollapsed) {
        if (isImmediate) {
            currentNode.classList.remove('collapsed');
            currentNodeUL.style.height = 'auto';

            return;
        }

        var scrollHeight = currentNodeUL.scrollHeight;

        currentNodeUL.style.height = scrollHeight + 'px';
        currentNode.classList.remove('collapsed');
        setAccordionIdToLocalStorage(currentNode.id);
        setTimeout(function() {
            if (!currentNode.classList.contains('collapsed'))
            { currentNodeUL.style.height = 'auto'; }
        }, 600);
    } else {
        currentNodeUL.style.height = '0px';
        currentNode.classList.add('collapsed');
        removeAccordionIdFromLocalStorage(currentNode.id);
    }
}

(function() {
    if (localStorage.getItem(accordionLocalStorageKey) === undefined ||
    localStorage.getItem(accordionLocalStorageKey) === null
    ) {
        console.log('reset', localStorage.getItem(accordionLocalStorageKey));
        localStorage.setItem(accordionLocalStorageKey, '{}');
    }
    var allAccordion = document.querySelectorAll('.accordion-heading');
    var ids = getAccordionIdsFromLocalStorage();


    allAccordion.forEach(function(item) {
        var parent = item.parentNode;

        item.addEventListener('click', function() { toggleAccordion(parent); } );
        if (parent.id in ids) {
            toggleAccordion(parent, true);
        }
    });
})();


/**
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} navbar
 */
function toggleNavbar(element, navbar) {
    console.log('cliced');
    /**
     * If class is present than it is expanded.
     */
    var isExpanded = element.classList.contains('expanded');

    if (isExpanded) {
        element.classList.remove('expanded');
        navbar.classList.remove('expanded');
    } else {
        element.classList.add('expanded');
        navbar.classList.add('expanded');
    }
}

/**
 * Navbar ham
 */
(function() {
    var navbarHam = document.querySelector('#navbar-ham');
    var navbar = document.querySelector('#navbar');

    console.log('adding', navbarHam, navbar);

    if (navbarHam && navbar) {
        navbarHam.addEventListener('click', function() {
            toggleNavbar(navbarHam, navbar);
        });
    }
})();
