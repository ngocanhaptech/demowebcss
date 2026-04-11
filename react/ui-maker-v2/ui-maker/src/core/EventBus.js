/**
 * Lightweight pub/sub event bus with filter-chain support.
 *
 * - Listeners are called in insertion order.
 * - A listener returning `false` stops propagation for that emit.
 * - `once()` auto-unsubscribes after first call.
 */
export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map()
  }

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} handler
   * @returns {() => void} unsubscribe function
   */
  on(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set())
    }
    this._listeners.get(event).add(handler)
    return () => this.off(event, handler)
  }

  /**
   * Unsubscribe a handler from an event.
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {
    this._listeners.get(event)?.delete(handler)
  }

  /**
   * Emit an event to all registered handlers.
   * Returning `false` from a handler stops further propagation.
   * @param {string} event
   * @param {any} payload
   */
  emit(event, payload) {
    const handlers = this._listeners.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      const result = handler(payload)
      if (result === false) break
    }
  }

  /**
   * Subscribe for a single emission, then auto-unsubscribe.
   * @param {string} event
   * @param {Function} handler
   * @returns {() => void} unsubscribe function
   */
  once(event, handler) {
    const unsub = this.on(event, (payload) => {
      handler(payload)
      unsub()
    })
    return unsub
  }

  /**
   * Remove all listeners for a specific event, or all events if no argument.
   * @param {string} [event]
   */
  clear(event) {
    if (event !== undefined) {
      this._listeners.delete(event)
    } else {
      this._listeners.clear()
    }
  }

  /**
   * Returns the number of listeners registered for an event.
   * @param {string} event
   * @returns {number}
   */
  listenerCount(event) {
    return this._listeners.get(event)?.size ?? 0
  }
}

/** Singleton event bus for the entire application. */
export const eventBus = new EventBus()
