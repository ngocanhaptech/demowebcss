/* ─────────────────────────────────────────────────────────────────
   sectionBuilders.js
   Shared HTML builder functions used by Canvas.jsx (preview) and
   htmlExporter.js (export). All styles are 100% inline.
───────────────────────────────────────────────────────────────── */

/* ── helpers ─────────────────────────────────────────────────── */

function ph(src, alt, style) {
  if (src && src.trim()) {
    return `<img src="${src}" alt="${alt || ''}" style="${style};max-width:100%;" />`;
  }
  return `<div style="${style};display:flex;align-items:center;justify-content:center;background:#e2e8f0;color:#94a3b8;font-size:13px;font-family:system-ui,sans-serif;">📷 Image</div>`;
}

function stars(n) {
  const count = Math.max(0, Math.min(5, parseInt(n, 10) || 5));
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

function parseItems(val, fallback) {
  if (Array.isArray(val)) return val;
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : fallback; } catch (_) { return fallback; }
}

/* ── 01  top-bar-basic ───────────────────────────────────────── */
function buildTopBarHtml(s) {
  const nav = s['html-nav'] || '';
  return `<div style="background:#8B4513;color:#fff;padding:5px 24px;font-size:13px;display:flex;gap:20px;align-items:center;">${nav}</div>`;
}

/* ── 02  header-main ─────────────────────────────────────────── */
function buildHeaderHtml(s) {
  const title = s.title || 'Header';
  return (
    `<header style="padding:14px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;background:#fff;">` +
    `<div style="font-weight:700;font-size:20px;color:#8B4513;">Gốm Đất</div>` +
    `<div style="font-size:14px;color:#444;">${title}</div>` +
    `</header>`
  );
}

/* ── 03  hero-ceramic ────────────────────────────────────────── */
function buildHeroHtml(s) {
  const content = s['html-content'] || '';
  return (
    `<section style="padding:60px 24px;text-align:center;background:#FDF8F3;">` +
    `<h1 style="font-size:32px;margin:0 0 16px;color:#3d1f00;">Gốm Phù Lãng cho không gian hiện đại</h1>` +
    `<div style="font-size:15px;color:#555;">${content}</div>` +
    `</section>`
  );
}

/* ── 04  intro-studio ────────────────────────────────────────── */
function buildIntroHtml(s) {
  const main = s['html-main'] || '';
  return (
    `<section style="padding:40px 24px;max-width:800px;margin:0 auto;">` +
    `<h2 style="font-size:24px;margin:0 0 12px;color:#3d1f00;">Giới thiệu xưởng gốm</h2>` +
    `<p style="font-size:15px;color:#444;line-height:1.7;">${main}</p>` +
    `</section>`
  );
}

/* ── 05  features-3col ───────────────────────────────────────── */
function buildFeaturesHtml(s) {
  const contents = Array.isArray(s.contents) ? s.contents : [];
  const items = contents.map((item) =>
    `<div style="border:1px solid #e5d9ce;border-radius:10px;padding:20px;font-size:14px;background:#fff;">` +
    `<strong style="color:#3d1f00;">${item}</strong></div>`
  ).join('');
  return (
    `<section style="padding:40px 24px;background:#fdf8f3;">` +
    `<h2 style="font-size:22px;margin:0 0 20px;color:#3d1f00;text-align:center;">Tính năng nổi bật</h2>` +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;">${items}</div>` +
    `</section>`
  );
}

/* ── 06  cta-html-1 ──────────────────────────────────────────── */
function buildCtaHtml(s) {
  const link = s['cta-link'] || '#';
  const text = s['cta-text'] || 'Xem chi tiết';
  return (
    `<section style="padding:40px 24px;text-align:center;background:#F5E9DD;">` +
    `<a href="${link}" style="display:inline-block;padding:12px 28px;background:#8B4513;color:#fff;border-radius:999px;text-decoration:none;font-size:15px;font-weight:600;">${text}</a>` +
    `</section>`
  );
}

/* ── 07  contact-form ────────────────────────────────────────── */
function buildContactFormHtml(s) {
  const formTitle = s['form-title'] || 'Liên hệ';
  return (
    `<section style="padding:40px 24px;background:#FDF8F3;">` +
    `<h2 style="font-size:22px;margin:0 0 20px;text-align:center;color:#3d1f00;">${formTitle}</h2>` +
    `<form style="max-width:480px;margin:0 auto;display:grid;gap:12px;">` +
    `<input type="text" id="contact-name" name="name" placeholder="Họ và tên" style="padding:10px 12px;border-radius:6px;border:1px solid #ddd;font-size:14px;" />` +
    `<input type="tel" id="contact-phone" name="phone" placeholder="Số điện thoại" style="padding:10px 12px;border-radius:6px;border:1px solid #ddd;font-size:14px;" />` +
    `<textarea id="contact-message" name="message" placeholder="Nội dung" rows="4" style="padding:10px 12px;border-radius:6px;border:1px solid #ddd;font-size:14px;resize:vertical;"></textarea>` +
    `<button type="submit" style="padding:12px 20px;border-radius:6px;border:none;background:#8B4513;color:#fff;font-weight:700;font-size:14px;cursor:pointer;">Gửi</button>` +
    `</form></section>`
  );
}

/* ── 08  footer-basic ────────────────────────────────────────── */
function buildFooterHtml(s) {
  const text = s['footer-text'] || '© 2026. All rights reserved.';
  return `<footer style="padding:20px 24px;text-align:center;font-size:13px;color:#777;border-top:1px solid #eee;background:#fff;">${text}</footer>`;
}

/* ── 09  banner-overlay ──────────────────────────────────────── */
function buildBannerOverlayHtml(s) {
  const title    = s.title     || 'Welcome to Our Website';
  const subtitle = s.subtitle  || 'Discover amazing products and services tailored for you.';
  const btnText  = s['btn-text']  || 'Get Started';
  const btnLink  = s['btn-link']  || '#';
  const btn2Text = s['btn2-text'] || '';
  const btn2Link = s['btn2-link'] || '#';
  const bgColor  = s['bg-color']  || '#1e293b';
  const txtColor = s['text-color'] || '#ffffff';
  const btns = (
    `<a href="${btnLink}" style="display:inline-block;padding:14px 36px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;margin:6px;">${btnText}</a>` +
    (btn2Text ? `<a href="${btn2Link}" style="display:inline-block;padding:14px 36px;background:transparent;color:${txtColor};border:2px solid ${txtColor};border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;margin:6px;">${btn2Text}</a>` : '')
  );
  return (
    `<section style="padding:90px 40px;text-align:center;background:${bgColor};color:${txtColor};">` +
    `<h1 style="font-size:44px;font-weight:800;margin:0 0 18px;line-height:1.15;color:${txtColor};">${title}</h1>` +
    `<p style="font-size:18px;margin:0 0 36px;opacity:0.85;max-width:620px;margin-left:auto;margin-right:auto;line-height:1.6;color:${txtColor};">${subtitle}</p>` +
    `<div style="display:flex;flex-wrap:wrap;justify-content:center;">${btns}</div>` +
    `</section>`
  );
}

