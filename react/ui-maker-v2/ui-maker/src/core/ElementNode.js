import { generateId } from '../utils/idGenerator.js'
import { deepClone } from '../utils/deepClone.js'

/**
 * Six history action types that HistoryManager handles.
 * @enum {string}
 */
export const ACTION_TYPES = {
  ADD_ELEMENT: 'ADD_ELEMENT',
  REMOVE_ELEMENT: 'REMOVE_ELEMENT',
  MOVE_ELEMENT: 'MOVE_ELEMENT',
  UPDATE_OPTION: 'UPDATE_OPTION',
  UPDATE_CONTENT: 'UPDATE_CONTENT',
  REORDER_CHILDREN: 'REORDER_CHILDREN',
}

/**
 * Defines which child tags each parent tag accepts.
 * Used by `allows()` to enforce valid tree structure.
 * @type {Record<string, Set<string>>}
 */
const ALLOWED_CHILDREN = {
  _root:     new Set(['section', 'navbar']),
  navbar:    new Set(['container', 'row']),
  section:   new Set(['container', 'row', 'card', 'heading', 'paragraph', 'button', 'image']),
  container: new Set(['row', 'column', 'card', 'heading', 'paragraph', 'button', 'image']),
  row:       new Set(['column', 'card', 'heading', 'paragraph', 'button', 'image']),
  column:    new Set(['heading', 'paragraph', 'button', 'card', 'row', 'image']),
  card:      new Set(['heading', 'paragraph', 'button', 'row', 'column', 'image']),
}

/**
 * Tags that are leaves: they have no children array and render `content` text.
 * @type {Set<string>}
 */
const LEAF_TAGS = new Set(['heading', 'paragraph', 'button', 'image'])

/**
 * Debounce delay (ms) before flushing an option change to history.
 * Rapid sequential edits to the same key collapse into one history entry.
 */
const OPTION_DEBOUNCE_MS = 250

/**
 * ElementNode — doubly-linked tree node for the page element tree.
 *
 * Key design points:
 *  - `this.options` is a Proxy over `this.optionValues` that auto-records history
 *  - Children are stored in DOM order (D1: tree order = DOM order always)
 *  - Responsive overrides are stored separately in `this.responsiveValues`
 *  - `applyOption()` / `applyStructure()` notify the store (fine-grained re-render, D4)
 */
export class ElementNode {
  /**
   * @param {object} plainObj - plain JSON node from page tree
   * @param {ElementNode|null} parentNode - direct parent, null for root
   * @param {import('./ElementRegistry.js').ElementRegistry} registry
   */
  constructor(plainObj, parentNode, registry) {
    this.$id = plainObj.$id ?? generateId(plainObj.tag ?? 'el')
    this.tag = plainObj.tag
    this.content = plainObj.content ?? ''
    this.$parentId = parentNode?.$id ?? null

    this._registry = registry
    this._parent = parentNode ?? null

    // Separate base options from $responsive block
    const rawOpts = plainObj.options ?? {}
    const { $responsive, ...baseOpts } = rawOpts

    /**
     * Raw option values (base, desktop-first).
     * Do NOT write to this directly — use `this.options[key] = value` instead.
     * @type {Record<string, any>}
     */
    this.optionValues = deepClone(baseOpts)

    /**
     * Per-key responsive arrays: { paddingY: [60, 80, 120] }
     * Indexed [mobile=0, tablet=1, desktop=2].
     * @type {Record<string, any[]>}
     */
    this.responsiveValues = deepClone($responsive ?? {})

    /**
     * UI state flags for selection, hover, drag.
     * @type {{ active: boolean, dragging: boolean, selected: boolean, open: boolean }}
     */
    this.states = { active: false, dragging: false, selected: false, open: false }

    /**
     * Per-key debounce state for history recording.
     * @type {Record<string, { oldValue: any, timer: ReturnType<typeof setTimeout> }> | null}
     */
    this._pendingOptions = null

    /**
     * Reactive proxy: `node.options.color = 'red'` triggers applyOption + history.
     * @type {Record<string, any>}
     */
    this.options = this._buildOptionsProxy()

    // Register in registry BEFORE creating children (children need to find siblings)
    registry.register(this)

    // Recursively build children (leaf tags have no children array)
    if (LEAF_TAGS.has(this.tag)) {
      this.children = undefined
    } else if (Array.isArray(plainObj.children)) {
      this.children = plainObj.children.map(
        child => new ElementNode(child, this, registry)
      )
    } else {
      this.children = []
    }
  }

  // ─── Proxy ───────────────────────────────────────────────────────────────────

  _buildOptionsProxy() {
    return new Proxy(this.optionValues, {
      get: (target, key) => {
        if (typeof key !== 'string') return target[key]
        return target[key]
      },
      set: (target, key, value) => {
        if (typeof key !== 'string') {
          target[key] = value
          return true
        }
        const oldValue = target[key]
        target[key] = value
        this.applyOption()
        this._scheduleHistoryOption(key, oldValue, value)
        return true
      },
    })
  }

