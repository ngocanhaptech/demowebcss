import React, { useState } from 'react';
import { SECTION_REGISTRY } from '../constants/sectionRegistry.js';

const CATEGORIES = [...new Set(SECTION_REGISTRY.map((s) => s.category))];

export function SectionsPanel({ onAddSection }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = SECTION_REGISTRY.filter((s) => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    const matchSearch =
      search.trim() === '' ||
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function handleDragStart(e, sectionName) {
    e.dataTransfer.setData('application/x-ui-maker-section', sectionName);
    e.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        borderRight: '1px solid #e5e4e7',
        display: 'flex',
        flexDirection: 'column',
        background: '#fafafa',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '12px 12px 8px',
          borderBottom: '1px solid #e5e4e7'
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
          Sections
        </div>
        <input
          type="text"
          placeholder="Tìm section..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '12px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '4px', padding: '8px 10px', flexWrap: 'wrap', borderBottom: '1px solid #e5e4e7' }}>
        {['All', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              border: '1px solid',
              borderColor: activeCategory === cat ? '#8B4513' : '#ddd',
              backgroundColor: activeCategory === cat ? '#8B4513' : '#fff',
              color: activeCategory === cat ? '#fff' : '#555',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: activeCategory === cat ? 700 : 400
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '12px', fontSize: '12px', color: '#aaa', textAlign: 'center' }}>
            Không tìm thấy section.
          </div>
        )}
        {filtered.map((meta) => (
          <div
            key={meta.name}
            draggable
            onDragStart={(e) => handleDragStart(e, meta.name)}
            onClick={() => onAddSection(meta.name)}
            title={`Click để thêm · Kéo vào Canvas`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              marginBottom: '4px',
              borderRadius: '6px',
              border: '1px solid #e5e4e7',
              background: '#fff',
              cursor: 'grab',
              userSelect: 'none',
              fontSize: '13px',
              color: '#333',
              transition: 'box-shadow 0.1s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(139,69,19,0.15)';
              e.currentTarget.style.borderColor = '#c4a48a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e5e4e7';
            }}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>{meta.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '12px' }}>{meta.label}</div>
              <div style={{ fontSize: '10px', color: '#999', marginTop: '1px' }}>{meta.category}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '8px 12px',
          fontSize: '10px',
          color: '#bbb',
          borderTop: '1px solid #e5e4e7',
          textAlign: 'center'
        }}
      >
        Click hoặc kéo vào Canvas
      </div>
    </aside>
  );
}
