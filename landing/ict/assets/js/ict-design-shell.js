/* Presentation over the native cart endpoints. Prices/stock stay on the server. */
(() => {
    'use strict';
    // Breadcrumb sits outside the PDP root; reuse its canonical share/toast handler.
    document.querySelectorAll('[data-ict-breadcrumb-share]').forEach(button => {
        button.addEventListener('click', () => document.querySelector('[data-ict-product] [data-ict-share]')?.click());
    });
    const shellIcon = (name, className = '') => {
        const shapes = {
            down:'<path d="M6 9l6 6 6-6"/>', clock:'<path d="M22 12a10 10 0 1 1-20 0a10 10 0 0 1 20 0M12 6v6l4 2"/>',
            wifi:'<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M1.5 9a15 15 0 0 1 21 0M12 19.5h.01"/>',
            eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0"/>',
            box:'<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7zM3.3 7l8.7 5 8.7-5M12 22V12"/>'
        };
        const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','none'); svg.setAttribute('stroke','currentColor');
        svg.setAttribute('stroke-width',className === 'ict-footer-chevron' ? '2.6' : '2'); svg.setAttribute('stroke-linecap','round'); svg.setAttribute('stroke-linejoin','round'); svg.setAttribute('aria-hidden','true'); svg.setAttribute('class',className); svg.innerHTML=shapes[name] || shapes.down; return svg;
    };
    document.querySelectorAll('.ict-product-page .categories_btn,.ict-product-page .navbar-support').forEach(button => button.append(shellIcon('down','ict-header-chevron')));
    const updateCartBadge = badge => { badge.hidden = !(Number(badge.textContent.trim()) > 0); };
    document.querySelectorAll('.cart_count_badge').forEach(badge => {
        updateCartBadge(badge);
        new MutationObserver(() => updateCartBadge(badge)).observe(badge,{childList:true,characterData:true,subtree:true});
    });
    document.querySelectorAll('#navbarSidetoggle > .navbar-nav > li').forEach(node => {
        const link = node.querySelector(':scope > a');
        if (!link || node.classList.contains('mobile-menu-item')) return;
        const path = link.getAttribute('href') || '';
        if (!path) return;
        if (new URL(path || '/', location.href).pathname === '/') node.classList.add('ict-nav-home');
        if (path.includes('gioi-thieu')) node.classList.add('ict-nav-about');
        if (path.includes('compare') || path.includes('so-sanh')) node.classList.add('ict-nav-compare');
    });
    const menu = document.getElementById('ict-design-menu');
    if (menu?.showModal) {
        const titleOf = link => link?.textContent.trim().replace(/\s+/g, ' ') || '';
        // Owner design 18/09/2026: the drawer now mirrors the three levels the mega menu already has —
        // category -> sub-group ("Theo thuong hieu", "Theo nhu cau"...) -> the actual links. The sub-group heading is
        // an <a href="#"> in the source markup, which the previous version filtered out, flattening everything into a
        // single column. The category name is a link now as well (owner: tapping the main category must open the
        // category page), while the chevron keeps the open/close job.
        const isRealLink = item => item && !['#', ''].includes(item.getAttribute('href') || '');
        const dedupe = () => { const seen = new Set(); return item => { const key = item.href + titleOf(item); if (seen.has(key)) return false; seen.add(key); return true; }; };
        const linkRow = (item, className = '') => {
            const child = document.createElement('a');
            child.href = item.href; child.textContent = titleOf(item);
            if (className) child.className = className;
            return child;
        };
        const fillGroups = (panel, nodes) => {
            panel.replaceChildren();
            nodes.forEach(node => {
                const link = node.querySelector(':scope > a');
                if (!link) return;
                const details = document.createElement('details'), summary = document.createElement('summary');
                const icon = document.createElement('span');
                icon.className = 'ict-menu-icon';
                const nativeIcon = link.querySelector('img,svg,i');
                const groupName = titleOf(link).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
                const designIcon = /cho thue/.test(groupName) ? 'clock' : /cntt|mang|wifi|lan/.test(groupName) ? 'wifi' : /camera|giam sat/.test(groupName) ? 'eye' : /cung cap|bao tri|bao hanh|sua chua/.test(groupName) ? 'box' : null;
                if (designIcon) icon.append(shellIcon(designIcon)); else if (nativeIcon) icon.append(nativeIcon.cloneNode(true)); else icon.append(shellIcon('box'));
                const title = document.createElement('a');
                title.className = 'ict-menu-group-link';
                title.href = link.href;
                title.textContent = titleOf(link);
                title.addEventListener('click', event => event.stopPropagation());
                summary.append(icon, title);
                if (/cho thue/.test(groupName)) {
                    const badge = document.createElement('b');
                    badge.className = 'ict-menu-hot-badge';
                    badge.textContent = panel.id === 'ict-menu-products' ? 'Phổ biến' : 'Nổi bật';
                    summary.append(badge);
                }
                summary.append(shellIcon('down', 'ict-menu-chevron'));
                details.append(summary);
                const children = document.createElement('div'); children.className = 'ict-menu-children';
                const branches = Array.from(node.querySelectorAll(':scope > .dropdown-menu > ul > li'));
                const seenTop = dedupe();
                let built = 0;
                branches.forEach(branch => {
                    const head = branch.querySelector(':scope > a');
                    if (!head) return;
                    const inner = Array.from(branch.querySelectorAll(':scope > .dropdown-menu a[href]')).filter(isRealLink);
                    if (inner.length) {
                        const sub = document.createElement('details'); sub.className = 'ict-menu-subgroup';
                        const subSummary = document.createElement('summary');
                        const subTitle = document.createElement('span'); subTitle.textContent = titleOf(head);
                        const subCount = document.createElement('small'); subCount.textContent = String(inner.length);
                        subSummary.append(subTitle, subCount, shellIcon('down', 'ict-menu-chevron'));
                        sub.append(subSummary);
                        const subLinks = document.createElement('div'); subLinks.className = 'ict-menu-sublinks';
                        const seenInner = dedupe();
                        inner.forEach(item => { if (seenInner(item)) subLinks.append(linkRow(item)); });
                        sub.append(subLinks); children.append(sub); built += 1;
                    } else if (isRealLink(head) && seenTop(head)) {
                        children.append(linkRow(head, 'ict-menu-flat-link')); built += 1;
                    }
                });
                if (!built) {
                    Array.from(node.querySelectorAll('a[href]'))
                        .filter(item => item !== link && isRealLink(item))
                        .forEach(item => { if (seenTop(item)) children.append(linkRow(item, 'ict-menu-flat-link')); });
                }
                const all = document.createElement('a'); all.href = link.href; all.className = 'ict-menu-view-all'; all.textContent = 'Xem tất cả ' + titleOf(link) + ' →'; children.append(all);
                details.append(children); panel.append(details);
            });
        };
        const refreshMenu = () => {
            fillGroups(menu.querySelector('#ict-menu-products'), Array.from(document.querySelectorAll('#navCatContent .main-mega-menu > li')));
            const nav = Array.from(document.querySelectorAll('.bottom_header .row-menu-item .navbar-nav > li'));
            const services = nav.find(node => titleOf(node.querySelector(':scope > a')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes('dich vu'));
            fillGroups(menu.querySelector('#ict-menu-services'), services ? Array.from(services.querySelectorAll('.w-sub-mega > li')) : nav.filter(node => node.querySelector('a[href]') && !node.classList.contains('mobile-menu-item')));
        };
        document.addEventListener('click', event => {
            if (event.target.closest('.header-mobile-menu > .navbar-toggler,[data-ict-scroll-menu]')) {
                event.preventDefault(); event.stopImmediatePropagation(); refreshMenu(); menu.showModal(); document.documentElement.classList.add('ict-menu-open');
                if (event.target.closest('[data-ict-scroll-menu]')) menu.querySelector('[data-ict-menu-tab="products"]')?.click();
            } else if (event.target.closest('[data-ict-menu-close]')) menu.close();
            const tab = event.target.closest('[data-ict-menu-tab]');
            if (tab) {
                menu.querySelectorAll('[data-ict-menu-tab]').forEach(button => { button.setAttribute('aria-selected', String(button === tab)); button.tabIndex = button === tab ? 0 : -1; menu.querySelector('#ict-menu-' + button.dataset.ictMenuTab).hidden = button !== tab; });
            }
        }, true);
        menu.addEventListener('keydown', event => {
            if (!event.target.matches('[data-ict-menu-tab]') || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
            event.preventDefault(); const other = menu.querySelector('[data-ict-menu-tab][aria-selected="false"]'); other.click(); other.focus();
        });
        menu.addEventListener('click', event => { const r = menu.getBoundingClientRect(); if (event.target === menu && (event.clientX < r.left || event.clientX > r.right)) menu.close(); });
        menu.addEventListener('close', () => document.documentElement.classList.remove('ict-menu-open'));
        menu.addEventListener('toggle', event => {
            if (event.target.tagName !== 'DETAILS' || !event.target.open) return;
            event.target.parentNode.querySelectorAll('details[open]').forEach(group => { if (group !== event.target) group.open = false; });
        }, true);
        const source = document.querySelector('#navCatContent');
        if (source) new MutationObserver(() => { if (menu.open) refreshMenu(); }).observe(source, {childList:true});
        // Hotline rows are server-rendered from IctSupportContacts on every page.
    }
    const drawer = document.getElementById('ict-design-cart');
    const footerMedia = matchMedia('(max-width: 1023px)');
    const footerGroups = [];
    document.querySelectorAll('.ict-footer-grid > .ict-footer-menu, .ict-footer-grid > .widget').forEach(group => {
        const heading = group.querySelector('h2, .widget_title_f');
        if (!heading) return;
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        const links = document.createElement('div');
        summary.textContent = heading.textContent.trim();
        summary.append(shellIcon('down','ict-footer-chevron'));
        heading.remove();
        while (group.firstChild) links.append(group.firstChild);
        details.append(summary, links);
        group.append(details);
        summary.addEventListener('click', event => { if (!footerMedia.matches) event.preventDefault(); });
        footerGroups.push(details);
    });
    const setFooterMode = () => footerGroups.forEach(group => { group.open = !footerMedia.matches; });
    setFooterMode();
    footerMedia.addEventListener('change', setFooterMode);
    document.querySelector('[data-ict-footer-quote]')?.addEventListener('submit', event => {
        event.preventDefault();
        const email = event.currentTarget.querySelector('[name="email"]').value;
        event.currentTarget.querySelector('[data-ict-quote]').click();
        const field = document.querySelector('[data-ict-quote-dialog] [name="email"]');
        if (field) field.value = email;
    });
    if (!drawer || !drawer.showModal) return;
    const error = drawer.querySelector('.ict-design-cart-error');
    const content = drawer.querySelector('.ict-design-cart-content');
    const continueButton = drawer.querySelector('.ict-design-cart-continue');
    const cartActions = drawer.querySelector('.ict-design-cart-actions');
    const hoverMedia = matchMedia('(min-width:1024px) and (hover:hover) and (pointer:fine)');
    const previewTabs = drawer.querySelector('.ict-cart-preview-tabs');
    const previewEmpty = document.createElement('p');
    previewEmpty.className='ict-cart-preview-empty';previewEmpty.hidden=true;previewEmpty.setAttribute('role','status');
    previewTabs?.after(previewEmpty);
    let previewKind = 'sale', previewTrigger = null, closeTimer = null;
    const isPreview = () => drawer.classList.contains('ict-cart-preview');
    function syncPreview() {
        const counts={sale:0,rental:0};
        content.querySelectorAll('[data-cart-row]').forEach(row=>{counts[row.dataset.cartKind]+=Number(row.dataset.cartQty)||0;row.hidden=isPreview()&&row.dataset.cartKind!==previewKind;});
        content.querySelectorAll('[data-cart-summary-kind]').forEach(node=>{node.hidden=isPreview()&&node.dataset.cartSummaryKind!==previewKind;});
        drawer.querySelectorAll('[data-cart-preview-tab]').forEach(tab=>{const selected=tab.dataset.cartPreviewTab===previewKind;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;tab.querySelector('[data-cart-preview-count]').textContent='('+counts[tab.dataset.cartPreviewTab]+')';});
        previewEmpty.hidden=!isPreview()||counts[previewKind]>0;
        previewEmpty.textContent=previewKind==='sale'?'Giỏ mua chưa có sản phẩm.':'Giỏ thuê chưa có thiết bị.';
    }
    function closePreview() {clearTimeout(closeTimer);if(isPreview())drawer.close();}
    function queueClosePreview() {clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(isPreview()&&!drawer.matches(':hover')&&!drawer.contains(document.activeElement))closePreview();},220);}
    function openPreview(trigger) {
        if(!hoverMedia.matches||busy||(drawer.open&&!isPreview()))return;
        clearTimeout(closeTimer);previewTrigger=trigger;
        const rows=Array.from(content.querySelectorAll('[data-cart-row]'));
        if(!rows.some(row=>row.dataset.cartKind===previewKind)&&rows.length)previewKind=rows[0].dataset.cartKind;
        drawer.classList.add('ict-cart-preview');controls();
        // Nonmodal preview does not steal keyboard focus when opened by hovering.
        drawer.open=true;
        const rect=trigger.getBoundingClientRect(),top=rect.bottom+12;
        drawer.style.setProperty('--ict-preview-top',top+'px');
        drawer.style.setProperty('--ict-preview-right',Math.max(16,document.documentElement.clientWidth-rect.right)+'px');
        drawer.style.setProperty('--ict-preview-height',Math.max(140,innerHeight-top-16)+'px');
        trigger.setAttribute('aria-expanded','true');
    }
    document.querySelectorAll('.header_wrap .middle-header .btn-shopping-cart').forEach(trigger=>{
        trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls',drawer.id);
        trigger.addEventListener('mouseenter',()=>openPreview(trigger));trigger.addEventListener('mouseleave',queueClosePreview);
        // Closing a modal restores focus to its trigger. Do not reopen on that focus.
        trigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();openPreview(trigger);if(isPreview())previewTabs?.querySelector('[aria-selected="true"]')?.focus();}});
    });
    drawer.addEventListener('mouseenter',()=>clearTimeout(closeTimer));drawer.addEventListener('mouseleave',queueClosePreview);
    drawer.addEventListener('focusout',()=>setTimeout(()=>{if(isPreview()&&!drawer.contains(document.activeElement)&&document.activeElement!==previewTrigger)queueClosePreview();},0));
    previewTabs?.addEventListener('click',event=>{const tab=event.target.closest('[data-cart-preview-tab]');if(tab){previewKind=tab.dataset.cartPreviewTab;syncPreview();}});
    previewTabs?.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const kind=event.key==='Home'?'sale':event.key==='End'?'rental':previewKind==='sale'?'rental':'sale';const tab=previewTabs.querySelector('[data-cart-preview-tab="'+kind+'"]');tab.click();tab.focus();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&isPreview()){event.preventDefault();const trigger=previewTrigger;closePreview();trigger?.focus({preventScroll:true});closePreview();}});
    window.addEventListener('scroll',closePreview,{passive:true});window.addEventListener('resize',closePreview);
    let busy = false;
    const headers = {'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''};
    const sameOrigin = path => {
        const url = new URL(path, location.href);
        if (url.origin !== location.origin) throw new Error('Đường dẫn giỏ hàng không hợp lệ.');
        return url.href;
    };
    async function request(url, options = {}) {
        const response = await fetch(sameOrigin(url), {credentials: 'same-origin', ...options,
            headers: {...headers, ...(options.headers || {})}});
        let data;
        try { data = await response.json(); }
        catch { throw new Error('Chưa cập nhật được giỏ hàng. Vui lòng tải lại trang và thử lại.'); }
        if (!response.ok || data.error) throw new Error(data.message || 'Chưa cập nhật được giỏ hàng. Vui lòng thử lại.');
        return data;
    }
    function controls() {
        content.querySelectorAll('.ict-cart-row-price').forEach(node=>{node.hidden=false;});
        content.querySelectorAll('[data-ict-cart-money]').forEach(node => {
            const amount = Number(node.dataset.ictCartMoney);
            if (Number.isFinite(amount) && /[₫đ]/.test(node.textContent)) node.textContent = new Intl.NumberFormat('vi-VN').format(amount) + '₫';
        });
        const emptyCheckout = drawer.querySelector('[data-cart-empty-checkout]');
        const rows = content.querySelectorAll('[data-cart-row]');
        if (emptyCheckout) emptyCheckout.hidden = rows.length !== 0;
        const emptyTotal = drawer.querySelector('[data-cart-empty-total]');
        if (emptyTotal) emptyTotal.hidden = rows.length !== 0;
        drawer.classList.toggle('ict-cart-is-empty', rows.length === 0);
        const emptyTitle = content.querySelector('.ict-cart-empty .text-center');
        if (emptyTitle) emptyTitle.textContent = 'Giỏ hàng trống';
        const emptyNote = content.querySelector('.ict-cart-empty-note');
        if (emptyNote) emptyNote.textContent = footerMedia.matches ? 'Chọn cấu hình rồi bấm ' + (document.querySelector('[data-ict-quote="visit"]') ? 'Đặt lịch xem máy' : 'Thêm vào giỏ') : 'Chọn cấu hình rồi bấm "Thêm vào giỏ hàng" để bắt đầu.';
        continueButton.textContent = rows.length === 0 && !footerMedia.matches ? 'Tiếp tục xem sản phẩm' : 'Tiếp tục mua sắm';
        const continueTarget = rows.length === 0 && !footerMedia.matches ? content.querySelector('.ict-cart-empty') || cartActions : cartActions;
        if (continueButton.parentNode !== continueTarget) {
            const focused = document.activeElement === continueButton;
            continueTarget.append(continueButton);
            if (focused) continueButton.focus({preventScroll:true});
        }
        const headingCount = drawer.querySelector('[data-cart-heading-count]');
        if (headingCount) headingCount.textContent = '(' + Array.from(rows).reduce((sum, row) => sum + Number(row.dataset.cartQty), 0) + ')';
        const totals = content.querySelectorAll('.cart_total');
        if (totals.length === 1 && content.querySelector('.cart_footer')?.dataset.ictSeparated !== '1') totals[0].querySelector('strong').textContent = footerMedia.matches ? 'Tạm tính' : 'Tạm tính (' + Array.from(rows).reduce((sum, row) => sum + Number(row.dataset.cartQty), 0) + ' sản phẩm)';
        const checkout = content.querySelector('.cart_buttons .checkout');
        const shippingNote = content.querySelector('.ict-cart-shipping-note');
        const footer = content.querySelector('.cart_footer');
        if (shippingNote && footer && shippingNote.nextElementSibling !== footer) footer.before(shippingNote);
        if (checkout && !checkout.querySelector('svg')) {
            const icon = document.createElementNS('http://www.w3.org/2000/svg','svg'), path = document.createElementNS('http://www.w3.org/2000/svg','path');
            icon.setAttribute('viewBox','0 0 24 24'); icon.setAttribute('fill','none'); icon.setAttribute('stroke','currentColor'); icon.setAttribute('stroke-width','1.8'); icon.setAttribute('aria-hidden','true');
            path.setAttribute('d','m13 3-9 11h7l-1 7 10-12h-7l1-6z'); icon.append(path); checkout.prepend(icon);
        }
        content.querySelectorAll('[data-cart-row]').forEach(row => {
            if (row.querySelector('.ict-cart-quantity')) return;
            const group = document.createElement('div');
            group.className = 'ict-cart-quantity';
            const qty = Number(row.dataset.cartQty);
            const min = Math.max(1, Number(row.dataset.cartMin) || 1);
            const max = row.dataset.cartMax === '' ? Infinity : Number(row.dataset.cartMax);
            [-1, 1].forEach(direction => {
                if (direction === 1) {
                    const value = document.createElement('span');
                    value.textContent = qty;
                    value.setAttribute('aria-label', 'Số lượng: ' + qty);
                    group.append(value);
                }
                const button = document.createElement('button');
                button.type = 'button';
                button.dataset.cartDelta = direction;
                button.textContent = direction < 0 ? '−' : '+';
                button.setAttribute('aria-label', direction < 0 ? 'Giảm số lượng' : 'Tăng số lượng');
                button.disabled = busy || (direction < 0 ? qty <= min : qty >= max);
                group.append(button);
            });
            (row.querySelector('.ict-cart-line-bottom') || row).prepend(group);
        });
        syncPreview();
    }
    async function change(url, options) {
        if (busy) return;
        const focused = document.activeElement;
        const focusRow = focused?.closest('[data-cart-row]')?.dataset.cartRow;
        const focusDelta = focused?.dataset.cartDelta;
        let failed = false;
        busy = true;
        error.hidden = true;
        drawer.setAttribute('aria-busy', 'true');
        drawer.querySelectorAll('[data-cart-delta]').forEach(button => button.disabled = true);
        try {
            const changed = await request(url, options);
            // A successful deletion remains a deletion even if refreshing the
            // drawer fails. Quantity updates have no remove analytics payload.
            window.IctCatalog?.trackRemoved(changed);
            const response = await request(drawer.dataset.refreshUrl);
            if (typeof response.data?.html !== 'string') throw new Error('Vui lòng tải lại giỏ hàng.');
            document.querySelectorAll('.cart_box').forEach(box => box.innerHTML = response.data.html);
            document.querySelectorAll('.cart_count, .cart_count_badge').forEach(badge => badge.textContent = response.data.count);
        } catch (exception) {
            failed = true;
            error.textContent = exception instanceof TypeError ? 'Không kết nối được. Anh/chị vui lòng thử lại.' : exception.message;
            error.hidden = false;
        } finally {
            busy = false;
            drawer.removeAttribute('aria-busy');
            content.querySelectorAll('.ict-cart-quantity').forEach(group => group.remove());
            controls();
            if (drawer.open) {
                const row = Array.from(content.querySelectorAll('[data-cart-row]')).find(item => item.dataset.cartRow === focusRow);
                const next = row && Array.from(row.querySelectorAll('[data-cart-delta]')).find(button => button.dataset.cartDelta === focusDelta && !button.disabled);
                (failed ? error : next || row?.querySelector('a:not(.item_remove)') || drawer.querySelector('[data-cart-close]')).focus({preventScroll: true});
            }
        }
    }
    document.addEventListener('click', event => {
        if (event.target.closest('.header_wrap .btn-shopping-cart')) {
            event.preventDefault();
            event.stopImmediatePropagation();
            if (matchMedia('(max-width: 767px)').matches) {
                location.assign(event.target.closest('.btn-shopping-cart').href);
                return;
            }
            error.hidden = true;
            if(isPreview()) {drawer.open=false;drawer.classList.remove('ict-cart-preview');}
            controls();
            drawer.showModal();
            document.documentElement.classList.add('ict-cart-open');
            return;
        }
        if(isPreview()&&!drawer.contains(event.target))closePreview();
        if (!drawer.contains(event.target)) return;
        const remove = event.target.closest('.remove-cart-button');
        const step = event.target.closest('[data-cart-delta]');
        if (remove) {
            event.preventDefault();
            event.stopImmediatePropagation();
            change(remove.href);
        } else if (step) {
            event.preventDefault();
            const row = step.closest('[data-cart-row]');
            const min = Math.max(1, Number(row.dataset.cartMin) || 1);
            const max = row.dataset.cartMax === '' ? Infinity : Number(row.dataset.cartMax);
            const qty = Math.min(max, Math.max(min, Number(row.dataset.cartQty) + Number(step.dataset.cartDelta)));
            if (qty < min) return;
            change(drawer.dataset.updateUrl, {method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({cart_kind: row.dataset.cartKind, items: [{rowId: row.dataset.cartRow, values: {qty}}]})});
        } else if (event.target.closest('[data-cart-close]')) drawer.close();
    }, true);
    drawer.addEventListener('click', event => {
        if (event.target === drawer) {
            const rect = drawer.getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) drawer.close();
        }
    });
    drawer.addEventListener('close', () => {document.documentElement.classList.remove('ict-cart-open');drawer.classList.remove('ict-cart-preview');previewTrigger?.setAttribute('aria-expanded','false');syncPreview();});
    new MutationObserver(controls).observe(content, {childList: true});
    footerMedia.addEventListener('change', () => { if (drawer.open) controls(); });
})();

