import { useState } from 'react'
import { MediaManager } from '../media/MediaManager.jsx'

const S = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  preview: {
    width: '100%',
    height: 120,
    objectFit: 'cover',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    background: '#f1f5f9',
    display: 'block',
  },
  placeholder: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    border: '2px dashed #cbd5e1',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    fontSize: 13,
  },
  chooseBtn: {
    width: '100%',
    padding: '7px 0',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 12,
  },
  urlInput: {
    width: '100%',
    padding: '7px 9px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 12,
    boxSizing: 'border-box',
    outline: 'none',
    color: '#374151',
    background: '#fff',
  },
  label: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
}

/**
 * OptionImage — option widget for the `src` field of an image element.
 *
 * - Shows a thumbnail preview (or placeholder if no src set)
 * - "Chọn ảnh" button opens MediaManager modal
 * - Direct URL text input as fallback
 *
 * @param {{ value: string, onChange: (val: string) => void }} props
 */
export function OptionImage({ value, onChange }) {
  const [open, setOpen] = useState(false)

  const url = value || ''

  return (
    <div style={S.root}>
      {url ? (
        <img
          src={url}
          alt="preview"
          style={S.preview}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      ) : (
        <div style={S.placeholder}>Chưa chọn ảnh</div>
      )}

      <button style={S.chooseBtn} onClick={() => setOpen(true)}>
        🖼 Chọn từ thư viện / Tải lên
      </button>

      <span style={S.label}>Hoặc nhập URL trực tiếp</span>
      <input
        style={S.urlInput}
        type="text"
        value={url}
        placeholder="https://..."
        onChange={(e) => onChange(e.target.value)}
      />

      {open && (
        <MediaManager
          onSelect={(u) => { onChange(u); setOpen(false) }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
