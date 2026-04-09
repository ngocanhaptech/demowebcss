import { BaseController } from './BaseController.js'

const PLACEHOLDER_BG = '#e2e8f0'

/**
 * ImageController — renders image elements on the canvas as a <div>
 * with CSS background-image (layout-stable, instant reactive updates).
 *
 * HTML export uses a proper <img> tag for semantic correctness.
 *
 * WHY background-image instead of <img> on canvas:
 *  - <img height="auto"> renders at 0px until the image loads asynchronously.
 *    React never re-renders on native load events, so the canvas stays blank.
 *  - background-image updates instantly when the style prop changes (reactive).
 *  - The wrapper div always has a visible minHeight even before src is set.
 *
 * NOTE: isVoidElement() returns FALSE here so ElementWrapper uses the normal
 * non-void branch and renders this as a regular block div (not <img>).
 */
export class ImageController extends BaseController {
  tag = 'image'

  isVoidElement() {
    return false          // ← canvas renders as div, not <img>
  }

  getHtmlTag(_node) {
    return 'div'          // canvas tag
  }

  /**
   * Canvas style — uses background-image so React sees it immediately.
   */
  resolveBaseStyle(optionValues) {
    const src = optionValues.src
    const fit = optionValues.objectFit || 'cover'
    const br  = optionValues.borderRadius

    const style = {
      display: 'block',
      width: optionValues.width || '100%',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: fit === 'contain' ? 'contain' : 'cover',
      backgroundColor: PLACEHOLDER_BG,
    }

    if (src) {
      style.backgroundImage = `url("${src}")`
    }

    const h = optionValues.height
    if (h && h !== 'auto') {
      style.height = typeof h === 'number' ? `${h}px` : h
    } else {
      style.minHeight = '200px'
    }

    if (br && br !== '0') {
      style.borderRadius = typeof br === 'number' ? `${br}px` : br
      style.overflow = 'hidden'
    }

    if (optionValues.marginTop != null) {
      style.marginTop = typeof optionValues.marginTop === 'number'
        ? `${optionValues.marginTop}px`
        : optionValues.marginTop
    }

    if (optionValues.marginBottom != null) {
      style.marginBottom = typeof optionValues.marginBottom === 'number'
        ? `${optionValues.marginBottom}px`
        : optionValues.marginBottom
    }

    return style
  }

  /**
   * HTML export — emits a semantic <img> tag using the ALREADY-RESOLVED
   * inlineStyle string passed by HtmlExporter (CSS vars already substituted).
   *
   * We convert the background-image / backgroundSize canvas style
   * into proper <img> attributes + object-fit style.
   *
   * @param {import('../core/ElementNode.js').ElementNode} node
   * @param {string} inlineStyle - fully resolved inline style string from HtmlExporter
   */
  buildHtml(node, inlineStyle, _childrenHtml) {
    const opts = node.optionValues ?? {}
    const src  = opts.src || ''
    const alt  = opts.alt || ''

    // Build a clean <img> style from the resolved canvas style string.
    // Strip background-* props (not valid on <img>), add object-fit instead.
    const imgStyleParts = []

    if (inlineStyle) {
      // Parse the resolved inline style string back into declarations
      for (const decl of inlineStyle.split(';')) {
        const colon = decl.indexOf(':')
        if (colon === -1) continue
        const prop  = decl.slice(0, colon).trim()
        const value = decl.slice(colon + 1).trim()
        // Skip background-* and min-height (specific to the canvas div trick)
        if (
          prop.startsWith('background') ||
          prop === 'min-height'
        ) continue
        imgStyleParts.push(`${prop}:${value}`)
      }
    }

    // Add object-fit from options (not present in canvas div style)
    const fit = opts.objectFit || 'cover'
    imgStyleParts.push(`object-fit:${fit}`)

    // Ensure max-width:100% is present for responsive images
    if (!imgStyleParts.some(p => p.startsWith('max-width'))) {
      imgStyleParts.push('max-width:100%')
    }

    const styleAttr = imgStyleParts.length ? ` style="${imgStyleParts.join(';')}"` : ''
    const srcAttr   = src ? ` src="${src}"` : ''
    const uid       = node.$id ? ` data-uid="${node.$id}"` : ''

    return `<img${uid}${srcAttr} alt="${alt}"${styleAttr} />`
  }
}
