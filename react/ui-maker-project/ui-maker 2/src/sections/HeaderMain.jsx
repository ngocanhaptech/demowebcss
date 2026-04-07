import React from 'react';

export function HeaderMain({ section }) {
  return (
    <header
      style={{
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #eee',
        background: '#fff'
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '20px', color: '#8B4513' }}>Gốm Đất</div>
      <div style={{ fontSize: '14px', color: '#444' }}>{section.title || 'Header'}</div>
    </header>
  );
}
