import { useCallback } from 'react'
import { useAppStore, registry } from '../../store/appStore.js'
import { ViewportFrame } from './ViewportFrame.jsx'
import { ElementRenderer } from './ElementRenderer.jsx'

/**
 * Canvas — the main editable surface.
 *
 * Renders the page tree from ElementRegistry starting at the root node.
 * The root node (_root) is not selectable — only its children are.
 *
 * Subscribes to `treeVersion` so it re-renders when openPage() replaces
 * the entire registry tree (e.g. after loading a JSON file).
 *
 * Hover behavior: onMouseLeave clears the outlined element so no ghost
 * highlight remains after the mouse exits the canvas.
 *
 * Click on canvas background (not on any element) deselects.
 */
export function Canvas() {
  // eslint-disable-next-line no-unused-vars
  const _treeVersion = useAppStore(s => s.treeVersion)

  const rootNode = registry.getRoot()

  const handleCanvasClick = useCallback(() => {
    useAppStore.getState().selectElement(null)
  }, [])

  const handleMouseLeave = useCallback(() => {
    useAppStore.getState().outlineElement(null)
  }, [])

  if (!rootNode) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: 14,
        fontFamily: 'system-ui',
      }}>
        Loading canvas…
      </div>
    )
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        background: '#e8edf3',
        padding: '24px 24px 80px',
      }}
      onClick={handleCanvasClick}
      onMouseLeave={handleMouseLeave}
    >
      <ViewportFrame>
        {/* _root renders its children; root itself is not selectable */}
        <ElementRenderer nodeId={rootNode.$id} />
      </ViewportFrame>
    </div>
  )
}
