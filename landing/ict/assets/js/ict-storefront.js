/* Shared responsive interactions. Native product, comparison and cart APIs remain authoritative. */
(() => {
    'use strict';
    const ready = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, {once:true}) : fn();
    ready(() => {
        const combinedChat = document.querySelector('[data-ict-corner-chat]');
        if (combinedChat) document.body.classList.add('ict-unified-support');
        const money = value => new Intl.NumberFormat('vi-VN').format(value) + 'đ';
        document.querySelectorAll('.product-search-field').forEach((input, index) => {
            const form = input.closest('form'), box = form?.querySelector('.box-search-result');
            if (!box) return;
            input.id = 'ict-search-input-' + index; box.id = 'ict-search-results-' + index;
            input.setAttribute('aria-controls', box.id); input.setAttribute('aria-expanded', 'false');
            box.classList.add('ict-search-results'); box.setAttribute('aria-label', 'Kết quả tìm kiếm');
            let timer, sequence = 0, pending;
            const size = () => {
                const viewport = window.visualViewport;
                const bottom = (viewport?.height || innerHeight) + (viewport?.offsetTop || 0);
                box.style.maxHeight = Math.max(72, Math.min(500, bottom - box.getBoundingClientRect().top - 12)) + 'px';
            };
            const hide = () => { box.style.display = 'none'; input.setAttribute('aria-expanded', 'false'); };
            const dismiss = () => { pending?.abort(); clearTimeout(timer); sequence++; hide(); };
            const show = () => { box.style.display = 'block'; input.setAttribute('aria-expanded', 'true'); size(); };
            const status = text => { box.replaceChildren(); const p=document.createElement('p');p.className='ict-search-status';p.setAttribute('role','status');p.textContent=text;box.append(p);show(); };
            input.addEventListener('input', () => {
                clearTimeout(timer); pending?.abort(); const current=++sequence, query=input.value.trim();
                if (!query) return hide();
                if (query.length < 3) return status('Vui lòng nhập ít nhất 3 ký tự.');
                status('Đang tìm sản phẩm…');
                timer = setTimeout(async () => {
                    pending = new AbortController();
                    try {
                        const endpoint = new URL(input.dataset.url, location.href);
                        if (endpoint.origin !== location.origin) throw new Error('Đường dẫn tìm kiếm không hợp lệ.');
                        const response = await fetch(endpoint, {method:'POST', credentials:'same-origin', signal:pending.signal,
                            headers:{'Accept':'application/json','X-Requested-With':'XMLHttpRequest','X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]')?.content || ''},body:new URLSearchParams({q:query})});
                        const payload = await response.json();
                        if (current !== sequence || query !== input.value.trim()) return;
                        if (!response.ok || payload.error) throw new Error(payload.message || 'Chưa tìm kiếm được. Vui lòng thử lại.');
                        const products=window.IctCatalog.products(payload,30);
                        if (!products.length) return status('Không tìm thấy sản phẩm phù hợp.');
                        // IctCatalog escapes these strings before HTML rendering.
                        box.innerHTML=products.map(item => {
                            const href=item.slugable ? '/' + item.slugable.key.replace(/^\/+/, '') : '#';
                            return '<a class="ict-search-row" href="'+href+'"><img src="'+item.main_image+'" alt="" width="56" height="56"><span class="ict-search-copy"><span class="ict-search-name">'+item.name+'</span><strong class="ict-search-price">'+(item.front_sale_price ? money(item.front_sale_price) : 'Liên hệ')+'</strong></span></a>';
                        }).join('');
                        if (document.activeElement===input || form.contains(document.activeElement)) show(); else hide();
                    } catch (error) {
                        if (error.name!=='AbortError' && current===sequence) status(error.message || 'Chưa tìm kiếm được. Vui lòng thử lại.');
                    }
                },250);
            });
            input.addEventListener('focus', () => {if (box.childElementCount && input.value) show();});
            input.addEventListener('keydown', event => {if(event.key==='Escape'){dismiss();}else if(event.key==='ArrowDown'){const result=box.querySelector('a');if(result){event.preventDefault();result.focus();}}});
            document.addEventListener('click', event => {if(!form.contains(event.target)) dismiss();});
            window.visualViewport?.addEventListener('resize',size);window.visualViewport?.addEventListener('scroll',size);window.addEventListener('resize',size);
        });
        document.querySelectorAll('[data-ict-breadcrumb]').forEach(list => {
            const fit=()=>{
                const middle=list.querySelector('[data-ict-breadcrumb-middle]');
                list.classList.remove('ict-breadcrumb-compact');
                if (!middle) return;
                const required=[...list.children].reduce((sum,e)=>sum+e.scrollWidth+parseFloat(getComputedStyle(e).marginLeft||0)+parseFloat(getComputedStyle(e).marginRight||0),0);
                if(required>list.clientWidth+1)list.classList.add('ict-breadcrumb-compact');
            };
            new ResizeObserver(fit).observe(list);document.fonts?.ready.then(fit);fit();
        });
        const compare=document.querySelector('#compare-modal-js');
        if(compare){
            let trigger;
            const reopen=document.querySelector('.open-compare-modal');
            const positionReopen=()=>{
                if(!reopen||!combinedChat)return;
                const box=combinedChat.getBoundingClientRect();if(!box.width||!box.height)return;
                reopen.style.setProperty('--ict-compare-right',Math.max(12,innerWidth-box.left+10)+'px');
                reopen.style.setProperty('--ict-compare-bottom',Math.max(12,innerHeight-box.top-box.height/2-22)+'px');
            };
            const updateReopen=()=>{
                if(!reopen)return;
                const hasItems=compare.querySelectorAll('.compare-modal-product-item').length>0;
                reopen.hidden=!hasItems;reopen.classList.toggle('ict-compare-has-items',hasItems);
                if(hasItems)positionReopen();
            };
            new MutationObserver(updateReopen).observe(compare,{childList:true,subtree:true});updateReopen();
            if(combinedChat){new ResizeObserver(positionReopen).observe(combinedChat);new MutationObserver(positionReopen).observe(combinedChat,{attributes:true,attributeFilter:['class','style']});}
            window.addEventListener('resize',positionReopen);window.visualViewport?.addEventListener('resize',positionReopen);
            window.addEventListener('scroll',positionReopen,{passive:true});
            const dismiss=()=>{compare.style.display='none';compare.setAttribute('aria-hidden','true');try{sessionStorage.setItem('ict-compare-dismissed','1');}catch(_){}trigger?.focus({preventScroll:true});};
            document.addEventListener('click',event=>{
                if(event.target.closest('.compare-modal-close')){event.preventDefault();event.stopImmediatePropagation();dismiss();}
                else if(event.target.closest('.open-compare-modal,.js-add-to-compare-button')){trigger=event.target.closest('a,button');compare.removeAttribute('aria-hidden');try{sessionStorage.removeItem('ict-compare-dismissed');}catch(_){}}
            },true);
            document.addEventListener('keydown',event=>{if(event.key==='Escape'&&getComputedStyle(compare).display!=='none'&&!document.querySelector('#compare-modal-search.show')){event.preventDefault();dismiss();}});
            try{if(sessionStorage.getItem('ict-compare-dismissed'))dismiss();}catch(_){}
        }
    });
})();
