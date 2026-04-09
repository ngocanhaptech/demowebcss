import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore } from '../../store/appStore.js'

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    padding: '8px 0 16px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px 4px',
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#94a3b8',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    border: '1px solid #e2e8f0',
    borderRadius: 5,
    background: 'transparent',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: 16,
    lineHeight: 1,
    fontFamily: 'inherit',
    transition: 'background 0.1s, border-color 0.1s',
  },
  pageRow: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    margin: '1px 6px',
    borderRadius: 6,
    cursor: 'pointer',
    background: active ? '#eff6ff' : 'transparent',
    border: active ? '1px solid #bfdbfe' : '1px solid transparent',
    transition: 'background 0.1s',
    userSelect: 'none',
    position: 'relative',
  }),
  pageIcon: (active) => ({
    fontSize: 13,
    flexShrink: 0,
    color: active ? '#2563eb' : '#94a3b8',
  }),
  pageName: (active) => ({
    flex: 1,
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    color: active ? '#1e40af' : '#374151',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    outline: 'none',
    background: 'transparent',
    border: 'none',
    cursor: 'inherit',
    fontFamily: 'inherit',
    padding: 0,
    minWidth: 0,
  }),
  menuBtn: {
    flexShrink: 0,
    width: 22,
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 4,
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 1,
    fontFamily: 'inherit',
  },
  contextMenu: {
    position: 'fixed',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    zIndex: 9999,
    minWidth: 160,
    padding: '4px 0',
    overflow: 'hidden',
  },
  menuItem: (danger) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 14px',
    fontSize: 12,
    color: danger ? '#dc2626' : '#374151',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
  }),
  menuDivider: {
    height: 1,
    background: '#f1f5f9',
    margin: '4px 0',
  },
  emptyHint: {
    padding: '16px 12px',
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 1.5,
    textAlign: 'center',
  },
}

// ─── Context Menu ─────────────────────────────────────────────────────────────

function ContextMenu({ x, y, page, isOnly, onClose, onRename, onDuplicate, onDelete }) {
  const ref = useRef()

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div ref={ref} style={{ ...S.contextMenu, left: x, top: y }}>
      <button
        style={S.menuItem(false)}
        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        onClick={() => { onRename(); onClose() }}
      >
        ✏️ Đổi tên
      </button>
      <button
        style={S.menuItem(false)}
        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        onClick={() => { onDuplicate(); onClose() }}
      >
        📋 Nhân bản
      </button>
      {!isOnly && (
        <>
          <div style={S.menuDivider} />
          <button
            style={S.menuItem(true)}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => { onDelete(); onClose() }}
          >
            🗑 Xóa trang
          </button>
        </>
      )}
    </div>
  )
}

// ─── PageRow ─────────────────────────────────────────────────────────────────

function PageRow({ page, isActive, isOnly, onSwitch, onRename, onDuplicate, onDelete }) {
  const [editing, setEditing]       = useState(false)
  const [editName, setEditName]     = useState(page.name)
  const [menu, setMenu]             = useState(null)  // {x, y}
  const inputRef = useRef()

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  function startEdit() {
    setEditName(page.name)
    setEditing(true)
  }

  function commitEdit() {
    setEditing(false)
    const trimmed = editName.trim()
    if (trimmed && trimmed !== page.name) {
      onRename(trimmed)
    } else {
      setEditName(page.name)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter')  { e.preventDefault(); commitEdit() }
    if (e.key === 'Escape') { setEditing(false); setEditName(page.name) }
  }

  function openMenu(e) {
    e.stopPropagation()
    setMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div
        style={S.pageRow(isActive)}
        onClick={() => !editing && onSwitch()}
        onDoubleClick={startEdit}
        onMouseEnter={e => {
          if (!isActive) e.currentTarget.style.background = '#f8fafc'
        }}
        onMouseLeave={e => {
          if (!isActive) e.currentTarget.style.background = 'transparent'
        }}
      >
        <span style={S.pageIcon(isActive)}>
          {isActive ? '🏠' : '📄'}
        </span>

        {editing ? (
          <input
            ref={inputRef}
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            onClick={e => e.stopPropagation()}
            style={{
              ...S.pageName(isActive),
              background: '#fff',
              border: '1px solid #93c5fd',
              borderRadius: 3,
              padding: '1px 4px',
              cursor: 'text',
            }}
          />
        ) : (
          <span style={S.pageName(isActive)} title={page.name}>
            {page.name}
          </span>
        )}

        <button
          style={S.menuBtn}
          onClick={openMenu}
          title="Tùy chọn"
          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          ···
        </button>
      </div>

      {menu && (
        <ContextMenu
          x={menu.x} y={menu.y}
          page={page}
          isOnly={isOnly}
          onClose={() => setMenu(null)}
          onRename={startEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      )}
    </>
  )
}

// ─── PagesPanel ───────────────────────────────────────────────────────────────

/**
 * PagesPanel — list of pages in the project.
 *
 * Features:
 *  - Click to switch pages (auto-saves current page tree)
 *  - Double-click or context menu → Rename (inline input)
 *  - + button → Add new page
 *  - Context menu → Duplicate / Delete
 */
export function PagesPanel() {
  const pages         = useAppStore(s => s.pages)
  const currentPageId = useAppStore(s => s.currentPageId)

  const switchPage    = useCallback(id => useAppStore.getState().switchPage(id), [])
  const addNewPage    = useCallback(() => useAppStore.getState().addNewPage('New Page'), [])
  const renamePage    = useCallback((id, name) => useAppStore.getState().renamePage(id, name), [])
  const duplicatePage = useCallback(id => useAppStore.getState().duplicatePage(id), [])
  const deletePage    = useCallback(id => useAppStore.getState().deleteCurrentPage(id), [])

  return (
    <div style={S.root}>
      <div style={S.sectionHeader}>
        <span style={S.sectionLabel}>Pages</span>
        <button
          style={S.addBtn}
          onClick={addNewPage}
          title="Thêm trang mới"
          onMouseEnter={e => {
            e.currentTarget.style.background = '#eff6ff'
            e.currentTarget.style.borderColor = '#bfdbfe'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
        >
          +
        </button>
      </div>

      {pages.length === 0 ? (
        <div style={S.emptyHint}>Chưa có trang nào</div>
      ) : (
        pages.map(page => (
          <PageRow
            key={page.id}
            page={page}
            isActive={page.id === currentPageId}
            isOnly={pages.length === 1}
            onSwitch={() => switchPage(page.id)}
            onRename={name => renamePage(page.id, name)}
            onDuplicate={() => duplicatePage(page.id)}
            onDelete={() => deletePage(page.id)}
          />
        ))
      )}

      <div style={{ marginTop: 8, padding: '0 10px' }}>
        <div style={{
          padding: '8px 10px',
          background: '#f8fafc',
          borderRadius: 6,
          fontSize: 10,
          color: '#94a3b8',
          lineHeight: 1.5,
          border: '1px solid #f1f5f9',
        }}>
          Double-click để đổi tên · Click ··· để thêm tùy chọn
        </div>
      </div>
    </div>
  )
}
