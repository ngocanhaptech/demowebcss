import { BaseController } from './BaseController.js'
import { optionsToStyle } from '../utils/styleMapper.js'

export class CardController extends BaseController {
  tag = 'card'

  resolveBaseStyle(optionValues) {
    return {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      ...optionsToStyle(optionValues),
    }
  }

  getHtmlTag(_node) {
    return 'div'
  }
}