/* ── 10  banner-split ────────────────────────────────────────── */
function buildBannerSplitHtml(s) {
  const heading     = s.heading      || 'Powerful Features';
  const text        = s.text         || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.';
  const btnText     = s['btn-text']  || 'Learn More';
  const btnLink     = s['btn-link']  || '#';
  const accentColor = s['accent-color'] || '#3b82f6';
  const imgSrc      = s['img-src']   || '';
  const reverse     = s.reverse === 'true' || s.reverse === true;
  const leftPanel = (
    `<div style="flex:1;padding:60px 48px;display:flex;flex-direction:column;justify-content:center;min-width:300px;">` +
    `<h2 style="font-size:36px;font-weight:800;margin:0 0 18px;color:#1e293b;line-height:1.2;">${heading}</h2>` +
    `<p style="font-size:16px;color:#475569;line-height:1.75;margin:0 0 28px;">${text}</p>` +
    `<a href="${btnLink}" style="display:inline-block;padding:12px 28px;background:${accentColor};color:#fff;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600;align-self:flex-start;">${btnText}</a>` +
    `</div>`
  );
  const rightPanel = (
    `<div style="flex:1;min-width:260px;min-height:320px;overflow:hidden;">` +
    ph(imgSrc, heading, `width:100%;height:100%;min-height:320px;object-fit:cover;`) +
    `</div>`
  );
  return (
    `<section style="display:flex;flex-wrap:wrap;background:#fff;">` +
    (reverse ? rightPanel + leftPanel : leftPanel + rightPanel) +
    `</section>`
  );
}

/* ── 11  text-block ──────────────────────────────────────────── */
function buildTextBlockHtml(s) {
  const heading = s.heading || '';
  const content = s.content || 'Write your content here. Supports <strong>bold</strong>, <em>italic</em>, <a href="#">links</a>.';
  const align   = s.align   || 'left';
  const maxW    = s['max-width'] || '780px';
  return (
    `<section style="padding:48px 32px;background:#fff;">` +
    `<div style="max-width:${maxW};margin:0 auto;text-align:${align};">` +
    (heading ? `<h2 style="font-size:30px;font-weight:700;color:#1e293b;margin:0 0 18px;line-height:1.25;">${heading}</h2>` : '') +
    `<div style="font-size:16px;color:#475569;line-height:1.8;">${content}</div>` +
    `</div></section>`
  );
}

/* ── 12  title-divider ───────────────────────────────────────── */
function buildTitleDividerHtml(s) {
  const title    = s.title    || 'Section Title';
  const subtitle = s.subtitle || 'A short description for this section goes here.';
  const align    = s.align    || 'center';
  const lineColor = s['line-color'] || '#3b82f6';
  const lineW = align === 'center' ? '60px' : '60px';
  const marginLine = align === 'center' ? 'margin:12px auto 0;' : 'margin:12px 0 0;';
  return (
    `<section style="padding:52px 32px;background:#fff;text-align:${align};">` +
    `<h2 style="font-size:34px;font-weight:800;color:#1e293b;margin:0 0 12px;letter-spacing:-0.02em;">${title}</h2>` +
    `<div style="width:${lineW};height:4px;border-radius:2px;background:${lineColor};${marginLine}"></div>` +
    (subtitle ? `<p style="font-size:17px;color:#64748b;margin:16px 0 0;max-width:600px;${align === 'center' ? 'margin-left:auto;margin-right:auto;' : ''}line-height:1.65;">${subtitle}</p>` : '') +
    `</section>`
  );
}

/* ── 13  columns-2col ────────────────────────────────────────── */
function buildColumns2ColHtml(s) {
  const heading   = s.heading    || '';
  const c1title   = s['col1-title'] || 'Column One';
  const c1text    = s['col1-text']  || 'Content for the first column goes here.';
  const c2title   = s['col2-title'] || 'Column Two';
  const c2text    = s['col2-text']  || 'Content for the second column goes here.';
  const gap       = '32px';
  return (
    `<section style="padding:52px 32px;background:#fff;">` +
    (heading ? `<h2 style="font-size:28px;font-weight:700;color:#1e293b;margin:0 0 32px;text-align:center;">${heading}</h2>` : '') +
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:${gap};max-width:1100px;margin:0 auto;">` +
    `<div><h3 style="font-size:20px;font-weight:700;color:#1e293b;margin:0 0 10px;">${c1title}</h3><p style="font-size:15px;color:#475569;line-height:1.75;margin:0;">${c1text}</p></div>` +
    `<div><h3 style="font-size:20px;font-weight:700;color:#1e293b;margin:0 0 10px;">${c2title}</h3><p style="font-size:15px;color:#475569;line-height:1.75;margin:0;">${c2text}</p></div>` +
    `</div></section>`
  );
}

/* ── 14  columns-3col ────────────────────────────────────────── */
function buildColumns3ColHtml(s) {
  const heading = s.heading || '';
  const items = parseItems(s.items, [
    { title: 'Column One',   text: 'Description for the first column.' },
    { title: 'Column Two',   text: 'Description for the second column.' },
    { title: 'Column Three', text: 'Description for the third column.' },
  ]);
  const cols = items.map((it) =>
    `<div style="padding:24px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">` +
    `<h3 style="font-size:18px;font-weight:700;color:#1e293b;margin:0 0 8px;">${it.title || ''}</h3>` +
    `<p style="font-size:14px;color:#475569;line-height:1.7;margin:0;">${it.text || ''}</p>` +
    `</div>`
  ).join('');
  return (
    `<section style="padding:52px 32px;background:#f8fafc;">` +
    (heading ? `<h2 style="font-size:28px;font-weight:700;color:#1e293b;margin:0 0 28px;text-align:center;">${heading}</h2>` : '') +
    `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto;">${cols}</div>` +
    `</section>`
  );
}

