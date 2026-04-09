import { useState, useCallback, useRef, useEffect } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useAppStore, registry } from '../../store/appStore.js'
import { getElementDef } from '../../data/elementDefs.js'

/**
 * LayersPanel — hierarchical tree view of the page element tree.
 *
 * Drag-reorder design:
 *  - LayerDropZone components are ALWAYS mounted (not conditionally rendered)
 *    so dnd-kit has them registered before a drag starts → no timing gap.
 *  - The draggable ref (setDragRef) is placed on the row container (always
 *    mounted 28px element) → stable rect for dnd-kit collision detection.
 *  - Listeners are on the drag handle icon only → only handle activates drag.
 *  - Drop zones are 14px tall (large hit area) with a 2px visual line.
 */
export function LayersPanel() {
  const _sv = useAppStore(s =>
    Object.values(s.structureVersions).reduce((a, b) => a + b, 0)
  )

  const root = registry.getRoot()
  if (!root) {
    return (
      <div style={emptyStyle}>
        <span>No page loaded</span>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
      <ChildList parentNode={root} depth={0} />
    </div>
  )
}

// ─── ChildList ────────────────────────────────────────────────────────────────
// Renders a sibling group with LayerDropZones between each row.
// Drop zones are ALWAYS mounted so dnd-kit registers them before drag starts.

function ChildList({ parentNode, depth }) {
  const children = parentNode.children

  if (!Array.isArray(children) || children.length === 0) {
    // Empty container: single drop zone for inserting first child
    return <LayerDropZone id={`drop:${parentNode.$id}:0`} depth={depth} />
  }

  return (
    <div>
      {/* Zone before first child */}
      <LayerDropZone id={`drop:${parentNode.$id}:0`} depth={depth} />

      {children.map((child, i) => (
        <div key={child.$id}>
          <LayerNode node={child} depth={depth} />
          {/* Zone after each child (= insert at i+1) */}
          <LayerDropZone id={`drop:${parentNode.$id}:${i + 1}`} depth={depth} />
        </div>
      ))}
    </div>
  )
}

// ─── LayerDropZone ────────────────────────────────────────────────────────────
// Always mounted. 14px tall hit area — visual line shows only during move drag.

function LayerDropZone({ id, depth }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const isDragging = useAppStore(s => s.isDragging)
  const dragType  = useAppStore(s => s.dragType)
  const active = isDragging && dragType === 'move'

  const INDENT = 14
  const indent = 4 + depth * INDENT

  return (
    <div
      ref={setNodeRef}
      style={{
        // 14px height = reliable hit area; visual line is centered inside
        height: 14,
        position: 'relative',
        zIndex: 10,
        // Pointer events always on so droppable is registered even pre-drag
        pointerEvents: 'all',
      }}
    >
      {/* Visual indicator — only visible during an active move drag */}
      {active && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: indent,
            right: 4,
            height: isOver ? 3 : 2,
            background: isOver ? '#2563eb' : 'rgba(37,99,235,0.15)',
            transform: 'translateY(-50%)',
            borderRadius: 2,
            transition: 'background 80ms, height 80ms',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Dot caps — only when isOver */}
      {active && isOver && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: indent - 4,
              transform: 'translateY(-50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#2563eb',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#2563eb',
              pointerEvents: 'none',
            }}
          />
        </>
      )}
    </div>
  )
}

// ─── LayerNode ────────────────────────────────────────────────────────────────

