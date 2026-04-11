import { useDraggable } from '@dnd-kit/core'
import { ELEMENT_CATALOG, ELEMENT_TEMPLATES } from '../../dnd/elementTemplates.js'

/**
 * ElementsPalette — inner scrollable content of the elements panel.
 * Rendered by LeftPanel inside the "Elements" tab.
 * No outer wrapper — LeftPanel owns the 220px column.
 */
export function ElementsPalette() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 16px' }}>
      {ELEMENT_CATALOG.map(({ category, items }) => (
        <div key={category} style={{ marginBottom: 14 }}>
          <div
            style={{
              padding: '4px 6px 5px',
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#94a3b8',
            }}
          >
            {category}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 5,
            }}
          >
            {items.map(item => (
              <DraggableCard key={item.tag} item={item} />
            ))}
          </div>
        </div>
      ))}

      <div
        style={{
          marginTop: 12,
          padding: '8px 6px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 6,
          fontSize: 10,
          color: '#16a34a',
          lineHeight: 1.5,
        }}
      >
        <strong>Tip:</strong> Drag an element onto the canvas to add it.
        Drop between existing elements for precise placement.
      </div>
    </div>
  )
}

/**
 * ElementsPanel — standalone 220px left panel.
 * Kept for backward compatibility; App.jsx now uses LeftPanel which
 * embeds ElementsPalette directly.
 */
export function ElementsPanel() {
  return (
    <div
      style={{
        width: 220,
        minWidth: 220,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '11px 14px 9px',
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#64748b',
          borderBottom: '1px solid #e2e8f0',
          flexShrink: 0,
        }}
      >
        Elements
      </div>
      <ElementsPalette />
    </div>
  )
}

/**
 * DraggableCard — individual element card in the palette.
 * Uses @dnd-kit useDraggable; carries element metadata as drag data.
 */
function DraggableCard({ item }) {
  const { tag, icon, label, desc } = item
  const defaultTree = ELEMENT_TEMPLATES[tag]

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${tag}`,
    data: { tag, icon, label, desc, defaultTree },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={desc}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: '11px 4px',
        background: isDragging ? '#eff6ff' : '#f8fafc',
        border: isDragging ? '1px solid #93c5fd' : '1px solid #e2e8f0',
        borderRadius: 6,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        opacity: isDragging ? 0.35 : 1,
        transition: 'background 100ms, border-color 100ms, opacity 100ms',
        outline: 'none',
      }}
      onMouseEnter={e => {
        if (!isDragging) {
          e.currentTarget.style.background = '#eff6ff'
          e.currentTarget.style.borderColor = '#bfdbfe'
        }
      }}
      onMouseLeave={e => {
        if (!isDragging) {
          e.currentTarget.style.background = '#f8fafc'
          e.currentTarget.style.borderColor = '#e2e8f0'
        }
      }}
    >
      <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#475569',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  )
}
