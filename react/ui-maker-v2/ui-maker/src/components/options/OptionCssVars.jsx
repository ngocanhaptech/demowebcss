import { useCallback } from 'react'
import { ThemeService } from '../../data/ThemeService.js'

/** Map cssVarGroup → ThemeService getter */
const GROUP_GETTERS = {
  fontSize: () => ThemeService.getFontSizeVars(),
  shadow:   () => ThemeService.getShadowVars(),
  radius:   () => ThemeService.getRadiusVars(),
}

/**
 * OptionCssVars — list picker for fontSize / shadow / radius CSS variables.
 * Each row shows a visual preview, the label, and is highlighted when active.
 *
 * @param {{ value: string, onChange: (v:string)=>void, cssVarGroup: 'fontSize'|'shadow'|'radius' }} props
 */
export function OptionCssVars({ value, onChange, cssVarGroup }) {
  const entries = GROUP_GETTERS[cssVarGroup]?.() ?? []

  const handleSelect = useCallback((cssValue) => {
    onChange(cssValue)
  }, [onChange])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {entries.map(({ varName, label, cssValue }) => {
        const active = value === cssValue
        return (
          <button
            key={varName}
            onClick={() => handleSelect(cssValue)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 8px',
              fontSize: 11,
              border: active ? '1px solid #2563eb' : '1px solid transparent',
              background: active ? '#eff6ff' : 'transparent',
              color: active ? '#1d4ed8' : '#475569',
              borderRadius: 4,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 80ms',
            }}
          >
            <CssVarPreview cssVarGroup={cssVarGroup} varName={varName} />
            <span style={{ flex: 1 }}>{label}</span>
            {active && (
              <span style={{ fontSize: 10, color: '#2563eb', flexShrink: 0 }}>✓</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Small visual preview of the CSS variable value. */
function CssVarPreview({ cssVarGroup, varName }) {
  if (cssVarGroup === 'fontSize') {
    return (
      <span
        style={{
          fontSize: `var(${varName})`,
          lineHeight: 1,
          color: '#1e293b',
          minWidth: 18,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        A
      </span>
    )
  }
  if (cssVarGroup === 'shadow') {
    return (
      <span
        style={{
          display: 'inline-block',
          width: 22,
          height: 14,
          borderRadius: 3,
          boxShadow: `var(${varName})`,
          background: '#fff',
          border: '1px solid #e2e8f0',
          flexShrink: 0,
        }}
      />
    )
  }
  if (cssVarGroup === 'radius') {
    return (
      <span
        style={{
          display: 'inline-block',
          width: 18,
          height: 18,
          borderRadius: `var(${varName})`,
          background: '#cbd5e1',
          flexShrink: 0,
        }}
      />
    )
  }
  return <span style={{ width: 18, flexShrink: 0 }} />
}