/* ── 15  columns-4col ────────────────────────────────────────── */
function buildColumns4ColHtml(s) {
  const heading = s.heading || '';
  const items = parseItems(s.items, [
    { title: 'Col 1', text: 'Short description.' },
    { title: 'Col 2', text: 'Short description.' },
    { title: 'Col 3', text: 'Short description.' },
    { title: 'Col 4', text: 'Short description.' },
  ]);
  const cols = items.map((it) =>
    `<div style="padding:20px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;">` +
    `<h3 style="font-size:16px;font-weight:700;color:#1e293b;margin:0 0 6px;">${it.title || ''}</h3>` +
    `<p style="font-size:13px;color:#475569;line-height:1.65;margin:0;">${it.text || ''}</p>` +
    `</div>`
  ).join('');
  return (
    `<section style="padding:52px 32px;background:#fff;">` +
    (heading ? `<h2 style="font-size:28px;font-weight:700;color:#1e293b;margin:0 0 28px;text-align:center;">${heading}</h2>` : '') +
    `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:1200px;margin:0 auto;">${cols}</div>` +
    `</section>`
  );
}

/* ── 16  image-single ────────────────────────────────────────── */
function buildImageSingleHtml(s) {
  const src     = s.src     || '';
  const alt     = s.alt     || 'Image';
  const caption = s.caption || '';
  const maxW    = s['max-width'] || '800px';
  const align   = s.align   || 'center';
  return (
    `<section style="padding:40px 32px;background:#fff;text-align:${align};">` +
    `<figure style="display:inline-block;max-width:${maxW};width:100%;margin:0 auto;">` +
    ph(src, alt, `width:100%;border-radius:8px;`) +
    (caption ? `<figcaption style="font-size:13px;color:#94a3b8;margin-top:10px;font-style:italic;">${caption}</figcaption>` : '') +
    `</figure></section>`
  );
}

/* ── 17  image-box ───────────────────────────────────────────── */
function buildImageBoxHtml(s) {
  const title = s.title || '';
  const items = parseItems(s.items, [
    { src: '', heading: 'Feature One',   text: 'Short description here.' },
    { src: '', heading: 'Feature Two',   text: 'Short description here.' },
    { src: '', heading: 'Feature Three', text: 'Short description here.' },
  ]);
  const cards = items.map((it) =>
    `<div style="border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 1px 8px rgba(0,0,0,.07);">` +
    ph(it.src || '', it.heading || '', `width:100%;height:180px;object-fit:cover;`) +
    `<div style="padding:16px;">` +
    `<h3 style="font-size:17px;font-weight:700;color:#1e293b;margin:0 0 6px;">${it.heading || ''}</h3>` +
    `<p style="font-size:14px;color:#475569;line-height:1.65;margin:0;">${it.text || ''}</p>` +
    (it.link ? `<a href="${it.link}" style="display:inline-block;margin-top:10px;font-size:13px;font-weight:600;color:#3b82f6;text-decoration:none;">Read more →</a>` : '') +
    `</div></div>`
  ).join('');
  return (
    `<section style="padding:52px 32px;background:#f8fafc;">` +
    (title ? `<h2 style="font-size:28px;font-weight:700;color:#1e293b;margin:0 0 28px;text-align:center;">${title}</h2>` : '') +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;max-width:1100px;margin:0 auto;">${cards}</div>` +
    `</section>`
  );
}

/* ── 18  gallery-grid ────────────────────────────────────────── */
function buildGalleryGridHtml(s) {
  const title = s.title || '';
  const cols  = parseInt(s.cols, 10) || 3;
  const items = parseItems(s.items, [
    { src: '', caption: 'Photo 1' },
    { src: '', caption: 'Photo 2' },
    { src: '', caption: 'Photo 3' },
    { src: '', caption: 'Photo 4' },
    { src: '', caption: 'Photo 5' },
    { src: '', caption: 'Photo 6' },
  ]);
  const cellSize = cols === 4 ? '160px' : '200px';
  const grid = items.map((it) =>
    `<div style="border-radius:8px;overflow:hidden;background:#e2e8f0;">` +
    ph(it.src || '', it.caption || '', `width:100%;height:${cellSize};object-fit:cover;`) +
    (it.caption ? `<div style="padding:6px 10px;font-size:12px;color:#475569;background:#fff;">${it.caption}</div>` : '') +
    `</div>`
  ).join('');
  return (
    `<section style="padding:52px 32px;background:#fff;">` +
    (title ? `<h2 style="font-size:28px;font-weight:700;color:#1e293b;margin:0 0 24px;text-align:center;">${title}</h2>` : '') +
    `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:16px;max-width:1200px;margin:0 auto;">${grid}</div>` +
    `</section>`
  );
}

/* ── 19  video-embed ─────────────────────────────────────────── */
function buildVideoEmbedHtml(s) {
  const title      = s.title       || '';
  const embedUrl   = s['embed-url'] || '';
  const caption    = s.caption     || '';
  const aspectW    = 16;
  const aspectH    = 9;
  const pt         = ((aspectH / aspectW) * 100).toFixed(4) + '%';
  const inner = embedUrl
    ? `<iframe src="${embedUrl}" title="${title || 'video'}" allow="autoplay;fullscreen" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"></iframe>`
    : `<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#1e293b;color:#94a3b8;gap:12px;font-family:system-ui,sans-serif;">` +
      `<div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:24px;">▶</div>` +
      `<span style="font-size:13px;">Paste YouTube / Vimeo embed URL in props</span></div>`;
  return (
    `<section style="padding:52px 32px;background:#fff;">` +
    (title ? `<h2 style="font-size:28px;font-weight:700;color:#1e293b;margin:0 0 24px;text-align:center;">${title}</h2>` : '') +
    `<div style="max-width:880px;margin:0 auto;">` +
    `<div style="position:relative;width:100%;padding-top:${pt};border-radius:12px;overflow:hidden;background:#000;">${inner}</div>` +
    (caption ? `<p style="font-size:13px;color:#94a3b8;text-align:center;margin:10px 0 0;">${caption}</p>` : '') +
    `</div></section>`
  );
}

