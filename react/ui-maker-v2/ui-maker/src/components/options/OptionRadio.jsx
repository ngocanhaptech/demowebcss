import { useCallback } from 'react'

/**
 * OptionRadio — segmented button group for a small set of values.
 * @param {{ value: string, onChange: (v:string)=>void, options: Array<{value,label}|string> }} props
 */
export function OptionRadio({ value, onChange, options = [] }) {
  const handleClick = useCallback((val) => {
    onChange(val)
  }, [onChange])

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {options.map(opt => {
        const val = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        const active = value === val
        return (
          <button
            key={val}
            onClick={() => handleClick(val)}
            style={{
              padding: '4px 9px',
              fontSize: 11,
              fontWeight: 500,
              border: active ? '1px solid #2563eb' : '1px solid #d1d5db',
              background: active ? '#eff6ff' : '#fff',
              color: active ? '#1d4ed8' : '#475569',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'all 80ms',
              userSelect: 'none',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
