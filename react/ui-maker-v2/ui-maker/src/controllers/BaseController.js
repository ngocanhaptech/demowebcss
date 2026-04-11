import { optionsToStyle, resolvePhase0Options } from '../utils/styleMapper.js'

/**
 * BaseController — abstract base for all element type controllers.
 *
 * Phase 0: resolveBaseStyle() + getHtmlTag() + buildInnerHtml()
 * Phase 6: buildHtml() for HTML export
 */
export class BaseController {
  /** @type {string} element tag identifier */
  tag = ''

  /**
   * Convert raw optionValues → React CSSProperties.
   * Subclasses call super then merge additional rules.
   * @param {Record<string,any>} optionValues
   * @returns {React.CSSProperties}
   */
  resolveBaseStyle(optionValues) {
    return optionsToStyle(optionValues)
  }

  /**
   * HTML tag name to render in React / export.
   * @param {object} node
   * @returns {string}
   */
  getHtmlTag(_node) {
    return 'div'
  }

  /**
   * Whether this element is a void HTML element (e.g. img) that cannot have children.
   * When true, ElementWrapper renders a div wrapper to host the handle + the void tag.
   * @returns {boolean}
   */
  isVoidElement() {
    return false
  }

  /**
   * Extra HTML attributes to spread on the rendered element (e.g. src/alt for img).
   * @param {Record<string,any>} optionValues
   * @returns {Record<string,string>}
   */
  resolveAttrs(_optionValues) {
    return {}
  }

  /**
   * Inner HTML for leaf nodes (Phase 6 export).
   * @param {object} node
   * @returns {string}
   */
  buildInnerHtml(node) {
    return node.content ?? ''
  }

  /**
   * Full HTML string for export (Phase 6).
   * @param {object} node
   * @param {string} inlineStyle
   * @param {string} childrenHtml
   * @returns {string}
   */
  buildHtml(node, inlineStyle, childrenHtml = '') {
    const tag = this.getHtmlTag(node)
    const styleAttr = inlineStyle ? ` style="${inlineStyle}"` : ''
    const uidAttr = node.$id ? ` data-uid="${node.$id}"` : ''
    const inner = childrenHtml || this.buildInnerHtml(node)
    return `<${tag}${uidAttr}${styleAttr}>${inner}</${tag}>`
  }
}
