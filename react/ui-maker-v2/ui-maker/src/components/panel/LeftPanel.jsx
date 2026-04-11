import { useCallback } from 'react'
import { useAppStore } from '../../store/appStore.js'
import { ElementsPalette } from './ElementsPanel.jsx'
import { LayersPanel } from './LayersPanel.jsx'
import { PagesPanel } from './PagesPanel.jsx'
import { SectionsPanel } from './SectionsPanel.jsx'

const TABS = [
  { id: 'elements',  label: 'Elements' },
  { id: 'sections',  label: 'Sections' },
  { id: 'pages',     label: 'Pages'    },
  { id: 'layers',    label: 'Layers'   },
]

/**
 * LeftPanel — 240px left sidebar with four tabs:
 *  - Elements  : draggable element palette
 *  - Sections  : pre-built section template library
 *  - Pages     : multi-page management (add / switch / rename / delete)
 *  - Layers    : hierarchical tree of current page elements
 */
export function LeftPanel() {
  const activeTab        = useAppStore(s => s.activeLeftTab)
  const setActiveLeftTab = useAppStore(s => s.setActiveLeftTab)

  const setTab = useCallback(tab => setActiveLeftTab(tab), [setActiveLeftTab])

  return (
    <div
      style={{
        width: 240,
        minWidth: 240,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* ── Tab Bar ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          flexShrink: 0,
          background: '#fff',
          overflowX: 'auto',
        }}
      >
        {TABS.map(tab => (
          <TabButton
            key={tab.id}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => setTab(tab.id)}
          />
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────── */}
      {activeTab === 'elements' && <ElementsPalette />}
      {activeTab === 'sections' && <SectionsPanel />}
      {activeTab === 'pages'    && <PagesPanel />}
      {activeTab === 'layers'   && <LayersPanel />}
    </div>
  )
}

// ─── TabButton ────────────────────────────────────────────────────────────────

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        height: 34,
        padding: '0 2px',
        border: 'none',
        borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
        background: 'none',
        fontSize: 10,
        fontWeight: active ? 700 : 500,
        color: active ? '#2563eb' : '#64748b',
        cursor: 'pointer',
        letterSpacing: '0.02em',
        transition: 'color 100ms, border-color 100ms',
        outline: 'none',
        whiteSpace: 'nowrap',
        minWidth: 0,
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.color = '#334155'
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.color = '#64748b'
      }}
    >
      {label}
    </button>
  )
}