/* ── 20  icon-box-grid ───────────────────────────────────────── */
function buildIconBoxGridHtml(s) {
  const title = s.title || '';
  const items = parseItems(s.items, [
    { icon: '⚡', heading: 'Fast Performance', text: 'Optimized for speed and efficiency.' },
    { icon: '🛡️', heading: 'Secure & Reliable', text: 'Built with security in mind.' },
    { icon: '🎯', heading: 'Easy to Use',       text: 'Intuitive interface for everyone.' },
    { icon: '📊', heading: 'Analytics',         text: 'Insights to grow your business.' },
    { icon: '🌐', heading: 'Global Reach',      text: 'Serve customers worldwide.' },
    { icon: '💬', heading: '24/7 Support',      text: 'Always here when you need us.' },
  ]);
  const cards = items.map((it) =>
    `<div style="padding:28px 20px;text-align:center;border:1px solid #e2e8f0;border-radius:12px;background:#fff;transition:box-shadow .2s;">` +
    `<div style="font-size:36px;margin-bottom:14px;line-height:1;">${it.icon || '●'}</div>` +
    `<h3 style="font-size:17px;font-weight:700;color:#1e293b;margin:0 0 8px;">${it.heading || ''}</h3>` +
    `<p style="font-size:14px;color:#475569;line-height:1.65;margin:0;">${it.text || ''}</p>` +
    `</div>`
  ).join('');
  return (
    `<section style="padding:60px 32px;background:#f8fafc;">` +
    (title ? `<h2 style="font-size:32px;font-weight:800;color:#1e293b;margin:0 0 36px;text-align:center;">${title}</h2>` : '') +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;max-width:1200px;margin:0 auto;">${cards}</div>` +
    `</section>`
  );
}

/* ── 21  tabs-section ────────────────────────────────────────── */
function buildTabsSectionHtml(s) {
  const title = s.title || '';
  const tabs = parseItems(s.tabs, [
    { label: 'Overview',  content: 'Overview content goes here. Add your text, lists, or HTML.' },
    { label: 'Features',  content: 'Features content goes here.' },
    { label: 'Pricing',   content: 'Pricing details go here.' },
  ]);
  const btnActive   = `padding:12px 22px;border:none;border-bottom:3px solid #3b82f6;background:#fff;cursor:pointer;font-size:14px;font-weight:600;color:#3b82f6;white-space:nowrap;`;
  const btnInactive = `padding:12px 22px;border:none;border-bottom:3px solid transparent;background:transparent;cursor:pointer;font-size:14px;font-weight:400;color:#64748b;white-space:nowrap;`;
  const buttons = tabs.map((tab, i) => {
    const onclick =
      `var g=this.closest('[data-tabgroup]');` +
      `g.querySelectorAll('[data-tabbtn]').forEach(function(b,j){` +
      `b.style.borderBottomColor=j===${i}?'#3b82f6':'transparent';` +
      `b.style.color=j===${i}?'#3b82f6':'#64748b';` +
      `b.style.fontWeight=j===${i}?'600':'400';` +
      `});` +
      `g.querySelectorAll('[data-tabpanel]').forEach(function(p,j){p.style.display=j===${i}?'block':'none';});`;
    return `<button onclick="${onclick}" data-tabbtn style="${i === 0 ? btnActive : btnInactive}">${tab.label}</button>`;
  }).join('');
  const panels = tabs.map((tab, i) =>
    `<div data-tabpanel style="display:${i === 0 ? 'block' : 'none'};padding:28px 24px;font-size:15px;color:#475569;line-height:1.75;">${tab.content}</div>`
  ).join('');
  return (
    `<section style="padding:52px 32px;background:#fff;" data-tabgroup>` +
    (title ? `<h2 style="font-size:28px;font-weight:700;color:#1e293b;margin:0 0 24px;text-align:center;">${title}</h2>` : '') +
    `<div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;max-width:1100px;margin:0 auto;">` +
    `<div style="display:flex;flex-wrap:wrap;background:#f8fafc;border-bottom:1px solid #e2e8f0;overflow-x:auto;">${buttons}</div>` +
    `<div>${panels}</div>` +
    `</div></section>`
  );
}

/* ── 22  accordion-faq ───────────────────────────────────────── */
function buildAccordionFaqHtml(s) {
  const title = s.title || 'Frequently Asked Questions';
  const items = parseItems(s.items, [
    { question: 'What is this product?',         answer: 'This is a flexible, easy-to-use solution for your needs.' },
    { question: 'How do I get started?',         answer: 'Sign up for an account and follow the onboarding guide.' },
    { question: 'Is there a free trial?',        answer: 'Yes, we offer a 14-day free trial with no credit card required.' },
    { question: 'Can I cancel at any time?',     answer: 'Absolutely. You can cancel your subscription at any time.' },
  ]);
  const rows = items.map((it) =>
    `<details style="border-top:1px solid #e2e8f0;">` +
    `<summary style="padding:18px 20px;cursor:pointer;font-size:16px;font-weight:600;color:#1e293b;list-style:none;display:flex;justify-content:space-between;align-items:center;">` +
    `${it.question || ''}` +
    `<span style="font-size:20px;color:#94a3b8;transition:transform .2s;">＋</span>` +
    `</summary>` +
    `<div style="padding:4px 20px 18px;font-size:15px;color:#475569;line-height:1.75;">${it.answer || ''}</div>` +
    `</details>`
  ).join('');
  return (
    `<section style="padding:52px 32px;background:#fff;">` +
    `<h2 style="font-size:30px;font-weight:800;color:#1e293b;margin:0 0 32px;text-align:center;">${title}</h2>` +
    `<div style="max-width:780px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">${rows}</div>` +
    `</section>`
  );
}

