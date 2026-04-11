import { useState, useCallback } from 'react'
import { useDraggable } from '@dnd-kit/core'
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
  sectionCard: {
    margin: '3px 8px',
    padding: '10px 12px 10px 20px', // left padding = room for drag handle
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 0.12s, border-color 0.12s, transform 0.1s',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    userSelect: 'none',
    position: 'relative',
  },
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

/**
 * SectionCard — supports both:
 *  1. Click → insert at end of page (quick)
 *  2. Drag → drop at any DropZone on canvas (precise placement)
 *
 * Drag data: { type:'section', sectionTree, label, icon }
 * DragDropContext handles the actual addChild() on drop.
 */
function SectionCard({ item, onInsert }) {
  const [inserting, setInserting] = useState(false)
  const [hovered, setHovered]     = useState(false)

  // ─ Draggable setup ────────────────────────────────────────────────────────
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `section-drag-${item.id}`,
    data: {
      type: 'section',
      sectionTree: item.tree,
      label: item.label,
      icon: item.icon,
    },
  })

  async function handleClick(e) {
    // Don't trigger click after a drag
    if (isDragging || inserting) return
    setInserting(true)
    try {
      await onInsert(item)
    } finally {
      setTimeout(() => setInserting(false), 400)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...S.sectionCard,
        opacity: isDragging ? 0.4 : 1,
        background: inserting
          ? '#eff6ff'
          : hovered && !isDragging
          ? '#eff6ff'
          : '#f8fafc',
        borderColor: inserting
          ? '#93c5fd'
          : hovered && !isDragging
          ? '#bfdbfe'
          : '#e2e8f0',
        transform: hovered && !inserting && !isDragging
          ? 'translateY(-1px)'
          : 'translateY(0)',
      }}
      onClick={handleClick}
      title="Click: chèn vào cuối trang · Kéo: thả vào vị trí bất kỳ"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Drag handle — grip dots, always present but fade in on hover */}
      <div
        {...listeners}
        {...attributes}
        onClick={e => e.stopPropagation()}
        title="Kéo để chọn vị trí"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s',
          borderRadius: '8px 0 0 8px',
          background: hovered ? 'rgba(99,102,241,0.08)' : 'transparent',
        }}
      >
        {/* 3×2 grip dots */}
        <svg width="6" height="14" viewBox="0 0 6 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="1.5" cy="2"  r="1.5" fill="#6366f1"/>
          <circle cx="4.5" cy="2"  r="1.5" fill="#6366f1"/>
          <circle cx="1.5" cy="7"  r="1.5" fill="#6366f1"/>
          <circle cx="4.5" cy="7"  r="1.5" fill="#6366f1"/>
          <circle cx="1.5" cy="12" r="1.5" fill="#6366f1"/>
          <circle cx="4.5" cy="12" r="1.5" fill="#6366f1"/>
        </svg>
      </div>

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
 * Each card supports:
 *  • Click → insert at the END of the current page (quick action)
 *  • Drag → drop between any DropZone strips on the canvas (precise placement)
 *
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
          <strong>Click</strong> để chèn vào cuối trang.{' '}
          <strong>Kéo</strong> để thả vào đúng vị trí trên canvas.
        </div>
      </div>
    </div>
  )
}
