import React from 'react';

export function Features3Col({ section }) {
  const contents = Array.isArray(section.contents) ? section.contents : [];

  return (
    <section style={{ padding: '40px 24px', backgroundColor: '#fdf8f3' }}>
      <h2
        style={{
          fontSize: '22px',
          marginBottom: '20px',
          color: '#3d1f00',
          textAlign: 'center'
        }}
      >
        Tính năng nổi bật
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}
      >
        {contents.map((item, idx) => (
          <div
            key={idx}
            style={{
              border: '1px solid #e5d9ce',
              borderRadius: '10px',
              padding: '20px',
              fontSize: '14px',
              background: '#fff'
            }}
          >
            <strong style={{ color: '#3d1f00' }}>{item}</strong>
          </div>
        ))}
        {contents.length === 0 && (
          <div style={{ fontSize: '13px', color: '#aaa', padding: '12px' }}>
            Không có mục nào.
          </div>
        )}
      </div>
    </section>
  );
}
