(function (root) {
    'use strict';

    // review-fixes 23/09/2026: these theme cookies used to be written for the whole site (path=/). The HTML
    // cache skips every page for a visitor who carries a cookie it does not know, for as long as 7 days.
    // Expire only the old site-wide copies; the page-scoped copies scripts.js writes now stay untouched.
    // This file loads on every page (the home page does not load scripts.js).
    if (root.document && typeof root.document.cookie === 'string') {
        ['date-of-receipt', 'time-of-receipt', 'invoice-request', 'buildpc-filter-sort', 'buildpc-keyword'].forEach(function (name) {
            if ((' ' + root.document.cookie).indexOf(' ' + name + '=') !== -1) {
                root.document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT';
            }
        });
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
        });
    }

    function products(response, limit) {
        var decoded;
        try { decoded = typeof response === 'string' ? JSON.parse(response) : response; } catch (_) { return []; }
        if (!decoded || decoded.error || !Array.isArray(decoded.data)) return [];
        return decoded.data.slice(0, Math.min(100, Math.max(1, limit || 30))).filter(function (item) {
            return item && Number.isInteger(Number(item.id)) && Number(item.id) > 0 && typeof item.name === 'string';
        }).map(function (item) {
            // These values are interpolated into HTML by the retained bundles.
            return {
                id: Number(item.id), name: escapeHtml(item.name), sku: escapeHtml(item.sku),
                main_image: escapeHtml(item.main_image),
                slugable: item.slugable && typeof item.slugable.key === 'string' ? {key: escapeHtml(item.slugable.key)} : null,
                price: Number.isFinite(Number(item.price)) ? Math.max(0, Number(item.price)) : 0,
                original_price: Number.isFinite(Number(item.original_price)) ? Math.max(0, Number(item.original_price)) : 0,
                front_sale_price: Number.isFinite(Number(item.front_sale_price)) ? Math.max(0, Number(item.front_sale_price)) : 0
            };
        });
    }

    function trackCart(response, event) {
        if (!response || response.error || !response.data || response.data.status !== true) return false;
        var analytics = response.data.analytics;
        if (!analytics || analytics.event !== event || !analytics.ecommerce || !Array.isArray(analytics.ecommerce.items)) return false;
        var item = analytics.ecommerce.items[0];
        if (analytics.ecommerce.items.length !== 1 || !item || !item.item_id || !Number.isFinite(item.price) || !Number.isInteger(item.quantity) || item.quantity < 1) return false;
        if (analytics.use_gtag && typeof root.gtag === 'function') {
            root.gtag('event', event, analytics.ecommerce);
        } else {
            root.dataLayer = root.dataLayer || [];
            root.dataLayer.push({ecommerce: null});
            root.dataLayer.push({event: event, ecommerce: analytics.ecommerce});
        }
        return true;
    }

    root.IctCatalog = {
        products: products,
        trackAdded: function (response) { return trackCart(response, 'add_to_cart'); },
        trackRemoved: function (response) { return trackCart(response, 'remove_from_cart'); }
    };
    function configurePreviewXsrf() {
        var meta = root.document && root.document.querySelector('meta[name="csrf-cookie"]');
        if (meta && root.axios && root.axios.defaults) {
            root.axios.defaults.xsrfCookieName = meta.content;
            root.axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
        }
    }
    configurePreviewXsrf();
    if (root.document) root.document.addEventListener('DOMContentLoaded', configurePreviewXsrf, {once: true});
    // Both retained storefront bundles use this endpoint, but older compiled
    // bundles alert the English HTTP status. Keep their public error contract
    // in one place without rebuilding unrelated UI code.
    if (root.jQuery) {
        root.jQuery.ajaxPrefilter(function (options) {
            if (! /\/ajax\/search-product-by-keyword(?:\?|$)/.test(options.url || '')) return;
            options.error = function (xhr, status) {
                if (status === 'abort') return;
                var payload = xhr.responseJSON;
                if (!payload) {
                    try { payload = JSON.parse(xhr.responseText); } catch (_) { payload = null; }
                }
                var message = payload && typeof payload.message === 'string' && payload.message
                    ? payload.message : 'Chưa tìm kiếm được. Anh/chị vui lòng thử lại.';
                root.jQuery('.search_btn').prop('disabled', false);
                root.jQuery('#compare-search-result').empty()
                    .append(root.jQuery('<p class="mb-0 text-center mt-3" role="status">').text(message)).show();
            };
        });
    }
    if (typeof module !== 'undefined' && module.exports) module.exports = root.IctCatalog;
})(typeof window !== 'undefined' ? window : globalThis);

/* Owner review 18/09/2026 17:05 (video "Trang danh mục sản phẩm"): choosing Mới nhất / Cũ nhất submits the whole
   catalogue form as a plain GET, so the browser lands at the top of the page and the shopper has to scroll back down
   to see the result. Remember where they were and put them back, so only the list underneath appears to change.
   Sessions only, one key per path, and a 30-second stamp so a stale entry can never move a later visit. */
(function (root) {
    'use strict';
    if (typeof root === 'undefined' || !root.document || !root.sessionStorage) return;
    var KEY = 'ict-catalog-scroll';
    var read = function () {
        try { return JSON.parse(root.sessionStorage.getItem(KEY) || 'null'); } catch (error) { return null; }
    };
    var write = function (value) {
        try { root.sessionStorage.setItem(KEY, JSON.stringify(value)); } catch (error) { /* private mode */ }
    };
    var clear = function () {
        try { root.sessionStorage.removeItem(KEY); } catch (error) { /* private mode */ }
    };
    var isCatalogForm = function (form) {
        if (!form || form.method && form.method.toLowerCase() === 'post') return false;
        return !!(form.querySelector('.sort_select, .sort_checkbox, .submit-form-on-change, [name="sort-by"]')
            || form.querySelector('.shop_container'));
    };
    var remember = function () {
        write({ path: root.location.pathname, y: Math.round(root.scrollY || 0), at: Date.now() });
    };
    root.document.addEventListener('submit', function (event) {
        if (isCatalogForm(event.target)) remember();
    }, true);
    // The sort widgets call form.submit() from an inline onchange, and a script-driven submit fires no submit event —
    // so the scroll position has to be taken on the change itself, in the capture phase, before the page navigates.
    root.document.addEventListener('change', function (event) {
        var field = event.target;
        if (!field || !field.matches) return;
        if (!field.matches('[name="sort-by"], .sort_select, .sort_checkbox, .submit-form-on-change')) return;
        if (!isCatalogForm(field.form)) return;
        remember();
    }, true);
    root.document.addEventListener('click', function (event) {
        var field = event.target && event.target.closest ? event.target.closest('.sort_checkbox') : null;
        if (field && isCatalogForm(field.form)) remember();
    }, true);
    var restore = function () {
        var saved = read();
        if (!saved || saved.path !== root.location.pathname || !saved.y) return;
        if (Date.now() - saved.at > 30000) { clear(); return; }
        clear();
        var jump = function () { root.scrollTo(0, saved.y); };
        jump();
        // The grid grows as lazy images resolve; nudge it back twice while that settles.
        root.setTimeout(jump, 120);
        root.setTimeout(jump, 400);
    };
    if (root.document.readyState === 'loading') {
        root.document.addEventListener('DOMContentLoaded', restore);
    } else {
        restore();
    }
})(typeof window !== 'undefined' ? window : globalThis);
