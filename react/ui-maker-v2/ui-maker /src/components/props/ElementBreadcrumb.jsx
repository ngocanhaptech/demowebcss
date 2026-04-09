import { useAppStore } from '../../store/appStore.js'
import { getElementDef } from '../../data/elementDefs.js'

/**
 * ElementBreadcrumb — shows the path from root to the selected node.
 * Each ancestor is a clickable chip that selects that node.
 *
 * @param {{ node: import('../../core/ElementNode.js').ElementNode }} props
 */
export function ElementBreadcrumb({ node }) {
  const selectElement = useAppStore(s => s.selectElement)

  const ancestors = []
  let cursor = node._parent
  while (cursor && !cursor.isRoot) {
    ancestors.unshift(cursor)
    cursor = cursor._parent
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        padding: '6px 12px',
        borderBottom: '1px solid #e2e8f0',
        minHeight: 30,
        background: '#f8fafc',
      }}
    >
      {ancestors.map((ancestor) => {
        const def = getElementDef(ancestor.tag)
        return (
          <span key={ancestor.$id} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <button
              onClick={() => selectElement(ancestor.$id)}
              title={`Select ${def.label} #${ancestor.$id}`}
              style={{
                padding: '1px 6px',
                fontSize: 10,
                color: '#94a3b8',
                background: 'transparent',
                border: '1px solid transparent',
                borderRadius: 3,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 80ms',
              }}
              onMouseEnter={e => {
                e.target.style.background = '#e2e8f0'
                e.target.style.color = '#475569'
              }}
              onMouseLeave={e => {
                e.target.style.background = 'transparent'
                e.target.style.color = '#94a3b8'
              }}
            >
              {def.icon} {def.label}
            </button>
            <span style={{ fontSize: 9, color: '#cbd5e1' }}>›</span>
          </span>
        )
      })}
      <span
        style={{
          padding: '1px 6px',
          fontSize: 10,
          fontWeight: 600,
          color: '#1e293b',
          background: '#e2e8f0',
          borderRadius: 3,
        }}
      >
        {getElementDef(node.tag).icon} {getElementDef(node.tag).label}
      </span>
    </div>
  )
}
