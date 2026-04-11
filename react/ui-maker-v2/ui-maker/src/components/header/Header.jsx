import { useCallback, useState } from 'react'
import { useAppStore, registry } from '../../store/appStore.js'
import { savePage, openPage } from '../../utils/PageSerializer.js'
import { downloadHtml } from '../../utils/HtmlExporter.js'

const VIEWPORT_TABS = [
  { mode: 'mobile',  icon: '📱', label: 'Mobile'  },
  { mode: 'tablet',  icon: '⬜', label: 'Tablet'  },
  { mode: 'desktop', icon: '🖥', label: 'Desktop' },
]

const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '5px 12px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  border: '1px solid',
  lineHeight: 1,
  transition: 'background 0.15s, color 0.15s',
  fontFamily: 'inherit',
}

const btnActive = {
  ...btnBase,
  background: '#2563eb',
  color: '#fff',
  borderColor: '#2563eb',
}

const btnInactive = {
  ...btnBase,
  background: 'transparent',
  color: '#64748b',
  borderColor: '#e2e8f0',
}

const btnAction = {
  ...btnBase,
  background: 'transparent',
  color: '#64748b',
  borderColor: '#e2e8f0',
}

const btnActionDisabled = {
  ...btnAction,
  opacity: 0.35,
  cursor: 'default',
}

/** Save / Open / Export buttons — grouped with a separator */
const btnSave = {
  ...btnBase,
  background: '#f0fdf4',
  color: '#16a34a',
  borderColor: '#bbf7d0',
}

const btnOpen = {
  ...btnBase,
  background: '#eff6ff',
  color: '#2563eb',
  borderColor: '#bfdbfe',
}

const btnExport = {
  ...btnBase,
  background: '#fefce8',
  color: '#92400e',
  borderColor: '#fde68a',
}

/**
 * PanelToggle — square icon button that shows/hides a side panel.
 * Active (panel visible) = blue fill; inactive = ghost outline.
 */
function PanelToggle({ active, onClick, title, icon }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        borderRadius: 6,
        border: '1px solid',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 14,
        lineHeight: 1,
        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
        background: active ? '#eff6ff' : 'transparent',
        color: active ? '#2563eb' : '#94a3b8',
        borderColor: active ? '#bfdbfe' : '#e2e8f0',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = '#f8fafc'
          e.currentTarget.style.color = '#475569'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#94a3b8'
        }
      }}
    >
      {icon}
    </button>
  )
}

