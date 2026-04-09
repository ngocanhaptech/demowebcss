import { memo, useCallback } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useAppStore, registry } from '../../store/appStore.js'
import { ControllerRegistry } from '../../controllers/registry.js'
import { ResponsiveManager } from '../../core/ResponsiveManager.js'
import { getElementDef } from '../../data/elementDefs.js'
import { ElementRenderer } from './ElementRenderer.jsx'

/**
 * ElementWrapper — renders one ElementNode as its semantic HTML tag.
 *
 * Fine-grained subscriptions (D4):
 *  - optionVersions[nodeId] → re-render when THIS node's options change
 *  - selectedId / outlinedId → re-render only when THIS node's selection changes
 *  - breakpoint → re-render when viewport changes
 *
 * Canvas drag-sort (Phase 5):
 *  - useDraggable with type:'canvas-move' on each element
 *  - setDragRef on the element itself for stable rect tracking
 *  - listeners on a floating handle (⠿) that appears on hover/select
 *  - DragDropContext handles 'canvas-move' identically to 'move'
 */
export const ElementWrapper = memo(function ElementWrapper({ nodeId }) {
  const _optV      = useAppStore(s => s.optionVersions[nodeId] ?? 0)
  const isSelected = useAppStore(s => s.selectedId === nodeId)
  const isOutlined = useAppStore(s => s.outlinedId === nodeId)
  const breakpoint = useAppStore(s => s.breakpoint)

  const node = registry.get(nodeId)
  if (!node) return null

  const controller = ControllerRegistry.get(node.tag)
  if (!controller) return null

  const def = getElementDef(node.tag)
  const displayName = node.optionValues?._name || def.label

  // Resolve options at current breakpoint
  const resolvedOpts = ResponsiveManager.resolveAll(
    node.optionValues,
    node.responsiveValues,
    breakpoint
  )
  const baseStyle = controller.resolveBaseStyle(resolvedOpts)

  // Selection / hover outline
  const interactionStyle = isSelected
    ? { outline: '2px solid #2563eb', outlineOffset: '2px', position: 'relative' }
    : isOutlined
    ? { outline: '1px dashed #93c5fd', outlineOffset: '2px', position: 'relative' }
    : { position: 'relative' }

  const style = { ...baseStyle, ...interactionStyle }

  const Tag = controller.getHtmlTag(node)

  // ── Canvas drag-sort ────────────────────────────────────────────────────────
  const {
    attributes: dragAttr,
    listeners: dragListeners,
    setNodeRef: setDragRef,
    isDragging: isDraggingThis,
  } = useDraggable({
    id: `canvas:${nodeId}`,
    data: {
      type: 'canvas-move',
      nodeId,
      tag: node.tag,
      icon: def.icon,
      label: displayName,
    },
  })

  // ── Interaction handlers ─────────────────────────────────────────────────────
  const handleClick = useCallback((e) => {
    e.stopPropagation()
    useAppStore.getState().selectElement(nodeId)
  }, [nodeId])

  const handleMouseOver = useCallback((e) => {
    e.stopPropagation()
    useAppStore.getState().outlineElement(nodeId)
  }, [nodeId])

  const handleHandleClick = useCallback((e) => {
    e.stopPropagation()
    useAppStore.getState().selectElement(nodeId)
  }, [nodeId])

  // Fade the element while it is being dragged
  const elementStyle = { ...style, opacity: isDraggingThis ? 0.35 : 1 }

  // Drag handle — shown when element is selected or outlined
  const showHandle = (isSelected || isOutlined) && !isDraggingThis
  const handle = showHandle ? (
    <span
      {...dragListeners}
      onClick={handleHandleClick}
      title={`Drag to reorder · ${displayName}`}
      style={{
        position: 'absolute',
        top: 3,
        left: 3,
        zIndex: 500,
        width: 20,
        height: 20,
        background: isSelected ? '#2563eb' : '#93c5fd',
        borderRadius: 4,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        color: '#fff',
        fontSize: 11,
        letterSpacing: '-1px',
        lineHeight: 1,
        userSelect: 'none',
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }}
    >
      ⠿
    </span>
  ) : null

  // ── Void-element branch (e.g. <img>) — cannot contain children ────────────
  const isVoid = typeof controller.isVoidElement === 'function' && controller.isVoidElement()

  if (isVoid) {
    const extraAttrs  = controller.resolveAttrs?.(resolvedOpts) ?? {}
    // Extract margin from baseStyle to apply on wrapper div; rest goes on the <img>
    const { marginTop, marginBottom, ...imgOnlyStyle } = baseStyle
    const wrapperStyle = {
      ...interactionStyle,
      display: 'block',
      opacity: isDraggingThis ? 0.35 : 1,
      ...(marginTop    != null ? { marginTop }    : {}),
      ...(marginBottom != null ? { marginBottom } : {}),
    }
    return (
      <div
        ref={setDragRef}
        {...dragAttr}
        style={wrapperStyle}
        data-uid={nodeId}
        onClick={handleClick}
        onMouseOver={handleMouseOver}
      >
        {handle}
        <Tag style={imgOnlyStyle} {...extraAttrs} />
      </div>
    )
  }

  if (!node.isParent) {
    return (
      <Tag
        ref={setDragRef}
        {...dragAttr}
        style={elementStyle}
        data-uid={nodeId}
        onClick={handleClick}
        onMouseOver={handleMouseOver}
      >
        {handle}
        {node.content}
      </Tag>
    )
  }

  return (
    <Tag
      ref={setDragRef}
      {...dragAttr}
      style={elementStyle}
      data-uid={nodeId}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
    >
      {handle}
      <ElementRenderer nodeId={nodeId} />
    </Tag>
  )
})
