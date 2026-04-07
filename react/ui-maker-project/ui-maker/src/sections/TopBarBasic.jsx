import React from 'react';

export function TopBarBasic({ section }) {
  return (
    <div
      style={{
        backgroundColor: '#8B4513',
        color: '#fff',
        padding: '5px 24px',
        fontSize: '13px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
      }}
    >
      <div
        dangerouslySetInnerHTML={{ __html: section['html-nav'] || '' }}
        style={{ display: 'flex', gap: '16px', alignItems: 'center' }}
      />
    </div>
  );
}