/** Small inline toast-style notification */
function Toast({ msg, type }) {
  if (!msg) return null
  const bg    = type === 'error' ? '#fef2f2' : '#f0fdf4'
  const color = type === 'error' ? '#dc2626' : '#16a34a'
  const border = type === 'error' ? '#fecaca' : '#bbf7d0'
  return (
    <span
      style={{
        fontSize: 11,
        padding: '3px 8px',
        borderRadius: 5,
        background: bg,
        color,
        border: `1px solid ${border}`,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {msg}
    </span>
  )
}

/**
 * Header — top bar with branding, panel toggles, viewport selector,
 * history controls, and page save / open / export HTML actions.
 */
export function Header() {
  const viewportMode  = useAppStore(s => s.viewportMode)
  const canUndo       = useAppStore(s => s.canUndo)
  const canRedo       = useAppStore(s => s.canRedo)
  const selectedId    = useAppStore(s => s.selectedId)
  const showLeft      = useAppStore(s => s.showLeftPanel)
  const showRight     = useAppStore(s => s.showRightPanel)
  const isDirty       = useAppStore(s => s.isDirty)
  const pages         = useAppStore(s => s.pages ?? [])
  const currentPageId = useAppStore(s => s.currentPageId)
  const currentPage   = pages.find(p => p.id === currentPageId) ?? null

  const [toast, setToast] = useState({ msg: '', type: 'ok' })

  function showToast(msg, type = 'ok', ms = 2500) {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'ok' }), ms)
  }

  const setViewportMode = useCallback((mode) => {
    useAppStore.getState().setViewportMode(mode)
  }, [])

  const undo       = useCallback(() => useAppStore.getState().undo(), [])
  const redo       = useCallback(() => useAppStore.getState().redo(), [])
  const toggleLeft = useCallback(() => useAppStore.getState().toggleLeftPanel(), [])
  const toggleRight= useCallback(() => useAppStore.getState().toggleRightPanel(), [])

  // ── Page actions ─────────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    try {
      // Persist current canvas tree to localStorage first
      useAppStore.getState().saveCurrentPage()
      // Then download JSON file with the current page's slug as filename
      const slug = useAppStore.getState().pages?.find(
        p => p.id === useAppStore.getState().currentPageId
      )?.slug ?? 'page'
      savePage(registry, `${slug}.json`)
      showToast('✓ Đã lưu ' + slug + '.json')
    } catch (err) {
      showToast('✗ Lỗi khi lưu: ' + err.message, 'error')
    }
  }, [])

  const handleOpen = useCallback(() => {
    openPage(registry)
      .then(() => {
        // reloadTree increments treeVersion → Canvas re-renders with new root
        // and resets all selection / history state cleanly.
        useAppStore.getState().reloadTree()
        showToast('✓ Đã mở file JSON')
      })
      .catch((err) => {
        if (err.message !== 'File picker cancelled') {
          showToast('✗ ' + err.message, 'error')
        }
      })
  }, [])

  const handleExportHtml = useCallback(() => {
    try {
      const root = registry.getRoot()
      if (!root) {
        showToast('✗ Không có nội dung để xuất', 'error')
        return
      }
      downloadHtml(root, 'page.html')
      showToast('✓ Đã xuất page.html')
    } catch (err) {
      showToast('✗ Lỗi xuất HTML: ' + err.message, 'error')
    }
  }, [])

  return (
    <header
      style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
        gap: 8,
        zIndex: 100,
        position: 'relative',
      }}
    >
      {/* ── Left: Logo + Left-panel toggle ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: '#2563eb',
            letterSpacing: '-0.03em',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          ui-maker
        </span>
        <span
          style={{
            fontSize: 10,
            background: '#eff6ff',
            color: '#3b82f6',
            borderRadius: 4,
            padding: '1px 5px',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          v2
        </span>

        <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 2px' }} />

        <PanelToggle
          active={showLeft}
          onClick={toggleLeft}
          title={showLeft ? 'Ẩn panel trái' : 'Hiện panel trái'}
          icon="◧"
        />

        {/* Current page name pill */}
        {currentPage && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#374151',
              background: '#f1f5f9',
              borderRadius: 5,
              padding: '2px 8px',
              maxWidth: 110,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
            }}
            title={`Trang hiện tại: ${currentPage.name}`}
            onClick={() => useAppStore.getState().setActiveLeftTab('pages')}
          >
            {isDirty ? '● ' : ''}{currentPage.name}
          </span>
        )}
      </div>

      {/* ── Center: Viewport Toggle + Page actions ── */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        {VIEWPORT_TABS.map(vp => (
          <button
            key={vp.mode}
            style={viewportMode === vp.mode ? btnActive : btnInactive}
            onClick={() => setViewportMode(vp.mode)}
          >
            <span style={{ fontSize: 13 }}>{vp.icon}</span>
            {vp.label}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 4px' }} />

        {/* Save / Open / Export HTML */}
        <button style={btnSave} onClick={handleSave} title="Lưu page thành file JSON">
          💾 Lưu JSON
        </button>
        <button style={btnOpen} onClick={handleOpen} title="Mở file JSON đã lưu">
          📂 Mở JSON
        </button>
        <button style={btnExport} onClick={handleExportHtml} title="Xuất file HTML tĩnh">
          🌐 Xuất HTML
        </button>

        {toast.msg && <Toast msg={toast.msg} type={toast.type} />}
      </div>

      {/* ── Right: Right-panel toggle + History ── */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', minWidth: 120, justifyContent: 'flex-end', flexShrink: 0 }}>
        {selectedId && (
          <span
            style={{
              fontSize: 11,
              color: '#94a3b8',
              fontFamily: 'ui-monospace, monospace',
              maxWidth: 90,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={selectedId}
          >
            #{selectedId}
          </span>
        )}
        <button
          style={canUndo ? btnAction : btnActionDisabled}
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          ↩ Undo
        </button>
        <button
          style={canRedo ? btnAction : btnActionDisabled}
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          ↪ Redo
        </button>

        <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 2px' }} />

        <PanelToggle
          active={showRight}
          onClick={toggleRight}
          title={showRight ? 'Ẩn panel properties' : 'Hiện panel properties'}
          icon="◨"
        />
      </div>
    </header>
  )
}
