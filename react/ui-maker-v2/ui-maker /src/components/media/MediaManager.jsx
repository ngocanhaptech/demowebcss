import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

const CLOUD_NAME       = 'dycwkcxiu'
const UPLOAD_PRESET    = 'googlesheet'
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxmldsqkRcMM_tKsYw1TMtkVuBBiDE5SPVAULMr_etIc7QsHYRn0uiLm17Zo_WX54PD/exec'
const ROWS_PER_PAGE    = 9

const STYLES = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    width: 680,
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 48px)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  tabs: {
    display: 'flex',
    gap: 4,
    padding: '12px 20px 0',
    borderBottom: '1px solid #e2e8f0',
    flexShrink: 0,
    background: '#f8fafc',
  },
  tab: (active) => ({
    padding: '8px 18px',
    border: 'none',
    borderRadius: '6px 6px 0 0',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    fontSize: 13,
    background: active ? '#fff' : 'transparent',
    color: active ? '#2563eb' : '#64748b',
    borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
    transition: 'all 0.15s',
  }),
  body: {
    flex: 1,
    overflow: 'auto',
    padding: 20,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 22,
    cursor: 'pointer',
    color: '#94a3b8',
    lineHeight: 1,
    padding: '2px 4px',
  },
  uploadZone: (hover) => ({
    border: `2px dashed ${hover ? '#2563eb' : '#94a3b8'}`,
    borderRadius: 10,
    padding: '32px 20px',
    textAlign: 'center',
    background: hover ? '#eff6ff' : '#f8fafc',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: 16,
  }),
  previewImg: {
    maxWidth: '100%',
    maxHeight: 220,
    borderRadius: 8,
    margin: '12px auto 0',
    display: 'block',
    border: '1px solid #e2e8f0',
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 13,
    boxSizing: 'border-box',
    marginBottom: 10,
    outline: 'none',
  },
  btnPrimary: (disabled) => ({
    width: '100%',
    padding: '10px 0',
    background: disabled ? '#cbd5e1' : '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 7,
    fontWeight: 600,
    fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    marginTop: 4,
  }),
  statusText: (ok) => ({
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 600,
    fontSize: 13,
    color: ok ? '#16a34a' : '#ef4444',
    minHeight: 20,
  }),
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 12,
  },
  gridItem: (selected) => ({
    borderRadius: 8,
    overflow: 'hidden',
    cursor: 'pointer',
    border: selected ? '2px solid #2563eb' : '2px solid transparent',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    background: '#f1f5f9',
    transition: 'border-color 0.15s',
  }),
  gridImg: {
    width: '100%',
    height: 110,
    objectFit: 'cover',
    display: 'block',
  },
  gridLabel: {
    fontSize: 11,
    padding: '4px 6px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#475569',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTop: '1px solid #e2e8f0',
  },
  pageBtn: (disabled) => ({
    padding: '5px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: 5,
    background: disabled ? '#f1f5f9' : '#fff',
    color: disabled ? '#cbd5e1' : '#2563eb',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 13,
  }),
  searchInput: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 13,
    boxSizing: 'border-box',
    marginBottom: 12,
    outline: 'none',
  },
  selectBtn: {
    marginTop: 16,
    width: '100%',
    padding: '10px 0',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 7,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
}

