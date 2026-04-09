import { useState, useCallback } from 'react'
import { ThemeService } from '../../data/ThemeService.js'

/**
 * OptionColor — two-mode color picker.
 *   mode "raw"  : native color picker + text input for any CSS value
 *   mode "theme": CSS variable swatch grid from ThemeService
 *
 * @param {{ value: string, onChange: (v:string)=>void }} props
 */
export function OptionColor({ value, onChange }) {
  const isVar = typeof value === 'string' && value.startsWith('var(')
  const [mode, setMode] = useState(isVar ? 'theme' : 'raw')

  const colorVars = ThemeService.getColorVars()
  const resolved = ThemeService.resolveValue(value)

  const handleColorPicker = useCallback((e) => {
    onChange(e.target.value)
  }, [onChange])

  const handleText = useCallback((e) => {
    onChange(e.target.value)
  }, [onChange])

  const handleVarSelect = useCallback((cssValue) => {
    onChange(cssValue)
  }, [onChange])

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        <button onClick={() => setMode('raw')} style={modeBtn(mode === 'raw')}>Raw</button>
        <button onClick={() => setMode('theme')} style={modeBtn(mode === 'theme')}>Theme</button>
      </div>

      {mode === 'raw' ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="color"
            value={safeHex(resolved)}
            onChange={handleColorPicker}
            title="Pick a color"
            style={{
              width: 32,
              height: 28,
              padding: 2,
              border: '1px solid #d1d5db',
              borderRadius: 4,
              cursor: 'pointer',
              flexShrink: 0,
              background: 'none',
            }}
          />
          <input
            type="text"
            value={value ?? ''}
            onChange={handleText}
            placeholder="#000 or var(--color-...)"
            style={{
              flex: 1,
              padding: '4px 7px',
              fontSize: 11,
              border: '1px solid #d1d5db',
              borderRadius: 4,
              background: '#fff',
              color: '#1e293b',
              outline: 'none',
              fontFamily: 'ui-monospace, monospace',
            }}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {colorVars.map(({ varName, label, value: resolvedColor, cssValue }) => {
            const active = value === cssValue
            return (
              <button
                key={varName}
                title={`${label}\n${cssValue}`}
                onClick={() => handleVarSelect(cssValue)}
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  background: resolvedColor || cssValue,
                  border: active ? '2px solid #2563eb' : '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  padding: 0,
                  outline: active ? '2px solid #93c5fd' : 'none',
                  outlineOffset: 1,
                  transition: 'outline 80ms',
                }}
              />
            )
          })}
          <button
            title="No color (transparent)"
            onClick={() => handleVarSelect('')}
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              background: 'repeating-linear-gradient(45deg,#e2e8f0 0,#e2e8f0 4px,#fff 4px,#fff 8px)',
              border: value === '' ? '2px solid #2563eb' : '1px solid rgba(0,0,0,0.12)',
              borderRadius: 4,
              cursor: 'pointer',
              padding: 0,
              fontSize: 8,
              color: '#94a3b8',
            }}
          />
        </div>
      )}
    </div>
  )
}

/** Returns a safe hex color string for the native color picker (must start with #). */
function safeHex(val) {
  if (!val) return '#000000'
  if (/^#[0-9a-fA-F]{6}$/.test(val)) return val
  if (/^#[0-9a-fA-F]{3}$/.test(val)) {
    const [, r, g, b] = val.match(/^#(.)(.)(.)$/)
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return '#000000'
}

function modeBtn(active) {
  return {
    flex: 1,
    padding: '3px 0',
    fontSize: 11,
    fontWeight: 500,
    border: active ? '1px solid #2563eb' : '1px solid #d1d5db',
    background: active ? '#eff6ff' : '#fff',
    color: active ? '#2563eb' : '#64748b',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'all 100ms',
  }
}
