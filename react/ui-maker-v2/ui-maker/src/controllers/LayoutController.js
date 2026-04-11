import { BaseController } from './BaseController.js'
import { optionsToStyle } from '../utils/styleMapper.js'

export class RowController extends BaseController {
  tag = 'row'

  resolveBaseStyle(optionValues) {
    return {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'stretch',
      ...optionsToStyle(optionValues),
    }
  }

  getHtmlTag(_node) {
    return 'div'
  }
}

export class ColumnController extends BaseController {
  tag = 'column'

  resolveBaseStyle(optionValues) {
    const base = {
      flex: '1',
      minWidth: '0',
      ...optionsToStyle(optionValues),
    }
    return base
  }

  getHtmlTag(_node) {
    return 'div'
  }
}