  /**
   * Debounce a history push for an option change.
   * Multiple rapid edits to the same key produce exactly one history entry.
   * @param {string} key
   * @param {any} oldValue - value before this edit session started
   * @param {any} newValue - current value (may change again before flush)
   */
  _scheduleHistoryOption(key, oldValue, newValue) {
    if (!this._pendingOptions) this._pendingOptions = {}

    if (!this._pendingOptions[key]) {
      // Capture original value before this edit session
      this._pendingOptions[key] = { oldValue, timer: null }
    } else {
      clearTimeout(this._pendingOptions[key].timer)
    }

    this._pendingOptions[key].timer = setTimeout(() => {
      const pending = this._pendingOptions?.[key]
      if (!pending) return
      delete this._pendingOptions[key]
      if (Object.keys(this._pendingOptions).length === 0) {
        this._pendingOptions = null
      }
      // If value ended up same as before the session, skip recording
      if (pending.oldValue === this.optionValues[key]) return

      this._registry.history?.push({
        type: ACTION_TYPES.UPDATE_OPTION,
        nodeId: this.$id,
        key,
        oldValue: pending.oldValue,
        newValue: this.optionValues[key],
      })
    }, OPTION_DEBOUNCE_MS)
  }

  // ─── Render Notification ─────────────────────────────────────────────────────

  /** Notify the store that this node's visual options changed. */
  applyOption() {
    this._registry.updateFns.bumpOptionVersion(this.$id)
  }

  /** Notify the store that this node's children structure changed. */
  applyStructure() {
    this._registry.updateFns.bumpStructureVersion(this.$id)
  }

  // ─── Tree Operations ─────────────────────────────────────────────────────────

  /**
   * Insert a child node at the given index.
   * @param {object|ElementNode} data - plain JSON object or existing ElementNode
   * @param {number} [index] - position to insert at; omit to append
   * @param {boolean} [record=false] - push ADD_ELEMENT to history
   * @returns {ElementNode} the inserted node
   */
  addChild(data, index, record = false) {
    if (!Array.isArray(this.children)) {
      throw new Error(`"${this.tag}" (${this.$id}) is a leaf node and cannot have children.`)
    }

    let node
    if (data instanceof ElementNode) {
      node = data
      node.$parentId = this.$id
      node._parent = this
    } else {
      node = new ElementNode(data, this, this._registry)
    }

    const insertAt =
      index !== undefined && index >= 0 && index <= this.children.length
        ? index
        : this.children.length

    this.children.splice(insertAt, 0, node)
    this.applyStructure()

    if (record) {
      this._registry.history?.push({
        type: ACTION_TYPES.ADD_ELEMENT,
        nodeId: node.$id,
        parentId: this.$id,
        index: insertAt,
        snapshot: node.toPlain(),
      })
    }

    return node
  }

  /**
   * Remove the child at the given index.
   * Unregisters the removed node and all its descendants.
   * @param {number} index
   * @param {boolean} [record=false] - push REMOVE_ELEMENT to history
   */
  removeChild(index, record = false) {
    if (!Array.isArray(this.children)) return
    if (index < 0 || index >= this.children.length) return

    const [removed] = this.children.splice(index, 1)

    if (record) {
      this._registry.history?.push({
        type: ACTION_TYPES.REMOVE_ELEMENT,
        nodeId: removed.$id,
        parentId: this.$id,
        index,
        snapshot: removed.toPlain(),
      })
    }

    this._registry.unregister(removed)
    this.applyStructure()
  }

  /**
   * Remove this node from its parent (self-removal convenience).
   * @param {boolean} [record=false]
   */
  remove(record = false) {
    const parent = this._parent
    if (!parent) return
    const idx = this.index
    if (idx >= 0) parent.removeChild(idx, record)
  }

  /**
   * Detach this node from its parent tree without unregistering.
   * Used during drag-drop MOVE operations — the node stays alive in the registry.
   * @returns {ElementNode} this (fluent)
   */
  detach() {
    const parent = this._parent
    if (!parent || !Array.isArray(parent.children)) return this
    const idx = this.index
    if (idx >= 0) {
      parent.children.splice(idx, 1)
      parent.applyStructure()
    }
    this.$parentId = null
    this._parent = null
    return this
  }

  /**
   * Create a deep duplicate of this node and optionally insert it after a sibling.
   * The duplicate gets a new $id (and all descendants get new $ids).
   * @param {number} [afterIndex] - index in the same parent to insert after
   * @returns {ElementNode} the duplicated node
   */
  duplicate(afterIndex) {
    const plain = this.toPlain()
    plain.$id = generateId(this.tag)
    const newNode = new ElementNode(plain, this._parent, this._registry)

    if (this._parent && afterIndex !== undefined) {
      const insertAt = afterIndex + 1
      this._parent.children.splice(insertAt, 0, newNode)
      newNode.$parentId = this._parent.$id
      newNode._parent = this._parent
      this._parent.applyStructure()
    }

    return newNode
  }

