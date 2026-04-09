import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ElementRegistry } from '../core/ElementRegistry.js'
import { ElementNode, ACTION_TYPES } from '../core/ElementNode.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeRegistry() {
  return new ElementRegistry()
}

/**
 * Minimal page tree fixture for testing.
 *
 * _root
 *   └── section (section-001)
 *         └── container (container-001)
 *               ├── heading (heading-001)  [leaf, content="Hello"]
 *               └── paragraph (para-001)   [leaf, content="World"]
 */
const FIXTURE_TREE = {
  $id: 'root',
  tag: '_root',
  options: {},
  children: [
    {
      $id: 'section-001',
      tag: 'section',
      options: { paddingY: 80, bgColor: 'var(--color-bg)' },
      children: [
        {
          $id: 'container-001',
          tag: 'container',
          options: {},
          children: [
            {
              $id: 'heading-001',
              tag: 'heading',
              content: 'Hello',
              options: { level: 'h1', color: 'var(--color-text)' },
            },
            {
              $id: 'para-001',
              tag: 'paragraph',
              content: 'World',
              options: { fontSize: 'var(--font-size-base)' },
            },
          ],
        },
      ],
    },
  ],
}

/**
 * Fixture with responsive options.
 */
const RESPONSIVE_TREE = {
  $id: 'root',
  tag: '_root',
  options: {},
  children: [
    {
      $id: 'section-resp',
      tag: 'section',
      options: {
        paddingY: 120,
        $responsive: { paddingY: [60, 80, 120] },
      },
      children: [],
    },
  ],
}

// ─── Constructor ──────────────────────────────────────────────────────────────

describe('ElementNode — constructor', () => {
  it('sets $id, tag, content from plain object', () => {
    const reg = makeRegistry()
    reg.restore(FIXTURE_TREE)
    const node = reg.get('heading-001')
    expect(node.$id).toBe('heading-001')
    expect(node.tag).toBe('heading')
    expect(node.content).toBe('Hello')
  })

  it('generates a $id when plainObj has no $id', () => {
    const reg = makeRegistry()
    const root = new ElementNode({ tag: '_root', options: {} }, null, reg)
    expect(root.$id).toMatch(/^_root-/)
  })

  it('sets $parentId to null for root node', () => {
    const reg = makeRegistry()
    reg.restore(FIXTURE_TREE)
    expect(reg.get('root').$parentId).toBeNull()
  })

  it('sets $parentId correctly for children', () => {
    const reg = makeRegistry()
    reg.restore(FIXTURE_TREE)
    const heading = reg.get('heading-001')
    expect(heading.$parentId).toBe('container-001')
  })

  it('parses optionValues without $responsive', () => {
    const reg = makeRegistry()
    reg.restore(FIXTURE_TREE)
    const section = reg.get('section-001')
    expect(section.optionValues.paddingY).toBe(80)
    expect(section.optionValues.bgColor).toBe('var(--color-bg)')
    expect(section.optionValues.$responsive).toBeUndefined()
  })

  it('parses responsiveValues from $responsive block', () => {
    const reg = makeRegistry()
    reg.restore(RESPONSIVE_TREE)
    const section = reg.get('section-resp')
    expect(section.responsiveValues.paddingY).toEqual([60, 80, 120])
    expect(section.optionValues.paddingY).toBe(120)
    expect(section.optionValues.$responsive).toBeUndefined()
  })

  it('leaf tags have undefined children', () => {
    const reg = makeRegistry()
    reg.restore(FIXTURE_TREE)
    const heading = reg.get('heading-001')
    expect(heading.children).toBeUndefined()
  })

  it('parent tags with no children have empty array', () => {
    const reg = makeRegistry()
    reg.restore(RESPONSIVE_TREE)
    const section = reg.get('section-resp')
    expect(section.children).toEqual([])
  })

  it('registers all nodes in the registry', () => {
    const reg = makeRegistry()
    reg.restore(FIXTURE_TREE)
    expect(reg.size).toBe(5) // root + section + container + heading + para
  })
})

// ─── Tree Traversal ───────────────────────────────────────────────────────────

