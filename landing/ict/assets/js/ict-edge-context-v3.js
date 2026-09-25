/* Token-free shell only. Load synchronously in <head>, before every theme script:
 * <script src="/js/ict-edge-context-v3.js" data-ict-edge-page="/mini-pc" data-ict-edge-paths='["/mini-pc"]' data-ict-cart-base="/cart"></script>
 * Never include this loader on the ict_dynamic fallback document.
 * v3 (23/09/2026): refreshing an already ready document (focus, visibility, BFCache) keeps the page.
 * No pending state is shown, the last valid token stays until the server answers, and only an explicit
 * ineligible answer, or a 419 on a guarded write, moves the page to dynamic HTML. v1/v2 stay unchanged
 * for documents that still reference them. */
(function () {
    'use strict';
    var marker = '__ICT_EDGE_CSRF_PENDING__';
    var script = document.currentScript;
    var page = script && script.getAttribute('data-ict-edge-page');
    var allowedPaths;
    try { allowedPaths = JSON.parse(script.getAttribute('data-ict-edge-paths') || 'null'); }
    catch (error) { return; }
    if (window.IctEdgeContext || !Array.isArray(allowedPaths) || !allowedPaths.length || allowedPaths.length > 32 ||
        allowedPaths.some(function (path) { return typeof path !== 'string' || !/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(path); }) ||
        allowedPaths.indexOf(page) < 0 || location.pathname !== page || location.search !== '') return;
    if (new URLSearchParams(location.search).has('ict_dynamic')) return;
    var fallback = page + '?ict_dynamic=1';
    // Parent renders the path of route('public.cart') for configured/localized slugs.
    var cartBase = new URL(script.getAttribute('data-ict-cart-base') || '/cart', location.origin);
    var cartPath = cartBase.origin === location.origin && !cartBase.search && !cartBase.hash ? cartBase.pathname.replace(/\/$/, '') : '/cart';
    var nativeFetch = window.fetch.bind(window);
    var nativeSubmit = HTMLFormElement.prototype.submit;
    // ready: a valid context arrived at least once; wrote: this document completed its own write;
    // writing: guarded writes on the wire whose outcome is not known yet.
    var state = { token: null, generation: 0, failed: false, loading: false, promise: null, ready: false, wrote: false, writing: 0 };
    // Transport outcome of a refresh (offline, timeout, 5xx, non-JSON): keep the page and its token.
    var KEEP = {};
    // Server renders this descriptor only from the already verified product scope.
    // One promise per document: refreshing context never reports the visit twice.
    var productId = script.getAttribute('data-ict-edge-product-id');
    var visitUrl = script.getAttribute('data-ict-edge-visit-url');
    var visitPromise = null;
    function ownsProductVisit(id) {
        return /^[1-9][0-9]*$/.test(productId || '') && String(id) === productId;
    }
    function ensureVisit(token, signal) {
        if (productId === null && visitUrl === null) return Promise.resolve();
        if (visitPromise) return visitPromise;
        visitPromise = Promise.resolve().then(function () {
            if (!ownsProductVisit(productId) || !Number.isSafeInteger(Number(productId)) || !visitUrl) throw fail();
            var url = new URL(visitUrl, location.origin);
            if (url.origin !== location.origin || url.search || url.hash || !url.pathname.startsWith('/')) throw fail();
            // Never call wrapped fetch here: it waits for ready(), which awaits this POST.
            return nativeFetch(url.href, {
                method: 'POST', credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: signal,
                headers: { Accept: 'application/json', 'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': token },
                body: JSON.stringify({ type: 'product', id: Number(productId) })
            });
        }).then(function (response) {
            if (response.status !== 204 || ['counted', 'throttled'].indexOf(response.headers.get('X-ICT-Page-View')) < 0) throw fail();
        });
        return visitPromise;
    }
    var xhrState = new WeakMap();
    var heldForms = new WeakSet();

    function fail() {
        if (!state.failed) {
            state.failed = true;
            state.token = null;
            location.replace(fallback);
        }
        return new Error('The page context must be reloaded before submitting.');
    }
    // Called when a guarded write goes on the wire; the returned function settles it exactly once.
    function sentWrite() {
        var open = true;
        state.writing++;
        return function (status, body) {
            if (!open) return;
            open = false;
            state.writing--;
            if (status === 419) {
                // Only where the token is actually checked: Laravel accepts same-origin requests on
                // Sec-Fetch-Site alone, so this is not a general detector of session changes.
                fail();
            } else if (status >= 200 && status < 300 && !(body && body.error === true)) {
                // Botble reports a refused action as HTTP 200 {error: true}: not a completed write.
                state.wrote = true;
            }
        };
    }
    function settleFetch(response, settle) {
        if (!response.ok) return settle(response.status);
        response.clone().json().then(function (body) { settle(response.status, body); }, function () { settle(response.status); });
    }
    function xhrBody(xhr) {
        try {
            if (xhr.responseType === 'json') return xhr.response;
            if (!xhr.responseType || xhr.responseType === 'text') return JSON.parse(xhr.responseText);
        } catch (error) {}
        return null;
    }
    function unsafe(method, url) {
        return !/^(GET|HEAD|OPTIONS)$/i.test(method || 'GET') && new URL(url, location.href).origin === location.origin;
    }
    function sameOrigin(url) { return new URL(url, location.href).origin === location.origin; }
    function cartMutation(url) {
        var path = new URL(url, location.href).pathname;
        return path.indexOf(cartPath + '/') === 0 && /^(?:add\/|remove\/|destroy(?:\/|$))/.test(path.slice(cartPath.length + 1));
    }
    function patchDocument() {
        if (!state.token) return;
        document.querySelectorAll('meta[name="csrf-token"], input[name="_token"]').forEach(function (node) {
            var attribute = node.tagName === 'META' ? 'content' : 'value';
            if (node.getAttribute(attribute) !== state.token) node.setAttribute(attribute, state.token);
            if (attribute === 'value') node.value = state.token;
        });
    }
    function bootstrap() {
        if (state.loading || state.failed) return;
        state.loading = true;
        var generation = ++state.generation;
        // The first context gates the page; any problem moves to dynamic HTML. A refresh of an
        // already ready page shows no pending state and keeps the last valid token meanwhile.
        var refresh = state.ready;
        var previous = state.token;
        if (!refresh) {
            state.token = null;
            document.documentElement.dataset.ictEdgeContext = 'pending';
            document.dispatchEvent(new CustomEvent('ict:edge-context-pending'));
        }
        var controller = new AbortController();
        var timeout = setTimeout(function () { controller.abort(); }, 7000);
        state.promise = nativeFetch('/_ict/edge-context?page=' + encodeURIComponent(page), {
            method: 'GET', credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: controller.signal,
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-ICT-Page-Referrer': document.referrer || '' }
        }).then(function (response) {
            if (refresh ? response.status >= 500 : !response.ok) throw refresh ? KEEP : new Error('Context unavailable');
            return response.json().then(function (data) {
                return { ok: response.ok, data: data };
            }, function () {
                throw refresh ? KEEP : new Error('Context unavailable');
            });
        }, function (error) {
            throw refresh ? KEEP : error;
        }).then(function (result) {
            var data = result.data;
            if (generation !== state.generation) return state.promise;
            // Any JSON answer other than a valid eligible context, including 404 {eligible:false}.
            if (state.failed || !result.ok || !data || data.eligible !== true || typeof data.token !== 'string' || !/^[A-Za-z0-9]{40}$/.test(data.token)) throw fail();
            return ensureVisit(data.token, controller.signal).then(function () {
                if (generation !== state.generation) return state.promise;
                if (state.failed) throw fail();
                state.token = data.token;
                state.ready = true;
                document.documentElement.dataset.ictEdgeContext = 'ready';
                patchDocument();
                document.dispatchEvent(new CustomEvent('ict:edge-context-ready'));
                return data.token;
            });
        }).catch(function (error) {
            if (generation !== state.generation) return state.promise;
            // Keep this page and its token; the next focus/visibility/BFCache retries.
            // Native CSRF still validates every write sent meanwhile.
            if (error === KEEP && !state.failed) return previous;
            throw fail();
        }).finally(function () { clearTimeout(timeout); if (generation === state.generation) state.loading = false; });
        // The page can have no forms at all. Do not emit an unhandled rejection.
        state.promise.catch(function () {});
    }
    function ready() {
        var generation = state.generation;
        return state.promise.then(function (token) {
            if (generation !== state.generation) return ready();
            if (state.failed || !token) throw fail();
            return token;
        });
    }
    function readyForWrite() {
        // The document's context remains valid after its own writes: returning to the tab
        // then keeps the page (decision 23/09/2026). BFCache still refreshes it, native
        // CSRF/auth validate each write and a 419 moves to dynamic HTML.
        // Never add a guest-eligibility roundtrip before every interaction.
        return ready();
    }
    function jsonTokens(value, token) {
        if (value === marker) return token;
        if (Array.isArray(value)) return value.map(function (item) { return jsonTokens(item, token); });
        if (value && typeof value === 'object') {
            Object.keys(value).forEach(function (key) {
                value[key] = key === '_token' ? token : jsonTokens(value[key], token);
            });
        }
        return value;
    }
    function parameters(body, token, FormType) {
        var result = new FormType();
        body.forEach(function (value, key) {
            var patched = key === '_token' || value === marker ? token : value;
            if (typeof patched === 'string' && patched.indexOf(marker) >= 0) throw fail();
            result.append(key, patched);
        });
        return result;
    }
    function rewrite(body, type, token) {
        if (body === null || body === undefined) return body;
        if (body instanceof FormData) return parameters(body, token, FormData);
        if (body instanceof URLSearchParams) return parameters(body, token, URLSearchParams);
        if (typeof body !== 'string') {
            // Opaque files/streams have no form token fields. Header CSRF still applies.
            return body;
        }
        var result = body;
        if (/application\/(?:[\w.+-]*\+)?json/i.test(type)) result = JSON.stringify(jsonTokens(JSON.parse(body), token));
        else if (/application\/x-www-form-urlencoded/i.test(type)) result = parameters(new URLSearchParams(body), token, URLSearchParams).toString();
        if (result.indexOf(marker) >= 0 || result.indexOf(encodeURIComponent(marker)) >= 0) throw fail();
        return result;
    }
    async function requestWithToken(request, token) {
        var headers = new Headers(request.headers);
        headers.set('X-CSRF-TOKEN', token);
        var body;
        var type = headers.get('Content-Type') || '';
        if (request.body !== null) {
            if (/multipart\/form-data/i.test(type)) {
                body = rewrite(await request.formData(), type, token);
                headers.delete('Content-Type'); // Browser must generate the new boundary.
            } else if (/application\/(?:[\w.+-]*\+)?json|application\/x-www-form-urlencoded|^text\//i.test(type)) {
                body = rewrite(await request.text(), type, token);
            } else {
                // No body interpretation for binary data; preserve bytes exactly.
                body = await request.blob();
            }
        }
        return new Request(request, { headers: headers, body: body });
    }
    window.fetch = function (input, init) {
        var request;
        try {
            var method = init && init.method || (input instanceof Request ? input.method : 'GET');
            var url = input instanceof Request ? input.url : input;
            if (!sameOrigin(url)) return nativeFetch(input, init);
            request = new Request(input, init);
        } catch (error) { return Promise.reject(error); }
        var writes = unsafe(request.method, request.url) || cartMutation(request.url);
        var initialGate = writes ? readyForWrite() : ready();
        function prepare(current) {
            return ready().then(function (token) {
                var generation = state.generation;
                return requestWithToken(current, token).then(function (patched) {
                    // A refresh may start while formData/text is being read; the old
                    // token stays in place meanwhile, so compare generations too.
                    if (state.failed) throw fail();
                    if (state.token !== token || state.generation !== generation) return prepare(patched);
                    return patched;
                });
            });
        }
        return initialGate.then(function () { return writes ? prepare(request) : request; }).catch(function (error) {
            if (error.name !== 'AbortError') fail();
            throw error;
        }).then(function (patched) {
            // Transport/HTTP failure after send never automatically replays a mutation.
            var settle = writes ? sentWrite() : null;
            return nativeFetch(patched).then(function (response) {
                if (settle) settleFetch(response, settle);
                return response;
            }, function (error) {
                if (settle) settle(0);
                throw error;
            });
        });
    };
    var nativeOpen = XMLHttpRequest.prototype.open;
    var nativeHeader = XMLHttpRequest.prototype.setRequestHeader;
    var nativeSend = XMLHttpRequest.prototype.send;
    var nativeAbort = XMLHttpRequest.prototype.abort;
    XMLHttpRequest.prototype.open = function (method, url, async) {
        var previous = xhrState.get(this);
        // Reopening terminates an in-flight request, possibly without loadend.
        if (previous && previous.settle) previous.settle(0);
        var result = nativeOpen.apply(this, arguments);
        xhrState.set(this, { sameOrigin: sameOrigin(url), unsafe: unsafe(method, url) || cartMutation(url), async: async !== false, type: '', cancelled: false, sent: false });
        return result;
    };
    XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
        var item = xhrState.get(this);
        if (item && item.sameOrigin && name.toLowerCase() === 'x-csrf-token') { item.csrfRequested = true; return; }
        if (item && name.toLowerCase() === 'content-type') item.type = value;
        return nativeHeader.apply(this, arguments);
    };
    XMLHttpRequest.prototype.abort = function () {
        var item = xhrState.get(this);
        if (item) item.cancelled = true;
        return nativeAbort.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function (body) {
        var xhr = this;
        var item = xhrState.get(xhr);
        if (!item || !item.sameOrigin) return nativeSend.apply(xhr, arguments);
        if (item.sent) throw new DOMException('Request was already sent', 'InvalidStateError');
        item.sent = true;
        function send(token) {
            if (item.cancelled || xhrState.get(xhr) !== item || state.failed) return;
            var patched = item.unsafe ? rewrite(body, item.type, token) : body;
            if (item.unsafe || item.csrfRequested) nativeHeader.call(xhr, 'X-CSRF-TOKEN', token);
            if (item.unsafe) {
                item.settle = sentWrite();
                xhr.addEventListener('loadend', function () { item.settle(xhr.status, xhrBody(xhr)); });
            }
            try {
                nativeSend.call(xhr, patched);
            } catch (error) {
                if (item.settle) item.settle(0);
                throw error;
            }
        }
        if (!item.async) {
            if (item.unsafe || !state.token || state.failed) throw fail();
            return send(state.token);
        }
        (item.unsafe ? readyForWrite() : ready()).then(send).catch(function () {
            if (!item.cancelled && xhrState.get(xhr) === item) {
                fail();
                nativeAbort.call(xhr);
                xhr.dispatchEvent(new ProgressEvent('error'));
                xhr.dispatchEvent(new ProgressEvent('loadend'));
            }
        });
    };
    function formUnsafe(form, submitter) {
        var method = submitter && submitter.hasAttribute('formmethod') ? submitter.formMethod : form.method;
        var action = submitter && submitter.hasAttribute('formaction') ? submitter.formAction : form.action;
        return unsafe(method, action || location.href) || (sameOrigin(action || location.href) && cartMutation(action || location.href));
    }
    document.addEventListener('submit', function (event) {
        var form = event.target;
        if (!(form instanceof HTMLFormElement) || !formUnsafe(form, event.submitter)) return;
        // The old token remains during a refresh; a repeated submit must still wait for it.
        if (heldForms.has(form) && state.token && !state.failed && !state.loading) { heldForms.delete(form); patchDocument(); return; }
        event.preventDefault();
        event.stopImmediatePropagation();
        if (heldForms.has(form)) return;
        heldForms.add(form);
        var submitter = event.submitter;
        readyForWrite().then(function () {
            patchDocument();
            if (form.isConnected) form.requestSubmit(submitter && submitter.isConnected ? submitter : undefined);
        }).catch(function () { heldForms.delete(form); });
    }, true);
    HTMLFormElement.prototype.submit = function () {
        var form = this;
        if (!formUnsafe(form)) return nativeSubmit.call(form);
        if (heldForms.has(form)) return;
        heldForms.add(form);
        readyForWrite().then(function () {
            heldForms.delete(form);
            patchDocument();
            if (form.isConnected) nativeSubmit.call(form);
        }).catch(function () { heldForms.delete(form); });
    };
    window.IctEdgeContext = Object.freeze({ ready: ready, ownsProductVisit: ownsProductVisit });
    var heldLinks = new WeakSet();
    function modifiedCartClick(event) {
        var link = event.target instanceof Element ? event.target.closest('a[href]') : null;
        if (!link || !sameOrigin(link.href) || !cartMutation(link.href)) return false;
        if (!(event.button === 1 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return false;
        // An asynchronous synthetic click cannot preserve browser new-tab intent.
        // Move to dynamic HTML instead of opening a mutation URL without context.
        event.preventDefault();
        event.stopImmediatePropagation();
        fail();
        return true;
    }
    document.addEventListener('auxclick', modifiedCartClick, true);
    document.addEventListener('click', function (event) {
        if (modifiedCartClick(event)) return;
        var link = event.target instanceof Element ? event.target.closest('a[href]') : null;
        if (!link || !sameOrigin(link.href) || !cartMutation(link.href)) return;
        if (heldLinks.has(link) && state.token && !state.failed && !state.loading) { heldLinks.delete(link); return; }
        event.preventDefault();
        event.stopImmediatePropagation();
        if (heldLinks.has(link)) return;
        heldLinks.add(link);
        (cartMutation(link.href) ? readyForWrite() : ready()).then(function () {
            if (link.isConnected) link.click();
        }).catch(function () { heldLinks.delete(link); });
    }, true);
    new MutationObserver(patchDocument).observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', patchDocument);
    function refreshOnReturn() {
        // Decision 23/09/2026: once this document has written (e.g. added to cart),
        // returning to the tab keeps the page. Back/forward (BFCache) still refreshes.
        // A write still on the wire may already have changed the session: wait for its outcome.
        if (state.ready && !state.wrote && !state.writing) bootstrap();
    }
    window.addEventListener('pageshow', function (event) { if (event.persisted) bootstrap(); });
    window.addEventListener('focus', refreshOnReturn);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) refreshOnReturn(); });
    bootstrap();
})();