/* Owner review 18/09/2026 18:50: computers keep the header in view while scrolling, like phones do. The class drives
   the compact state in block 39 of ict-review-20260918.css; no layout work happens here. */
(function (root) {
    'use strict';
    if (typeof root === 'undefined' || !root.document) return;
    var flag = 'ict-scrolled', pending = false;
    var apply = function () {
        pending = false;
        var y = root.scrollY || root.pageYOffset || 0;
        root.document.documentElement.classList.toggle(flag, y > 200);
        // Two thresholds, two jobs. The header only turns compact past 200px, but it is pinned at 36..189 from the
        // very first pixel, so anything positioned under it starts being covered long before that: measured 19/09, the
        // side banners lost 47px of their top at scroll 100 and 146px at scroll 199, and the homepage category panel
        // stayed open over the products the whole way. This earlier flag closes the panel and frees the banners.
        root.document.documentElement.classList.toggle('ict-past-top', y > 40);
    };
    root.addEventListener('scroll', function () {
        if (pending) return;
        pending = true;
        root.requestAnimationFrame ? root.requestAnimationFrame(apply) : setTimeout(apply, 60);
    }, { passive: true });
    apply();
})(typeof window !== 'undefined' ? window : globalThis);

/* Item 13 of Hoang's September review: "Danh muc san pham ben trai bi an som khi keo xuong gay loi khoang trang".
   The homepage banner row reserves a 245px column for the category list, but the list itself lived inside the sticky
   header, absolutely positioned 188px from the viewport top. It therefore drifted away from the row as soon as the
   page moved and rode the header down over the products, so it was hidden past 40px of scroll - leaving a measured
   245 x 489px of white in the reserved column until the row went off screen.

   Moving it into the banner row makes the two scroll together: no flag, no scroll handler, no clipping. It stays
   position:absolute (see ict-desktop-navigation.css) so it takes up no space and adds nothing to CLS.

   Order matters. ict-desktop-navigation.js builds the "Danh muc san pham" dropdown - a separate, wider panel - and
   looks its source up as `.header_wrap .bottom_header #navCatContent`, so the move has to wait until that has run,
   or the dropdown is never built. It marks the bar with data-ict-desktop-navigation="ready" when done; we wait for
   that, and give up waiting after ~2s rather than leaving the gap forever.

   Cloning instead of moving was measured and rejected: the sub-branches open through handlers bound to this element,
   so a clone is inert (hovering "Linh Kien May Tinh" expands 168 -> 186 links on the original, 12 -> 12 on a copy).
   home.js still measures `.bottom_header #navCatContent` on resize and will now read undefined, which only feeds
   .mega-menu-container and .mega-menu-child-dv - both measured dead on the live homepage (visibility:hidden, 0x0). */
