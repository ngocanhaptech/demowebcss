import { useAppStore } from '../../store/appStore.js'

/**
 * Viewport widths for each mode (matches ResponsiveManager breakpoints).
 * Desktop is unconstrained (100% of canvas area).
 */
const VIEWPORT_CONFIG = {
  desktop: { maxWidth: '100%',  label: 'Desktop',  labelWidth: null },
  tablet:  { maxWidth: '768px', label: 'Tablet',   labelWidth: '768' },
  mobile:  { maxWidth: '375px', label: 'Mobile',   labelWidth: '375' },
}

/**
 * ViewportFrame — constrains the canvas content to the current viewport width.
 * Centers the frame horizontally and shows a width indicator for non-desktop modes.
 */
export function ViewportFrame({ children }) {
  const viewportMode = useAppStore(s => s.viewportMode)
  const config = VIEWPORT_CONFIG[viewportMode] ?? VIEWPORT_CONFIG.desktop

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100%',
      }}
    >
      {config.labelWidth && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            marginBottom: 8,
            background: '#1e293b',
            borderRadius: 6,
            fontSize: 11,
            color: '#94a3b8',
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '0.04em',
          }}
        >
          <span style={{ color: '#64748b' }}>↔</span>
          <span>{config.label} — {config.labelWidth}px</span>
        </div>
      )}

      <div
        style={{
          width: '100%',
          maxWidth: config.maxWidth,
          background: '#ffffff',
          boxShadow: viewportMode !== 'desktop'
            ? '0 0 0 1px #e2e8f0, 0 4px 24px rgba(0,0,0,0.08)'
            : 'none',
          transition: 'max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}
