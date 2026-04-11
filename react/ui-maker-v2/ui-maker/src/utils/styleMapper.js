/**
 * Maps element option values → React CSSProperties object.
 * Shared between StaticPreview (Phase 0) and ElementWrapper (Phase 2+).
 * CSS variable strings like "var(--color-primary)" pass through as-is.
 */

function numToPx(v) {
  if (v == null || v === '') return undefined
  return typeof v === 'number' ? `${v}px` : String(v)
}

/**
 * Resolve responsive options for Phase 0 (always desktop = index 2).
 * In Phase 2+ this is handled by ResponsiveManager.
 */
export function resolvePhase0Options(rawOptions) {
  const opts = { ...rawOptions }
  const responsive = opts.$responsive
  delete opts.$responsive
  if (!responsive) return opts
  for (const [key, arr] of Object.entries(responsive)) {
    const desktopVal = arr[2] ?? arr[1] ?? arr[0]
    if (desktopVal != null) opts[key] = desktopVal
  }
  return opts
}

/**
 * Convert option map → CSS properties object (camelCase, React-compatible).
 * @param {Record<string,any>} opts - already resolved (no $responsive)
 * @returns {React.CSSProperties}
 */
export function optionsToStyle(opts) {
  const s = {}

  if (opts.bgColor)         s.backgroundColor = opts.bgColor
  if (opts.color)           s.color = opts.color
  if (opts.fontSize)        s.fontSize = opts.fontSize
  if (opts.fontWeight)      s.fontWeight = opts.fontWeight
  if (opts.fontFamily)      s.fontFamily = opts.fontFamily
  if (opts.lineHeight)      s.lineHeight = opts.lineHeight
  if (opts.textAlign)       s.textAlign = opts.textAlign
  if (opts.letterSpacing)   s.letterSpacing = numToPx(opts.letterSpacing)

  if (opts.padding != null)         s.padding = numToPx(opts.padding)
  if (opts.paddingY != null) {
    s.paddingTop    = numToPx(opts.paddingY)
    s.paddingBottom = numToPx(opts.paddingY)
  }
  if (opts.paddingX != null) {
    s.paddingLeft  = numToPx(opts.paddingX)
    s.paddingRight = numToPx(opts.paddingX)
  }

  if (opts.marginBottom != null)    s.marginBottom = numToPx(opts.marginBottom)
  if (opts.marginTop != null)       s.marginTop    = numToPx(opts.marginTop)
  if (opts.marginX != null) {
    s.marginLeft  = opts.marginX
    s.marginRight = opts.marginX
  }
  // Thêm marginLeft và marginRight riêng lẻ (hỗ trợ 'auto')
  if (opts.marginLeft != null)      s.marginLeft   = numToPx(opts.marginLeft)
  if (opts.marginRight != null)     s.marginRight  = numToPx(opts.marginRight)

  if (opts.maxWidth) {
    s.maxWidth    = opts.maxWidth
    if (!s.marginLeft)  s.marginLeft  = 'auto'
    if (!s.marginRight) s.marginRight = 'auto'
  }
  if (opts.width)           s.width     = numToPx(opts.width)
  if (opts.minHeight)       s.minHeight = opts.minHeight
  if (opts.height)          s.height    = numToPx(opts.height)

  // Flex
  if (opts.flexDirection) {
    s.display        = 'flex'
    s.flexDirection  = opts.flexDirection
    s.flexWrap       = 'wrap'
  }
  if (opts.display)         s.display        = opts.display
  if (opts.justify)         s.justifyContent = opts.justify
  if (opts.align)           s.alignItems     = opts.align
  if (opts.gap != null)     s.gap            = numToPx(opts.gap)
  if (opts.flex)            s.flex           = opts.flex

  // Border
  if (opts.border)          s.border         = opts.border
  if (opts.borderBottom)    s.borderBottom   = opts.borderBottom
  if (opts.borderTop)       s.borderTop      = opts.borderTop
  if (opts.borderRadius || opts.radius)
    s.borderRadius = opts.borderRadius ?? opts.radius
  if (opts.outline)         s.outline        = opts.outline

  // Decorative
  if (opts.shadow)          s.boxShadow      = opts.shadow
  if (opts.opacity != null) s.opacity        = opts.opacity
  if (opts.overflow)        s.overflow       = opts.overflow
  if (opts.zIndex != null)  s.zIndex         = opts.zIndex
  if (opts.position)        s.position       = opts.position
  if (opts.top != null)     s.top            = numToPx(opts.top)

  // Remove undefined / empty string entries
  return Object.fromEntries(
    Object.entries(s).filter(([, v]) => v != null && v !== '')
  )
}
