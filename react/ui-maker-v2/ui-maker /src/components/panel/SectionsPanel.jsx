import { useState, useCallback } from 'react'
import { registry, useAppStore } from '../../store/appStore.js'
import { SECTION_TEMPLATES } from '../../data/sectionTemplates.js'

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  searchBar: {
    padding: '8px 10px',
    borderBottom: '1px solid #f1f5f9',
    flexShrink: 0,
  },
  searchInput: {
    width: '100%',
    padding: '6px 10px',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    fontSize: 12,
    outline: 'none',
    background: '#f8fafc',
    color: '#374151',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  categoryGroup: {
    marginBottom: 2,
  },
  categoryHeader: {
    padding: '8px 10px 4px',
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  sectionCard: (inserting) => ({
    margin: '3px 8px',
    padding: '10px 12px',
    background: inserting ? '#eff6ff' : '#f8fafc',
    border: inserting ? '1px solid #93c5fd' : '1px solid #e2e8f0',
    borderRadius: 8,
    cursor: inserting ? 'wait' : 'pointer',
    transition: 'background 0.12s, border-color 0.12s, transform 0.1s',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    userSelect: 'none',
  }),
  cardIcon: {
    fontSize: 20,
    flexShrink: 0,
    lineHeight: 1,
    marginTop: 1,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 2,
  },
  cardPreview: {
    fontSize: 10,
    color: '#94a3b8',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  insertBadge: {
    fontSize: 9,
    fontWeight: 700,
    color: '#2563eb',
    background: '#dbeafe',
    borderRadius: 4,
    padding: '1px 5px',
    flexShrink: 0,
    marginTop: 2,
  },
  emptyState: {
    padding: '24px 16px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 1.6,
  },
  tip: {
    padding: '10px 12px',
    margin: '8px 8px 12px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 6,
    fontSize: 10,
    color: '#16a34a',
    lineHeight: 1.5,
    flexShrink: 0,
  },
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({ item, onInsert }) {
  const [inserting, setInserting] = useState(false)

  async function handleClick() {
    if (inserting) return
    setInserting(true)
    try {
      await onInsert(item)
    } finally {
      setTimeout(() => setInserting(false), 400)
    }
  }

  return (
    <div
      style={S.sectionCard(inserting)}
      onClick={handleClick}
      title={item.desc}
      onMouseEnter={e => {
        if (!inserting) {
          e.currentTarget.style.background = '#eff6ff'
          e.currentTarget.style.borderColor = '#bfdbfe'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={e => {
        if (!inserting) {
          e.currentTarget.style.background = '#f8fafc'
          e.currentTarget.style.borderColor = '#e2e8f0'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      <span style={S.cardIcon}>{item.icon}</span>
      <div style={S.cardBody}>
        <div style={S.cardLabel}>{item.label}</div>
        <div style={S.cardPreview}>{item.preview}</div>
      </div>
      {inserting && <span style={S.insertBadge}>✓ OK</span>}
    </div>
  )
}

// ─── SectionsPanel ────────────────────────────────────────────────────────────

/**
 * SectionsPanel — library of pre-built section templates.
 *
 * Clicking a template inserts it at the end of the _root children list.
 * Supports text search across template labels + descriptions.
 */
export function SectionsPanel() {
  const [query, setQuery] = useState('')

  const handleInsert = useCallback(async (item) => {
    const root = registry.getRoot()
    if (!root) return

    // Deep-clone the template tree to avoid shared references
    const tree = JSON.parse(JSON.stringify(item.tree))

    // Insert at end of root's children
    const newNode = root.addChild(tree, root.children.length, true)
    useAppStore.getState().syncHistoryState()

    // Select the new section and scroll it into view
    useAppStore.getState().selectElement(newNode.$id)

    // Switch to Layers tab so user can see the new node
    useAppStore.getState().setActiveLeftTab('layers')
  }, [])

  // Filter templates by search query
  const q = query.toLowerCase().trim()
  const filtered = SECTION_TEMPLATES.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !q ||
      item.label.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.preview.toLowerCase().includes(q) ||
      cat.category.toLowerCase().includes(q)
    )
  })).filter(cat => cat.items.length > 0)

  return (
    <div style={S.root}>
      {/* Search */}
      <div style={S.searchBar}>
        <input
          style={S.searchInput}
          placeholder="🔍 Tìm section..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Template list */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {filtered.length === 0 ? (
          <div style={S.emptyState}>
            Không tìm thấy section nào<br />
            <span style={{ fontSize: 10 }}>Thử từ khóa khác</span>
          </div>
        ) : (
          filtered.map(cat => (
            <div key={cat.category} style={S.categoryGroup}>
              <div style={S.categoryHeader}>
                {cat.category}
              </div>
              {cat.items.map(item => (
                <SectionCard
                  key={item.id}
                  item={item}
                  onInsert={handleInsert}
                />
              ))}
            </div>
          ))
        )}

        <div style={S.tip}>
          <strong>Tip:</strong> Click vào section để chèn ngay vào cuối trang.
          Sau đó chỉnh sửa nội dung trong Properties panel.
        </div>
      </div>
    </div>
  )
}
