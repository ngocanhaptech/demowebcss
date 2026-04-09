import { BaseController } from './BaseController.js'
import { optionsToStyle } from '../utils/styleMapper.js'

export class HeadingController extends BaseController {
  tag = 'heading'

  resolveBaseStyle(optionValues) {
    return {
      fontFamily: 'var(--font-heading)',
      lineHeight: 'var(--line-height-tight)',
      ...optionsToStyle(optionValues),
    }
  }

  getHtmlTag(node) {
    return node.options?.level ?? node.optionValues?.level ?? 'h2'
  }

  buildInnerHtml(node) {
    return node.content ?? 'Heading'
  }
}

export class ParagraphController extends BaseController {
  tag = 'paragraph'

  resolveBaseStyle(optionValues) {
    return {
      fontFamily: 'var(--font-base)',
      lineHeight: 'var(--line-height-base)',
      ...optionsToStyle(optionValues),
    }
  }

  getHtmlTag(_node) {
    return 'p'
  }

  buildInnerHtml(node) {
    return node.content ?? ''
  }
}
