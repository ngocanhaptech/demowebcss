import { useState } from 'react'

/**
 * OptionGroup — collapsible section header for PropsPanel.
 * Local open/close state, independent per instance.
 *
 * @param {{ label: string, defaultOpen?: boolean, children: React.ReactNode }} props
 */
export function OptionGroup({ label, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '9px 12px',
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#94a3b8',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span>{label}</span>
        <span
          style={{
            display: 'inline-block',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
            fontSize: 9,
            lineHeight: 1,
          }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 12px 12px 12px' }}>
          {children}
        </div>
      )}
    </div>
  )
}
