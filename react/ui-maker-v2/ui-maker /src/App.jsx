import { useEffect, useState, useCallback } from 'react'
import { registry, useAppStore } from './store/appStore.js'
import { Header } from './components/header/Header.jsx'
import { Canvas } from './components/canvas/Canvas.jsx'
import { PropsPanel } from './components/props/PropsPanel.jsx'
import { LeftPanel } from './components/panel/LeftPanel.jsx'
import { DragDropContext } from './dnd/DragDropContext.jsx'

/**
 * Apply CSS custom properties from the theme JSON to :root.
 * @param {string} themeId
 */
async function applyTheme(themeId = 'default') {
  const theme = await fetch(`/data/themes/${themeId}.json`).then(r => r.json())
  const root = document.documentElement
  for (const group of Object.values(theme.variables)) {
    for (const [name, value] of Object.entries(group)) {
      root.style.setProperty(name, value)
    }
  }
  document.body.style.fontFamily = 'var(--font-base)'
  document.body.style.color = 'var(--color-text)'
  document.body.style.lineHeight = 'var(--line-height-base)'
}

/**
 * Top-level loading screen.
 */
function LoadingScreen({ error }) {
  if (error) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'ui-monospace, monospace',
        color: '#ef4444',
        gap: 8,
        padding: 32,
      }}>
        <strong style={{ fontSize: 16 }}>Init error</strong>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>{error}</span>
      </div>
    )
  }
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui',
      color: '#94a3b8',
      fontSize: 14,
    }}>
      Initializing ui-maker…
    </div>
  )
}

/**
 * Main editor layout — rendered after the page tree is loaded.
 *
 * Phase 4 layout:
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  Header (52px)                                          │
 *  ├─────────────────────────────────────────────────────────┤
 *  │ ElementsPanel(220) │ Canvas (flex:1) │ PropsPanel(280) │
 *  └─────────────────────────────────────────────────────────┘
 *
 * DragDropContext wraps the entire editor body (above Header too).
 */
function EditorLayout() {
  const showLeft = useAppStore(s => s.showLeftPanel)
  const showRight = useAppStore(s => s.showRightPanel)

  return (
    <DragDropContext>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#f8fafc',
        }}
      >
        <Header />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {showLeft && <LeftPanel />}
          <Canvas />
          {showRight && <PropsPanel />}
        </div>
      </div>
    </DragDropContext>
  )
}

/**
 * App root — manages initialization then hands off to EditorLayout.
 *
 * Initialization order:
 *  1. Apply theme CSS variables to :root
 *  2. Fetch landing-page.json
 *  3. registry.restore(page.tree) — builds the ElementNode tree
 *  4. Render EditorLayout
 */
export default function App() {
  const [ready, setReady] = useState(false)
  const [initError, setInitError] = useState(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      applyTheme('default'),
      fetch('/data/samples/landing-page.json').then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} fetching landing-page.json`)
        return r.json()
      }),
    ])
      .then(([, page]) => {
        if (cancelled) return
        // initPages: loads pages from localStorage, or seeds with sample tree on first run.
        // This replaces the direct registry.restore(page.tree) call.
        useAppStore.getState().initPages(page.tree)
        setReady(true)
      })
      .catch(err => {
        if (cancelled) return
        setInitError(err.message)
      })

    return () => { cancelled = true }
  }, [])

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Y / Escape
  const handleKeyDown = useCallback((e) => {
    const store = useAppStore.getState()
    const isInput = e.target.matches('input, textarea, [contenteditable]')

    if ((e.ctrlKey || e.metaKey) && !isInput) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        store.undo()
        return
      }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault()
        store.redo()
        return
      }
    }
    if (e.key === 'Escape') {
      store.selectElement(null)
      return
    }

    // Delete / Backspace — remove selected element (skip when typing in inputs)
    if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
      if (store.selectedId) {
        e.preventDefault()
        store.deleteElement()
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!ready) return <LoadingScreen error={initError} />

  return <EditorLayout />
}
