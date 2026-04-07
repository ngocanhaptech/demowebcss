function buildTopBarHtml(section) {
  const nav = section['html-nav'] || '';
  return (
    `<div style="background:#8B4513;color:#fff;padding:4px 24px;font-size:13px;display:flex;gap:20px;align-items:center;">` +
    nav +
    `</div>`
  );
}

function buildHeaderHtml(section) {
  const title = section.title || 'Header';
  return (
    `<header style="padding:16px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;background:#fff;">` +
    `<div style="font-weight:700;font-size:20px;color:#8B4513;">Gốm Đất</div>` +
    `<div style="font-size:14px;color:#444;">${title}</div>` +
    `</header>`
  );
}

function buildHeroHtml(section) {
  const content = section['html-content'] || '';
  return (
    `<section style="padding:60px 24px;text-align:center;background:#FDF8F3;">` +
    `<h1 style="font-size:32px;margin:0 0 16px;color:#3d1f00;">Gốm Phù Lãng cho không gian hiện đại</h1>` +
    `<div style="font-size:15px;color:#555;">` +
    content +
    `</div>` +
    `</section>`
  );
}

function buildIntroHtml(section) {
  const main = section['html-main'] || '';
  return (
    `<section style="padding:40px 24px;max-width:800px;margin:0 auto;">` +
    `<h2 style="font-size:24px;margin:0 0 12px;color:#3d1f00;">Giới thiệu xưởng gốm</h2>` +
    `<p style="font-size:15px;color:#444;line-height:1.7;">` +
    main +
    `</p>` +
    `</section>`
  );
}

function buildFeaturesHtml(section) {
  const contents = Array.isArray(section.contents) ? section.contents : [];
  const items = contents
    .map(
      (item) =>
        `<div style="border:1px solid #e5d9ce;border-radius:10px;padding:20px;font-size:14px;background:#fff;">` +
        `<strong style="color:#3d1f00;">${item}</strong>` +
        `</div>`
    )
    .join('');
  return (
    `<section style="padding:40px 24px;background:#fdf8f3;">` +
    `<h2 style="font-size:22px;margin:0 0 20px;color:#3d1f00;text-align:center;">Tính năng nổi bật</h2>` +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;">` +
    items +
    `</div>` +
    `</section>`
  );
}

function buildCtaHtml(section) {
  const link = section['cta-link'] || '#';
  const text = section['cta-text'] || 'Xem chi tiết';
  return (
    `<section style="padding:40px 24px;text-align:center;background:#F5E9DD;">` +
    `<a href="${link}" style="display:inline-block;padding:12px 28px;background:#8B4513;color:#fff;border-radius:999px;text-decoration:none;font-size:15px;font-weight:600;">` +
    text +
    `</a>` +
    `</section>`
  );
}

function buildContactFormHtml(section) {
  const title = section['form-title'] || 'Liên hệ';
  return (
    `<section style="padding:40px 24px;background:#FDF8F3;">` +
    `<h2 style="font-size:22px;margin:0 0 20px;text-align:center;color:#3d1f00;">${title}</h2>` +
    `<form style="max-width:480px;margin:0 auto;display:grid;gap:12px;" onsubmit="return false;">` +
    `<input type="text" placeholder="Họ và tên" style="padding:10px 12px;border-radius:6px;border:1px solid #ddd;font-size:14px;" />` +
    `<input type="tel" placeholder="Số điện thoại" style="padding:10px 12px;border-radius:6px;border:1px solid #ddd;font-size:14px;" />` +
    `<textarea placeholder="Nội dung" rows="4" style="padding:10px 12px;border-radius:6px;border:1px solid #ddd;font-size:14px;resize:vertical;"></textarea>` +
    `<button type="submit" style="padding:12px 20px;border-radius:6px;border:none;background:#8B4513;color:#fff;font-weight:700;font-size:14px;cursor:pointer;">Gửi</button>` +
    `</form>` +
    `</section>`
  );
}

function buildFooterHtml(section) {
  const text = section['footer-text'] || '© 2026 Gốm Đất. All rights reserved.';
  return (
    `<footer style="padding:20px 24px;text-align:center;font-size:13px;color:#777;border-top:1px solid #eee;background:#fff;">` +
    text +
    `</footer>`
  );
}

function buildSectionHtml(section) {
  switch (section.name) {
    case 'top-bar-basic':
      return buildTopBarHtml(section);
    case 'header-main':
      return buildHeaderHtml(section);
    case 'hero-ceramic':
      return buildHeroHtml(section);
    case 'intro-studio':
      return buildIntroHtml(section);
    case 'features-3col':
      return buildFeaturesHtml(section);
    case 'cta-html-1':
      return buildCtaHtml(section);
    case 'contact-form':
      return buildContactFormHtml(section);
    case 'footer-basic':
      return buildFooterHtml(section);
    default:
      return `<div style="padding:16px;background:#fffbe6;border:1px dashed #ccc;font-size:13px;color:#888;">Unknown section: ${section.name}</div>`;
  }
}

export function buildHtmlDocument(page) {
  if (!page || !Array.isArray(page.sections)) return '';

  const bodyHtml = page.sections.map(buildSectionHtml).join('\n');
  const title = page.title || 'Exported Page';

  const resetCss =
    '*{box-sizing:border-box;}' +
    'body{margin:0;padding:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;}' +
    'a{text-decoration:none;color:inherit;}' +
    'h1,h2,h3{margin:0;}' +
    'input,textarea,button{font-family:inherit;}';

  return (
    '<!doctype html>\n' +
    '<html lang="vi">\n' +
    '<head>\n' +
    '  <meta charset="utf-8" />\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
    `  <title>${title}</title>\n` +
    `  <style>${resetCss}</style>\n` +
    '</head>\n' +
    '<body>\n' +
    bodyHtml +
    '\n</body>\n' +
    '</html>'
  );
}

export function downloadHtmlFile(page) {
  const html = buildHtmlDocument(page);
  const filename = (page && page.id ? page.id : 'page') + '.html';
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
