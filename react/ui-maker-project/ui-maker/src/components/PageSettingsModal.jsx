import React, { useState, useEffect } from 'react';

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: 700,
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '5px'
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>{hint}</div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  fontSize: '13px',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit'
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: 64,
  lineHeight: '1.5'
};

export function PageSettingsModal({ page, onSave, onClose }) {
  const [form, setForm] = useState({
    title: '',
    id: '',
    language: 'vi',
    seoDescription: '',
    seoKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    canonicalUrl: ''
  });

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!page) return;
    setForm({
      title: page.title || '',
      id: page.id || '',
      language: page.language || 'vi',
      seoDescription: page.seo?.description || '',
      seoKeywords: page.seo?.keywords || '',
      ogTitle: page.seo?.ogTitle || '',
      ogDescription: page.seo?.ogDescription || '',
      ogImage: page.seo?.ogImage || '',
      canonicalUrl: page.seo?.canonicalUrl || ''
    });
  }, [page]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const updatedPage = {
      ...page,
      title: form.title.trim() || page.title,
      id: form.id.trim() || page.id,
      language: form.language,
      seo: {
        description: form.seoDescription,
        keywords: form.seoKeywords,
        ogTitle: form.ogTitle,
        ogDescription: form.ogDescription,
        ogImage: form.ogImage,
        canonicalUrl: form.canonicalUrl
      }
    };
    onSave(updatedPage);
  }

  if (!page) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '10px',
          width: 540,
          maxWidth: '94vw',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#222' }}>
              Cài đặt Page
            </div>
            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
              id: <code style={{ background: '#f3f3f3', padding: '1px 5px', borderRadius: '3px' }}>{page.id}</code>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#999',
              lineHeight: 1,
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#8B4513',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px',
              paddingBottom: '6px',
              borderBottom: '1px solid #f0e4d7'
            }}
          >
            Thông tin cơ bản
          </div>

          <Field label="Tên page (title)" hint="Hiển thị trên tab trình duyệt và thẻ <title>">
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="VD: Trang chủ Gốm Đất"
              style={inputStyle}
            />
          </Field>

          <Field label="Page ID / Slug" hint="Dùng làm tên file khi export HTML, không dấu, không space">
            <input
              type="text"
              value={form.id}
              onChange={(e) => set('id', e.target.value.replace(/\s+/g, '-').toLowerCase())}
              placeholder="vd: trang-chu"
              style={inputStyle}
            />
          </Field>

          <Field label="Ngôn ngữ">
            <select
              value={form.language}
              onChange={(e) => set('language', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="vi">Tiếng Việt (vi)</option>
              <option value="en">English (en)</option>
              <option value="ja">日本語 (ja)</option>
              <option value="ko">한국어 (ko)</option>
              <option value="zh">中文 (zh)</option>
            </select>
          </Field>

          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#8B4513',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginTop: '20px',
              marginBottom: '12px',
              paddingBottom: '6px',
              borderBottom: '1px solid #f0e4d7'
            }}
          >
            SEO Meta Tags
          </div>

          <Field label="Meta Description" hint="Tóm tắt trang ~150 ký tự, hiển thị trong kết quả Google">
            <textarea
              value={form.seoDescription}
              onChange={(e) => set('seoDescription', e.target.value)}
              placeholder="Mô tả ngắn về trang..."
              style={textareaStyle}
            />
          </Field>

          <Field label="Meta Keywords" hint="Cách nhau bằng dấu phẩy (Google ít dùng nhưng vẫn nên có)">
            <input
              type="text"
              value={form.seoKeywords}
              onChange={(e) => set('seoKeywords', e.target.value)}
              placeholder="gốm đất, gốm phù lãng, gốm thủ công"
              style={inputStyle}
            />
          </Field>

          <Field label="Canonical URL" hint="URL chuẩn tránh nội dung trùng lặp">
            <input
              type="url"
              value={form.canonicalUrl}
              onChange={(e) => set('canonicalUrl', e.target.value)}
              placeholder="https://example.com/trang-chu"
              style={inputStyle}
            />
          </Field>

          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#8B4513',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginTop: '20px',
              marginBottom: '12px',
              paddingBottom: '6px',
              borderBottom: '1px solid #f0e4d7'
            }}
          >
            Open Graph (Facebook / Zalo share)
          </div>

          <Field label="OG Title" hint="Tiêu đề hiển thị khi share lên mạng xã hội">
            <input
              type="text"
              value={form.ogTitle}
              onChange={(e) => set('ogTitle', e.target.value)}
              placeholder="Để trống = dùng Title ở trên"
              style={inputStyle}
            />
          </Field>

          <Field label="OG Description">
            <textarea
              value={form.ogDescription}
              onChange={(e) => set('ogDescription', e.target.value)}
              placeholder="Mô tả khi share..."
              style={textareaStyle}
            />
          </Field>

          <Field label="OG Image URL" hint="Ảnh thumbnail khi share (tỉ lệ 1200×630 px)">
            <input
              type="url"
              value={form.ogImage}
              onChange={(e) => set('ogImage', e.target.value)}
              placeholder="https://example.com/og-image.jpg"
              style={inputStyle}
            />
          </Field>
        </div>

        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              background: '#fff',
              color: '#555',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              borderRadius: '5px',
              border: 'none',
              background: '#8B4513',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