describe('ElementNode — tree traversal', () => {
  let reg

  beforeEach(() => {
    reg = makeRegistry()
    reg.restore(FIXTURE_TREE)
  })

  it('root.isRoot is true', () => {
    expect(reg.get('root').isRoot).toBe(true)
  })

  it('non-root isRoot is false', () => {
    expect(reg.get('section-001').isRoot).toBe(false)
  })

  it('root depth is 0', () => {
    expect(reg.get('root').depth).toBe(0)
  })

  it('section depth is 1', () => {
    expect(reg.get('section-001').depth).toBe(1)
  })

  it('heading depth is 3', () => {
    expect(reg.get('heading-001').depth).toBe(3)
  })

  it('index returns -1 for root', () => {
    expect(reg.get('root').index).toBe(-1)
  })

  it('index returns correct position', () => {
    expect(reg.get('heading-001').index).toBe(0)
    expect(reg.get('para-001').index).toBe(1)
  })

  it('parent getter returns the correct parent node', () => {
    const heading = reg.get('heading-001')
    expect(heading.parent.$id).toBe('container-001')
  })

  it('ancestors returns ordered path from root to parent', () => {
    const heading = reg.get('heading-001')
    const ancestors = heading.ancestors
    expect(ancestors.map(n => n.$id)).toEqual(['root', 'section-001', 'container-001'])
  })

  it('root.ancestors is empty', () => {
    expect(reg.get('root').ancestors).toHaveLength(0)
  })

  it('descendants returns all descendants in DFS order', () => {
    const root = reg.get('root')
    const ids = root.descendants.map(n => n.$id)
    expect(ids).toEqual(['section-001', 'container-001', 'heading-001', 'para-001'])
  })

  it('leaf node.descendants is empty', () => {
    const heading = reg.get('heading-001')
    expect(heading.descendants).toHaveLength(0)
  })

  it('siblings excludes self', () => {
    const heading = reg.get('heading-001')
    const siblings = heading.siblings
    expect(siblings).toHaveLength(1)
    expect(siblings[0].$id).toBe('para-001')
  })

  it('nextSibling returns the next child', () => {
    const heading = reg.get('heading-001')
    expect(heading.nextSibling.$id).toBe('para-001')
  })

  it('previousSibling returns null for first child', () => {
    expect(reg.get('heading-001').previousSibling).toBeNull()
  })

  it('previousSibling returns correct node for second child', () => {
    expect(reg.get('para-001').previousSibling.$id).toBe('heading-001')
  })

  it('isParent is true for container nodes', () => {
    expect(reg.get('container-001').isParent).toBe(true)
  })

  it('isParent is false for leaf nodes', () => {
    expect(reg.get('heading-001').isParent).toBe(false)
  })

  it('isEmpty is true for nodes with no children', () => {
    const reg2 = makeRegistry()
    reg2.restore(RESPONSIVE_TREE)
    expect(reg2.get('section-resp').isEmpty).toBe(true)
  })

  it('isEmpty is false for nodes with children', () => {
    expect(reg.get('section-001').isEmpty).toBe(false)
  })
})

// ─── Options Proxy ────────────────────────────────────────────────────────────

describe('ElementNode — options Proxy', () => {
  let reg
  let bumpOptionVersion

  beforeEach(() => {
    bumpOptionVersion = vi.fn()
    reg = makeRegistry()
    reg.setUpdateFns({
      bumpOptionVersion,
      bumpStructureVersion: vi.fn(),
    })
    reg.restore(FIXTURE_TREE)
  })

  it('reading node.options[key] returns the current value', () => {
    const section = reg.get('section-001')
    expect(section.options.paddingY).toBe(80)
  })

  it('writing node.options[key] updates optionValues', () => {
    const section = reg.get('section-001')
    section.options.paddingY = 40
    expect(section.optionValues.paddingY).toBe(40)
  })

  it('writing node.options[key] calls bumpOptionVersion', () => {
    const section = reg.get('section-001')
    section.options.paddingY = 40
    expect(bumpOptionVersion).toHaveBeenCalledWith('section-001')
  })
})

// ─── options Proxy + History debounce ────────────────────────────────────────

describe('ElementNode — options Proxy history debounce', () => {
  let reg
  let pushSpy

  beforeEach(() => {
    vi.useFakeTimers()
    reg = makeRegistry()
    pushSpy = vi.fn()
    reg.setHistory({ push: pushSpy })
    reg.setUpdateFns({ bumpOptionVersion: vi.fn(), bumpStructureVersion: vi.fn() })
    reg.restore(FIXTURE_TREE)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('pushes UPDATE_OPTION to history after debounce', () => {
    const heading = reg.get('heading-001')
    heading.options.color = '#ff0000'
    expect(pushSpy).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(pushSpy).toHaveBeenCalledOnce()
    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ACTION_TYPES.UPDATE_OPTION,
        nodeId: 'heading-001',
        key: 'color',
        oldValue: 'var(--color-text)',
        newValue: '#ff0000',
      })
    )
  })

  it('collapses rapid edits to same key into one history entry', () => {
    const heading = reg.get('heading-001')
    heading.options.color = '#ff0000'
    heading.options.color = '#00ff00'
    heading.options.color = '#0000ff'
    vi.runAllTimers()
    expect(pushSpy).toHaveBeenCalledOnce()
    expect(pushSpy.mock.calls[0][0].newValue).toBe('#0000ff')
    expect(pushSpy.mock.calls[0][0].oldValue).toBe('var(--color-text)')
  })

  it('does not push history if value reverts to original', () => {
    const heading = reg.get('heading-001')
    const original = heading.optionValues.color
    heading.options.color = '#ff0000'
    heading.options.color = original
    vi.runAllTimers()
    expect(pushSpy).not.toHaveBeenCalled()
  })
})

