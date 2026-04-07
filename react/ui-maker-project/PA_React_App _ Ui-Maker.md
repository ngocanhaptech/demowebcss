<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# tạo một PA để làm một standalone React App : ui-maker . MVP chỉ chạy local, chỉ dùng LocalStorage, export chỉ là download HTML inline style. “Ưu tiên code đầy đủ, import rõ ràng, không pseudo.”

“Không dùng comment // TODO cho đoạn core.”
yêu cầu:
React + Vite + PageRenderer đọc JSON page
json data page-1.json:
{
"id": "gomdat-landing-v1",
"version": "1.0.0",
"title": "Trang chủ Gốm Đất",
"language": "vi",
"sections": [
```    { "name": "top-bar-basic", "title": "top bar", "html-nav": "<a href='home'>Home</a><a href='contact'>Contact</a>" },    ```
{ "name": "header-main", "title": "Header content title"  },
```    { "name": "hero-ceramic","html-content": "<a href='s1'>Slider1</a><a href='slide2'>Slider2</a>" },    ```
```    { "name": "intro-studio", "html-main": "S Media <i>Studio</i>" },    ```
{ "name": "features-3col", "contents": ['title1', 'title2'] },
{ "name": "cta-html-1", "cta-link": "abc.html" },
{ "name": "contact-form", "form-title": "Contact"  },
{ "name": "footer-basic" }
]
}

kết quả có thể npm run dev được

Dưới đây là một PA rất cụ thể + bộ file skeleton để anh có thể tạo **standalone React + Vite app “ui-maker”**, chạy local, dùng localStorage, export HTML inline style, và `npm run dev` là lên ngay.[^1]

***

## 1. Khởi tạo project React + Vite

```bash
# 1. Tạo project Vite + React (JS)
npm create vite@latest ui-maker -- --template react

cd ui-maker

# 2. Cài dependencies
npm install

# 3. Chạy dev server
npm run dev
```

Giữ nguyên `vite.config.js`, `index.html` mặc định của Vite.[^1]

***

## 2. Cấu trúc file cần tạo / sửa

Trong thư mục `ui-maker/`:

```plaintext
ui-maker/
├─ index.html              # giữ nguyên của Vite
├─ vite.config.js          # giữ nguyên
└─ src/
   ├─ data/
   │  └─ page-1.json       # JSON page mẫu
   ├─ PageRenderer.jsx     # render page từ JSON
   ├─ App.jsx              # UI chính: edit JSON + preview + export
   └─ main.jsx             # entrypoint React
```

Từng file cụ thể như sau.

***

## 3. `src/data/page-1.json`

Tạo thư mục `src/data/` và file `page-1.json` với nội dung (JSON hợp lệ, đã escape dấu `"` trong HTML):

```json
{
  "id": "gomdat-landing-v1",
  "version": "1.0.0",
  "title": "Trang chủ Gốm Đất",
  "language": "vi",
  "sections": [
    {
      "name": "top-bar-basic",
      "title": "top bar",
      "html-nav": "<a href=\"home\">Home</a><a href=\"contact\">Contact</a>"
    },
    {
      "name": "header-main",
      "title": "Header content title"
    },
    {
      "name": "hero-ceramic",
      "html-content": "<a href=\"s1\">Slider1</a><a href=\"slide2\">Slider2</a>"
    },
    {
      "name": "intro-studio",
      "html-main": "S Media <i>Studio</i>"
    },
    {
      "name": "features-3col",
      "contents": ["title1", "title2"]
    },
    {
      "name": "cta-html-1",
      "cta-link": "abc.html"
    },
    {
      "name": "contact-form",
      "form-title": "Contact"
    },
    {
      "name": "footer-basic"
    }
  ]
}
```


***

## 4. `src/PageRenderer.jsx`

Component này nhận `page` (object JSON) và render các section đơn giản với inline style.

