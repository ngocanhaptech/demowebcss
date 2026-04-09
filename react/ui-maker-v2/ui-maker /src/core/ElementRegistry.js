import { ElementNode } from './ElementNode.js'
import { deepClone } from '../utils/deepClone.js'

/**
 * ElementRegistry — the authoritative store for all ElementNode instances.
 *
 * Responsibilities:
 *  - O(1) node lookup by $id via an internal Map
 *  - Build the tree from plain JSON (restore)
 *  - Serialize the tree back to plain JSON (snapshot)
 *  - Provide `updateFns` and `history` to nodes via dependency injection
 */
export class ElementRegistry {
  constructor() {
    /** @type {Map<string, ElementNode>} */
    this._map = new Map()

    /** @type {ElementNode|null} */
    this._root = null

    /**
     * Store bump functions injected by AppStore in Phase 2.
     * Phase 1 uses no-op stubs so nodes work without a store.
     * @type {{ bumpOptionVersion: (id: string) => void, bumpStructureVersion: (id: string) => void }}
     */
    this._updateFns = {
      bumpOptionVersion: (_id) => {},
      bumpStructureVersion: (_id) => {},
    }

    /** @type {import('./HistoryManager.js').HistoryManager|null} */
    this._history = null
  }

  // ─── Dependency Injection ─────────────────────────────────────────────────────

  /**
   * Inject store bump functions (called by AppStore after initialization).
   * @param {{ bumpOptionVersion: Function, bumpStructureVersion: Function }} fns
   */
  setUpdateFns(fns) {
    this._updateFns = fns
  }

  /**
   * Inject the HistoryManager (called after both are constructed).
   * @param {import('./HistoryManager.js').HistoryManager} history
   */
  setHistory(history) {
    this._history = history
  }

  /** @returns {{ bumpOptionVersion: Function, bumpStructureVersion: Function }} */
  get updateFns() {
    return this._updateFns
  }

  /** @returns {import('./HistoryManager.js').HistoryManager|null} */
  get history() {
    return this._history
  }

  // ─── Map Operations ────────────────────────────────────────────────────────────

  /**
   * Register a node. Called by ElementNode constructor.
   * @param {ElementNode} node
   */
  register(node) {
    this._map.set(node.$id, node)
  }

  /**
   * Unregister a node and ALL its descendants from the map.
   * Called by removeChild before discarding the node.
   * @param {ElementNode} node
   */
  unregister(node) {
    this._map.delete(node.$id)
    for (const child of node.children ?? []) {
      this.unregister(child)
    }
  }

  /**
   * O(1) node lookup.
   * @param {string} id
   * @returns {ElementNode|undefined}
   */
  get(id) {
    return this._map.get(id)
  }

  /**
   * Root node of the current page tree.
   * @returns {ElementNode|null}
   */
  getRoot() {
    return this._root
  }

  /**
   * Total number of nodes currently registered.
   * @returns {number}
   */
  get size() {
    return this._map.size
  }

  /**
   * Iterate all registered nodes.
   * @param {(node: ElementNode, id: string) => void} callback
   */
  forEach(callback) {
    this._map.forEach((node, id) => callback(node, id))
  }

  // ─── Tree Lifecycle ────────────────────────────────────────────────────────────

  /**
   * Build the tree from a plain JSON object (e.g. pageData.tree).
   * Clears any previous tree first.
   * @param {object} plainTree - JSON node (must have `tag`, optionally `children`)
   */
  restore(plainTree) {
    this._map.clear()
    this._root = new ElementNode(deepClone(plainTree), null, this)
  }

  /**
   * Serialize the current tree back to a plain JSON object.
   * The result can be passed back into `restore()` for a perfect roundtrip.
   * @returns {object|null}
   */
  snapshot() {
    if (!this._root) return null
    return this._root.toPlain()
  }

  /** Clear the registry and discard the current tree. */
  clear() {
    this._map.clear()
    this._root = null
  }
}
