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

function combinedCollision(args) {
  const inner = pointerWithin(args)
  return inner.length > 0 ? inner : rectIntersection(args)
}

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
    let targetParent = null
    let insertIndex = -1

    // === Trường hợp 1: Thả vào DropZone ===
    if (overId.startsWith('drop:')) {
      const body = overId.slice(5)
      const sepIdx = body.lastIndexOf(':')
      if (sepIdx >= 0) {
        const parentId = body.slice(0, sepIdx)
        const idx = parseInt(body.slice(sepIdx + 1), 10)
        targetParent = registry.get(parentId)
        if (!isNaN(idx)) insertIndex = idx
      }
    } else {
      // === Trường hợp 2: Thả trực tiếp lên element (fallback) ===
      const overNode = registry.get(overId)
      if (!overNode) return

      // Nếu phần tử đích là container và cho phép tag đang kéo → thêm vào cuối
      if (overNode.isParent && overNode.allows(dragData.tag)) {
        targetParent = overNode
        insertIndex = overNode.children.length
      } else {
        // Ngược lại, thêm vào sau phần tử đó (cùng cha)
        const parent = overNode.parent
        if (parent && parent.allows(dragData.tag)) {
          targetParent = parent
          insertIndex = overNode.index + 1
        }
      }
    }

    if (!targetParent || !Array.isArray(targetParent.children)) return
    if (!targetParent.allows(dragData.tag)) return

    // === Xử lý di chuyển node có sẵn ===
    if (dragData.type === 'move' || dragData.type === 'canvas-move') {
      const movingNode = registry.get(dragData.nodeId)
      if (!movingNode) return

      if (targetParent.isSelfOrDescendantOf(movingNode)) return
      if (!targetParent.allows(movingNode.tag)) return

      const originalParent = movingNode._parent
      const originalIndex = movingNode.index
      let targetIndex = insertIndex
      if (originalParent === targetParent && originalIndex < insertIndex) {
        targetIndex = insertIndex - 1
      }

      movingNode.detach()
      targetParent.addChild(movingNode, targetIndex, true)
      useAppStore.getState().syncHistoryState()
      useAppStore.getState().selectElement(movingNode.$id)
      return
    }

    // === Section template ===
    if (dragData.type === 'section') {
      if (!dragData.sectionTree) return
      const tree = JSON.parse(JSON.stringify(dragData.sectionTree))
      const newNode = targetParent.addChild(tree, insertIndex, true)
      useAppStore.getState().syncHistoryState()
      useAppStore.getState().selectElement(newNode.$id)
      useAppStore.getState().setActiveLeftTab('layers')
      return
    }

    // === Palette (element mới) ===
    if (!dragData.defaultTree) return
    const tree = JSON.parse(JSON.stringify(dragData.defaultTree))
    const newNode = targetParent.addChild(tree, insertIndex, true)
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
      <DragOverlay dropAnimation={null}>
        {overlayData && (
          <div style={{
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
          }}>
            <span>{overlayData.icon}</span>
            <span>{overlayData.label}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}