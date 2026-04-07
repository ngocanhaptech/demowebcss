import React from 'react';

export function IntroStudio({ section }) {
  return (
    <section
      style={{
        padding: '40px 24px',
        maxWidth: 800,
        margin: '0 auto'
      }}
    >
      <h2 style={{ fontSize: '24px', marginBottom: '12px', color: '#3d1f00' }}>
        Giới thiệu xưởng gốm
      </h2>
      <p
        style={{ fontSize: '15px', color: '#444', lineHeight: '1.7' }}
        dangerouslySetInnerHTML={{ __html: section['html-main'] || '' }}
      />
    </section>
  );
}
