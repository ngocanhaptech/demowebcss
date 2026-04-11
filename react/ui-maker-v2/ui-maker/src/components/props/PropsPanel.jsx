import { useCallback } from 'react'
import { useAppStore } from '../../store/appStore.js'
import { useSelectedNode } from '../../hooks/useApp.js'
import { getElementDef } from '../../data/elementDefs.js'
import { ElementBreadcrumb } from './ElementBreadcrumb.jsx'
import { OptionGroup } from '../options/OptionGroup.jsx'
import { OptionField } from '../options/OptionField.jsx'

/**
 * PropsPanel — 280px right-side panel showing options for the selected element.
 *
 * Structure:
 *  ┌─ Header (element type + deselect button) ─┐
 *  │  ElementBreadcrumb                         │
 *  │  ContentEditor  (leaf nodes only)          │
 *  │  OptionGroups (collapsible)                │
 *  └────────────────────────────────────────────┘
 *
 * When nothing is selected, shows an empty placeholder.
 */
export function PropsPanel() {
  const node = useSelectedNode()

  if (!node) {
    return (
      <div style={panelStyle}>
        <div style={emptyStyle}>
          <span style={{ fontSize: 28 }}>↖</span>
          <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
            Click an element to edit
          </span>
        </div>
      </div>
    )
  }

  const def = getElementDef(node.tag)

  return (
    <div style={panelStyle}>
      <PanelHeader node={node} def={def} />
      <ElementBreadcrumb node={node} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {node.children === undefined && (
          <ContentEditor node={node} />
        )}
        {def.groups.map(group => (
          <OptionGroup
            key={group.label}
            label={group.label}
            defaultOpen={group.defaultOpen}
          >
            <FieldList node={node} def={def} fields={group.fields} />
          </OptionGroup>
        ))}
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PanelHeader({ node, def }) {
  const selectElement = useAppStore(s => s.selectElement)
  const deleteElement = useAppStore(s => s.deleteElement)

  const canDelete = !!node._parent  // root node has no parent

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 12px',
        borderBottom: '1px solid #e2e8f0',
        background: '#fff',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          background: '#eff6ff',
          borderRadius: 5,
          fontSize: 12,
          fontWeight: 700,
          color: '#2563eb',
          flexShrink: 0,
        }}
      >
        {def.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>
          {def.label}
        </div>
        <div
          style={{
            fontSize: 10,
            color: '#94a3b8',
            fontFamily: 'ui-monospace, monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          #{node.$id}
        </div>
      </div>

      {/* Delete button */}
      {canDelete && (
        <button
          onClick={() => deleteElement(node.$id)}
          title="Delete element (Delete)"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, fontSize: 13,
            border: 'none', background: 'transparent',
            color: '#94a3b8', cursor: 'pointer', borderRadius: 4,
            flexShrink: 0, lineHeight: 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
        >
          🗑
        </button>
      )}

      {/* Deselect button */}
      <button
        onClick={() => selectElement(null)}
        title="Deselect (Esc)"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 22, height: 22, fontSize: 14,
          border: 'none', background: 'transparent',
          color: '#94a3b8', cursor: 'pointer', borderRadius: 4,
          flexShrink: 0, lineHeight: 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
      >
        ✕
      </button>
    </div>
  )
}

function ContentEditor({ node }) {
  // Subscribe to option version so the textarea re-renders when setContent fires
  // (setContent calls applyOption → bumpOptionVersion; without this the controlled
  // textarea reverts to the stale value after every keystroke)
  useAppStore(s => s.optionVersions[node.$id] ?? 0)

  const handleInput = useCallback((e) => {
    node.setContent(e.target.value, true)
  }, [node])

  return (
    <div style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>
      <label
        style={{
          display: 'block',
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#94a3b8',
          marginBottom: 5,
        }}
      >
        Content
      </label>
      <textarea
        value={node.content ?? ''}
        onChange={handleInput}
        rows={3}
        style={{
          width: '100%',
          padding: '6px 8px',
          fontSize: 12,
          border: '1px solid #d1d5db',
          borderRadius: 4,
          background: '#fff',
          color: '#1e293b',
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'inherit',
          lineHeight: 1.5,
          boxSizing: 'border-box',
        }}
        onFocus={e => { e.target.style.borderColor = '#2563eb' }}
        onBlur={e => { e.target.style.borderColor = '#d1d5db' }}
      />
    </div>
  )
}

function FieldList({ node, def, fields }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {fields.map(key => {
        const fieldDef = def.optionDefs[key]
        if (!fieldDef) return null
        const isCheckbox = fieldDef.type === 'checkbox'
        return (
          <div key={key}>
            {!isCheckbox && (
              <label
                style={{
                  display: 'block',
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#64748b',
                  marginBottom: 4,
                  userSelect: 'none',
                }}
              >
                {fieldDef.label}
              </label>
            )}
            <OptionField node={node} optKey={key} def={fieldDef} />
          </div>
        )
      })}
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const panelStyle = {
  width: 280,
  minWidth: 280,
  maxWidth: 280,
  display: 'flex',
  flexDirection: 'column',
  background: '#fff',
  borderLeft: '1px solid #e2e8f0',
  height: '100%',
  overflow: 'hidden',
  flexShrink: 0,
}

const emptyStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#cbd5e1',
  gap: 0,
}