// ─── addChild ─────────────────────────────────────────────────────────────────

describe('ElementNode — addChild', () => {
  let reg

  beforeEach(() => {
    reg = makeRegistry()
    reg.setUpdateFns({ bumpOptionVersion: vi.fn(), bumpStructureVersion: vi.fn() })
    reg.restore(FIXTURE_TREE)
  })

  it('appends a child when no index given', () => {
    const container = reg.get('container-001')
    const newNode = container.addChild({ tag: 'button', options: {}, content: 'Click' })
    expect(container.children).toHaveLength(3)
    expect(container.children[2]).toBe(newNode)
  })

  it('inserts at a specific index', () => {
    const container = reg.get('container-001')
    const newNode = container.addChild({ tag: 'button', options: {} }, 0)
    expect(container.children[0]).toBe(newNode)
    expect(container.children).toHaveLength(3)
  })

  it('registers the new node in the registry', () => {
    const container = reg.get('container-001')
    const newNode = container.addChild({ $id: 'btn-new', tag: 'button', options: {} })
    expect(reg.get('btn-new')).toBe(newNode)
  })

  it('sets the new node parent correctly', () => {
    const container = reg.get('container-001')
    const newNode = container.addChild({ tag: 'button', options: {} })
    expect(newNode.parent).toBe(container)
    expect(newNode.$parentId).toBe('container-001')
  })

  it('throws when adding a child to a leaf node', () => {
    const heading = reg.get('heading-001')
    expect(() => heading.addChild({ tag: 'button', options: {} })).toThrow()
  })

  it('records ADD_ELEMENT to history when record=true', () => {
    const pushSpy = vi.fn()
    reg.setHistory({ push: pushSpy })
    const container = reg.get('container-001')
    container.addChild({ $id: 'btn-rec', tag: 'button', options: {} }, undefined, true)
    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: ACTION_TYPES.ADD_ELEMENT, parentId: 'container-001' })
    )
  })
})

// ─── removeChild ─────────────────────────────────────────────────────────────

describe('ElementNode — removeChild', () => {
  let reg

  beforeEach(() => {
    reg = makeRegistry()
    reg.setUpdateFns({ bumpOptionVersion: vi.fn(), bumpStructureVersion: vi.fn() })
    reg.restore(FIXTURE_TREE)
  })

  it('removes child at index', () => {
    const container = reg.get('container-001')
    container.removeChild(0)
    expect(container.children).toHaveLength(1)
    expect(container.children[0].$id).toBe('para-001')
  })

  it('unregisters removed node from registry', () => {
    const container = reg.get('container-001')
    container.removeChild(0)
    expect(reg.get('heading-001')).toBeUndefined()
  })

  it('no-op for out-of-bounds index', () => {
    const container = reg.get('container-001')
    expect(() => container.removeChild(99)).not.toThrow()
    expect(container.children).toHaveLength(2)
  })

  it('records REMOVE_ELEMENT to history when record=true', () => {
    const pushSpy = vi.fn()
    reg.setHistory({ push: pushSpy })
    const container = reg.get('container-001')
    container.removeChild(0, true)
    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: ACTION_TYPES.REMOVE_ELEMENT, nodeId: 'heading-001' })
    )
  })
})

// ─── remove (self-removal) ────────────────────────────────────────────────────

describe('ElementNode — remove', () => {
  let reg

  beforeEach(() => {
    reg = makeRegistry()
    reg.setUpdateFns({ bumpOptionVersion: vi.fn(), bumpStructureVersion: vi.fn() })
    reg.restore(FIXTURE_TREE)
  })

  it('removes self from parent', () => {
    const heading = reg.get('heading-001')
    heading.remove()
    expect(reg.get('container-001').children).toHaveLength(1)
    expect(reg.get('heading-001')).toBeUndefined()
  })

  it('does not throw when called on root', () => {
    const root = reg.get('root')
    expect(() => root.remove()).not.toThrow()
  })
})

