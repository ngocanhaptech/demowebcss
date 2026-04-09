import { useCallback } from 'react'

/**
 * OptionSelect — native <select> dropdown.
 * @param {{ value: string, onChange: (v:string)=>void, options: Array<{value,label}|string> }} props
 */
export function OptionSelect({ value, onChange, options = [] }) {
  const handleChange = useCallback((e) => {
    onChange(e.target.value)
  }, [onChange])

  return (
    <select
      value={value ?? ''}
      onChange={handleChange}
      style={{
        width: '100%',
        padding: '5px 8px',
        fontSize: 12,
        border: '1px solid #d1d5db',
        borderRadius: 4,
        background: '#fff',
        color: '#1e293b',
        cursor: 'pointer',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        outline: 'none',
        appearance: 'auto',
      }}
    >
      {options.map(opt => {
        const val = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        return <option key={val} value={val}>{label}</option>
      })}
    </select>
  )
}