function UploadTab({ onUploaded }) {
  const [file, setFile]           = useState(null)
  const [preview, setPreview]     = useState('')
  const [title, setTitle]         = useState('')
  const [status, setStatus]       = useState('')
  const [isError, setIsError]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [hover, setHover]         = useState(false)
  const fileRef = useRef()

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setTitle(t => t || f.name.replace(/\.[^.]+$/, ''))
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(f)
    setStatus('')
  }

  function handleDrop(e) {
    e.preventDefault()
    setHover(false)
    const f = e.dataTransfer.files[0]
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setTitle(t => t || f.name.replace(/\.[^.]+$/, ''))
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(f)
    setStatus('')
  }

  async function handleUpload() {
    if (!file) return
    if (!title.trim()) { setStatus('Vui lòng nhập tiêu đề!'); setIsError(true); return }
    setUploading(true)
    setStatus('⏳ Đang tải lên Cloudinary...')
    setIsError(false)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)

      const clouResp = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const clouData = await clouResp.json()
      if (!clouData.secure_url) throw new Error('Cloudinary upload failed')
      const imageUrl = clouData.secure_url

      setStatus('⏳ Đang lưu vào thư viện...')

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          short_link:  imageUrl,
          title:       title.trim(),
          thumb:       imageUrl,
          store_id:    clouData.public_id ?? '',
          description: '',
          aff_link:    '',
          price:       '',
        }),
      })

      setStatus('✅ Tải lên thành công!')
      setIsError(false)

      setFile(null)
      setPreview('')
      setTitle('')
      if (fileRef.current) fileRef.current.value = ''

      onUploaded(imageUrl)
    } catch {
      setStatus('❌ Lỗi khi tải lên. Thử lại!')
      setIsError(true)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div
        style={STYLES.uploadZone(hover)}
        onDragOver={(e) => { e.preventDefault(); setHover(true) }}
        onDragLeave={() => setHover(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <div style={{ fontSize: 32, marginBottom: 6 }}>📁</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          {file ? file.name : 'Kéo ảnh vào đây hoặc click để chọn file'}
        </div>
        {preview && (
          <img src={preview} alt="preview" style={STYLES.previewImg} />
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <label style={{ fontSize: 12, color: '#475569', fontWeight: 600, display: 'block', marginBottom: 4 }}>
        Tiêu đề ảnh
      </label>
      <input
        style={STYLES.input}
        placeholder="Nhập tiêu đề..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button
        style={STYLES.btnPrimary(!file || uploading)}
        disabled={!file || uploading}
        onClick={handleUpload}
      >
        {uploading ? 'Đang xử lý...' : '⬆ Tải lên & Lưu vào thư viện'}
      </button>

      {status && (
        <div style={STYLES.statusText(!isError)}>{status}</div>
      )}
    </div>
  )
}

function LibraryTab({ onSelect }) {
  const [allItems, setAllItems]       = useState([])
  const [filtered, setFiltered]       = useState([])
  const [page, setPage]               = useState(1)
  const [search, setSearch]           = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [selected, setSelected]       = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const resp = await fetch(GOOGLE_SCRIPT_URL)
      const data = await resp.json()
      const items = Array.isArray(data) ? data : []
      setAllItems(items)
      setFiltered(items)
      setPage(1)
    } catch {
      setError('Không thể tải thư viện. Kiểm tra kết nối mạng.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const q = search.toLowerCase()
    const result = q
      ? allItems.filter(it => (it.title || '').toLowerCase().includes(q))
      : allItems
    setFiltered(result)
    setPage(1)
  }, [search, allItems])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const pageItems  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          style={{ ...STYLES.searchInput, marginBottom: 0, flex: 1 }}
          placeholder="🔍 Tìm ảnh..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={load}
          style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', background: '#f8fafc', fontSize: 13 }}
        >
          🔄
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>⏳ Đang tải...</div>}
      {error   && <div style={{ textAlign: 'center', color: '#ef4444', padding: 20 }}>{error}</div>}

      {!loading && !error && (
        <>
          {pageItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>Không có ảnh nào.</div>
          ) : (
            <div style={STYLES.grid}>
              {pageItems.map((item, i) => (
                <div
                  key={item.store_id || i}
                  style={STYLES.gridItem(selected === (item.short_link || item.thumb))}
                  onClick={() => setSelected(item.short_link || item.thumb)}
                  title={item.title}
                >
                  <img
                    src={item.thumb}
                    alt={item.title || ''}
                    style={STYLES.gridImg}
                    loading="lazy"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div style={STYLES.gridLabel}>{item.title || 'Không tiêu đề'}</div>
                </div>
              ))}
            </div>
          )}

          <div style={STYLES.pagination}>
            <button
              style={STYLES.pageBtn(page <= 1)}
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              ← Trước
            </button>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {page} / {totalPages}
            </span>
            <button
              style={STYLES.pageBtn(page >= totalPages)}
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Sau →
            </button>
          </div>

          {selected && (
            <button
              style={STYLES.selectBtn}
              onClick={() => onSelect(selected)}
            >
              ✓ Dùng ảnh này
            </button>
          )}
        </>
      )}
    </div>
  )
}

/**
 * MediaManager — modal for uploading images to Cloudinary and browsing
 * the saved library from Google Sheets.
 *
 * @param {{ onSelect: (url: string) => void, onClose: () => void }} props
 */
export function MediaManager({ onSelect, onClose }) {
  const [tab, setTab] = useState('upload')

  function handleSelect(url) {
    onSelect(url)
    onClose()
  }

  function handleUploaded(url) {
    onSelect(url)
    onClose()
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return createPortal(
    <div style={STYLES.overlay} onMouseDown={handleOverlayClick}>
      <div style={STYLES.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={STYLES.header}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>
            🖼 Media Manager
          </span>
          <button style={STYLES.closeBtn} onClick={onClose} title="Đóng">×</button>
        </div>

        <div style={STYLES.tabs}>
          <button style={STYLES.tab(tab === 'upload')}  onClick={() => setTab('upload')}>
            ⬆ Tải lên
          </button>
          <button style={STYLES.tab(tab === 'library')} onClick={() => setTab('library')}>
            📚 Thư viện
          </button>
        </div>

        <div style={STYLES.body}>
          {tab === 'upload'  && <UploadTab  onUploaded={handleUploaded} />}
          {tab === 'library' && <LibraryTab onSelect={handleSelect} />}
        </div>
      </div>
    </div>,
    document.body
  )
}
