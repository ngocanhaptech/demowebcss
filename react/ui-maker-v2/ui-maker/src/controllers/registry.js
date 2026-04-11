import { BaseController } from './BaseController.js'
import { SectionController, ContainerController } from './SectionController.js'
import { RowController, ColumnController } from './LayoutController.js'
import { HeadingController, ParagraphController } from './TextController.js'
import { ButtonController } from './ButtonController.js'
import { NavbarController } from './NavbarController.js'
import { CardController } from './CardController.js'
import { ImageController } from './ImageController.js'

/** @type {Map<string, BaseController>} */
const controllers = new Map()

function register(ControllerClass) {
  const instance = new ControllerClass()
  controllers.set(instance.tag, instance)
}

register(SectionController)
register(ContainerController)
register(RowController)
register(ColumnController)
register(HeadingController)
register(ParagraphController)
register(ButtonController)
register(NavbarController)
register(CardController)
register(ImageController)

const _fallback = new BaseController()

export const ControllerRegistry = {
  /**
   * Get controller for a tag. Falls back to BaseController if unknown.
   * @param {string} tag
   * @returns {BaseController}
   */
  get(tag) {
    return controllers.get(tag) ?? _fallback
  },

  /**
   * Register a custom controller at runtime.
   * @param {typeof BaseController} ControllerClass
   */
  register(ControllerClass) {
    register(ControllerClass)
  },

  has(tag) {
    return controllers.has(tag)
  },

  tags() {
    return [...controllers.keys()]
  },
}