  /**
   * Whether this parent node accepts the given tag (or node) as a direct child.
   * @param {ElementNode|string} nodeOrTag
   * @returns {boolean}
   */
  allows(nodeOrTag) {
    const tag = typeof nodeOrTag === 'string' ? nodeOrTag : nodeOrTag.tag
    return ALLOWED_CHILDREN[this.tag]?.has(tag) ?? false
  }

  /**
   * Whether `candidate` is this node or any ancestor of this node.
   * Prevents drag-drop from placing a node inside itself or its descendants.
   * @param {ElementNode} candidate
   * @returns {boolean}
   */
  isSelfOrDescendantOf(candidate) {
    let node = this
    while (node) {
      if (node.$id === candidate.$id) return true
      node = node._parent
    }
    return false
  }

  // ─── Serialization ────────────────────────────────────────────────────────────

  /**
   * Serialize this node and its subtree to a plain JSON-safe object.
   * Roundtrips through `new ElementNode(toPlain(), ...)` without data loss.
   * @returns {object}
   */
  toPlain() {
    const result = {
      $id: this.$id,
      tag: this.tag,
      options: { ...deepClone(this.optionValues) },
    }

    if (this.content) result.content = this.content

    if (Object.keys(this.responsiveValues).length > 0) {
      result.options.$responsive = deepClone(this.responsiveValues)
    }

    if (Array.isArray(this.children)) {
      result.children = this.children.map(child => child.toPlain())
    }

    return result
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  /** Direct parent node, or null for root. */
  get parent() {
    return this._parent
  }

  /** Zero-based position of this node in parent's children array. -1 if root. */
  get index() {
    if (!this._parent) return -1
    return this._parent.children.indexOf(this)
  }

  /** Depth in the tree: root = 0, root's children = 1, etc. */
  get depth() {
    let d = 0
    let node = this._parent
    while (node) {
      d++
      node = node._parent
    }
    return d
  }

  /**
   * Ordered array of ancestor nodes from root → immediate parent.
   * @returns {ElementNode[]}
   */
  get ancestors() {
    const result = []
    let node = this._parent
    while (node) {
      result.unshift(node)
      node = node._parent
    }
    return result
  }

  /**
   * All descendant nodes in depth-first order.
   * @returns {ElementNode[]}
   */
  get descendants() {
    const result = []
    const visit = (node) => {
      for (const child of node.children ?? []) {
        result.push(child)
        visit(child)
      }
    }
    visit(this)
    return result
  }

  /**
   * Siblings: all other children of this node's parent.
   * @returns {ElementNode[]}
   */
  get siblings() {
    if (!this._parent) return []
    return this._parent.children.filter(c => c.$id !== this.$id)
  }

  /** Next sibling in parent's children, or null. */
  get nextSibling() {
    if (!this._parent) return null
    return this._parent.children[this.index + 1] ?? null
  }

  /** Previous sibling in parent's children, or null. */
  get previousSibling() {
    if (!this._parent) return null
    const idx = this.index
    if (idx <= 0) return null
    return this._parent.children[idx - 1] ?? null
  }

  /** True if this node has no parent (is the root). */
  get isRoot() {
    return this._parent === null
  }

  /** True if this node can have children (has a children array). */
  get isParent() {
    return Array.isArray(this.children)
  }

  /** True if this node is a parent with zero children. */
  get isEmpty() {
    return Array.isArray(this.children) && this.children.length === 0
  }

  // ─── Responsive + Content Editing API ────────────────────────────────────────

  /**
   * Get the effective option value for a given breakpoint.
   * Falls back to base optionValues when no override exists for that bp.
   * @param {string} key
   * @param {0|1|2} bp
   * @returns {any}
   */
  getOptionForBreakpoint(key, bp) {
    if (bp === 2) return this.optionValues[key]
    const arr = this.responsiveValues[key]
    if (arr && arr[bp] !== null && arr[bp] !== undefined) return arr[bp]
    return this.optionValues[key]
  }

  /**
   * Set an option value for a specific breakpoint.
   *  bp=2 (desktop): writes to base optionValues via Proxy (triggers history debounce).
   *  bp=0,1 (mobile/tablet): writes to responsiveValues[key][bp] + applyOption().
   * @param {string} key
   * @param {any} value
   * @param {0|1|2} bp
   */
  setOptionForBreakpoint(key, value, bp) {
    if (bp === 2) {
      this.options[key] = value
      return
    }
    if (!this.responsiveValues[key]) {
      this.responsiveValues[key] = [null, null, null]
    }
    const histKey = `$responsive.${key}[${bp}]`
    const oldValue = this.responsiveValues[key][bp]
    this.responsiveValues[key][bp] = value
    this.applyOption()
    this._scheduleHistoryOption(histKey, oldValue, value)
  }

  /**
   * Update text content and optionally push UPDATE_CONTENT to history.
   * @param {string} value
   * @param {boolean} [record=true]
   */
  setContent(value, record = true) {
    const oldValue = this.content
    this.content = value
    this.applyOption()
    if (record && oldValue !== value) {
      this._registry.history?.push({
        type: ACTION_TYPES.UPDATE_CONTENT,
        nodeId: this.$id,
        oldValue,
        newValue: value,
      })
    }
  }
}
