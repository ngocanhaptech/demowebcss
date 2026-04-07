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