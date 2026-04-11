import { useCallback } from 'react'

/**
 * OptionRange — range slider with numeric display.
 * Value stored as number (no unit) or "${number}${unit}" string.
 *
 * @param {{ value: number|string, onChange: (v:any)=>void, min?: number, max?: number, step?: number, unit?: string }} props
 */
export function OptionRange({ value, onChange, min = 0, max = 100, step = 1, unit = '' }) {
  const numVal = parseFloat(value) || 0

  const handleSlider = useCallback((e) => {
    const v = parseFloat(e.target.value)
    onChange(unit ? `${v}${unit}` : v)
  }, [onChange, unit])

  const handleNumber = useCallback((e) => {
    const v = parseFloat(e.target.value)
    if (!isNaN(v)) onChange(unit ? `${v}${unit}` : v)
  }, [onChange, unit])

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numVal}
        onChange={handleSlider}
        style={{
          flex: 1,
          height: 4,
          accentColor: '#2563eb',
          cursor: 'pointer',
        }}
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={numVal}
        onChange={handleNumber}
        style={{
          width: 44,
          padding: '3px 4px',
          fontSize: 11,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          border: '1px solid #d1d5db',
          borderRadius: 4,
          background: '#fff',
          color: '#475569',
          textAlign: 'center',
          outline: 'none',
        }}
      />
      {unit && (
        <span style={{ fontSize: 10, color: '#94a3b8', minWidth: 14, textAlign: 'left' }}>
          {unit}
        </span>
      )}
    </div>
  )
}
