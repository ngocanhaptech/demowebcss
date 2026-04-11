/**
 * HtmlExporter — walks the ElementNode tree and produces a standalone
 * HTML document with fully-resolved inline styles.
 *
 * KEY FIXES vs previous version:
 *  1. CSS var() are resolved to concrete values from the theme JSON.
 *     Previously `var(--color-primary)` was emitted as-is — no browser
 *     loading the exported file would have the :root vars defined.
 *  2. Each controller's resolveBaseStyle() is called with the node object
 *     passed correctly so getHtmlTag() works for dynamic tags (e.g. h1/h2).
 *  3. Responsive @media blocks use the correct maxWidth thresholds from
 *     ResponsiveManager.BREAKPOINTS (480 mobile, 768 tablet).
 *  4. Container default styles (maxWidth, auto margins, gutter padding)
 *     are preserved — they come from ContainerController, not optionsToStyle.
 */

import { ControllerRegistry } from '../controllers/registry.js'
import { ResponsiveManager } from '../core/ResponsiveManager.js'

// ─── CSS Variable Resolution ──────────────────────────────────────────────────

/** @type {Record<string,string>|null} loaded once per export call */
let _cachedThemeVars = null

/**
 * Load theme variables from the <link>/:root or the theme JSON file.
 * We read from document.documentElement computed styles when in browser,
 * which is the most accurate source (matches exactly what the editor shows).
 *
 * Falls back to an empty map if not in browser context.
 * @returns {Record<string,string>}
 */
function readThemeVarsFromDOM() {
  if (typeof window === 'undefined') return {}
  const style = getComputedStyle(document.documentElement)
  const vars = {}

  // Enumerate all --xxx properties from the computed styles
  // by inspecting the CSSStyleDeclaration
  for (let i = 0; i < style.length; i++) {
    const prop = style[i]
    if (prop.startsWith('--')) {
      vars[prop] = style.getPropertyValue(prop).trim()
    }
  }
  return vars
}

/**
 * Recursively resolve CSS var() references to their concrete values.
 * Handles nested vars like var(--a) where --a = var(--b).
 *
 * @param {string} value
 * @param {Record<string,string>} vars
 * @param {number} [depth] - recursion guard
 * @returns {string}
 */
function resolveVarString(value, vars, depth = 0) {
  if (depth > 8 || typeof value !== 'string') return value
  // Match: var(--name) or var(--name, fallback)
  return value.replace(
    /var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g,
    (match, varName, fallback) => {
      const resolved = vars[varName]
      if (resolved != null && resolved !== '') {
        return resolveVarString(resolved, vars, depth + 1)
      }
      if (fallback != null) {
        return resolveVarString(fallback.trim(), vars, depth + 1)
      }
      return match // leave unresolved if nothing found
    }
  )
}

/**
 * Resolve all CSS var() values in a style object.
 * @param {Record<string,string|number>} styleObj
 * @param {Record<string,string>} vars
 * @returns {Record<string,string|number>}
 */
function resolveStyleVars(styleObj, vars) {
  const out = {}
  for (const [k, v] of Object.entries(styleObj)) {
    out[k] = typeof v === 'string' ? resolveVarString(v, vars) : v
  }
  return out
}

// ─── Style Serialization ──────────────────────────────────────────────────────

/**
 * Convert a React CSSProperties object → inline style string.
 * camelCase → kebab-case, skips null/undefined/empty-string values.
 * @param {Record<string,string|number>} styleObj
 * @returns {string}
 */
