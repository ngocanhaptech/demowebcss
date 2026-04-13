// src/components/canvas/ElementWrapper.jsx
import { memo, useCallback } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useAppStore, registry } from '../../store/appStore.js'
import { ControllerRegistry } from '../../controllers/registry.js'
import { ResponsiveManager } from '../../core/ResponsiveManager.js'
import { getElementDef } from '../../data/elementDefs.js'
import { ElementRenderer } from './ElementRenderer.jsx'

// Danh sách các tag được coi là container layout (có thể chứa children)
const LAYOUT_CONTAINER_TAGS = new Set([
  'section', 'container', 'row', 'column', 'card', 'navbar'
])

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

  const resolvedOpts = ResponsiveManager.resolveAll(
    node.optionValues,
    node.responsiveValues,
    breakpoint
  )
  const baseStyle = controller.resolveBaseStyle(resolvedOpts)

  // Kiểm tra nếu đây là container layout và hiện đang rỗng
  const isLayoutContainer = LAYOUT_CONTAINER_TAGS.has(node.tag)
  const isEmptyContainer = isLayoutContainer &&
    Array.isArray(node.children) &&
    node.children.length === 0

  // Style tạm thời cho container rỗng để người dùng dễ nhìn thấy
  const emptyContainerStyle = isEmptyContainer
    ? {
        minHeight: '50px',
        backgroundColor: 'rgba(148, 163, 184, 0.08)',
        outline: '1px dashed #cbd5e1',
        outlineOffset: '-1px',
      }
    : {}

  const interactionStyle = isSelected
    ? { outline: '2px solid #2563eb', outlineOffset: '2px', position: 'relative' }
    : isOutlined
    ? { outline: '1px dashed #93c5fd', outlineOffset: '2px', position: 'relative' }
    : { position: 'relative' }

  // Merge style: base -> empty container (nếu có) -> interaction
  const style = { ...baseStyle, ...emptyContainerStyle, ...interactionStyle }

  const Tag = controller.getHtmlTag(node)

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

  const elementStyle = { ...style, opacity: isDraggingThis ? 0.35 : 1 }

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

  const isVoid = typeof controller.isVoidElement === 'function' && controller.isVoidElement()

  if (isVoid) {
    const extraAttrs  = controller.resolveAttrs?.(resolvedOpts) ?? {}
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