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
    return 'div'          // both canvas AND export use div (background-image)
  }

  /**
   * Canvas style — uses background-image so React sees it immediately.
   */
  resolveBaseStyle(optionValues) {
    const src = optionValues.src;
    const fit = optionValues.objectFit || 'cover';
    const br  = optionValues.borderRadius;

    const style = {
      display: 'block',
      width: optionValues.width || '100%',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: fit === 'contain' ? 'contain' : 'cover',
      backgroundColor: PLACEHOLDER_BG,
    };

    if (src) {
      style.backgroundImage = `url(${src})`;
      style.backgroundColor = 'transparent';
    }

    // Helper: trích xuất số và đơn vị hợp lệ từ chuỗi (bỏ qua ký tự rác)
    const parseCssValue = (val) => {
      if (val == null || val === '') return null;
      const str = String(val).trim();
      const match = str.match(/^(\d+(?:\.\d+)?)(%|px|em|rem|vw|vh)?/);
      if (!match) return null;
      const num = match[1];
      const unit = match[2] || '';
      return { value: parseFloat(num), unit, raw: num + unit };
    };

    const hRaw = optionValues.height;
    if (hRaw != null && hRaw !== '') {
      const parsed = parseCssValue(hRaw);
      if (parsed) {
        if (parsed.unit === '%') {
          // Dùng padding-top để tạo aspect ratio, height: 0
          style.height = '0';
          style.paddingTop = parsed.raw;  // ví dụ "320%"
        } else if (parsed.unit === '') {
          style.height = `${parsed.value}px`;
        } else {
          style.height = parsed.raw; // giữ nguyên "50px", "10em", ...
        }
      } else {
        style.height = hRaw;
      }
    } else {
      style.minHeight = '200px';
    }

    // Border radius
    if (br && br !== '0') {
      style.borderRadius = typeof br === 'number' ? `${br}px` : br;
      style.overflow = 'hidden';
    }

    // Margin helpers
    const applyMargin = (key, styleKey) => {
      const val = optionValues[key];
      if (val != null && val !== '') {
        style[styleKey] = typeof val === 'number' ? `${val}px` : String(val);
      }
    };

    applyMargin('marginTop', 'marginTop');
    applyMargin('marginBottom', 'marginBottom');
    applyMargin('marginLeft', 'marginLeft');
    applyMargin('marginRight', 'marginRight');

    return style;
  }

  /**
   * HTML export — emits a <div> with background-image, exactly matching
   * the canvas rendering. This ensures the exported HTML looks identical
   * to what the user sees in the editor (same crop, same background-size,
   * same dimensions).
   *
   * We do NOT use <img> for export because:
   *  - <img> ignores the container dimensions and shows the image at its
   *    natural aspect ratio (object-fit only clips inside the img element
   *    itself, not the surrounding layout box)
   *  - background-image + background-size:cover replicates the editor view 1:1
   *
   * For SEO/accessibility an aria-label is added with the alt text.
   *
   * @param {import('../core/ElementNode.js').ElementNode} node
   * @param {string} inlineStyle - fully resolved inline style string from HtmlExporter
   */
  buildHtml(node, inlineStyle, _childrenHtml) {
    const opts = node.optionValues ?? {}
    const uid  = node.$id ? ` data-uid="${node.$id}"` : ''
    const role = opts.alt ? ` role="img" aria-label="${opts.alt}"` : ''

    // The inlineStyle from HtmlExporter already contains the fully-resolved
    // background-image, background-size, width, height / min-height etc.
    // We just emit it as-is on the div — no transformation needed.
    const styleAttr = inlineStyle ? ` style="${inlineStyle}"` : ''

    return `<div${uid}${role}${styleAttr}></div>`
  }
}