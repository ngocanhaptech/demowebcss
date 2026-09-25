/* Approved desktop navigation geometry; content and destinations come from native CMS menus. */
(() => {
    'use strict';
    const init = () => {
        const header = document.querySelector('.header_wrap:not(.fixed-top)');
        const bar = header?.querySelector('.bottom_header');
        const categorySource = bar?.querySelector('#navCatContent');
        const categoryTrigger = bar?.querySelector('.categories_btn');
        if (!bar || !categorySource || !categoryTrigger || bar.dataset.ictDesktopNavigation) return;
        bar.dataset.ictDesktopNavigation = 'ready';
        const desktop = matchMedia('(min-width:1024px)');
        const homeWide = matchMedia('(min-width:1200px)');
        const homeHost = document.querySelector('.page-home .home-slide-col') ? document.createElement('div') : null;
        if (homeHost) {
            homeHost.className = 'ict-desktop-nav-home';
            categorySource.classList.add('ict-desktop-nav-home-source');
            categorySource.append(homeHost);
        }
        const label = node => node?.textContent.replace(/\s+/g, ' ').trim() || '';
        const plain = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd');
        const navNodes = Array.from(bar.querySelectorAll('#navbarSidetoggle > .navbar-nav > li'));
        const serviceNode = navNodes.find(node => node.querySelector('.w-sub-mega') && plain(label(node.querySelector(':scope > a'))).includes('dich vu'));
        const serviceTrigger = serviceNode?.querySelector(':scope > a');
        const supportTrigger = bar.querySelector('#navbarSidetoggle > .navbar-support');
        const supportSource = supportTrigger?.querySelector('.navbar-support-online-sub');
        const make = (tag, className, text) => {
            const node = document.createElement(tag); node.className = className || '';
            if (text != null) node.textContent = text;
            return node;
        };
        const svgIcon = (name, className = '') => {
            const shapes = {
                chevron: '<path d="m9 6 6 6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>', x: '<path d="m6 6 12 12M6 18 18 6"/>',
                phone: '<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
                clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
                wifi: '<path d="M2 9a16 16 0 0 1 20 0M5 13a11 11 0 0 1 14 0M8 17a6 6 0 0 1 8 0"/><circle cx="12" cy="20.5" r=".5" fill="currentColor"/>',
                eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
                box: '<path d="m3 7 9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10"/>',
                cpu: '<rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx=".5"/><path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"/>',
                shield: '<path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3zM9 12l2 2 4-4"/>',
                truck: '<path d="M2 7h11v9H2zM13 10h5l3 3v3h-8z"/><circle cx="7" cy="18" r="1.8"/><circle cx="18" cy="18" r="1.8"/>',
                card: '<rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 10h19M6 15h3"/>',
                image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 19 5-5 4 4 3-3 4 4"/>',
                memory: '<path d="M3 8h18v8H3zM6 8v8M10 8v8M14 8v8M18 8v8M3 11h18M3 13h18"/>',
                copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/>',
                swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
                file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6"/>',
                check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
                flame: '<path d="M13 2c1 5 7 7 7 13a8 8 0 0 1-16 0c0-3 1-5 4-7-1 4 1 5 3 6 2-3 3-7 2-12z"/>'
            };
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','none'); svg.setAttribute('stroke','currentColor');
            svg.setAttribute('stroke-width','1.8'); svg.setAttribute('stroke-linecap','round'); svg.setAttribute('stroke-linejoin','round'); svg.setAttribute('aria-hidden','true');
            svg.setAttribute('class',className); svg.innerHTML = shapes[name] || shapes.chevron; return svg;
        };
        serviceTrigger?.querySelector('.dropdown-tgg')?.replaceChildren(svgIcon('down'));
        const isDestination = anchor => {
            const href = anchor?.getAttribute('href')?.trim();
            return !!href && href !== '#' && !/^javascript:/i.test(href);
        };
        const copyLink = (original, className) => {
            const node = make(isDestination(original) ? 'a' : 'span', className, label(original));
            if (node.tagName === 'A') {
                node.href = original.href;
                if (original.target) node.target = original.target;
                if (original.rel) node.rel = original.rel;
            }
            return node;
        };
        const icon = anchor => {
            const box = make('span', 'ict-desktop-nav-icon');
            const original = anchor?.querySelector('img,svg,i');
            const name = plain(label(anchor));
            const categories = {'mini pc':'box','may tinh de ban':'cpu','laptop':'card','man hinh may tinh':'image','linh kien may tinh':'memory','thiet bi van phong':'copy','thiet bi mang':'wifi','camera & giam sat':'eye','camera wifi':'eye','camera quan sat':'eye','hang cu (thanh ly)':'swap','hang cu':'swap'};
            const design = categories[name] || (/dich vu cho thue/.test(name) ? 'box' : /dich vu cntt/.test(name) ? 'cpu' : /lap dat camera/.test(name) ? 'eye' : /cung cap thiet bi/.test(name) ? 'truck' : null);
            if (design) box.append(svgIcon(design));
            else if (original) {
                const image = original.cloneNode(true);
                image.removeAttribute('id'); image.removeAttribute('style'); image.setAttribute('aria-hidden', 'true');
                if (image.tagName === 'IMG') image.alt = '';
                box.append(image);
            } else box.textContent = '▦';
            box.setAttribute('aria-hidden', 'true'); return box;
        };
        const uniqueLinks = (node, exclude) => {
            const seen = new Set();
            return Array.from(node.querySelectorAll('a')).filter(anchor => {
                const key = (anchor.getAttribute('href') || '') + label(anchor);
                if (anchor === exclude || !label(anchor) || seen.has(key)) return false;
                seen.add(key); return true;
            });
        };
        const models = new Map(); let current = null; let clickedModel = null; let closeTimer; let refreshTimer;
        let groupHoverTimer; let pendingGroup; let aimOrigin; let pointer = {x:0,y:0}; let dismissedPointer;
        function cancelGroupHover() { clearTimeout(groupHoverTimer); pendingGroup = null; }
        function headingIntoCascade(point) {
            if (!aimOrigin || !current?.panel.classList.contains('is-cascade')) return false;
            const rect = current.panel.querySelector('.ict-desktop-nav-main').getBoundingClientRect();
            const width = rect.left - aimOrigin.x;
            if (width <= 0) return false;
            const progress = (point.x - aimOrigin.x) / width;
            return progress >= 0 && progress <= 1
                && point.y >= aimOrigin.y + (rect.top - 12 - aimOrigin.y) * progress - 4
                && point.y <= aimOrigin.y + (rect.bottom + 12 - aimOrigin.y) * progress + 4;
        }
        function deferGroup(group) {
            pendingGroup = group; clearTimeout(groupHoverTimer);
            groupHoverTimer = setTimeout(() => {
                const next = pendingGroup; cancelGroupHover();
                if (next && current === next.model && next.row.matches(':hover')) next.select();
            }, 280);
        }
        document.addEventListener('mousemove', event => {
            const previous = pointer; pointer = {x:event.clientX,y:event.clientY};
            if (dismissedPointer && Math.hypot(pointer.x-dismissedPointer.x,pointer.y-dismissedPointer.y)>2) dismissedPointer = null;
            if (!current) return;
            const active = current.panel.querySelector('[data-ict-desktop-group][aria-selected="true"]')?.parentElement;
            if (active?.contains(event.target)) aimOrigin = {...pointer};
            if (!pendingGroup) return;
            const sidebar = current.panel.querySelector('.ict-desktop-nav-sidebar');
            if (!sidebar?.contains(event.target)) cancelGroupHover();
            else if (pointer.x > previous.x && headingIntoCascade(pointer)) deferGroup(pendingGroup);
        }, {passive:true});
        const sourceClass = 'ict-desktop-nav-source';
        categorySource.classList.add(sourceClass);
        serviceNode?.querySelector(':scope > .dropdown-menu')?.classList.add(sourceClass);
        supportSource?.classList.add(sourceClass);

        function createPanel(kind, trigger) {
            const panel = make('section', 'ict-desktop-nav-panel ict-desktop-nav-' + kind);
            panel.id = 'ict-desktop-nav-' + kind; panel.hidden = true;
            panel.setAttribute('aria-label', kind === 'category' ? 'Danh mục sản phẩm' : kind === 'services' ? 'Dịch vụ' : 'Danh bạ hỗ trợ');
            const model = {kind, trigger, panel, items:[], active:0}; models.set(kind, model);
            trigger.setAttribute('aria-controls', panel.id); trigger.setAttribute('aria-expanded', 'false');
            trigger.setAttribute('aria-haspopup', 'true');
            if (!['A','BUTTON'].includes(trigger.tagName)) { trigger.tabIndex = 0; trigger.setAttribute('role', 'button'); }
            document.body.append(panel);
            trigger.addEventListener('mouseenter', () => open(kind));
            trigger.addEventListener('mouseleave', scheduleClose);
            panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
            panel.addEventListener('mouseleave', scheduleClose);
            trigger.addEventListener('keydown', event => {
                if (!desktop.matches) return;
                if (kind === 'support' && event.target.closest('a[href]') && ['Enter',' '].includes(event.key)) return;
                if (['ArrowDown','Enter',' '].includes(event.key)) {
                    event.preventDefault(); event.stopImmediatePropagation(); open(kind);
                    panel.querySelector('button,a[href]')?.focus();
                }
            });
            return model;
        }
        function scheduleClose() { clearTimeout(closeTimer); closeTimer = setTimeout(() => { if (!current?.panel.contains(document.activeElement)) close(); }, 180); }
        function close(restore = false) {
            clearTimeout(closeTimer);
            cancelGroupHover(); aimOrigin = null;
            if (!current) return;
            const previous = current; previous.panel.hidden = true; previous.trigger.setAttribute('aria-expanded', 'false');
            resetHomeEntry(previous);
            current = null; clickedModel = null;
            if (restore) dismissedPointer = {...pointer};
            dockHomeSidebar();
            if (restore) previous.trigger.focus();
        }
        function dockHomeSidebar() {
            const model = models.get('category');
            if (!homeHost || !model?.sidebar) return;
            if (homeHost.parentElement !== categorySource) categorySource.append(homeHost);
            const target = homeWide.matches && current !== model ? homeHost : model.panel.querySelector('.ict-desktop-nav-inner');
            if (model.sidebar.parentElement !== target) target.prepend(model.sidebar);
            if (target === homeHost) homeHost.style.minHeight = model.sidebar.scrollHeight + 'px';
        }
        function resetHomeEntry(model) {
            model.homeEntry = null;
            const inner = model.panel.querySelector('.ict-desktop-nav-inner');
            if (inner) inner.style.height = '';
            if (model.sidebar) {
                model.sidebar.style.paddingBottom = model.sidebar.style.maxHeight = model.sidebar.style.overflowY = '';
                model.sidebar.scrollTop = 0;
            }
        }
        function position() {
            if (!current) return;
            const rect = bar.getBoundingClientRect();
            if (rect.bottom <= 0 || rect.top >= innerHeight) { close(); return; }
            const top = Math.max(0, rect.bottom) + (current.kind === 'support' ? 4 : 0);
            current.panel.style.top = top + 'px';
            current.panel.style.maxHeight = Math.max(120, innerHeight - top - 16) + 'px';
            current.panel.style.setProperty('--ict-menu-available-height', Math.max(120, innerHeight - top - 16) + 'px');
            const frame = bar.querySelector('.row-menu') || bar.querySelector('.mega-width') || current.trigger;
            const frameRect = frame.getBoundingClientRect();
            const categoryRect = categoryTrigger.getBoundingClientRect();
            if (current.kind === 'support') {
                // Anchor the support card on the page frame, not on the hotline button. The button stops short of the
                // frame by the container's padding - measured 1549 against a frame edge of 1564 at 1728px - and that
                // 15px gap read as the card not quite reaching the edge. Measuring .mega-width instead of using vw
                // keeps the scrollbar out of the sum.
                current.panel.style.right = Math.max(16, document.documentElement.clientWidth - frameRect.right) + 'px';
            } else {
                // Use the visible navigation edges, including its actual container padding.
                // The sidebar divider follows the category button at every width and after scrolling.
                const left = Math.max(0, categoryRect.left);
                current.panel.style.left = left + 'px';
                current.panel.style.right = 'auto';
                current.panel.style.width = Math.max(0, Math.min(innerWidth, frameRect.right) - left) + 'px';
                current.panel.style.marginLeft = current.panel.style.marginRight = '0';
                current.panel.style.setProperty('--ict-menu-sidebar-width', categoryRect.right - left + 'px');
            }
            if (current.homeEntry && homeHost && homeWide.matches) {
                // Keep the clicked/hovered row under the pointer when the hero has scrolled under the header.
                const offset = Math.max(0, top - homeHost.getBoundingClientRect().top);
                const natural = current.homeEntry.height;
                if (offset >= natural) { close(); return; }
                const height = Math.min(Math.max(120, natural - offset), Math.max(120, innerHeight - top - 16));
                current.panel.querySelector('.ict-desktop-nav-inner').style.height = height + 'px';
                current.panel.style.setProperty('--ict-menu-available-height', height + 'px');
                current.sidebar.style.maxHeight = '100%'; current.sidebar.style.overflowY = 'auto';
                current.sidebar.style.paddingBottom = Math.max(0, height + offset - natural) + 'px';
                current.sidebar.scrollTop = offset;
            }
            positionCascade(current);
        }
        function positionCascade(model) {
            const main = model.panel.querySelector('.ict-desktop-nav-main');
            if (!main) return;
            // All categories share one continuous frame below the navigation bar.
            // CSS stretches the flyout to the sidebar; never offset it to the active row.
            main.style.marginTop = '';
        }
        function open(kind, fromHome = false) {
            if (!desktop.matches) return;
            clearTimeout(closeTimer);
            const model = models.get(kind); if (!model) return;
            if (current && current !== model) close();
            if (fromHome && homeHost?.contains(model.sidebar)) model.homeEntry = {height:model.sidebar.scrollHeight};
            else resetHomeEntry(model);
            current = model; dockHomeSidebar();
            model.panel.hidden = false; model.trigger.setAttribute('aria-expanded', 'true'); syncActiveGroup(model); position();
        }
        function fillContent(model) {
            const item = model.items[model.active]; const main = model.panel.querySelector('.ict-desktop-nav-main');
            if (!item || !main) return;
            main.replaceChildren();
            model.panel.classList.remove('is-cascade', 'has-promotion');
            main.style.marginTop = '';
            model.panel.querySelector('.ict-desktop-nav-promo')?.remove();
            const categoryPath = new URL(item.anchor.href || '#', location.href).pathname.replace(/\/$/, '');
            const branchNodes = Array.from(item.node.querySelectorAll(':scope > .dropdown-menu > ul > li'));
            if (model.kind === 'category' && ['/linh-kien-may-tinh', '/hang-cu'].includes(categoryPath) && branchNodes.length) {
                model.panel.classList.add('is-cascade');
                fillCascade(model, main, branchNodes, categoryPath);
                syncActiveGroup(model);
                return;
            }
            const titlebar = make('div', 'ict-desktop-nav-titlebar'); const heading = make('h4', '', label(item.anchor));
            heading.prepend(icon(item.anchor)); titlebar.append(heading);
            if (isDestination(item.anchor)) {
                const all = copyLink(item.anchor, 'ict-desktop-nav-all'); all.textContent = model.kind === 'services' ? 'Xem tất cả dịch vụ ›' : 'Xem tất cả ›'; titlebar.append(all);
            }
            main.append(titlebar);
            const groups = model.kind === 'category' ? Array.from(item.node.querySelectorAll(':scope > .dropdown-menu > ul > li')) : [];
            const grouped = groups.some(group => group.querySelector('.dropdown-menu'));
            const grid = make('div', 'ict-desktop-nav-groups' + (grouped ? ' is-grouped' : ' is-flat'));
            grid.style.setProperty('--ict-menu-columns', Math.min(4, Math.max(2, groups.length)));
            grid.style.setProperty('--ict-menu-columns-tablet', groups.length >= 4 ? 3 : 2);
            if (grouped) {
                groups.forEach(group => {
                    const top = group.querySelector(':scope > a'); const section = make('div', 'ict-desktop-nav-group');
                    if (top) { const title = copyLink(top, 'ict-desktop-nav-group-title'); title.append(svgIcon('chevron','ict-desktop-nav-small-chevron')); section.append(title); }
                    const list = make('div', 'ict-desktop-nav-links');
                    uniqueLinks(group, top).forEach(anchor => list.append(copyLink(anchor, 'ict-desktop-nav-link')));
                    section.append(list); grid.append(section);
                });
            } else {
                uniqueLinks(item.node, item.anchor).forEach(anchor => grid.append(copyLink(anchor, 'ict-desktop-nav-link')));
            }
            if (!grid.childElementCount) {
                const fallback = copyLink(item.anchor, 'ict-desktop-nav-link'); fallback.textContent = 'Xem ' + label(item.anchor); grid.append(fallback);
            }
            main.append(grid);
            model.panel.querySelector('.ict-desktop-nav-promo')?.remove(); model.panel.classList.remove('has-promotion');
            // Prefer a CMS campaign; the Mini PC offer below was explicitly
            // approved by the owner on 20/09/2026. Its destination stays CMS-owned.
            let promotion = item.node.querySelector('[data-ict-menu-promotion]');
            if (!promotion && model.kind === 'category' && categoryPath === '/mini-pc') {
                const destination = uniqueLinks(item.node, item.anchor).find(a => plain(label(a)) === 'asus nuc');
                if (isDestination(destination)) {
                    promotion = make('div', 'ict-desktop-nav-offer');
                    promotion.append(make('p','ict-desktop-nav-offer-kicker','ƯU ĐÃI THÁNG NÀY'),
                        make('h4','','Mini PC ASUS NUC giảm đến 30%'),
                        make('p','ict-desktop-nav-offer-description','Quà tặng cho mọi đơn hàng ≥ 12 triệu'));
                    const cta = copyLink(destination, 'ict-desktop-nav-offer-cta'); cta.textContent = 'Xem chi tiết →';
                    const badges = make('div','ict-desktop-nav-offer-badges');
                    ['Quà tặng','Trả góp','Ship 2h'].forEach(text => badges.append(make('span','',text)));
                    const decoration = make('span','ict-desktop-nav-offer-decoration'); decoration.setAttribute('aria-hidden','true');
                    decoration.append(svgIcon('flame'));
                    promotion.append(cta,badges,decoration);
                }
            }
            if (model.kind === 'category' && promotion) {
                const slot = make('aside','ict-desktop-nav-promo'); slot.append(promotion.cloneNode(true));
                model.panel.querySelector('.ict-desktop-nav-inner').append(slot); model.panel.classList.add('has-promotion');
            }
            if (model.kind === 'services') {
                heading.append(make('small','ict-desktop-nav-count','(' + uniqueLinks(item.node,item.anchor).length + ' dịch vụ)'));
                const commitments = make('div', 'ict-desktop-nav-commitments');
                // Informational copy from the approved ServiceMegaMenu; no payment/provider action.
                [['shield','Báo giá minh bạch'],['truck','Triển khai 24h'],['card','Thanh toán linh hoạt'],['check','Hợp đồng rõ ràng']].forEach(([glyph, text]) => {
                    const item = make('div'); const badge = make('span'); badge.append(svgIcon(glyph)); badge.setAttribute('aria-hidden', 'true');
                    item.append(badge, make('span', '', text)); commitments.append(item);
                });
                main.append(commitments);
                const nativeImages = Array.from(item.node.querySelectorAll('.mega-menu-child-dv img')).filter(img => img.getAttribute('src') || img.dataset.original);
                if (nativeImages.length) {
                    const media = make('div', 'ict-desktop-nav-service-media');
                    nativeImages.slice(0,1).forEach(original => {const img = make('img'); img.src = original.getAttribute('src') || original.dataset.original; img.alt = original.alt || label(item.anchor); img.loading = 'lazy'; media.append(img);});
                    main.append(media);
                }
            }
            syncActiveGroup(model);
        }
        function syncActiveGroup(model) {
            (model.sidebar || model.panel).querySelectorAll('[data-ict-desktop-group]').forEach((button, index) => {
                button.setAttribute('aria-selected', String(index === model.active)); button.tabIndex = index === model.active ? 0 : -1;
            });
            (model.sidebar || model.panel).querySelectorAll('[data-ict-desktop-expand]').forEach((button, index) => {
                button.setAttribute('aria-expanded', String(index === model.active));
            });
            positionCascade(model);
        }
        function fillCascade(model, main, nodes, rootKey) {
            const children = node => Array.from(node.querySelectorAll(':scope > .dropdown-menu > ul > li')).filter(n => label(n.querySelector(':scope > a')));
            const key = node => (node.querySelector(':scope > a')?.getAttribute('href') || '') + '|' + label(node.querySelector(':scope > a'));
            model.cascadePaths ||= new Map();
            const trail = model.cascadePaths.get(rootKey) || [];
            model.cascadePaths.set(rootKey, trail);
            const cascade = make('div', 'ict-desktop-nav-cascade');
            const columns = Array.from({length:3}, (_, level) => {
                const col = make('div', 'ict-desktop-nav-cascade-column');
                col.dataset.ictCascadeLevel = level; col.setAttribute('aria-label', 'Danh mục cấp ' + (level + 1));
                cascade.append(col); return col;
            });
            main.append(cascade);
            function draw(level, entries) {
                if (level >= columns.length) return;
                const col = columns[level]; col.replaceChildren();
                entries = entries.filter(n => label(n.querySelector(':scope > a')));
                if (!entries.length) { trail.splice(level); draw(level + 1, []); return; }
                let active = Math.max(0, entries.findIndex(n => key(n) === trail[level]));
                const rows = [];
                const select = (index, enter = false) => {
                    if (active !== index || trail[level] !== key(entries[index])) trail.splice(level + 1);
                    active = index; trail[level] = key(entries[index]);
                    rows.forEach((row, i) => {
                        row.classList.toggle('is-active', i === index);
                        row.querySelectorAll('[aria-expanded]').forEach(b => b.setAttribute('aria-expanded', String(i === index)));
                    });
                    draw(level + 1, children(entries[index]));
                    positionCascade(model);
                    if (enter) columns[level + 1]?.querySelector('.ict-desktop-nav-cascade-link')?.focus();
                };
                entries.forEach((node, index) => {
                    const original = node.querySelector(':scope > a'), nested = children(node);
                    const row = make('div','ict-desktop-nav-cascade-row');
                    const link = isDestination(original) ? copyLink(original, 'ict-desktop-nav-cascade-link') : make('button','ict-desktop-nav-cascade-link',label(original));
                    if (link.tagName === 'BUTTON') link.type = 'button';
                    row.append(link); rows.push(row);
                    if (nested.length && level < 2) {
                        const expand = make('button','ict-desktop-nav-cascade-expand'); expand.type = 'button';
                        expand.setAttribute('aria-label','Mở ' + label(original)); expand.setAttribute('aria-expanded','false');
                        expand.append(svgIcon('chevron')); row.append(expand);
                        expand.addEventListener('click',event=>{event.preventDefault();select(index,true);});
                    }
                    row.addEventListener('mouseenter',()=>select(index));
                    link.addEventListener('focus',()=>select(index));
                    link.addEventListener('click',()=>select(index,link.tagName==='BUTTON'));
                    row.addEventListener('keydown',event=>{
                        if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
                            event.preventDefault();event.stopPropagation();
                            const next=event.key==='Home'?0:event.key==='End'?rows.length-1:(index+(event.key==='ArrowDown'?1:-1)+rows.length)%rows.length;
                            rows[next].querySelector('.ict-desktop-nav-cascade-link').focus();
                        } else if (event.key==='ArrowRight' || (event.key===' ' && event.target===link)) {
                            event.preventDefault();event.stopPropagation();select(index,true);
                        } else if (event.key==='ArrowLeft') {
                            event.preventDefault();event.stopPropagation();
                            (level?columns[level-1].querySelector('.is-active .ict-desktop-nav-cascade-link'):model.panel.querySelector('[data-ict-desktop-group][aria-selected="true"]'))?.focus();
                        }
                    });
                    col.append(row);
                });
                select(active);
            }
            draw(0,nodes);
        }
        function fillMenu(model, nodes) {
            cancelGroupHover();
            const selected = model.items[model.active]?.anchor?.href;
            model.items = nodes.map(node => ({node, anchor:node.querySelector(':scope > a')})).filter(item => item.anchor && label(item.anchor));
            model.active = Math.max(0, model.items.findIndex(item => item.anchor.href === selected));
            model.sidebar?.remove(); model.panel.replaceChildren();
            const inner = make('div', 'ict-desktop-nav-inner'); const sidebar = make('div', 'ict-desktop-nav-sidebar');
            model.sidebar = sidebar;
            if (model.kind === 'category' && homeHost) model.panel.classList.add('has-home-sidebar');
            sidebar.setAttribute('role', 'tablist'); sidebar.setAttribute('aria-orientation', 'vertical'); sidebar.setAttribute('aria-label', model.kind === 'category' ? 'Nhóm sản phẩm' : 'Nhóm dịch vụ');
            model.items.forEach((item, index) => {
                const row = make('div', 'ict-desktop-nav-group-row'); row.setAttribute('role', 'presentation');
                const button = make(isDestination(item.anchor) ? 'a' : 'button', 'ict-desktop-nav-group-button');
                if (button.tagName === 'A') button.href = item.anchor.href; else button.type = 'button';
                button.dataset.ictDesktopGroup = index;
                button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', model.panel.id + '-content');
                button.append(icon(item.anchor), make('span', 'ict-desktop-nav-group-name', label(item.anchor)));
                if (model.kind === 'services' && /dich vu cho thue/.test(plain(label(item.anchor)))) button.append(make('span','ict-desktop-nav-badge','Phổ biến'));
                const expand = make('button', 'ict-desktop-nav-expand'); expand.type = 'button'; expand.tabIndex = -1;
                expand.dataset.ictDesktopExpand = index; expand.setAttribute('aria-label', 'Mở nhóm ' + label(item.anchor));
                expand.setAttribute('aria-controls', model.panel.id + '-content');
                expand.append(svgIcon('chevron','ict-desktop-nav-chevron'));
                const select = () => { cancelGroupHover(); if (model.active !== index) { model.active = index; fillContent(model); } };
                row.addEventListener('mouseenter', event => {
                    if (homeHost?.contains(button)) {
                        if (dismissedPointer && Math.hypot(event.clientX-dismissedPointer.x,event.clientY-dismissedPointer.y)<=2) return;
                        select(); open(model.kind, true); return;
                    }
                    if (model.active !== index && event.clientX >= pointer.x && headingIntoCascade({x:event.clientX,y:event.clientY}))
                        deferGroup({model,row,select});
                    else select();
                });
                button.addEventListener('focus', () => { select(); if (homeHost?.contains(button)) open(model.kind, true); }); button.addEventListener('click', select);
                button.addEventListener('keydown', event => { if (event.key === ' ') { event.preventDefault(); select(); } });
                expand.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); const fromHome=homeHost?.contains(expand); select(); open(model.kind, fromHome); });
                row.append(button, expand); sidebar.append(row);
            });
            if (model.kind === 'services') {
                const promise = make('div','ict-desktop-nav-service-promise');
                promise.append(make('strong','','CAM KẾT'),make('p','','Báo giá trong 30 phút. Triển khai trong 24h.'));
                const phone = document.querySelector('.ict-footer-contacts a[href^="tel:"]') || document.querySelector('[data-ict-menu-hotlines] a[href^="tel:"]');
                if (phone) { const contact = copyLink(phone,''); contact.prepend(svgIcon('phone')); promise.append(contact); }
                sidebar.append(promise);
            }
            const main = make('div', 'ict-desktop-nav-main'); main.id = model.panel.id + '-content'; main.setAttribute('role', 'tabpanel');
            main.addEventListener('mouseenter', cancelGroupHover);
            sidebar.addEventListener('scroll', () => { cancelGroupHover(); positionCascade(model); }, {passive:true});
            inner.append(sidebar, main); model.panel.append(inner); fillContent(model);
        }
        function fillSupport(model) {
            const headings = Array.from(supportSource.querySelectorAll('.support-online-head'));
            model.panel.replaceChildren();
            const head = make('div', 'ict-desktop-nav-support-head'); const title = make('div');
            title.append(make('strong', '', headings.length + ' PHÒNG BAN — LIÊN HỆ TRỰC TIẾP'), make('p', '', 'Bấm vào số điện thoại để gọi ngay'));
            const dismiss = make('button', 'ict-desktop-nav-dismiss'); dismiss.append(svgIcon('x')); dismiss.type = 'button'; dismiss.setAttribute('aria-label', 'Đóng danh bạ'); dismiss.addEventListener('click', () => close(true));
            head.append(title, dismiss); model.panel.append(head);
            const grid = make('div', 'ict-desktop-nav-support-grid');
            headings.forEach(nativeHeading => {
                const section = make('section', 'ict-desktop-nav-contact-group'); const h = make('div', 'ict-desktop-nav-contact-title', label(nativeHeading)); h.prepend(icon(nativeHeading)); section.append(h);
                const ul = nativeHeading.nextElementSibling;
                ul?.querySelectorAll('li').forEach(row => {
                    const detail = row.querySelector('div') || row; const number = label(detail.querySelector('span'));
                    const digits = number.replace(/\D/g, ''); const isPhone = /^(?:\+84|0)[\d .()-]+$/.test(number) && digits.length >= 9 && digits.length <= 12;
                    const line = make(isPhone ? 'a' : 'div', 'ict-desktop-nav-contact');
                    if (isPhone) line.href = 'tel:' + (number.startsWith('+') ? '+' : '') + digits;
                    const glyph = make('span','ict-desktop-nav-phone-icon'); glyph.append(svgIcon(isPhone ? 'phone' : 'clock'));
                    line.append(glyph, make('strong', '', number), make('span', '', label(detail).replace(number, '').trim())); section.append(line);
                });
                grid.append(section);
            });
            model.panel.append(grid);
        }
        createPanel('category', categoryTrigger);
        if (serviceTrigger) createPanel('services', serviceTrigger);
        if (supportSource && supportTrigger) { const model = createPanel('support', supportTrigger); fillSupport(model); }
        function refresh() {
            fillMenu(models.get('category'), Array.from(categorySource.querySelectorAll('.main-mega-menu > li')));
            if (models.has('services')) fillMenu(models.get('services'), Array.from(serviceNode.querySelectorAll('.w-sub-mega > li')));
            dockHomeSidebar();
        }
        refresh();
        // Only CMS mutations rebuild navigation; moving the shared rendered sidebar must not rebuild itself.
        new MutationObserver(records => {
            if (!records.some(record => !homeHost?.contains(record.target)
                && [...record.addedNodes,...record.removedNodes].some(node => node !== homeHost))) return;
            clearTimeout(refreshTimer); refreshTimer = setTimeout(refresh, 0);
        }).observe(categorySource, {childList:true, subtree:true});
        homeHost?.addEventListener('mouseleave', scheduleClose);
        homeWide.addEventListener('change', () => { dockHomeSidebar(); position(); });
        document.addEventListener('click', event => {
            if (!desktop.matches) return;
            const model = Array.from(models.values()).find(item => item.trigger.contains(event.target));
            if (model) {
                if (model.kind === 'support' && event.target.closest('a[href^="tel:"]')) return;
                event.preventDefault(); event.stopImmediatePropagation();
                if (current === model && clickedModel === model) close(); else { open(model.kind); clickedModel = model; }
            } else if (current && !current.panel.contains(event.target)) close();
        }, true);
        document.addEventListener('keydown', event => {
            if (!current) return;
            if (event.key === 'Escape') {event.preventDefault(); close(true); return;}
            const group = event.target.closest('[data-ict-desktop-group]');
            if (group && ['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
                event.preventDefault(); const buttons = Array.from(current.panel.querySelectorAll('[data-ict-desktop-group]'));
                const index = buttons.indexOf(group); const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
                buttons[next]?.focus();
            } else if (group && event.key === 'ArrowRight') { event.preventDefault(); current.panel.querySelector('.ict-desktop-nav-main a[href]')?.focus(); }
            else if (current.panel.contains(event.target) && event.key === 'ArrowLeft') { event.preventDefault(); current.panel.querySelector('[aria-selected="true"]')?.focus(); }
        });
        document.addEventListener('focusin', event => { if (current && !current.panel.contains(event.target) && !current.trigger.contains(event.target)) close(); });
        window.addEventListener('scroll', position, {passive:true});
        window.addEventListener('resize', position, {passive:true});
        desktop.addEventListener('change', () => { if (!desktop.matches) close(); });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
