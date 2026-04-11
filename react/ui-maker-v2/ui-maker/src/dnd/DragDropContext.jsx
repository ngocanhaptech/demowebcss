import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core'
import { registry, useAppStore } from '../store/appStore.js'

/**
 * Combine pointerWithin + rectIntersection for reliable hit detection.
 * pointerWithin is preferred when the pointer is inside a droppable.
 * rectIntersection is the fallback when no droppable contains the pointer.
 */
function combinedCollision(args) {
  const inner = pointerWithin(args)
  return inner.length > 0 ? inner : rectIntersection(args)
}

/**
 * DragDropContext — wraps the editor with @dnd-kit/core DndContext.
 *
 * Handles the full drag lifecycle:
 *  1. onDragStart  → store.setDragging(data)  — canvas shows DropZones
 *  2. onDragOver   → @dnd-kit handles internally
 *  3. onDragEnd    → parse drop zone id → parentNode.addChild() → select new node
 *  4. onDragCancel → store.setDragging(null)
 *
 * Drop zone id format: "drop:{parentId}:{insertIndex}"
 *  parentId    — $id of the parent ElementNode to insert into
 *  insertIndex — position in children array (0 = before first, length = after last)
 */
export function DragDropContext({ children }) {
  const [overlayData, setOverlayData] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = useCallback(({ active }) => {
    const data = active.data.current
    if (!data) return
    setOverlayData(data)
    useAppStore.getState().setDragging(data)
  }, [])

  const handleDragCancel = useCallback(() => {
    setOverlayData(null)
    useAppStore.getState().setDragging(null)
  }, [])

  const handleDragEnd = useCallback(({ active, over }) => {
    setOverlayData(null)
    useAppStore.getState().setDragging(null)

    if (!over || !active) return

    const dragData = active.data.current
    if (!dragData) return

    const overId = String(over.id)
    if (!overId.startsWith('drop:')) return

    // Parse "drop:{parentId}:{insertIndex}"
    // Use lastIndexOf to handle parentIds that contain colons
    const body = overId.slice(5)
    const sepIdx = body.lastIndexOf(':')
    if (sepIdx < 0) return

    const parentId = body.slice(0, sepIdx)
    const insertIndex = parseInt(body.slice(sepIdx + 1), 10)
    if (isNaN(insertIndex)) return

    const parentNode = registry.get(parentId)
    if (!parentNode || !Array.isArray(parentNode.children)) return

    if (dragData.type === 'move' || dragData.type === 'canvas-move') {
      // Moving an existing node — from Layers panel OR canvas drag handle
      const movingNode = registry.get(dragData.nodeId)
      if (!movingNode) return
      // Prevent circular: target parent cannot be inside the moving node
      if (parentNode.isSelfOrDescendantOf(movingNode)) return
      if (!parentNode.allows(movingNode.tag)) return

      // When moving within the SAME parent, detaching shifts later siblings
      // one index down — compensate so the visual drop position is exact.
      const originalParent = movingNode._parent
      const originalIndex  = movingNode.index
      let targetIndex = insertIndex
      if (originalParent === parentNode && originalIndex < insertIndex) {
        targetIndex = insertIndex - 1
      }

      movingNode.detach()
      parentNode.addChild(movingNode, targetIndex, true)
      useAppStore.getState().syncHistoryState()
      useAppStore.getState().selectElement(movingNode.$id)
      return
    }

    // Section drop — type: 'section' from SectionsPanel
    if (dragData.type === 'section') {
      if (!dragData.sectionTree) return
      const tree = JSON.parse(JSON.stringify(dragData.sectionTree))
      const newNode = parentNode.addChild(tree, insertIndex, true)
      useAppStore.getState().syncHistoryState()
      useAppStore.getState().selectElement(newNode.$id)
      // Auto-switch to Layers so user sees the new section
      useAppStore.getState().setActiveLeftTab('layers')
      return
    }

    // Palette drop — type: 'new' or no type field
    if (!dragData.defaultTree) return
    if (!parentNode.allows(dragData.tag)) return

    // Deep clone the template to avoid shared references
    const tree = JSON.parse(JSON.stringify(dragData.defaultTree))
    const newNode = parentNode.addChild(tree, insertIndex, true)

    useAppStore.getState().syncHistoryState()
    useAppStore.getState().selectElement(newNode.$id)
  }, [])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={combinedCollision}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      {children}

      {/* DragOverlay renders in a portal — not clipped by overflow:hidden */}
      <DragOverlay dropAnimation={null}>
        {overlayData ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              background: '#2563eb',
              color: '#fff',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              boxShadow: '0 6px 20px rgba(37,99,235,0.45)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            <span>{overlayData.icon}</span>
            <span>{overlayData.label}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
