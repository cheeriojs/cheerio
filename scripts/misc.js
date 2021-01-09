/* global document */
function copy(value) {
    const el = document.createElement('textarea');

    el.value = value;
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
