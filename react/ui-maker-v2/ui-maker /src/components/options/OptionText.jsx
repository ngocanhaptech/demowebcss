import { useCallback } from 'react'

/**
 * OptionText — plain text / CSS value input.
 * @param {{ value: string, onChange: (v:string)=>void, placeholder?: string }} props
 */
export function OptionText({ value, onChange, placeholder = '' }) {
  const handleChange = useCallback((e) => {
    onChange(e.target.value)
  }, [onChange])

  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={handleChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '5px 8px',
        fontSize: 12,
        border: '1px solid #d1d5db',
        borderRadius: 4,
        background: '#fff',
        color: '#1e293b',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
      }}
      onFocus={e => { e.target.style.borderColor = '#2563eb' }}
      onBlur={e => { e.target.style.borderColor = '#d1d5db' }}
    />
  )
}
