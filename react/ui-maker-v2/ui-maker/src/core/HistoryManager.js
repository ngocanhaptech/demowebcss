import { ACTION_TYPES, ElementNode } from './ElementNode.js'

/** Maximum number of history entries to keep in memory. */
const MAX_HISTORY = 200

/**
 * HistoryManager — undo/redo stack for page editing.
 *
 * Supports 6 action types (matching UX Builder's history system):
 *  ADD_ELEMENT, REMOVE_ELEMENT, MOVE_ELEMENT,
 *  UPDATE_OPTION, UPDATE_CONTENT, REORDER_CHILDREN
 *
 * Design:
 *  - `_stack[_cursor]` is the last committed action.
 *  - `undo()` decrements cursor and applies the reverse operation.
 *  - `redo()` increments cursor and re-applies the forward operation.
 *  - `push()` truncates any redo tail before appending.
 *  - `pause()`/`resume()` prevent recording during undo/redo replay.
 */
export class HistoryManager {
  /**
   * @param {import('./ElementRegistry.js').ElementRegistry} registry
   */
  constructor(registry) {
    this._registry = registry
    /** @type {object[]} */
    this._stack = []
    /** @type {number} index of the last committed action (-1 = empty) */
    this._cursor = -1
    this._paused = false
  }

  // ─── Stack Management ─────────────────────────────────────────────────────────

  /**
   * Append a new action. Truncates any redo entries that exist after the cursor.
   * Caps the stack at MAX_HISTORY entries.
   * @param {object} action
   */
  push(action) {
    if (this._paused) return

    // Discard all redo entries
    this._stack.splice(this._cursor + 1)
    this._stack.push(action)

    if (this._stack.length > MAX_HISTORY) {
      this._stack.shift()
    } else {
      this._cursor++
    }
  }

  /** @returns {boolean} */
  get canUndo() {
    return this._cursor >= 0
  }

  /** @returns {boolean} */
  get canRedo() {
    return this._cursor < this._stack.length - 1
  }

  /** @returns {number} total entries in the stack */
  get stackSize() {
    return this._stack.length
  }

  /** @returns {number} current cursor position */
  get cursor() {
    return this._cursor
  }

  /** Pause history recording (e.g. during undo/redo replay). */
  pause() {
    this._paused = true
  }

  /** Resume history recording. */
  resume() {
    this._paused = false
  }

  /** Clear all history. */
  clear() {
    this._stack = []
    this._cursor = -1
  }

  // ─── Undo / Redo ──────────────────────────────────────────────────────────────

  /** Undo the most recent action. No-op if stack is empty. */
  undo() {
    if (!this.canUndo) return
    const action = this._stack[this._cursor]
    this._cursor--
    this.pause()
    try {
      this._applyUndo(action)
    } finally {
      this.resume()
    }
  }

  /** Redo the next action. No-op if at the top of the stack. */
  redo() {
    if (!this.canRedo) return
    this._cursor++
    const action = this._stack[this._cursor]
    this.pause()
    try {
      this._applyRedo(action)
    } finally {
      this.resume()
    }
  }

  // ─── Apply Operations ─────────────────────────────────────────────────────────

  /**
   * @param {object} action
   */
  _applyUndo(action) {
    const reg = this._registry

    switch (action.type) {
      case ACTION_TYPES.UPDATE_OPTION: {
        const node = reg.get(action.nodeId)
        if (!node) return
        node.optionValues[action.key] = action.oldValue
        node.applyOption()
        break
      }

      case ACTION_TYPES.UPDATE_CONTENT: {
        const node = reg.get(action.nodeId)
        if (!node) return
        node.content = action.oldValue
        node.applyOption()
        break
      }

      case ACTION_TYPES.ADD_ELEMENT: {
        const parent = reg.get(action.parentId)
        const node = reg.get(action.nodeId)
        if (!parent || !node) return
        const idx = node.index
        if (idx >= 0) {
          parent.children.splice(idx, 1)
          reg.unregister(node)
          parent.applyStructure()
        }
        break
      }

      case ACTION_TYPES.REMOVE_ELEMENT: {
        const parent = reg.get(action.parentId)
        if (!parent) return
        const restored = new ElementNode(action.snapshot, parent, reg)
        parent.children.splice(action.index, 0, restored)
        parent.applyStructure()
        break
      }

      case ACTION_TYPES.MOVE_ELEMENT: {
        const node = reg.get(action.nodeId)
        const toParent = reg.get(action.toParentId)
        const fromParent = reg.get(action.fromParentId)
        if (!node || !toParent || !fromParent) return

        // Remove from current position (toParent)
        const currentIdx = toParent.children.indexOf(node)
        if (currentIdx >= 0) toParent.children.splice(currentIdx, 1)

        // Re-insert at original position (fromParent)
        node._parent = fromParent
        node.$parentId = fromParent.$id
        fromParent.children.splice(action.fromIndex, 0, node)

        toParent.applyStructure()
        if (fromParent.$id !== toParent.$id) fromParent.applyStructure()
        break
      }

      case ACTION_TYPES.REORDER_CHILDREN: {
        const parent = reg.get(action.parentId)
        if (!parent) return
        parent.children = action.oldOrder.map(id => reg.get(id)).filter(Boolean)
        parent.applyStructure()
        break
      }
    }
  }

  /**
   * @param {object} action
   */
  _applyRedo(action) {
    const reg = this._registry

    switch (action.type) {
      case ACTION_TYPES.UPDATE_OPTION: {
        const node = reg.get(action.nodeId)
        if (!node) return
        node.optionValues[action.key] = action.newValue
        node.applyOption()
        break
      }

      case ACTION_TYPES.UPDATE_CONTENT: {
        const node = reg.get(action.nodeId)
        if (!node) return
        node.content = action.newValue
        node.applyOption()
        break
      }

      case ACTION_TYPES.ADD_ELEMENT: {
        const parent = reg.get(action.parentId)
        if (!parent) return
        const restored = new ElementNode(action.snapshot, parent, reg)
        parent.children.splice(action.index, 0, restored)
        parent.applyStructure()
        break
      }

      case ACTION_TYPES.REMOVE_ELEMENT: {
        const parent = reg.get(action.parentId)
        const node = reg.get(action.nodeId)
        if (!parent || !node) return
        const idx = node.index
        if (idx >= 0) {
          parent.children.splice(idx, 1)
          reg.unregister(node)
          parent.applyStructure()
        }
        break
      }

      case ACTION_TYPES.MOVE_ELEMENT: {
        const node = reg.get(action.nodeId)
        const fromParent = reg.get(action.fromParentId)
        const toParent = reg.get(action.toParentId)
        if (!node || !fromParent || !toParent) return

        // Remove from original position (fromParent)
        const currentIdx = fromParent.children.indexOf(node)
        if (currentIdx >= 0) fromParent.children.splice(currentIdx, 1)

        // Insert at destination (toParent)
        node._parent = toParent
        node.$parentId = toParent.$id
        toParent.children.splice(action.toIndex, 0, node)

        fromParent.applyStructure()
        if (fromParent.$id !== toParent.$id) toParent.applyStructure()
        break
      }

      case ACTION_TYPES.REORDER_CHILDREN: {
        const parent = reg.get(action.parentId)
        if (!parent) return
        parent.children = action.newOrder.map(id => reg.get(id)).filter(Boolean)
        parent.applyStructure()
        break
      }
    }
  }
}
