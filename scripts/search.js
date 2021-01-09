/* global document */
function hideSearchList() {
    document.getElementById('search-item-ul').style.display = 'none';
}

function showSearchList() {
    document.getElementById('search-item-ul').style.display = 'block';
}

function checkClick(e) {
    if ( e.target.id !== 'search-box') {
        setTimeout(function() {
            hideSearchList();
        }, 60);

        /* eslint-disable-next-line */
        window.removeEventListener('click', checkClick);
    }
}

function search(list, options, keys, searchKey) {
    var defaultOptions = {
        shouldSort: true,
        threshold: 0.4,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: keys
    };

    var op = Object.assign({}, defaultOptions, options);

    /* eslint-disable-next-line */
    var fuse = new Fuse(list, op);
    var result = fuse.search(searchKey);
    var searchUL = document.getElementById('search-item-ul');

    searchUL.innerHTML = '';

    if (result.length === 0) {
        searchUL.innerHTML += '<li> No Result Found </li>';
    } else {
        result.forEach(function(item) {
            searchUL.innerHTML += '<li>' + item.link + '</li>';
        });
    }
}

/* eslint-disable-next-line */
function setupSearch(list, options) {
    var inputBox = document.getElementById('search-box');
    var keys = ['title'];

    inputBox.addEventListener('keyup', function() {
        if (inputBox.value !== '') {
            showSearchList();
            search(list, options, keys, inputBox.value);
        }
        else { hideSearchList(); }
    });

    inputBox.addEventListener('focus', function() {
        showSearchList();
        if (inputBox.value !== '') {
            search(list, options, keys, inputBox.value);
        }

        /* eslint-disable-next-line */
        window.addEventListener('click', checkClick);
    });
}


