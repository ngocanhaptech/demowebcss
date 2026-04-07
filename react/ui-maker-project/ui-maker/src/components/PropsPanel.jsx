import React, { useState, useEffect } from 'react';
import { getSectionMeta } from '../constants/sectionRegistry.js';

function TextPropField({ propKey, label, value, onChange }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: 600,
          color: '#666',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        {label}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(propKey, e.target.value)}
        style={{
          width: '100%',
          padding: '7px 9px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          fontSize: '12px',
          boxSizing: 'border-box',
          outline: 'none',
          fontFamily: 'inherit'
        }}
      />
    </div>
  );
}

function HtmlPropField({ propKey, label, value, onChange }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: 600,
          color: '#666',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        {label}
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(propKey, e.target.value)}
        rows={4}
        style={{
          width: '100%',
          padding: '7px 9px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          fontSize: '12px',
          boxSizing: 'border-box',
          outline: 'none',
          fontFamily: 'ui-monospace, Consolas, monospace',
          resize: 'vertical',
          lineHeight: '1.5'
        }}
      />
    </div>
  );
}

function JsonArrayPropField({ propKey, label, value, onChange }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setText(JSON.stringify(Array.isArray(value) ? value : [], null, 2));
    setError('');
  }, [value]);

  function handleChange(e) {
    setText(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      if (Array.isArray(parsed)) {
        setError('');
        onChange(propKey, parsed);
      } else {
        setError('Phải là JSON array.');
      }
    } catch (_e) {
      setError('JSON không hợp lệ.');
    }
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: 600,
          color: '#666',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        {label}
      </label>
      <textarea
        value={text}
        onChange={handleChange}
        rows={5}
        style={{
          width: '100%',
          padding: '7px 9px',
          border: `1px solid ${error ? '#e53e3e' : '#ddd'}`,
          borderRadius: '5px',
          fontSize: '12px',
          boxSizing: 'border-box',
          outline: 'none',
          fontFamily: 'ui-monospace, Consolas, monospace',
          resize: 'vertical'
        }}
      />
      {error && <div style={{ color: '#e53e3e', fontSize: '11px', marginTop: '3px' }}>{error}</div>}
    </div>
  );
}

export function PropsPanel({ selectedSection, onUpdateSection, onDeleteSection }) {
  if (!selectedSection) {
    return (
      <aside
        style={{
          width: 240,
          minWidth: 240,
          borderLeft: '1px solid #e5e4e7',
          background: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
      >
        <div style={{ textAlign: 'center', color: '#bbb', fontSize: '13px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>☝️</div>
          <div>Chọn một section để chỉnh sửa</div>
        </div>
      </aside>
    );
  }

  const meta = getSectionMeta(selectedSection.name);
  const propSchema = meta ? meta.propSchema : [];

  function handleChange(key, val) {
    onUpdateSection({ ...selectedSection, [key]: val });
  }

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        borderLeft: '1px solid #e5e4e7',
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid #e5e4e7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Props
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#333', marginTop: '2px' }}>
            {meta ? meta.label : selectedSection.name}
          </div>
        </div>
        <span
          style={{
            fontSize: '11px',
            background: '#f0e4d7',
            color: '#8B4513',
            padding: '2px 7px',
            borderRadius: '4px',
            fontWeight: 600
          }}
        >
          {meta ? meta.category : '?'}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        {propSchema.length === 0 && (
          <div style={{ fontSize: '12px', color: '#aaa' }}>Section này không có props.</div>
        )}
        {propSchema.map((field) => {
          if (field.type === 'text') {
            return (
              <TextPropField
                key={field.key}
                propKey={field.key}
                label={field.label}
                value={selectedSection[field.key]}
                onChange={handleChange}
              />
            );
          }
          if (field.type === 'html') {
            return (
              <HtmlPropField
                key={field.key}
                propKey={field.key}
                label={field.label}
                value={selectedSection[field.key]}
                onChange={handleChange}
              />
            );
          }
          if (field.type === 'json-array') {
            return (
              <JsonArrayPropField
                key={field.key}
                propKey={field.key}
                label={field.label}
                value={selectedSection[field.key]}
                onChange={handleChange}
              />
            );
          }
          return null;
        })}

        <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Section ID
          </div>
          <code
            style={{
              fontSize: '11px',
              background: '#f3f3f3',
              padding: '3px 6px',
              borderRadius: '4px',
              color: '#555',
              display: 'block',
              wordBreak: 'break-all'
            }}
          >
            {selectedSection.name}
          </code>
        </div>
      </div>

      <div style={{ padding: '10px 14px', borderTop: '1px solid #e5e4e7' }}>
        <button
          type="button"
          onClick={() => onDeleteSection(selectedSection._uid)}
          style={{
            width: '100%',
            padding: '7px',
            borderRadius: '5px',
            border: '1px solid #f87171',
            backgroundColor: '#fff5f5',
            color: '#e53e3e',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Xoá section này
        </button>
      </div>
    </aside>
  );
}
