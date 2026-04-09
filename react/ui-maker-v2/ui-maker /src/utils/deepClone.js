/**
 * Deep clone a serializable value using the native structuredClone API.
 * Only works with JSON-serializable types (no functions, no class instances).
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function deepClone(value) {
  return structuredClone(value)
}
