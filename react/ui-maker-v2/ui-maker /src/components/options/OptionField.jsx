import { useAppStore } from '../../store/appStore.js'
import { OptionText }      from './OptionText.jsx'
import { OptionSelect }    from './OptionSelect.jsx'
import { OptionColor }     from './OptionColor.jsx'
import { OptionRange }     from './OptionRange.jsx'
import { OptionRadio }     from './OptionRadio.jsx'
import { OptionCheckbox }  from './OptionCheckbox.jsx'
import { OptionCssVars }   from './OptionCssVars.jsx'
import { OptionResponsive } from './OptionResponsive.jsx'
import { OptionImage }     from './OptionImage.jsx'

/**
 * OptionField — router component.
 * Renders the correct input widget based on `def.type`, wrapping in
 * OptionResponsive when `def.responsive === true`.
 *
 * @param {{
 *   node: import('../../core/ElementNode.js').ElementNode,
 *   optKey: string,
 *   def: import('../../data/elementDefs.js').OptionDef,
 * }} props
 */
export function OptionField({ node, optKey, def }) {
  // Subscribe to option version — re-renders when any option on this node changes
  // (Proxy setter calls bumpOptionVersion; without this, controlled inputs revert)
  useAppStore(s => s.optionVersions[node.$id] ?? 0)

  const baseValue = node.options[optKey] ?? def.default

  function renderInner(value, onChange) {
    switch (def.type) {
      case 'text':
        return (
          <OptionText
            value={value}
            onChange={onChange}
            placeholder={def.placeholder}
          />
        )
      case 'select':
        return (
          <OptionSelect
            value={value}
            onChange={onChange}
            options={def.options ?? []}
          />
        )
      case 'color':
        return (
          <OptionColor
            value={value}
            onChange={onChange}
          />
        )
      case 'range':
        return (
          <OptionRange
            value={value}
            onChange={onChange}
            min={def.min}
            max={def.max}
            step={def.step}
            unit={def.unit}
          />
        )
      case 'radio':
        return (
          <OptionRadio
            value={value}
            onChange={onChange}
            options={def.options ?? []}
          />
        )
      case 'checkbox':
        return (
          <OptionCheckbox
            value={value}
            onChange={onChange}
            label={def.label}
          />
        )
      case 'cssvars':
        return (
          <OptionCssVars
            value={value}
            onChange={onChange}
            cssVarGroup={def.cssVarGroup}
          />
        )
      case 'image':
        return (
          <OptionImage
            value={value}
            onChange={onChange}
          />
        )
      default:
        return (
          <OptionText
            value={String(value ?? '')}
            onChange={onChange}
            placeholder={def.placeholder}
          />
        )
    }
  }

  if (def.responsive) {
    return (
      <OptionResponsive node={node} optKey={optKey}>
        {(value, onChange) => renderInner(value, onChange)}
      </OptionResponsive>
    )
  }

  function handleChange(newVal) {
    node.options[optKey] = newVal
  }

  return renderInner(baseValue, handleChange)
}
