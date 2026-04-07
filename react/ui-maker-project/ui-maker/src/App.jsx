import React, { useEffect, useState } from 'react';
import pageData from './data/page-1.json';
import { PageRenderer } from './PageRenderer';

const STORAGE_KEY = 'ui-maker:page:gomdat-landing-v1';

function buildHtmlDocument(page) {
  const bodyHtmlParts = [];

  if (page && Array.isArray(page.sections)) {
    // Rất đơn giản: chỉ nối các đoạn HTML thô có trong JSON
    page.sections.forEach((section) => {
      if (section['html-nav']) {
        bodyHtmlParts.push(
          `<div style="background:#8B4513;color:#fff;padding:4px 16px;font-size:12px;">${section['html-nav']}</div>`
        );
      } else if (section['html-content']) {
        bodyHtmlParts.push(
          `<section style="padding:40px 16px;text-align:center;background:#FDF8F3;">${section['html-content']}</section>`
        );
      } else if (section['html-main']) {
        bodyHtmlParts.push(
          `<section style="padding:32px 16px;max-width:800px;margin:0 auto;">${section['html-main']}</section>`
        );
      } else if (Array.isArray(section.contents)) {
        const items = section.contents
          .map(
            (item) =>
              `<div style="border:1px solid #eee;border-radius:8px;padding:16px;font-size:14px;"><strong>${item}</strong></div>`
          )
          .join('');
        bodyHtmlParts.push(
          `<section style="padding:32px 16px;"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;">${items}</div></section>`
        );
      } else if (section['cta-link']) {
        bodyHtmlParts.push(
          `<section style="padding:24px 16px;text-align:center;background:#F5E9DD;"><a href="${section['cta-link']}" style="display:inline-block;padding:10px 20px;background:#8B4513;color:#fff;border-radius:999px;text-decoration:none;font-size:14px;">Xem chi tiết</a></section>`
        );
      } else if (section.name === 'footer-basic') {
        bodyHtmlParts.push(
          `<footer style="padding:16px;text-align:center;font-size:12px;color:#777;border-top:1px solid #eee;">© 2026 Gốm Đất. All rights reserved.</footer>`
        );
      }
    });
  }

  const inlineStyle =
    'body{margin:0;padding:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;}a{text-decoration:none;color:inherit;}';

  const title = page && page.title ? page.title : 'Exported Page';

  const html =
    '<!doctype html>' +
    '<html lang="vi">' +
    '<head>' +
    '<meta charset="utf-8" />' +
    `<title>${title}</title>` +
    `<style>${inlineStyle}</style>` +
    '</head>' +
    '<body>' +
    bodyHtmlParts.join('') +
    '</body>' +
    '</html>';

  return html;
}

function downloadHtml(text, filename) {
  const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function App() {
  const [pageJsonText, setPageJsonText] = useState('');
  const [pageObj, setPageObj] = useState(null);
  const [error, setError] = useState('');

  // Load initial data: ưu tiên localStorage, fallback sang file JSON
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPageObj(parsed);
        setPageJsonText(JSON.stringify(parsed, null, 2));
        return;
      } catch (_e) {
        // Nếu lỗi parse localStorage, fallback sang file
      }
    }
    setPageObj(pageData);
    setPageJsonText(JSON.stringify(pageData, null, 2));
  }, []);

  const handleJsonChange = (e) => {
    setPageJsonText(e.target.value);
  };

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(pageJsonText);
      setPageObj(parsed);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError('JSON không hợp lệ: ' + e.message);
    }
  };

  const handleExportHtml = () => {
    if (!pageObj) {
      return;
    }
    const html = buildHtmlDocument(pageObj);
    const filename = (pageObj && pageObj.id ? pageObj.id : 'page') + '.html';
    downloadHtml(html, filename);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div
        style={{
          width: '40%',
          borderRight: '1px solid #ddd',
          padding: '12px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <h1 style={{ fontSize: '18px', marginBottom: '8px' }}>ui-maker – JSON Editor</h1>
        <p style={{ fontSize: '12px', marginBottom: '8px', color: '#555' }}>
          Sửa JSON của trang, lưu vào localStorage và xem preview bên phải.
        </p>
        <textarea
          value={pageJsonText}
          onChange={handleJsonChange}
          style={{
            flex: 1,
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '12px',
            padding: '8px',
            boxSizing: 'border-box',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        {error && (
          <div style={{ marginTop: '8px', color: 'red', fontSize: '12px' }}>{error}</div>
        )}
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleSaveJson}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Lưu JSON vào LocalStorage
          </button>
          <button
            type="button"
            onClick={handleExportHtml}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#16a34a',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Export HTML
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px', boxSizing: 'border-box', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>Preview</h2>
        <div style={{ border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
          <PageRenderer page={pageObj} />
        </div>
      </div>
    </div>
  );
}

export default App;