function LayerNode({ node, depth }) {
  const [expanded, setExpanded] = useState(true)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const inputRef = useRef(null)

  const isSelected  = useAppStore(s => s.selectedId === node.$id)
  const isDraggingAny = useAppStore(s => s.isDragging)
  const _ov = useAppStore(s => s.optionVersions[node.$id] ?? 0)

  const def = getElementDef(node.tag)
  const hasChildren = Array.isArray(node.children) && node.children.length > 0
  const isParent = Array.isArray(node.children)
  const displayName = node.optionValues?._name || def.label

  /**
   * FIX: setDragRef is placed on the ROW container (always mounted, 28px tall).
   * This gives dnd-kit a stable element rect for collision detection even when
   * the handle icon toggles visibility.
   * listeners are placed on the drag handle div only → only handle activates drag.
   */
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: `layer:${node.$id}`,
    data: {
      type: 'move',
      nodeId: node.$id,
      tag: node.tag,
      icon: def.icon,
      label: displayName,
    },
  })

  // ── Rename ──────────────────────────────────────────────────────────────────

  const startRename = useCallback((e) => {
    e.stopPropagation()
    setRenameValue(node.optionValues?._name || '')
    setIsRenaming(true)
  }, [node])

  const commitRename = useCallback(() => {
    const trimmed = renameValue.trim()
    node.options._name = trimmed || null
    setIsRenaming(false)
  }, [renameValue, node])

  const handleRenameKeyDown = useCallback((e) => {
    if (e.key === 'Enter') { e.preventDefault(); commitRename() }
    if (e.key === 'Escape') { setIsRenaming(false); setRenameValue('') }
    e.stopPropagation()
  }, [commitRename])

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleRowClick = useCallback(() => {
    useAppStore.getState().selectElement(node.$id)
  }, [node.$id])

  const handleToggle = useCallback((e) => {
    e.stopPropagation()
    setExpanded(o => !o)
  }, [])

  const INDENT = 14
  const paddingLeft = 4 + depth * INDENT

  return (
    <div>
      {/* ── Row container — drag ref lives here (always mounted) ──────── */}
      <div
        ref={setDragRef}          // ← stable 28px element for dnd-kit rect
        {...attributes}            // ← accessibility (aria-*, role, tabIndex)
        onClick={handleRowClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 28,
          paddingLeft,
          paddingRight: 4,
          gap: 1,
          background: isSelected ? '#eff6ff' : 'transparent',
          borderLeft: isSelected ? '2px solid #2563eb' : '2px solid transparent',
          cursor: 'pointer',
          opacity: isDragging ? 0.3 : 1,
          userSelect: 'none',
          transition: 'background 80ms, opacity 80ms',
          boxSizing: 'border-box',
        }}
        onMouseEnter={e => {
          if (!isSelected) e.currentTarget.style.background = '#f8fafc'
        }}
        onMouseLeave={e => {
          if (!isSelected) e.currentTarget.style.background = 'transparent'
        }}
      >
        {/* Expand / collapse toggle */}
        <button
          onClick={handleToggle}
          style={{
            width: 16, height: 16, padding: 0, border: 'none',
            background: 'none',
            cursor: isParent ? 'pointer' : 'default',
            flexShrink: 0,
            color: hasChildren ? '#94a3b8' : 'transparent',
            fontSize: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}
          tabIndex={-1}
        >
          {isParent ? (hasChildren ? (expanded ? '▾' : '▸') : '▸') : ''}
        </button>

        {/* Element icon */}
        <span
          style={{
            fontSize: 11, width: 18, textAlign: 'center', flexShrink: 0,
            color: isSelected ? '#2563eb' : '#64748b', lineHeight: 1,
          }}
        >
          {def.icon}
        </span>

        {/* Label or rename input */}
        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleRenameKeyDown}
            onClick={e => e.stopPropagation()}
            placeholder={def.label}
            style={{
              flex: 1, fontSize: 11, fontWeight: 500, color: '#1d4ed8',
              border: '1px solid #93c5fd', borderRadius: 3,
              padding: '1px 5px', outline: 'none', background: '#eff6ff',
              lineHeight: '20px', height: 22, boxSizing: 'border-box', minWidth: 0,
            }}
          />
        ) : (
          <span
            onDoubleClick={startRename}
            title="Double-click to rename"
            style={{
              flex: 1, fontSize: 11,
              fontWeight: isSelected ? 600 : 400,
              color: node.optionValues?._name
                ? (isSelected ? '#1d4ed8' : '#1e293b')
                : (isSelected ? '#1d4ed8' : '#374151'),
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              lineHeight: '28px', cursor: 'pointer',
            }}
          >
            {displayName}
          </span>
        )}

        {/* Empty badge */}
        {isParent && !hasChildren && !isRenaming && (
          <span style={{ fontSize: 9, color: '#cbd5e1', marginRight: 2, flexShrink: 0 }}>
            empty
          </span>
        )}

        {/* Drag handle — listeners ONLY here (not on row) to limit activation area.
            Always rendered (not conditioned on isDraggingAny) so the row stays
            stable and doesn't lose the dnd-kit ref. Fades during drag. */}
        {!isRenaming && (
          <div
            {...listeners}          // ← pointer events that activate drag
            onClick={e => e.stopPropagation()}
            title="Drag to reorder"
            style={{
              cursor: isDragging ? 'grabbing' : (isDraggingAny ? 'default' : 'grab'),
              color: isDraggingAny && !isDragging ? 'transparent' : '#d1d5db',
              padding: '0 3px',
              flexShrink: 0,
              fontSize: 13,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '-1px',
              transition: 'color 120ms',
            }}
          >
            ⠿
          </div>
        )}
      </div>

      {/* ── Children (recursive) ──────────────────────────────────────── */}
      {isParent && expanded && (
        <ChildList parentNode={node} depth={depth + 1} />
      )}
    </div>
  )
}

// ─── Style constants ──────────────────────────────────────────────────────────

const emptyStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
  fontSize: 12,
}
