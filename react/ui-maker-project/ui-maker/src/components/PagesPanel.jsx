import React, { useState } from 'react';

export function PagesPanel({ pages, activePageId, onSelectPage, onAddPage, onDeletePage, onOpenSettings }) {
  const [hoverId, setHoverId] = useState(null);

  return (
    <div
      style={{
        width: 200,
        minWidth: 200,
        borderRight: '1px solid #2d2d4e',
        background: '#13132a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '10px 12px 8px',
          borderBottom: '1px solid #2d2d4e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#888',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}
        >
          Pages
        </span>
        <button
          type="button"
          onClick={onAddPage}
          title="Thêm page mới"
          style={{
            width: 22,
            height: 22,
            borderRadius: '4px',
            border: 'none',
            background: '#8B4513',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            padding: 0
          }}
        >
          +
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {pages.length === 0 && (
          <div style={{ padding: '12px', fontSize: '12px', color: '#555', textAlign: 'center' }}>
            Chưa có page nào.
          </div>
        )}
        {pages.map((p) => {
          const isActive = p.id === activePageId;
          const isHover = hoverId === p.id;

          return (
            <div
              key={p.id}
              onMouseEnter={() => setHoverId(p.id)}
              onMouseLeave={() => setHoverId(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '5px',
                marginBottom: '2px',
                background: isActive ? '#2a2a4e' : isHover ? '#1e1e38' : 'transparent',
                border: isActive ? '1px solid #8B4513' : '1px solid transparent',
                overflow: 'hidden'
              }}
            >
              <button
                type="button"
                onClick={() => onSelectPage(p.id)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? '#e8b87d' : '#aaa',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 400,
                  padding: '7px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={p.title || p.id}
              >
                {p.title || p.id}
              </button>

              {(isActive || isHover) && (
                <button
                  type="button"
                  onClick={() => onOpenSettings(p.id)}
                  title="Cài đặt page"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#777',
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: '4px 4px 4px 0',
                    lineHeight: 1
                  }}
                >
                  ⚙
                </button>
              )}

              {(isHover || isActive) && pages.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Xoá page "${p.title || p.id}"?`)) onDeletePage(p.id);
                  }}
                  title="Xoá page"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#e53e3e',
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: '4px 6px 4px 0',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: '8px',
          borderTop: '1px solid #2d2d4e',
          fontSize: '10px',
          color: '#444',
          textAlign: 'center'
        }}
      >
        {pages.length} page{pages.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