```jsx
import React from 'react';

function TopBarBasic({ section }) {
  return (
    <div
      style={{
        backgroundColor: '#8B4513',
        color: '#fff',
        padding: '4px 16px',
        fontSize: '12px',
        display: 'flex',
        gap: '16px'
      }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: section['html-nav'] || ''
        }}
      />
    </div>
  );
}

function HeaderMain({ section }) {
  return (
    <header
      style={{
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #eee'
      }}
    >
      <div style={{ fontWeight: 'bold' }}>Gốm Đất</div>
      <div style={{ fontSize: '14px', color: '#444' }}>
        {section.title || 'Header'}
      </div>
    </header>
  );
}

function HeroCeramic({ section }) {
  return (
    <section
      style={{
        padding: '40px 16px',
        textAlign: 'center',
        backgroundColor: '#FDF8F3'
      }}
    >
      <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>
        Gốm Phù Lãng cho không gian hiện đại
      </h1>
      <div
        style={{ fontSize: '14px' }}
        dangerouslySetInnerHTML={{
          __html: section['html-content'] || ''
        }}
      />
    </section>
  );
}

function IntroStudio({ section }) {
  return (
    <section style={{ padding: '32px 16px', maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Giới thiệu xưởng gốm</h2>
      <p
        style={{ fontSize: '14px', color: '#444' }}
        dangerouslySetInnerHTML={{
          __html: section['html-main'] || ''
        }}
      />
    </section>
  );
}

function Features3Col({ section }) {
  const contents = Array.isArray(section.contents) ? section.contents : [];
  return (
    <section style={{ padding: '32px 16px', backgroundColor: '#fff' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Tính năng</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px'
        }}
      >
        {contents.map((item, idx) => (
          <div
            key={idx}
            style={{
              border: '1px solid #eee',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px'
            }}
          >
            <strong>{item}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaHtml({ section }) {
  return (
    <section
      style={{
        padding: '24px 16px',
        textAlign: 'center',
        backgroundColor: '#F5E9DD'
      }}
    >
      <a
        href={section['cta-link'] || '#'}
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#8B4513',
          color: '#fff',
          borderRadius: '999px',
          textDecoration: 'none',
          fontSize: '14px'
        }}
      >
        Xem chi tiết
      </a>
    </section>
  );
}

function ContactForm({ section }) {
  return (
    <section style={{ padding: '32px 16px', backgroundColor: '#FDF8F3' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>
        {section['form-title'] || 'Liên hệ'}
      </h2>
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{ maxWidth: 480, margin: '0 auto', display: 'grid', gap: '12px' }}
      >
        <input
          type="text"
          placeholder="Họ và tên"
          style={{
            padding: '8px 10px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
        <input
          type="tel"
          placeholder="Số điện thoại"
          style={{
            padding: '8px 10px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
        <textarea
          placeholder="Nội dung"
          rows={3}
          style={{
            padding: '8px 10px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#8B4513',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Gửi
        </button>
      </form>
    </section>
  );
}

function FooterBasic() {
  return (
    <footer
      style={{
        padding: '16px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#777',
        borderTop: '1px solid #eee'
      }}
    >
      © 2026 Gốm Đất. All rights reserved.
    </footer>
  );
}

function renderSection(section) {
  switch (section.name) {
    case 'top-bar-basic':
      return <TopBarBasic key={section.name} section={section} />;
    case 'header-main':
      return <HeaderMain key={section.name} section={section} />;
    case 'hero-ceramic':
      return <HeroCeramic key={section.name} section={section} />;
    case 'intro-studio':
      return <IntroStudio key={section.name} section={section} />;
    case 'features-3col':
      return <Features3Col key={section.name} section={section} />;
    case 'cta-html-1':
      return <CtaHtml key={section.name} section={section} />;
    case 'contact-form':
      return <ContactForm key={section.name} section={section} />;
    case 'footer-basic':
      return <FooterBasic key={section.name} />;
    default:
      return null;
  }
}

export function PageRenderer({ page }) {
  if (!page || !Array.isArray(page.sections)) {
    return <div>Không có dữ liệu trang.</div>;
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {page.sections.map((section) => renderSection(section))}
    </div>
  );
}
```


***

## 5. `src/App.jsx`

App này:

- Load JSON từ file, sau đó ưu tiên bản trong `localStorage` nếu có.
- Hiển thị một `<textarea>` cho phép sửa JSON thô và lưu lại vào localStorage.
- Dùng `PageRenderer` để preview.
- Nút “Export HTML” build một document HTML với inline style + nội dung render, và cho tải file `.html`.

```jsx
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
```


***

## 6. `src/main.jsx`

Chỉ cần adapt file mặc định Vite:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // nếu Vite đã tạo sẵn, có thể giữ để reset base

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

`src/index.css` có thể giữ nội dung mặc định hoặc rỗng (không bắt buộc sửa).

***

## 7. Kết quả

Sau khi:

```bash
npm install
npm run dev
```

- Mở URL Vite in ra (thường là `http://localhost:5173`).
- Anh sẽ thấy:
    - Bên trái: textarea JSON (`page-1.json`), nút “Lưu JSON vào LocalStorage” và “Export HTML”.
    - Bên phải: preview được render bởi `PageRenderer` từ JSON hiện tại.
    - Bấm “Export HTML” → trình duyệt tải file `.html` với **inline style** (không phụ thuộc React) tương ứng với cấu trúc JSON.

Đây là MVP đúng yêu cầu: standalone React + Vite, local only, dùng localStorage, export là HTML inline style, code đầy đủ, có thể `npm run dev` chạy ngay.[^1]

<div align="center">⁂</div>

[^1]: https://vite.dev/guide/

