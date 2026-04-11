import { nanoid } from 'nanoid'

/**
 * Generate a unique element ID with an optional prefix for readability.
 * @param {string} [prefix='el'] - short tag-based prefix
 * @returns {string} e.g. "section-a3f2Kx1b"
 */
export function generateId(prefix = 'el') {
  return `${prefix}-${nanoid(8)}`
}
