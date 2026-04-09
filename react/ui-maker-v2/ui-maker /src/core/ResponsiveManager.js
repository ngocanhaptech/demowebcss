/**
 * Breakpoint index convention (matches $responsive arrays):
 *   0 = mobile  (≤ 480px)
 *   1 = tablet  (≤ 768px)
 *   2 = desktop (> 768px)
 *
 * Cascade rule: if the requested breakpoint has no value,
 * try higher breakpoints first (desktop fallback), then lower.
 *
 * Example: $responsive.paddingY = [60, 80, 120]
 *   at desktop (2) → 120
 *   at tablet  (1) → 80
 *   at mobile  (0) → 60
 */
export class ResponsiveManager {
  static BREAKPOINTS = [
    { id: 'mobile',  label: 'Mobile',  maxWidth: 480 },
    { id: 'tablet',  label: 'Tablet',  maxWidth: 768 },
    { id: 'desktop', label: 'Desktop', maxWidth: null },
  ]

  /**
   * Resolve the effective value from a responsive array at a given breakpoint.
   * Cascades upward (to desktop) then downward if no value found.
   * @param {any[]} responsiveArr - [mobile, tablet, desktop]
   * @param {0|1|2} breakpoint
   * @returns {any} resolved value, or undefined if nothing found
   */
  static resolve(responsiveArr, breakpoint) {
    if (!Array.isArray(responsiveArr)) return responsiveArr

    for (let bp = breakpoint; bp < responsiveArr.length; bp++) {
      const val = responsiveArr[bp]
      if (val !== null && val !== undefined) return val
    }

    for (let bp = breakpoint - 1; bp >= 0; bp--) {
      const val = responsiveArr[bp]
      if (val !== null && val !== undefined) return val
    }

    return undefined
  }

  /**
   * Merge base optionValues with breakpoint-specific overrides from responsiveValues.
   * The $responsive object maps each key to a [mobile, tablet, desktop] array.
   * @param {Record<string, any>} optionValues - base (desktop) option values
   * @param {Record<string, any[]>} responsiveValues - per-key breakpoint arrays
   * @param {0|1|2} breakpoint - target breakpoint index
   * @returns {Record<string, any>} merged resolved options
   */
  static resolveAll(optionValues, responsiveValues, breakpoint) {
    const resolved = { ...optionValues }
    for (const [key, arr] of Object.entries(responsiveValues ?? {})) {
      const val = ResponsiveManager.resolve(arr, breakpoint)
      if (val !== undefined) {
        resolved[key] = val
      }
    }
    return resolved
  }

  /**
   * Build the CSS @media block for a given breakpoint.
   * @param {0|1} breakpoint - 0 = mobile, 1 = tablet (desktop has no @media)
   * @param {string} innerCss - the CSS rules inside the block
   * @returns {string}
   */
  static buildMediaBlock(breakpoint, innerCss) {
    const bp = ResponsiveManager.BREAKPOINTS[breakpoint]
    if (!bp?.maxWidth) return innerCss
    return `@media (max-width: ${bp.maxWidth}px) {\n${innerCss}\n}`
  }
}
