import { dataLoader } from './DataLoader.js'

const LS_PREFIX = 'ui-maker:def:'

/**
 * ElementDefService — loads and caches element type definitions.
 *
 * Source hierarchy (highest priority first):
 *   1. LocalStorage override   (`ui-maker:def:{tag}`)
 *   2. Public JSON file         (`/data/elements/{tag}.json`)
 *
 * Each element def has this shape:
 * {
 *   tag: string,
 *   label: string,
 *   category: string,
 *   icon: string,
 *   isParent: boolean,
 *   allowedChildren: string[],
 *   defaultOptions: Record<string, any>,
 *   schema: { [key]: { type, label, default, options? } }
 * }
 */
export class ElementDefService {
  constructor() {
    /** @type {Map<string, object>} tag → merged def */
    this._cache = new Map()
  }

  /**
   * Return a cached element def synchronously. Returns `undefined` if not loaded yet.
   * @param {string} tag
   * @returns {object|undefined}
   */
  getCached(tag) {
    return this._cache.get(tag)
  }

  /**
   * Load the element def for a tag. Merges the LocalStorage override if present.
   * Falls back to a minimal stub def if the JSON file is missing.
   * @param {string} tag
   * @returns {Promise<object>}
   */
  async get(tag) {
    if (this._cache.has(tag)) return this._cache.get(tag)

    let fileDef
    try {
      fileDef = await dataLoader.fetchJSON(`/data/elements/${tag}.json`)
    } catch {
      fileDef = {
        tag,
        label: tag,
        category: 'custom',
        icon: '□',
        isParent: false,
        allowedChildren: [],
        defaultOptions: {},
        schema: {},
      }
    }

    const lsRaw = localStorage.getItem(`${LS_PREFIX}${tag}`)
    let merged = fileDef
    if (lsRaw) {
      try {
        const lsOverride = JSON.parse(lsRaw)
        merged = { ...fileDef, ...lsOverride }
      } catch {
        // Ignore malformed LocalStorage entry
      }
    }

    this._cache.set(tag, merged)
    return merged
  }

  /**
   * Load all known element defs using the element index file.
   * Falls back to returning whatever is already cached if the index is missing.
   * @returns {Promise<object[]>}
   */
  async getAll() {
    try {
      const index = await dataLoader.fetchJSON('/data/elements/index.json')
      const defs = await Promise.all(index.tags.map(tag => this.get(tag)))
      return defs
    } catch {
      return [...this._cache.values()]
    }
  }

  /**
   * Persist a partial def override to LocalStorage and update the in-memory cache.
   * The override is shallowly merged on top of the existing def.
   * @param {string} tag
   * @param {object} patch
   */
  update(tag, patch) {
    const existing = this._cache.get(tag) ?? { tag }
    const merged = { ...existing, ...patch }
    this._cache.set(tag, merged)
    localStorage.setItem(`${LS_PREFIX}${tag}`, JSON.stringify(patch))
  }

  /**
   * Create a brand-new element def stored only in LocalStorage.
   * @param {string} tag
   * @param {object} def
   */
  create(tag, def) {
    this._cache.set(tag, def)
    localStorage.setItem(`${LS_PREFIX}${tag}`, JSON.stringify(def))
  }

  /**
   * Remove the LocalStorage override for a tag and invalidate the file cache.
   * The next call to `get(tag)` will re-fetch from the JSON file.
   * @param {string} tag
   */
  removeOverride(tag) {
    localStorage.removeItem(`${LS_PREFIX}${tag}`)
    this._cache.delete(tag)
    dataLoader.invalidate(`/data/elements/${tag}.json`)
  }
}

/** Singleton ElementDefService for the application. */
export const elementDefService = new ElementDefService()
