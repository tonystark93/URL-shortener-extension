// Applies chrome.i18n messages to the DOM.
// Elements opt in with data-i18n (textContent), data-i18n-ph (placeholder),
// data-i18n-title (title) or data-i18n-value (value) attributes.
(function () {
    function msg(key) {
        return key ? chrome.i18n.getMessage(key) : '';
    }

    function applyAttr(attr, fn) {
        var nodes = document.querySelectorAll('[' + attr + ']');
        for (var i = 0; i < nodes.length; i++) {
            var m = msg(nodes[i].getAttribute(attr));
            if (m) {
                fn(nodes[i], m);
            }
        }
    }

    function apply() {
        applyAttr('data-i18n', function (el, m) { el.textContent = m; });
        applyAttr('data-i18n-ph', function (el, m) { el.setAttribute('placeholder', m); });
        applyAttr('data-i18n-title', function (el, m) { el.setAttribute('title', m); });
        applyAttr('data-i18n-value', function (el, m) { el.setAttribute('value', m); });

        var lang = msg('@@ui_locale');
        if (lang) {
            document.documentElement.setAttribute('lang', lang.replace('_', '-'));
        }
        var dir = msg('@@bidi_dir');
        if (dir) {
            document.documentElement.setAttribute('dir', dir);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', apply);
    } else {
        apply();
    }
})();