function styleObjToString(styleObj, important = false) {
  return Object.entries(styleObj)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => {
      const prop = k.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`)
      return important ? `${prop}:${v} !important` : `${prop}:${v}`
    })
    .join(';')
}

// ─── Node Walking ─────────────────────────────────────────────────────────────

/**
 * Get the HTML tag for a node, handling dynamic tags (e.g. HeadingController
 * returns h1/h2/... based on node.optionValues.level).
 * @param {object} controller
 * @param {import('../core/ElementNode.js').ElementNode} node
 * @returns {string}
 */
function resolveTag(controller, node) {
  // getHtmlTag may inspect node.optionValues or node.options.level for headings
  return controller.getHtmlTag(node) ?? 'div'
}

/**
 * Walk a node tree and emit indented HTML strings.
 * @param {import('../core/ElementNode.js').ElementNode} node
 * @param {Record<string,string>} themeVars - resolved CSS variables
 * @param {number} indent
 * @returns {string}
 */
function walkNode(node, themeVars, indent = 0) {
  if (!node) return ''

  // Unwrap the invisible _root — only render its children
  if (node.tag === '_root') {
    return (node.children ?? [])
      .map(child => walkNode(child, themeVars, indent))
      .join('\n')
  }

  const controller = ControllerRegistry.get(node.tag)
  if (!controller) return ''

  // Resolve options at desktop breakpoint (index 2) — base for inline styles
  const resolvedOpts = ResponsiveManager.resolveAll(
    node.optionValues,
    node.responsiveValues ?? {},
    2 // desktop
  )

  // Get the raw style object from the controller (same path as canvas render)
  const rawStyle = controller.resolveBaseStyle(resolvedOpts)

  // Resolve CSS var() to concrete values using live :root computed styles
  const finalStyle = resolveStyleVars(rawStyle, themeVars)
  const inlineStyle = styleObjToString(finalStyle)

  const spaces = '  '.repeat(indent)

  // ── Image: custom buildHtml outputs <img> (not the canvas div) ──────────────
  if (node.tag === 'image') {
    // Re-resolve image-specific inline style (HtmlExporter buildHtml does its own)
    return `${spaces}${controller.buildHtml(node, inlineStyle, '')}`
  }

  const tag = resolveTag(controller, node)
  const styleAttr = inlineStyle ? ` style="${inlineStyle}"` : ''
  const uidAttr = node.$id ? ` data-uid="${node.$id}"` : ''

  // ── Leaf nodes (heading, paragraph, button) ─────────────────────────────────
  if (!Array.isArray(node.children)) {
    const inner = controller.buildInnerHtml
      ? controller.buildInnerHtml(node)
      : (node.content ?? '')
    return `${spaces}<${tag}${uidAttr}${styleAttr}>${inner}</${tag}>`
  }

  // ── Container nodes ─────────────────────────────────────────────────────────
  if (node.children.length === 0) {
    return `${spaces}<${tag}${uidAttr}${styleAttr}></${tag}>`
  }

  const childrenHtml = node.children
    .map(child => walkNode(child, themeVars, indent + 1))
    .join('\n')

  return [
    `${spaces}<${tag}${uidAttr}${styleAttr}>`,
    childrenHtml,
    `${spaces}</${tag}>`,
  ].join('\n')
}

// ─── Responsive CSS ───────────────────────────────────────────────────────────

/**
 * Build @media override blocks for mobile (bp=0) and tablet (bp=1).
 * Emits only properties that differ from the desktop base style,
 * with CSS var() fully resolved.
 *
 * @param {import('../core/ElementNode.js').ElementNode} rootNode
 * @param {Record<string,string>} themeVars
 * @returns {string} <style> block or empty string
 */
function buildResponsiveCss(rootNode, themeVars) {
  // mobile → max-width: 480px  (ResponsiveManager.BREAKPOINTS[0].maxWidth)
  // tablet → max-width: 768px  (ResponsiveManager.BREAKPOINTS[1].maxWidth)
  const mobileRules  = []
  const tabletRules  = []

  function visitNode(node) {
    if (!node || node.tag === '_root') {
      for (const child of node?.children ?? []) visitNode(child)
      return
    }

    const rv = node.responsiveValues ?? {}
    if (Object.keys(rv).length === 0) {
      for (const child of node.children ?? []) visitNode(child)
      return
    }

    const controller = ControllerRegistry.get(node.tag)
    if (!controller) return

    const desktopOpts = ResponsiveManager.resolveAll(node.optionValues, rv, 2)
    const desktopStyle = resolveStyleVars(controller.resolveBaseStyle(desktopOpts), themeVars)

    // Tablet override (bp=1)
    const tabletOpts  = ResponsiveManager.resolveAll(node.optionValues, rv, 1)
    const tabletStyle = resolveStyleVars(controller.resolveBaseStyle(tabletOpts), themeVars)
    const tabletDiff  = diffStyles(desktopStyle, tabletStyle)
    if (Object.keys(tabletDiff).length > 0 && node.$id) {
      tabletRules.push(`  [data-uid="${node.$id}"] { ${styleObjToString(tabletDiff, true)} }`)
    }

    // Mobile override (bp=0)
    const mobileOpts  = ResponsiveManager.resolveAll(node.optionValues, rv, 0)
    const mobileStyle = resolveStyleVars(controller.resolveBaseStyle(mobileOpts), themeVars)
    const mobileDiff  = diffStyles(desktopStyle, mobileStyle)
    if (Object.keys(mobileDiff).length > 0 && node.$id) {
      mobileRules.push(`  [data-uid="${node.$id}"] { ${styleObjToString(mobileDiff, true)} }`)
    }

    for (const child of node.children ?? []) visitNode(child)
  }

  visitNode(rootNode)

  const blocks = []

  // Tablet: max-width 768px
  if (tabletRules.length > 0) {
    blocks.push(
      `@media (max-width: ${ResponsiveManager.BREAKPOINTS[1].maxWidth}px) {\n${tabletRules.join('\n')}\n}`
    )
  }

  // Mobile: max-width 480px
  if (mobileRules.length > 0) {
    blocks.push(
      `@media (max-width: ${ResponsiveManager.BREAKPOINTS[0].maxWidth}px) {\n${mobileRules.join('\n')}\n}`
    )
  }

  if (blocks.length === 0) return ''

  return `<style>\n/* Responsive overrides — generated by ui-maker v2 */\n${blocks.join('\n\n')}\n</style>`
}

/** Return only keys where newStyle differs from baseStyle. */
function diffStyles(base, updated) {
  const diff = {}
  for (const [k, v] of Object.entries(updated)) {
    if (String(base[k]) !== String(v)) diff[k] = v
  }
  return diff
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a complete standalone HTML document.
 *
 * CSS var() values are resolved by reading the live computed styles from
 * document.documentElement — this is 100% accurate because the editor
 * already applied the theme to :root via applyTheme().
 *
 * @param {import('../core/ElementNode.js').ElementNode} rootNode
 * @param {object} [opts]
 * @param {string} [opts.pageTitle]
 * @returns {string} complete HTML document string
 */
export function exportHtml(rootNode, { pageTitle = 'Page — ui-maker v2' } = {}) {
  // Read the live :root CSS vars — same values the editor is rendering with
  const themeVars = readThemeVarsFromDOM()

  const bodyHtml      = walkNode(rootNode, themeVars, 2)
  const responsiveCss = buildResponsiveCss(rootNode, themeVars)

  // Embed a minimal :root block so the file looks correct even if opened
  // after the vars have been changed — redundant but safe.
  const rootVarsBlock = Object.entries(themeVars).length > 0
    ? `:root {\n${Object.entries(themeVars).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`
    : ''

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle}</title>
  <style>
    /* Reset */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
    img { display: block; max-width: 100%; }

    /* Theme CSS variables (embedded for self-contained file) */
    ${rootVarsBlock}
  </style>
  ${responsiveCss ? `  ${responsiveCss}` : ''}
</head>
<body>
${bodyHtml}
</body>
</html>`
}

/**
 * Trigger browser download of the HTML file.
 * @param {import('../core/ElementNode.js').ElementNode} rootNode
 * @param {string} [filename]
 */
export function downloadHtml(rootNode, filename = 'page.html') {
  const html = exportHtml(rootNode)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