// ─── detach ───────────────────────────────────────────────────────────────────

describe('ElementNode — detach', () => {
  let reg

  beforeEach(() => {
    reg = makeRegistry()
    reg.setUpdateFns({ bumpOptionVersion: vi.fn(), bumpStructureVersion: vi.fn() })
    reg.restore(FIXTURE_TREE)
  })

  it('removes node from parent children but keeps it in registry', () => {
    const heading = reg.get('heading-001')
    heading.detach()
    expect(reg.get('container-001').children).toHaveLength(1)
    expect(reg.get('heading-001')).toBeDefined()
  })

  it('nulls out parent references', () => {
    const heading = reg.get('heading-001')
    heading.detach()
    expect(heading.parent).toBeNull()
    expect(heading.$parentId).toBeNull()
  })
})

// ─── duplicate ────────────────────────────────────────────────────────────────

describe('ElementNode — duplicate', () => {
  let reg

  beforeEach(() => {
    reg = makeRegistry()
    reg.setUpdateFns({ bumpOptionVersion: vi.fn(), bumpStructureVersion: vi.fn() })
    reg.restore(FIXTURE_TREE)
  })

  it('creates a new node with a different $id', () => {
    const heading = reg.get('heading-001')
    const dup = heading.duplicate()
    expect(dup.$id).not.toBe('heading-001')
  })

  it('clones optionValues', () => {
    const heading = reg.get('heading-001')
    const dup = heading.duplicate()
    expect(dup.optionValues.color).toBe('var(--color-text)')
    dup.options.color = 'red'
    expect(heading.optionValues.color).toBe('var(--color-text)')
  })

  it('inserts after the given index when afterIndex provided', () => {
    const container = reg.get('container-001')
    const heading = reg.get('heading-001')
    heading.duplicate(0) // after index 0
    expect(container.children).toHaveLength(3)
    expect(container.children[1].$id).not.toBe('heading-001')
    expect(container.children[1].$id).not.toBe('para-001')
  })
})

// ─── allows ──────────────────────────────────────────────────────────────────

describe('ElementNode — allows', () => {
  let reg

  beforeEach(() => {
    reg = makeRegistry()
    reg.restore(FIXTURE_TREE)
  })

  it('section allows container', () => {
    expect(reg.get('section-001').allows('container')).toBe(true)
  })

  it('section allows heading', () => {
    expect(reg.get('section-001').allows('heading')).toBe(true)
  })

  it('container does NOT allow section', () => {
    expect(reg.get('container-001').allows('section')).toBe(false)
  })

  it('accepts an ElementNode as argument', () => {
    const heading = reg.get('heading-001')
    const container = reg.get('container-001')
    expect(container.allows(heading)).toBe(true)
  })

  it('heading (leaf) allows nothing', () => {
    expect(reg.get('heading-001').allows('paragraph')).toBe(false)
  })
})

// ─── isSelfOrDescendantOf ─────────────────────────────────────────────────────

describe('ElementNode — isSelfOrDescendantOf', () => {
  let reg

  beforeEach(() => {
    reg = makeRegistry()
    reg.restore(FIXTURE_TREE)
  })

  it('returns true when candidate is self', () => {
    const section = reg.get('section-001')
    expect(section.isSelfOrDescendantOf(section)).toBe(true)
  })

  it('returns true when candidate is an ancestor', () => {
    const heading = reg.get('heading-001')
    const section = reg.get('section-001')
    expect(heading.isSelfOrDescendantOf(section)).toBe(true)
  })

  it('returns false for unrelated node', () => {
    const section = reg.get('section-001')
    const para = reg.get('para-001')
    expect(section.isSelfOrDescendantOf(para)).toBe(false)
  })
})

// ─── toPlain roundtrip ────────────────────────────────────────────────────────

describe('ElementNode — toPlain roundtrip', () => {
  it('serializes and restores the tree without data loss', () => {
    const reg1 = makeRegistry()
    reg1.restore(FIXTURE_TREE)
    const plain1 = reg1.snapshot()

    const reg2 = makeRegistry()
    reg2.restore(plain1)
    const plain2 = reg2.snapshot()

    expect(plain2).toEqual(plain1)
  })

  it('preserves $responsive in options', () => {
    const reg = makeRegistry()
    reg.restore(RESPONSIVE_TREE)
    const plain = reg.snapshot()
    expect(plain.children[0].options.$responsive.paddingY).toEqual([60, 80, 120])
  })
})