(function (root) {
    'use strict';
    if (typeof root === 'undefined' || !root.document) return;
    var doc = root.document, tries = 0, sourceParent = null, sourceNext = null, heroRow = null;
    var wide = root.matchMedia ? root.matchMedia('(min-width: 1200px)') : null;
    var move = function () {
        var panel = doc.getElementById('navCatContent');
        var column = doc.querySelector('.home-slide-col');
        if (!panel || !column || !column.parentElement) return;
        if (!sourceParent) { sourceParent = panel.parentElement; sourceNext = panel.nextSibling; }
        if (!wide || !wide.matches) {
            if (heroRow && panel.parentElement === heroRow) {
                sourceParent.insertBefore(panel, sourceNext && sourceNext.parentNode === sourceParent ? sourceNext : null);
                heroRow.classList.remove('ict-hero-row');
            }
            return;
        }
        var row = column.parentElement;
        if (panel.parentElement === row) return;
        var bar = doc.querySelector('.header_wrap .bottom_header');
        if (bar && !bar.dataset.ictDesktopNavigation && tries++ < 120) {
            root.requestAnimationFrame ? root.requestAnimationFrame(move) : setTimeout(move, 16);
            return;
        }
        row.classList.add('ict-hero-row');
        heroRow = row;
        row.appendChild(panel);
    };
    if (wide) wide.addEventListener('change', function () { tries = 0; move(); });
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', move);
    else move();
})(typeof window !== 'undefined' ? window : globalThis);
