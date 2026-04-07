import React from 'react';

export function CtaHtml({ section }) {
  const link = section['cta-link'] || '#';
  const text = section['cta-text'] || 'Xem chi tiết';

  return (
    <section
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        backgroundColor: '#F5E9DD'
      }}
    >
      <a
        href={link}
        style={{
          display: 'inline-block',
          padding: '12px 28px',
          backgroundColor: '#8B4513',
          color: '#fff',
          borderRadius: '999px',
          textDecoration: 'none',
          fontSize: '15px',
          fontWeight: 600
        }}
        onClick={(e) => e.preventDefault()}
      >
        {text}
      </a>
    </section>
  );
}
