import { useDroppable } from '@dnd-kit/core'
import { useAppStore } from '../../store/appStore.js'

/**
 * DropZone — thin horizontal strip between sibling elements.
 *
 * Renders as an invisible 10px strip. When the dragged item is over it,
 * shows a 3px blue horizontal line with dot-caps (UX Builder style).
 *
 * Only visible during an active drag (isDragging from store).
 *
 * @param {{ id: string }} props
 */
export function DropZone({ id }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  const isDragging = useAppStore(s => s.isDragging)
  const dragType = useAppStore(s => s.dragType)

  // Layer 'move' drags use LayerDropZones in the panel — not canvas strips
  // 'section' drags from SectionsPanel DO show canvas drop zones
  if (!isDragging || dragType === 'move') return null

  return (
    <div
      ref={setNodeRef}
      data-dropzone={id}
      style={{
        position: 'relative',
        height: 10,
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Invisible wider hover target — fills the strip + extra area */}
      <div
        style={{
          position: 'absolute',
          top: -4,
          left: 0,
          right: 0,
          bottom: -4,
          zIndex: 0,
        }}
      />

      {/* Visual indicator — only when isOver */}
      {isOver && (
        <>
          {/* Center line */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 8,
              right: 8,
              height: 3,
              background: '#2563eb',
              transform: 'translateY(-50%)',
              borderRadius: 2,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          {/* Left dot */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: '#2563eb',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          {/* Right dot */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: 0,
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: '#2563eb',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </>
      )}
    </div>
  )
}

/**
 * EmptyDropZone — shown inside empty parent containers during a drag.
 * Displays a dashed rect with instructional text, lights up blue on hover.
 *
 * @param {{ id: string }} props
 */
export function EmptyDropZone({ id }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  const isDragging = useAppStore(s => s.isDragging)
  const dragType = useAppStore(s => s.dragType)

  if (!isDragging || dragType === 'move') return null

  return (
    <div
      ref={setNodeRef}
      data-dropzone={id}
      style={{
        minHeight: dragType === 'section' ? 80 : 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `2px dashed ${isOver ? '#2563eb' : '#94a3b8'}`,
        borderRadius: 6,
        background: isOver ? 'rgba(37,99,235,0.06)' : 'rgba(148,163,184,0.04)',
        color: isOver ? '#2563eb' : '#94a3b8',
        fontSize: 11,
        fontWeight: 500,
        transition: 'border-color 120ms, background 120ms, color 120ms',
        margin: '4px',
        cursor: 'default',
        pointerEvents: 'all',
        zIndex: 20,
      }}
    >
      {isOver ? '↓ Drop here' : '⊕ Drop elements here'}
    </div>
  )
}
