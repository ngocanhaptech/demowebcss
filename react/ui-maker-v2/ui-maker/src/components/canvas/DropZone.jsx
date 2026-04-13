import { useDroppable } from '@dnd-kit/core'
import { useAppStore } from '../../store/appStore.js'

/**
 * DropZone — thin horizontal strip between sibling elements.
 * Renders an invisible drop target with a visual indicator when hovered.
 */
export function DropZone({ id }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  const isDragging = useAppStore(s => s.isDragging)
  const dragType = useAppStore(s => s.dragType)

  if (!isDragging || dragType === 'move') return null

  return (
    <div
      ref={setNodeRef}
      data-dropzone={id}
      style={{
        position: 'relative',
        height: 24,               // Tăng chiều cao vùng hit
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {isOver && (
        <>
          <div style={{
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
          }} />
          <div style={{
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
          }} />
          <div style={{
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
          }} />
        </>
      )}
    </div>
  )
}

/**
 * EmptyDropZone — shown inside empty parent containers during a drag.
 * Displays a dashed rectangle with text, lights up blue on hover.
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