/* ── 23  testimonials-grid ───────────────────────────────────── */
function buildTestimonialsGridHtml(s) {
  const title = s.title || 'What Our Customers Say';
  const items = parseItems(s.items, [
    { quote: 'This product changed our workflow completely. Highly recommend it to any team.', name: 'Alice Johnson', role: 'CEO at Acme Corp', stars: 5 },
    { quote: 'Incredible support and a beautiful product. Best investment we made this year.', name: 'Bob Smith',      role: 'CTO at TechStart',  stars: 5 },
    { quote: 'Simple, powerful and reliable. We scaled from 0 to 10k users without a hitch.', name: 'Carol White',    role: 'Founder, NovaCo',   stars: 5 },
  ]);
  const cards = items.map((it) => {
    const initials = (it.name || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const hue = ((it.name || '').charCodeAt(0) * 47) % 360;
    return (
      `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;display:flex;flex-direction:column;gap:16px;">` +
      `<div style="color:#f59e0b;font-size:18px;letter-spacing:2px;">${stars(it.stars)}</div>` +
      `<p style="font-size:15px;color:#475569;line-height:1.75;margin:0;font-style:italic;">"${it.quote || ''}"</p>` +
      `<div style="display:flex;align-items:center;gap:12px;margin-top:auto;">` +
      `<div style="width:40px;height:40px;border-radius:50%;background:hsl(${hue},60%,55%);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0;">${initials}</div>` +
      `<div><div style="font-size:14px;font-weight:700;color:#1e293b;">${it.name || ''}</div><div style="font-size:12px;color:#94a3b8;">${it.role || ''}</div></div>` +
      `</div></div>`
    );
  }).join('');
  return (
    `<section style="padding:60px 32px;background:#f8fafc;">` +
    `<h2 style="font-size:32px;font-weight:800;color:#1e293b;margin:0 0 36px;text-align:center;">${title}</h2>` +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;max-width:1100px;margin:0 auto;">${cards}</div>` +
    `</section>`
  );
}

/* ── 24  team-members ────────────────────────────────────────── */
function buildTeamMembersHtml(s) {
  const title = s.title || 'Meet the Team';
  const items = parseItems(s.items, [
    { name: 'Alice Johnson', role: 'CEO & Co-Founder',  bio: 'Visionary leader with 15 years in product strategy.' },
    { name: 'Bob Smith',     role: 'Head of Design',    bio: 'Award-winning designer crafting delightful experiences.' },
    { name: 'Carol White',   role: 'Lead Engineer',     bio: 'Full-stack expert who loves clean, scalable code.' },
    { name: 'David Lee',     role: 'Marketing Director',bio: 'Growth hacker with a passion for data-driven campaigns.' },
  ]);
  const cards = items.map((it) => {
    const initials = (it.name || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const hue = ((it.name || '').charCodeAt(0) * 53) % 360;
    return (
      `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:28px 20px;text-align:center;">` +
      ph(it.photo || '', it.name, `width:80px;height:80px;border-radius:50%;object-fit:cover;margin:0 auto 14px;`) +
      (!it.photo ? `<div style="width:80px;height:80px;border-radius:50%;background:hsl(${hue},60%,55%);display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:700;margin:0 auto 14px;">${initials}</div>` : '') +
      `<h3 style="font-size:17px;font-weight:700;color:#1e293b;margin:0 0 4px;">${it.name || ''}</h3>` +
      `<div style="font-size:13px;font-weight:600;color:#3b82f6;margin-bottom:10px;">${it.role || ''}</div>` +
      `<p style="font-size:13px;color:#64748b;line-height:1.6;margin:0;">${it.bio || ''}</p>` +
      `</div>`
    );
  }).join('');
  return (
    `<section style="padding:60px 32px;background:#f8fafc;">` +
    `<h2 style="font-size:32px;font-weight:800;color:#1e293b;margin:0 0 36px;text-align:center;">${title}</h2>` +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;max-width:1100px;margin:0 auto;">${cards}</div>` +
    `</section>`
  );
}

/* ── 25  pricing-table ───────────────────────────────────────── */
function buildPricingTableHtml(s) {
  const title   = s.title   || 'Simple, Transparent Pricing';
  const subtitle = s.subtitle || 'Choose the plan that works for you.';
  const items = parseItems(s.items, [
    { name: 'Starter',  price: '0',  period: 'mo',  features: ['5 projects','1 GB storage','Email support'], 'btn-text': 'Get started', featured: false },
    { name: 'Pro',      price: '29', period: 'mo',  features: ['Unlimited projects','50 GB storage','Priority support','Custom domain'], 'btn-text': 'Get Pro', featured: true },
    { name: 'Business', price: '79', period: 'mo',  features: ['Everything in Pro','500 GB storage','SLA guarantee','Dedicated manager'], 'btn-text': 'Contact us', featured: false },
  ]);
  const cards = items.map((it) => {
    const feat = it.featured;
    const featureList = Array.isArray(it.features) ? it.features : [];
    const featureItems = featureList.map((f) =>
      `<li style="padding:6px 0;font-size:14px;color:${feat ? 'rgba(255,255,255,.85)' : '#475569'};display:flex;align-items:center;gap:8px;">` +
      `<span style="color:${feat ? '#93c5fd' : '#22c55e'};font-size:16px;">✓</span>${f}` +
      `</li>`
    ).join('');
    return (
      `<div style="border-radius:16px;padding:36px 28px;text-align:center;background:${feat ? '#1e40af' : '#fff'};border:${feat ? 'none' : '1px solid #e2e8f0'};box-shadow:${feat ? '0 20px 60px rgba(30,64,175,.35)' : '0 1px 6px rgba(0,0,0,.06)'};position:relative;">` +
      (feat ? `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#f59e0b;color:#fff;font-size:11px;font-weight:700;padding:4px 14px;border-radius:999px;letter-spacing:.05em;">MOST POPULAR</div>` : '') +
      `<h3 style="font-size:20px;font-weight:700;color:${feat ? '#fff' : '#1e293b'};margin:0 0 16px;">${it.name || ''}</h3>` +
      `<div style="margin-bottom:24px;"><span style="font-size:44px;font-weight:800;color:${feat ? '#fff' : '#1e293b'};">$${it.price || '0'}</span><span style="font-size:15px;color:${feat ? 'rgba(255,255,255,.6)' : '#94a3b8'};">/${it.period || 'mo'}</span></div>` +
      `<ul style="list-style:none;margin:0 0 28px;padding:0;text-align:left;border-top:1px solid ${feat ? 'rgba(255,255,255,.15)' : '#f1f5f9'};padding-top:18px;">${featureItems}</ul>` +
      `<a href="#" style="display:block;padding:13px 24px;background:${feat ? '#3b82f6' : '#1e293b'};color:#fff;border-radius:8px;text-decoration:none;font-size:15px;font-weight:700;">${it['btn-text'] || 'Get started'}</a>` +
      `</div>`
    );
  }).join('');
  return (
    `<section style="padding:70px 32px;background:#f8fafc;">` +
    `<h2 style="font-size:34px;font-weight:800;color:#1e293b;margin:0 0 12px;text-align:center;">${title}</h2>` +
    `<p style="font-size:17px;color:#64748b;text-align:center;margin:0 0 48px;">${subtitle}</p>` +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;max-width:1000px;margin:0 auto;align-items:start;">${cards}</div>` +
    `</section>`
  );
}

/* ── 26  blog-posts-grid ─────────────────────────────────────── */
function buildBlogPostsGridHtml(s) {
  const title = s.title || 'Latest Articles';
  const items = parseItems(s.items, [
    { title: 'Getting Started with Modern Design',      date: 'Jan 10, 2026', category: 'Design',      excerpt: 'A beginner\'s guide to design principles and tools.' },
    { title: 'How to Build Scalable Web Applications',  date: 'Jan 18, 2026', category: 'Development', excerpt: 'Best practices for building apps that grow.' },
    { title: 'Growing Your Business with Content',      date: 'Feb 2, 2026',  category: 'Marketing',   excerpt: 'Strategies to attract and retain customers.' },
  ]);
  const cards = items.map((it) => {
    const catColors = { Design: '#8b5cf6', Development: '#3b82f6', Marketing: '#f59e0b', default: '#64748b' };
    const catColor  = catColors[it.category] || catColors.default;
    return (
      `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">` +
      ph(it.img || '', it.title, `width:100%;height:180px;object-fit:cover;`) +
      `<div style="padding:20px;">` +
      `<span style="font-size:11px;font-weight:700;color:${catColor};text-transform:uppercase;letter-spacing:.08em;">${it.category || 'General'}</span>` +
      `<h3 style="font-size:17px;font-weight:700;color:#1e293b;margin:8px 0 8px;line-height:1.35;">${it.title || ''}</h3>` +
      `<p style="font-size:14px;color:#64748b;line-height:1.65;margin:0 0 14px;">${it.excerpt || ''}</p>` +
      `<div style="display:flex;align-items:center;justify-content:space-between;">` +
      `<span style="font-size:12px;color:#94a3b8;">${it.date || ''}</span>` +
      `<a href="${it.link || '#'}" style="font-size:13px;font-weight:600;color:#3b82f6;text-decoration:none;">Read more →</a>` +
      `</div></div></div>`
    );
  }).join('');
  return (
    `<section style="padding:60px 32px;background:#f8fafc;">` +
    `<h2 style="font-size:32px;font-weight:800;color:#1e293b;margin:0 0 36px;text-align:center;">${title}</h2>` +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;max-width:1100px;margin:0 auto;">${cards}</div>` +
    `</section>`
  );
}

/* ── 27  cta-full-banner ─────────────────────────────────────── */
function buildCtaFullBannerHtml(s) {
  const heading   = s.heading      || 'Ready to Get Started?';
  const subtext   = s.subtext      || 'Join thousands of happy customers. No credit card required.';
  const btnText   = s['btn-text']  || 'Start Free Trial';
  const btnLink   = s['btn-link']  || '#';
  const btn2Text  = s['btn2-text'] || 'Learn More';
  const btn2Link  = s['btn2-link'] || '#';
  const bgColor   = s['bg-color']  || '#1e40af';
  const txtColor  = s['text-color']|| '#ffffff';
  return (
    `<section style="padding:80px 40px;text-align:center;background:${bgColor};color:${txtColor};">` +
    `<h2 style="font-size:38px;font-weight:800;margin:0 0 16px;line-height:1.15;color:${txtColor};">${heading}</h2>` +
    `<p style="font-size:18px;margin:0 0 36px;opacity:0.85;max-width:560px;margin-left:auto;margin-right:auto;color:${txtColor};">${subtext}</p>` +
    `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;">` +
    `<a href="${btnLink}" style="padding:15px 40px;background:#fff;color:${bgColor};border-radius:8px;text-decoration:none;font-size:16px;font-weight:700;">${btnText}</a>` +
    (btn2Text ? `<a href="${btn2Link}" style="padding:15px 40px;background:transparent;color:${txtColor};border:2px solid rgba(255,255,255,.6);border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">${btn2Text}</a>` : '') +
    `</div></section>`
  );
}

/* ── 28  buttons-row ─────────────────────────────────────────── */
function buildButtonsRowHtml(s) {
  const title  = s.title  || 'Button Styles';
  const align  = s.align  || 'center';
  const items  = parseItems(s.items, [
    { text: 'Primary',   link: '#', style: 'primary'   },
    { text: 'Secondary', link: '#', style: 'secondary' },
    { text: 'Outline',   link: '#', style: 'outline'   },
    { text: 'Ghost',     link: '#', style: 'ghost'     },
    { text: 'Danger',    link: '#', style: 'danger'    },
  ]);
  const styleMap = {
    primary:   `background:#3b82f6;color:#fff;border:2px solid #3b82f6;`,
    secondary: `background:#6b7280;color:#fff;border:2px solid #6b7280;`,
    outline:   `background:transparent;color:#3b82f6;border:2px solid #3b82f6;`,
    ghost:     `background:transparent;color:#475569;border:2px solid transparent;`,
    danger:    `background:#ef4444;color:#fff;border:2px solid #ef4444;`,
    success:   `background:#22c55e;color:#fff;border:2px solid #22c55e;`,
    warning:   `background:#f59e0b;color:#fff;border:2px solid #f59e0b;`,
    dark:      `background:#1e293b;color:#fff;border:2px solid #1e293b;`,
  };
  const btns = items.map((it) => {
    const sty = styleMap[it.style] || styleMap.primary;
    return `<a href="${it.link || '#'}" style="display:inline-block;padding:11px 26px;border-radius:7px;text-decoration:none;font-size:15px;font-weight:600;${sty}cursor:pointer;">${it.text || 'Button'}</a>`;
  }).join('');
  return (
    `<section style="padding:48px 32px;background:#fff;text-align:${align};">` +
    (title ? `<h2 style="font-size:22px;font-weight:700;color:#1e293b;margin:0 0 24px;">${title}</h2>` : '') +
    `<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:${align};">${btns}</div>` +
    `</section>`
  );
}

/* ── 29  newsletter-form ─────────────────────────────────────── */
function buildNewsletterFormHtml(s) {
  const heading     = s.heading     || 'Stay in the Loop';
  const subtext     = s.subtext     || 'Get the latest news, updates and tips delivered straight to your inbox.';
  const placeholder = s.placeholder || 'Enter your email address';
  const btnText     = s['btn-text'] || 'Subscribe';
  const bgColor     = s['bg-color'] || '#f8fafc';
  return (
    `<section style="padding:64px 32px;background:${bgColor};text-align:center;">` +
    `<h2 style="font-size:30px;font-weight:800;color:#1e293b;margin:0 0 12px;">${heading}</h2>` +
    `<p style="font-size:16px;color:#64748b;margin:0 0 28px;max-width:480px;margin-left:auto;margin-right:auto;">${subtext}</p>` +
    `<form style="display:flex;max-width:480px;margin:0 auto;gap:0;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">` +
    `<input type="email" name="email" placeholder="${placeholder}" style="flex:1;padding:14px 16px;border:1px solid #e2e8f0;border-right:none;border-radius:8px 0 0 8px;font-size:15px;outline:none;" />` +
    `<button type="submit" style="padding:14px 24px;background:#3b82f6;color:#fff;border:none;border-radius:0 8px 8px 0;font-size:15px;font-weight:700;cursor:pointer;white-space:nowrap;">${btnText}</button>` +
    `</form>` +
    `<p style="font-size:12px;color:#94a3b8;margin:12px 0 0;">No spam. Unsubscribe at any time.</p>` +
    `</section>`
  );
}

/* ── 30  stats-counter ───────────────────────────────────────── */
function buildStatsCounterHtml(s) {
  const title = s.title || '';
  const bgColor = s['bg-color'] || '#1e293b';
  const txtColor = s['text-color'] || '#ffffff';
  const items = parseItems(s.items, [
    { number: '10K+',  label: 'Happy Customers' },
    { number: '98%',   label: 'Satisfaction Rate' },
    { number: '500+',  label: 'Projects Delivered' },
    { number: '24/7',  label: 'Support Available' },
  ]);
  const stats = items.map((it) =>
    `<div style="text-align:center;padding:20px;">` +
    `<div style="font-size:48px;font-weight:900;color:${txtColor};line-height:1;margin-bottom:8px;">${it.number || '0'}</div>` +
    `<div style="font-size:15px;color:rgba(255,255,255,.65);font-weight:500;">${it.label || ''}</div>` +
    `</div>`
  ).join('');
  return (
    `<section style="padding:60px 32px;background:${bgColor};">` +
    (title ? `<h2 style="font-size:28px;font-weight:700;color:${txtColor};margin:0 0 32px;text-align:center;">${title}</h2>` : '') +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;max-width:1000px;margin:0 auto;">${stats}</div>` +
    `</section>`
  );
}

/* ── 31  divider-section ─────────────────────────────────────── */
function buildDividerSectionHtml(s) {
  const style  = s.style || 'line';
  const text   = s.text  || '';
  const color  = s.color || '#e2e8f0';
  const padding = 'padding:20px 32px;';
  if (style === 'dots') {
    return (
      `<div style="${padding}text-align:center;">` +
      `<span style="color:${color};font-size:20px;letter-spacing:12px;">• • •</span>` +
      `</div>`
    );
  }
  if (style === 'double') {
    return (
      `<div style="${padding}">` +
      `<div style="border-top:1px solid ${color};border-bottom:1px solid ${color};height:4px;"></div>` +
      `</div>`
    );
  }
  if (style === 'with-text' && text) {
    return (
      `<div style="${padding}display:flex;align-items:center;gap:16px;">` +
      `<div style="flex:1;height:1px;background:${color};"></div>` +
      `<span style="font-size:13px;font-weight:600;color:#94a3b8;white-space:nowrap;text-transform:uppercase;letter-spacing:.1em;">${text}</span>` +
      `<div style="flex:1;height:1px;background:${color};"></div>` +
      `</div>`
    );
  }
  return `<div style="${padding}"><hr style="border:none;border-top:1px solid ${color};margin:0;" /></div>`;
}

/* ── 32  message-box ─────────────────────────────────────────── */
function buildMessageBoxHtml(s) {
  const type    = s.type    || 'info';
  const title   = s.title   || '';
  const message = s.message || 'This is a notification message.';
  const configs = {
    info:    { bg: '#eff6ff', border: '#93c5fd', icon: 'ℹ️', titleColor: '#1d4ed8', textColor: '#1e40af' },
    success: { bg: '#f0fdf4', border: '#86efac', icon: '✅', titleColor: '#15803d', textColor: '#166534' },
    warning: { bg: '#fffbeb', border: '#fcd34d', icon: '⚠️', titleColor: '#b45309', textColor: '#92400e' },
    error:   { bg: '#fef2f2', border: '#fca5a5', icon: '❌', titleColor: '#dc2626', textColor: '#991b1b' },
  };
  const cfg = configs[type] || configs.info;
  return (
    `<section style="padding:20px 32px;">` +
    `<div style="max-width:860px;margin:0 auto;padding:16px 20px;background:${cfg.bg};border:1px solid ${cfg.border};border-left:4px solid ${cfg.border};border-radius:8px;display:flex;gap:12px;align-items:flex-start;">` +
    `<span style="font-size:18px;flex-shrink:0;margin-top:1px;">${cfg.icon}</span>` +
    `<div>` +
    (title ? `<div style="font-size:15px;font-weight:700;color:${cfg.titleColor};margin-bottom:4px;">${title}</div>` : '') +
    `<div style="font-size:14px;color:${cfg.textColor};line-height:1.6;">${message}</div>` +
    `</div></div></section>`
  );
}

/* ── 33  social-links ────────────────────────────────────────── */
function buildSocialLinksHtml(s) {
  const title = s.title || 'Follow Us';
  const align = s.align || 'center';
  const items = parseItems(s.items, [
    { platform: 'Facebook',  url: '#', color: '#1877f2' },
    { platform: 'Twitter',   url: '#', color: '#1da1f2' },
    { platform: 'Instagram', url: '#', color: '#e1306c' },
    { platform: 'YouTube',   url: '#', color: '#ff0000' },
    { platform: 'LinkedIn',  url: '#', color: '#0a66c2' },
  ]);
  const icons = {
    Facebook: 'f', Twitter: 't', Instagram: '📷', YouTube: '▶', LinkedIn: 'in',
    GitHub: '⌨', TikTok: '♪', Pinterest: 'p',
  };
  const btns = items.map((it) => {
    const icon = icons[it.platform] || it.platform.slice(0, 2);
    return (
      `<a href="${it.url || '#'}" title="${it.platform}" style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:${it.color || '#64748b'};color:#fff;text-decoration:none;font-size:14px;font-weight:700;">${icon}</a>`
    );
  }).join('');
  return (
    `<section style="padding:40px 32px;background:#fff;text-align:${align};">` +
    (title ? `<p style="font-size:15px;font-weight:600;color:#64748b;margin:0 0 16px;text-transform:uppercase;letter-spacing:.08em;">${title}</p>` : '') +
    `<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:${align};">${btns}</div>` +
    `</section>`
  );
}

/* ── 34  logo-grid ───────────────────────────────────────────── */
function buildLogoGridHtml(s) {
  const title = s.title || 'Trusted by Leading Brands';
  const items = parseItems(s.items, [
    { name: 'Acme Corp' }, { name: 'Globex' }, { name: 'Initech' },
    { name: 'Umbrella' },  { name: 'Dunder M' }, { name: 'Pied Piper' },
  ]);
  const logos = items.map((it) => {
    const initials = (it.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase();
    const logo = it.src
      ? `<img src="${it.src}" alt="${it.name}" style="max-width:120px;max-height:40px;object-fit:contain;filter:grayscale(1);opacity:.6;" />`
      : `<span style="font-size:15px;font-weight:800;color:#94a3b8;letter-spacing:.05em;">${it.name || initials}</span>`;
    return `<div style="padding:20px;display:flex;align-items:center;justify-content:center;border:1px solid #f1f5f9;border-radius:8px;">${logo}</div>`;
  }).join('');
  return (
    `<section style="padding:52px 32px;background:#fff;">` +
    (title ? `<p style="font-size:14px;font-weight:600;color:#94a3b8;text-align:center;text-transform:uppercase;letter-spacing:.1em;margin:0 0 28px;">${title}</p>` : '') +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0;max-width:1000px;margin:0 auto;">${logos}</div>` +
    `</section>`
  );
}

/* ── 35  portfolio-grid ──────────────────────────────────────── */
function buildPortfolioGridHtml(s) {
  const title  = s.title  || 'Our Work';
  const cols   = parseInt(s.cols, 10) || 3;
  const items  = parseItems(s.items, [
    { title: 'Brand Identity', category: 'Design',      color: '#8b5cf6', src: '' },
    { title: 'E-commerce App', category: 'Development', color: '#3b82f6', src: '' },
    { title: 'SEO Campaign',   category: 'Marketing',   color: '#f59e0b', src: '' },
    { title: 'Mobile App',     category: 'Development', color: '#10b981', src: '' },
    { title: 'Logo Design',    category: 'Design',      color: '#ec4899', src: '' },
    { title: 'Content Strategy',category:'Marketing',   color: '#f97316', src: '' },
  ]);
  const cards = items.map((it) => {
    const bgStyle = it.src
      ? `background:url('${it.src}') center/cover;`
      : `background:${it.color || '#3b82f6'};`;
    return (
      `<div style="${bgStyle}border-radius:10px;overflow:hidden;position:relative;height:200px;">` +
      `<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 60%);">` +
      `<span style="font-size:11px;font-weight:700;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">${it.category || ''}</span>` +
      `<span style="font-size:16px;font-weight:700;color:#fff;">${it.title || ''}</span>` +
      `</div></div>`
    );
  }).join('');
  return (
    `<section style="padding:60px 32px;background:#fff;">` +
    `<h2 style="font-size:32px;font-weight:800;color:#1e293b;margin:0 0 36px;text-align:center;">${title}</h2>` +
    `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:16px;max-width:1200px;margin:0 auto;">${cards}</div>` +
    `</section>`
  );
}

/* ── main switch ─────────────────────────────────────────────── */
export function buildSectionHtml(section) {
  switch (section.name) {
    case 'top-bar-basic':    return buildTopBarHtml(section);
    case 'header-main':      return buildHeaderHtml(section);
    case 'hero-ceramic':     return buildHeroHtml(section);
    case 'intro-studio':     return buildIntroHtml(section);
    case 'features-3col':    return buildFeaturesHtml(section);
    case 'cta-html-1':       return buildCtaHtml(section);
    case 'contact-form':     return buildContactFormHtml(section);
    case 'footer-basic':     return buildFooterHtml(section);
    case 'banner-overlay':   return buildBannerOverlayHtml(section);
    case 'banner-split':     return buildBannerSplitHtml(section);
    case 'text-block':       return buildTextBlockHtml(section);
    case 'title-divider':    return buildTitleDividerHtml(section);
    case 'columns-2col':     return buildColumns2ColHtml(section);
    case 'columns-3col':     return buildColumns3ColHtml(section);
    case 'columns-4col':     return buildColumns4ColHtml(section);
    case 'image-single':     return buildImageSingleHtml(section);
    case 'image-box':        return buildImageBoxHtml(section);
    case 'gallery-grid':     return buildGalleryGridHtml(section);
    case 'video-embed':      return buildVideoEmbedHtml(section);
    case 'icon-box-grid':    return buildIconBoxGridHtml(section);
    case 'tabs-section':     return buildTabsSectionHtml(section);
    case 'accordion-faq':    return buildAccordionFaqHtml(section);
    case 'testimonials-grid':return buildTestimonialsGridHtml(section);
    case 'team-members':     return buildTeamMembersHtml(section);
    case 'pricing-table':    return buildPricingTableHtml(section);
    case 'blog-posts-grid':  return buildBlogPostsGridHtml(section);
    case 'cta-full-banner':  return buildCtaFullBannerHtml(section);
    case 'buttons-row':      return buildButtonsRowHtml(section);
    case 'newsletter-form':  return buildNewsletterFormHtml(section);
    case 'stats-counter':    return buildStatsCounterHtml(section);
    case 'divider-section':  return buildDividerSectionHtml(section);
    case 'message-box':      return buildMessageBoxHtml(section);
    case 'social-links':     return buildSocialLinksHtml(section);
    case 'logo-grid':        return buildLogoGridHtml(section);
    case 'portfolio-grid':   return buildPortfolioGridHtml(section);
    default:
      return `<div style="padding:16px;background:#fffbe6;border:1px dashed #ccc;font-size:13px;color:#888;font-family:system-ui,sans-serif;">Unknown section: ${section.name}</div>`;
  }
}
