import { useState } from 'react'
import { useAppStore } from '../../store/appStore.js'

const BP_TABS = [
  { bp: 0, icon: '📱', label: 'Mobile' },
  { bp: 1, icon: '▭', label: 'Tablet' },
  { bp: 2, icon: '🖥', label: 'Desktop' },
]

/**
 * OptionResponsive — wraps any OptionField with 3 breakpoint tabs.
 *
 * The active tab reads `node.getOptionForBreakpoint(optKey, tabBp)`.
 * On change, calls `node.setOptionForBreakpoint(optKey, value, tabBp)`.
 *
 * The global viewport breakpoint is pre-selected as the default tab.
 *
 * @param {{
 *   node: import('../../core/ElementNode.js').ElementNode,
 *   optKey: string,
 *   children: (value: any, onChange: (v:any)=>void) => React.ReactNode
 * }} props
 */
export function OptionResponsive({ node, optKey, children }) {
  const globalBp = useAppStore(s => s.breakpoint)
  // Re-render when options change so the displayed value stays current
  useAppStore(s => s.optionVersions[node.$id] ?? 0)
  const [activeBp, setActiveBp] = useState(globalBp)

  const currentValue = node.getOptionForBreakpoint(optKey, activeBp)

  function handleChange(newVal) {
    node.setOptionForBreakpoint(optKey, newVal, activeBp)
  }

  const hasOverride = (bp) => {
    if (bp === 2) return false
    const arr = node.responsiveValues[optKey]
    if (!arr) return false
    return arr[bp] !== null && arr[bp] !== undefined
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 2, marginBottom: 6, background: '#f1f5f9', borderRadius: 5, padding: 2 }}>
        {BP_TABS.map(({ bp, icon, label }) => {
          const active = activeBp === bp
          const overridden = hasOverride(bp)
          return (
            <button
              key={bp}
              title={label}
              onClick={() => setActiveBp(bp)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                padding: '3px 0',
                fontSize: 13,
                border: 'none',
                background: active ? '#fff' : 'transparent',
                color: active ? '#2563eb' : '#94a3b8',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                transition: 'all 100ms',
                position: 'relative',
              }}
            >
              {icon}
              {overridden && (
                <span
                  title="Has override"
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 4,
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#f59e0b',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
      {children(currentValue, handleChange)}
    </div>
  )
}
