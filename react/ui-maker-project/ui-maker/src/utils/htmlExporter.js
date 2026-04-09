import { buildSectionHtml } from './sectionBuilders.js';

function buildSeoMetaTags(page) {
  const seo = page.seo || {};
  const parts = [];

  if (seo.description) {
    parts.push(`  <meta name="description" content="${escapeAttr(seo.description)}" />`);
  }
  if (seo.keywords) {
    parts.push(`  <meta name="keywords" content="${escapeAttr(seo.keywords)}" />`);
  }
  if (seo.canonicalUrl) {
    parts.push(`  <link rel="canonical" href="${escapeAttr(seo.canonicalUrl)}" />`);
  }

  const ogTitle = seo.ogTitle || page.title || '';
  const ogDesc  = seo.ogDescription || seo.description || '';
  const ogImage = seo.ogImage || '';

  if (ogTitle) {
    parts.push(`  <meta property="og:title" content="${escapeAttr(ogTitle)}" />`);
  }
  if (ogDesc) {
    parts.push(`  <meta property="og:description" content="${escapeAttr(ogDesc)}" />`);
  }
  if (ogImage) {
    parts.push(`  <meta property="og:image" content="${escapeAttr(ogImage)}" />`);
  }
  if (seo.canonicalUrl) {
    parts.push(`  <meta property="og:url" content="${escapeAttr(seo.canonicalUrl)}" />`);
  }

  if (parts.length > 0) {
    parts.unshift(`  <!-- SEO Meta -->`);
  }
  return parts.join('\n');
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildHtmlDocument(page) {
  if (!page || !Array.isArray(page.sections)) return '';

  const bodyHtml = page.sections.map(buildSectionHtml).join('\n');
  const title    = page.title    || 'Exported Page';
  const lang     = page.language || 'vi';
  const seoMeta  = buildSeoMetaTags(page);

  const resetCss =
    '*{box-sizing:border-box;}' +
    'body{margin:0;padding:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;}' +
    'a{text-decoration:none;color:inherit;}' +
    'h1,h2,h3{margin:0;}' +
    'input,textarea,button,select{font-family:inherit;}' +
    'details summary::-webkit-details-marker{display:none;}';

  return (
    `<!doctype html>\n` +
    `<html lang="${lang}">\n` +
    `<head>\n` +
    `  <meta charset="utf-8" />\n` +
    `  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n` +
    `  <title>${escapeAttr(title)}</title>\n` +
    (seoMeta ? seoMeta + '\n' : '') +
    `  <style>${resetCss}</style>\n` +
    `</head>\n` +
    `<body>\n` +
    bodyHtml +
    `\n</body>\n` +
    `</html>`
  );
}

export function downloadHtmlFile(page) {
  const html     = buildHtmlDocument(page);
  const filename = (page && page.id ? page.id : 'page') + '.html';
  const blob     = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url      = URL.createObjectURL(blob);
  const anchor   = document.createElement('a');
  anchor.href     = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
