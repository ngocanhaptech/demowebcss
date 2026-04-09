import { useAppStore, registry } from '../store/appStore.js'

/**
 * Returns the currently selected ElementNode, or null.
 * Re-renders only when selectedId changes.
 * @returns {import('../core/ElementNode.js').ElementNode|null}
 */
export function useSelectedNode() {
  const selectedId = useAppStore(s => s.selectedId)
  if (!selectedId) return null
  return registry.get(selectedId) ?? null
}

/**
 * Returns the current viewport mode string.
 * @returns {'mobile'|'tablet'|'desktop'}
 */
export function useViewportMode() {
  return useAppStore(s => s.viewportMode)
}

/**
 * Returns the current breakpoint index (0=mobile, 1=tablet, 2=desktop).
 * @returns {0|1|2}
 */
export function useBreakpoint() {
  return useAppStore(s => s.breakpoint)
}

/**
 * Returns undo/redo availability flags.
 * @returns {{ canUndo: boolean, canRedo: boolean }}
 */
export function useHistoryState() {
  return useAppStore(s => ({ canUndo: s.canUndo, canRedo: s.canRedo }))
}

/**
 * Returns left/right panel visibility and the active left tab.
 */
export function usePanels() {
  return useAppStore(s => ({
    showLeftPanel: s.showLeftPanel,
    showRightPanel: s.showRightPanel,
    activeLeftTab: s.activeLeftTab,
  }))
}
