/**
 * DataLoader — fetch wrapper with in-memory cache and request deduplication.
 *
 * - Caches successful responses by URL (no TTL — page lifetime).
 * - Deduplicates concurrent requests for the same URL (returns the same Promise).
 * - On error, removes the in-flight entry so the next call retries.
 */
export class DataLoader {
  constructor() {
    /** @type {Map<string, any>} URL → parsed JSON */
    this._cache = new Map()

    /** @type {Map<string, Promise<any>>} URL → in-flight Promise */
    this._inflight = new Map()
  }

  /**
   * Fetch and parse JSON from `url`. Caches the result.
   * Concurrent requests for the same URL share the same Promise.
   * @param {string} url
   * @returns {Promise<any>}
   */
  async fetchJSON(url) {
    if (this._cache.has(url)) return this._cache.get(url)
    if (this._inflight.has(url)) return this._inflight.get(url)

    const promise = fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
        return res.json()
      })
      .then(data => {
        this._cache.set(url, data)
        this._inflight.delete(url)
        return data
      })
      .catch(err => {
        this._inflight.delete(url)
        throw err
      })

    this._inflight.set(url, promise)
    return promise
  }

  /**
   * Remove a cached entry so the next `fetchJSON` makes a real request.
   * @param {string} url
   */
  invalidate(url) {
    this._cache.delete(url)
  }

  /**
   * Check whether a URL is already in the cache.
   * @param {string} url
   * @returns {boolean}
   */
  has(url) {
    return this._cache.has(url)
  }

  /** Clear the entire in-memory cache. */
  clearAll() {
    this._cache.clear()
  }
}

/** Singleton DataLoader for the application. */
export const dataLoader = new DataLoader()
