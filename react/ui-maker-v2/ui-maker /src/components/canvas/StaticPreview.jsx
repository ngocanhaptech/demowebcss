import { useEffect, useState, Fragment } from 'react'
import { ControllerRegistry } from '../../controllers/registry.js'
import { resolvePhase0Options } from '../../utils/styleMapper.js'

/**
 * Phase 0 — Static Preview.
 * Loads landing-page.json + default theme, renders the tree as React elements.
 * No interaction, no ElementNode class — pure JSON → JSX.
 */

async function applyTheme(themeId = 'default') {
  const theme = await fetch(`/data/themes/${themeId}.json`).then(r => r.json())
  const root = document.documentElement
  for (const group of Object.values(theme.variables)) {
    for (const [name, value] of Object.entries(group)) {
      root.style.setProperty(name, value)
    }
  }
  // Also set font-family on body
  document.body.style.fontFamily = 'var(--font-base)'
  document.body.style.color = 'var(--color-text)'
  document.body.style.lineHeight = 'var(--line-height-base)'
}

/**
 * Recursively render a plain JSON node as React elements.
 * @param {object} node - plain JSON node from the page tree
 * @returns {React.ReactElement|null}
 */
function renderNode(node) {
  if (!node?.tag) return null

  // _root: transparent wrapper, render children directly
  if (node.tag === '_root') {
    return (
      <Fragment key={node.$id}>
        {node.children?.map(child => renderNode(child))}
      </Fragment>
    )
  }

  const controller = ControllerRegistry.get(node.tag)
  const opts = resolvePhase0Options(node.options ?? {})
  const style = controller.resolveBaseStyle(opts)
  const Tag = controller.getHtmlTag(node)
  const hasChildren = Array.isArray(node.children) && node.children.length > 0

  if (hasChildren) {
    return (
      <Tag key={node.$id} style={style}>
        {node.children.map(child => renderNode(child))}
      </Tag>
    )
  }

  // Leaf node: render text content
  const content = node.content ?? ''
  return (
    <Tag key={node.$id} style={style}>
      {content}
    </Tag>
  )
}

export function StaticPreview() {
  const [pageData, setPageData] = useState(null)
  const [error, setError] = useState(null)
  const [themeReady, setThemeReady] = useState(false)

  useEffect(() => {
    applyTheme('default')
      .then(() => setThemeReady(true))
      .catch(err => setError(`Theme error: ${err.message}`))
  }, [])

  useEffect(() => {
    if (!themeReady) return
    fetch('/data/samples/landing-page.json')
      .then(r => r.json())
      .then(setPageData)
      .catch(err => setError(`Page error: ${err.message}`))
  }, [themeReady])

  if (error) {
    return (
      <div style={{ padding: 40, color: 'red', fontFamily: 'monospace' }}>
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (!pageData) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'system-ui', color: '#888', fontSize: 16
      }}>
        Loading page...
      </div>
    )
  }

  return (
    <div
      data-preview="static"
      style={{ backgroundColor: '#fff', minHeight: '100vh' }}
    >
      {renderNode(pageData.tree)}
    </div>
  )
}
