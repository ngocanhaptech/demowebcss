/**
 * ThemeService — reads live CSS custom properties from :root.
 *
 * All values are read directly from the computed style of document.documentElement,
 * which means they are always in sync with the applied theme (no stale cache).
 *
 * Usage:
 *   ThemeService.getColorVars()      → [{ varName, label, hexValue, cssValue }]
 *   ThemeService.getFontSizeVars()   → [{ varName, label, value, cssValue }]
 *   ThemeService.getShadowVars()     → [{ varName, label, value, cssValue }]
 *   ThemeService.getRadiusVars()     → [{ varName, label, value, cssValue }]
 */

const COLOR_VARS = [
  { varName: '--color-primary',      label: 'Primary' },
  { varName: '--color-primary-dark', label: 'Primary Dark' },
  { varName: '--color-primary-light',label: 'Primary Light' },
  { varName: '--color-secondary',    label: 'Secondary' },
  { varName: '--color-accent',       label: 'Accent' },
  { varName: '--color-success',      label: 'Success' },
  { varName: '--color-danger',       label: 'Danger' },
  { varName: '--color-text',         label: 'Text' },
  { varName: '--color-text-muted',   label: 'Text Muted' },
  { varName: '--color-text-inverse', label: 'Text Inverse' },
  { varName: '--color-bg',           label: 'Background' },
  { varName: '--color-bg-alt',       label: 'BG Alt' },
  { varName: '--color-bg-dark',      label: 'BG Dark' },
  { varName: '--color-border',       label: 'Border' },
]

const FONT_SIZE_VARS = [
  { varName: '--font-size-xs',   label: 'XS (12px)' },
  { varName: '--font-size-sm',   label: 'SM (14px)' },
  { varName: '--font-size-base', label: 'Base (16px)' },
  { varName: '--font-size-lg',   label: 'LG (18px)' },
  { varName: '--font-size-xl',   label: 'XL (20px)' },
  { varName: '--font-size-2xl',  label: '2XL (24px)' },
  { varName: '--font-size-3xl',  label: '3XL (30px)' },
  { varName: '--font-size-4xl',  label: '4XL (36px)' },
  { varName: '--font-size-5xl',  label: '5XL (48px)' },
]

const SHADOW_VARS = [
  { varName: '--shadow-sm', label: 'Shadow SM' },
  { varName: '--shadow-md', label: 'Shadow MD' },
  { varName: '--shadow-lg', label: 'Shadow LG' },
]

const RADIUS_VARS = [
  { varName: '--radius-sm',   label: 'SM (4px)' },
  { varName: '--radius-md',   label: 'MD (8px)' },
  { varName: '--radius-lg',   label: 'LG (16px)' },
  { varName: '--radius-xl',   label: 'XL (24px)' },
  { varName: '--radius-full', label: 'Full (9999px)' },
]

function getComputedVar(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

function buildEntries(defs) {
  return defs.map(({ varName, label }) => ({
    varName,
    label,
    value: getComputedVar(varName),
    cssValue: `var(${varName})`,
  }))
}

export const ThemeService = {
  /** @returns {{ varName, label, value, cssValue }[]} */
  getColorVars: () => buildEntries(COLOR_VARS),

  /** @returns {{ varName, label, value, cssValue }[]} */
  getFontSizeVars: () => buildEntries(FONT_SIZE_VARS),

  /** @returns {{ varName, label, value, cssValue }[]} */
  getShadowVars: () => buildEntries(SHADOW_VARS),

  /** @returns {{ varName, label, value, cssValue }[]} */
  getRadiusVars: () => buildEntries(RADIUS_VARS),

  /**
   * Resolve any CSS value (var() or literal) to a display hex/rgb string.
   * Useful for showing a preview color swatch.
   * @param {string} value - e.g. "var(--color-primary)" or "#2563eb"
   * @returns {string} resolved value or original
   */
  resolveValue(value) {
    if (!value) return ''
    if (value.startsWith('var(')) {
      const varName = value.slice(4, -1).trim()
      return getComputedVar(varName) || value
    }
    return value
  },
}
