import { BaseController } from './BaseController.js'
import { optionsToStyle } from '../utils/styleMapper.js'

export class NavbarController extends BaseController {
  tag = 'navbar'

  resolveBaseStyle(optionValues) {
    const stickyStyles = optionValues.sticky
      ? { position: 'sticky', top: 0, zIndex: 100 }
      : {}

    return {
      width: '100%',
      ...stickyStyles,
      ...optionsToStyle(optionValues),
    }
  }

  getHtmlTag(_node) {
    return 'nav'
  }
}
