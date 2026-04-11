import { useCallback } from 'react'

/**
 * OptionCheckbox — toggle checkbox with inline label.
 * @param {{ value: boolean, onChange: (v:boolean)=>void, label?: string }} props
 */
export function OptionCheckbox({ value, onChange, label }) {
  const id = `chk-${label ?? 'opt'}`

  const handleChange = useCallback((e) => {
    onChange(e.target.checked)
  }, [onChange])

  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        cursor: 'pointer',
        userSelect: 'none',
        padding: '2px 0',
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={!!value}
        onChange={handleChange}
        style={{
          width: 14,
          height: 14,
          accentColor: '#2563eb',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      />
      {label && (
        <span style={{ fontSize: 12, color: '#475569' }}>{label}</span>
      )}
    </label>
  )
}
