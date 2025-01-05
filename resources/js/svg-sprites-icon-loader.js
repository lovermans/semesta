(() => {
    var iconAnchor = document.getElementById('icon-sprites');

    iconAnchor.onload = (event) => {
        iconAnchor.parentElement.id = 'inline-svg-icon';
        iconAnchor.outerHTML = iconAnchor.contentDocument.documentElement.outerHTML;
    };
})();