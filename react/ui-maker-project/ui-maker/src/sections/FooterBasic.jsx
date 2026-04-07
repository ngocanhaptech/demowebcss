import React from 'react';

export function FooterBasic({ section }) {
  const text = section['footer-text'] || '© 2026 Gốm Đất. All rights reserved.';

  return (
    <footer
      style={{
        padding: '20px 24px',
        textAlign: 'center',
        fontSize: '13px',
        color: '#777',
        borderTop: '1px solid #eee',
        background: '#fff'
      }}
    >
      {text}
    </footer>
  );
}
