import React from 'react';

export function HeroCeramic({ section }) {
  return (
    <section
      style={{
        padding: '60px 24px',
        textAlign: 'center',
        backgroundColor: '#FDF8F3'
      }}
    >
      <h1 style={{ fontSize: '32px', marginBottom: '16px', color: '#3d1f00' }}>
        Gốm Phù Lãng cho không gian hiện đại
      </h1>
      <div
        style={{ fontSize: '15px', color: '#555' }}
        dangerouslySetInnerHTML={{ __html: section['html-content'] || '' }}
      />
    </section>
  );
}
