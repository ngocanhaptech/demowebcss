import { BaseController } from './BaseController.js'
import { optionsToStyle } from '../utils/styleMapper.js'

export class SectionController extends BaseController {
  tag = 'section'

  resolveBaseStyle(optionValues) {
    return {
      width: '100%',
      ...optionsToStyle(optionValues),
    }
  }

  getHtmlTag(_node) {
    return 'section'
  }
}

export class ContainerController extends BaseController {
  tag = 'container'

  resolveBaseStyle(optionValues) {
    return {
      maxWidth: 'var(--container-max)',
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingLeft: 'var(--gutter)',
      paddingRight: 'var(--gutter)',
      width: '100%',
      ...optionsToStyle(optionValues),
    }
  }

  getHtmlTag(_node) {
    return 'div'
  }
}
