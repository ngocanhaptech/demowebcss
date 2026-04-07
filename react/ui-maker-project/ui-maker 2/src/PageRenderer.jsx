import React from 'react';
import { TopBarBasic } from './sections/TopBarBasic.jsx';
import { HeaderMain } from './sections/HeaderMain.jsx';
import { HeroCeramic } from './sections/HeroCeramic.jsx';
import { IntroStudio } from './sections/IntroStudio.jsx';
import { Features3Col } from './sections/Features3Col.jsx';
import { CtaHtml } from './sections/CtaHtml.jsx';
import { ContactForm } from './sections/ContactForm.jsx';
import { FooterBasic } from './sections/FooterBasic.jsx';

function renderSection(section) {
  switch (section.name) {
    case 'top-bar-basic':
      return <TopBarBasic key={section._uid || section.name} section={section} />;
    case 'header-main':
      return <HeaderMain key={section._uid || section.name} section={section} />;
    case 'hero-ceramic':
      return <HeroCeramic key={section._uid || section.name} section={section} />;
    case 'intro-studio':
      return <IntroStudio key={section._uid || section.name} section={section} />;
    case 'features-3col':
      return <Features3Col key={section._uid || section.name} section={section} />;
    case 'cta-html-1':
      return <CtaHtml key={section._uid || section.name} section={section} />;
    case 'contact-form':
      return <ContactForm key={section._uid || section.name} section={section} />;
    case 'footer-basic':
      return <FooterBasic key={section._uid || section.name} section={section} />;
    default:
      return (
        <div
          key={section._uid || section.name}
          style={{
            padding: '16px',
            background: '#fffbe6',
            border: '1px dashed #ccc',
            fontSize: '13px',
            color: '#888'
          }}
        >
          Unknown section: <code>{section.name}</code>
        </div>
      );
  }
}

export function PageRenderer({ page }) {
  if (!page || !Array.isArray(page.sections)) {
    return (
      <div style={{ padding: '24px', color: '#888', fontSize: '14px' }}>
        Không có dữ liệu trang.
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {page.sections.map((section) => renderSection(section))}
    </div>
  );
}
