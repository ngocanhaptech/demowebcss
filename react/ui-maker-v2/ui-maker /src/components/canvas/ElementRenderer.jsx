import { memo, Fragment } from 'react'
import { useAppStore, registry } from '../../store/appStore.js'
import { ElementWrapper } from './ElementWrapper.jsx'
import { DropZone, EmptyDropZone } from './DropZone.jsx'

/**
 * ElementRenderer — renders the children of a given parent node.
 *
 * Fine-grained subscriptions (D4):
 *  - structureVersions[nodeId] → re-render when THIS node's children list changes
 *  - isDragging / dragType     → toggle DropZone injection mode
 *
 * Canvas DropZones are shown for:
 *  - Palette drops  (dragType = null / undefined)
 *  - Canvas reorder (dragType = 'canvas-move')
 * NOT shown for layer-panel moves (dragType = 'move') — they use LayerDropZones.
 */
export const ElementRenderer = memo(function ElementRenderer({ nodeId }) {
  // eslint-disable-next-line no-unused-vars
  const _structV  = useAppStore(s => s.structureVersions[nodeId] ?? 0)
  const isDragging = useAppStore(s => s.isDragging)
  const dragType   = useAppStore(s => s.dragType)

  const node = registry.get(nodeId)
  if (!node?.children) return null

  // Show canvas drop zones for palette + canvas-move drags only
  const showDropZones = isDragging && dragType !== 'move'

  // ── Drag mode: inject DropZones ──────────────────────────────────────────
  if (showDropZones) {
    if (node.children.length === 0) {
      return <EmptyDropZone id={`drop:${nodeId}:0`} />
    }

    return (
      <>
        <DropZone id={`drop:${nodeId}:0`} />
        {node.children.map((child, i) => (
          <Fragment key={child.$id}>
            <ElementWrapper nodeId={child.$id} />
            <DropZone id={`drop:${nodeId}:${i + 1}`} />
          </Fragment>
        ))}
      </>
    )
  }

  // ── Normal mode ──────────────────────────────────────────────────────────
  return (
    <>
      {node.children.map(child => (
        <ElementWrapper key={child.$id} nodeId={child.$id} />
      ))}
    </>
  )
})
