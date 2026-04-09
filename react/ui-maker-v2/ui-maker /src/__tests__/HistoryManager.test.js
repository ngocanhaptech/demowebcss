import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ElementRegistry } from '../core/ElementRegistry.js'
import { HistoryManager } from '../core/HistoryManager.js'
import { ACTION_TYPES } from '../core/ElementNode.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/**
 * Page tree with:
 *   _root
 *     └── section (section-001)
 *           └── row (row-001)
 *                 ├── card (card-001)
 *                 │     └── heading (head-c1) [content="Card 1"]
 *                 └── card (card-002)
 *                       └── heading (head-c2) [content="Card 2"]
 */
const PAGE_TREE = {
  $id: 'root',
  tag: '_root',
  options: {},
  children: [
    {
      $id: 'section-001',
      tag: 'section',
      options: { bgColor: '#fff', paddingY: 80 },
      children: [
        {
          $id: 'row-001',
          tag: 'row',
          options: { gap: 16 },
          children: [
            {
              $id: 'card-001',
              tag: 'card',
              options: { shadow: 'md' },
              children: [
                {
                  $id: 'head-c1',
                  tag: 'heading',
                  content: 'Card 1',
                  options: { color: '#000' },
                },
              ],
            },
            {
              $id: 'card-002',
              tag: 'card',
              options: { shadow: 'lg' },
              children: [
                {
                  $id: 'head-c2',
                  tag: 'heading',
                  content: 'Card 2',
                  options: { color: '#000' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

function makeSetup() {
  const reg = new ElementRegistry()
  reg.setUpdateFns({
    bumpOptionVersion: vi.fn(),
    bumpStructureVersion: vi.fn(),
  })
  const history = new HistoryManager(reg)
  reg.setHistory(history)
  reg.restore(PAGE_TREE)
  return { reg, history }
}

// ─── Stack management ─────────────────────────────────────────────────────────

describe('HistoryManager — stack management', () => {
  it('starts empty', () => {
    const { history } = makeSetup()
    expect(history.stackSize).toBe(0)
    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(false)
  })

  it('push increments stack and cursor', () => {
    const { history } = makeSetup()
    history.push({ type: ACTION_TYPES.UPDATE_OPTION, nodeId: 'x', key: 'a', oldValue: 1, newValue: 2 })
    expect(history.stackSize).toBe(1)
    expect(history.canUndo).toBe(true)
    expect(history.canRedo).toBe(false)
  })

  it('push truncates redo tail', () => {
    const { history } = makeSetup()
    history.push({ type: ACTION_TYPES.UPDATE_OPTION, nodeId: 'x', key: 'a', oldValue: 1, newValue: 2 })
    history.push({ type: ACTION_TYPES.UPDATE_OPTION, nodeId: 'x', key: 'a', oldValue: 2, newValue: 3 })
    history.undo()
    expect(history.canRedo).toBe(true)
    // Pushing a new action should kill the redo entry
    history.push({ type: ACTION_TYPES.UPDATE_OPTION, nodeId: 'x', key: 'a', oldValue: 2, newValue: 99 })
    expect(history.canRedo).toBe(false)
    expect(history.stackSize).toBe(2)
  })

  it('clear resets stack and cursor', () => {
    const { history } = makeSetup()
    history.push({ type: ACTION_TYPES.UPDATE_OPTION, nodeId: 'x', key: 'a', oldValue: 1, newValue: 2 })
    history.clear()
    expect(history.stackSize).toBe(0)
    expect(history.canUndo).toBe(false)
  })

  it('pause stops recording', () => {
    const { history } = makeSetup()
    history.pause()
    history.push({ type: ACTION_TYPES.UPDATE_OPTION, nodeId: 'x', key: 'a', oldValue: 1, newValue: 2 })
    expect(history.stackSize).toBe(0)
  })

  it('resume allows recording after pause', () => {
    const { history } = makeSetup()
    history.pause()
    history.resume()
    history.push({ type: ACTION_TYPES.UPDATE_OPTION, nodeId: 'x', key: 'a', oldValue: 1, newValue: 2 })
    expect(history.stackSize).toBe(1)
  })
})

// ─── UPDATE_OPTION ────────────────────────────────────────────────────────────

describe('HistoryManager — UPDATE_OPTION', () => {
  it('undo restores the old option value', () => {
    const { reg, history } = makeSetup()
    const section = reg.get('section-001')

    history.push({
      type: ACTION_TYPES.UPDATE_OPTION,
      nodeId: 'section-001',
      key: 'paddingY',
      oldValue: 80,
      newValue: 40,
    })
    section.optionValues.paddingY = 40

    history.undo()
    expect(section.optionValues.paddingY).toBe(80)
  })

  it('redo re-applies the new option value', () => {
    const { reg, history } = makeSetup()
    const section = reg.get('section-001')

    history.push({
      type: ACTION_TYPES.UPDATE_OPTION,
      nodeId: 'section-001',
      key: 'paddingY',
      oldValue: 80,
      newValue: 40,
    })
    section.optionValues.paddingY = 40
    history.undo()
    history.redo()
    expect(section.optionValues.paddingY).toBe(40)
  })

  it('multiple undo/redo cycles work correctly', () => {
    const { reg, history } = makeSetup()
    const section = reg.get('section-001')

    const values = [80, 60, 40, 20]
    for (let i = 1; i < values.length; i++) {
      history.push({
        type: ACTION_TYPES.UPDATE_OPTION,
        nodeId: 'section-001',
        key: 'paddingY',
        oldValue: values[i - 1],
        newValue: values[i],
      })
      section.optionValues.paddingY = values[i]
    }
    expect(section.optionValues.paddingY).toBe(20)

    history.undo()
    expect(section.optionValues.paddingY).toBe(40)
    history.undo()
    expect(section.optionValues.paddingY).toBe(60)
    history.redo()
    expect(section.optionValues.paddingY).toBe(40)
    history.redo()
    expect(section.optionValues.paddingY).toBe(20)
  })

  it('undo is no-op when stack is empty', () => {
    const { reg, history } = makeSetup()
    const section = reg.get('section-001')
    expect(() => history.undo()).not.toThrow()
    expect(section.optionValues.paddingY).toBe(80)
  })

  it('redo is no-op at top of stack', () => {
    const { history } = makeSetup()
    expect(() => history.redo()).not.toThrow()
  })

  it('undo does not record to history (pause/resume)', () => {
    const { reg, history } = makeSetup()
    const section = reg.get('section-001')

    history.push({
      type: ACTION_TYPES.UPDATE_OPTION,
      nodeId: 'section-001',
      key: 'paddingY',
      oldValue: 80,
      newValue: 40,
    })
    section.optionValues.paddingY = 40
    const sizeBefore = history.stackSize
    history.undo()
    expect(history.stackSize).toBe(sizeBefore)
  })
})

// ─── UPDATE_CONTENT ───────────────────────────────────────────────────────────

describe('HistoryManager — UPDATE_CONTENT', () => {
  it('undo restores old content', () => {
    const { reg, history } = makeSetup()
    const heading = reg.get('head-c1')

    history.push({
      type: ACTION_TYPES.UPDATE_CONTENT,
      nodeId: 'head-c1',
      oldValue: 'Card 1',
      newValue: 'Updated Title',
    })
    heading.content = 'Updated Title'

    history.undo()
    expect(heading.content).toBe('Card 1')
  })

  it('redo re-applies new content', () => {
    const { reg, history } = makeSetup()
    const heading = reg.get('head-c1')

    history.push({
      type: ACTION_TYPES.UPDATE_CONTENT,
      nodeId: 'head-c1',
      oldValue: 'Card 1',
      newValue: 'Updated Title',
    })
    heading.content = 'Updated Title'
    history.undo()
    history.redo()
    expect(heading.content).toBe('Updated Title')
  })
})

// ─── ADD_ELEMENT ──────────────────────────────────────────────────────────────

describe('HistoryManager — ADD_ELEMENT', () => {
  it('undo removes the added element', () => {
    const { reg, history } = makeSetup()
    const row = reg.get('row-001')

    const newCard = row.addChild({ $id: 'card-003', tag: 'card', options: {}, children: [] }, 2, true)
    expect(row.children).toHaveLength(3)
    expect(reg.get('card-003')).toBeDefined()

    history.undo()
    expect(row.children).toHaveLength(2)
    expect(reg.get('card-003')).toBeUndefined()
  })

  it('redo re-adds the element', () => {
    const { reg, history } = makeSetup()
    const row = reg.get('row-001')

    row.addChild({ $id: 'card-003', tag: 'card', options: {}, children: [] }, 2, true)
    history.undo()
    expect(row.children).toHaveLength(2)

    history.redo()
    expect(row.children).toHaveLength(3)
    expect(reg.get('card-003')).toBeDefined()
  })

  it('re-added element is at the correct index after redo', () => {
    const { reg, history } = makeSetup()
    const row = reg.get('row-001')

    row.addChild({ $id: 'card-ins', tag: 'card', options: {}, children: [] }, 0, true)
    history.undo()
    history.redo()

    expect(row.children[0].$id).toBe('card-ins')
  })
})

// ─── REMOVE_ELEMENT ───────────────────────────────────────────────────────────

describe('HistoryManager — REMOVE_ELEMENT', () => {
  it('undo restores the removed element at original index', () => {
    const { reg, history } = makeSetup()
    const row = reg.get('row-001')

    row.removeChild(0, true)
    expect(row.children).toHaveLength(1)
    expect(reg.get('card-001')).toBeUndefined()

    history.undo()
    expect(row.children).toHaveLength(2)
    expect(reg.get('card-001')).toBeDefined()
    expect(row.children[0].$id).toBe('card-001')
  })

  it('redo removes the element again', () => {
    const { reg, history } = makeSetup()
    const row = reg.get('row-001')

    row.removeChild(0, true)
    history.undo()
    history.redo()

    expect(row.children).toHaveLength(1)
    expect(reg.get('card-001')).toBeUndefined()
  })

  it('restored element children are also registered', () => {
    const { reg, history } = makeSetup()
    const row = reg.get('row-001')

    row.removeChild(0, true)
    history.undo()

    expect(reg.get('head-c1')).toBeDefined()
  })
})

// ─── MOVE_ELEMENT ─────────────────────────────────────────────────────────────

describe('HistoryManager — MOVE_ELEMENT', () => {
  it('undo moves element back to original position', () => {
    const { reg, history } = makeSetup()
    const row = reg.get('row-001')
    const card1 = reg.get('card-001')

    // Simulate moving card-001 from row[0] to section[1] (hypothetical)
    // For this test, we move card-001 to index 1 within the same row
    row.children.splice(0, 1) // detach from index 0
    row.children.splice(1, 0, card1) // reattach at index 1

    history.push({
      type: ACTION_TYPES.MOVE_ELEMENT,
      nodeId: 'card-001',
      fromParentId: 'row-001',
      toParentId: 'row-001',
      fromIndex: 0,
      toIndex: 1,
    })

    history.undo()

    // After undo, card-001 should be at index 0 in row-001
    expect(row.children[0].$id).toBe('card-001')
  })

  it('redo re-applies the move', () => {
    const { reg, history } = makeSetup()
    const row = reg.get('row-001')
    const card1 = reg.get('card-001')

    row.children.splice(0, 1)
    row.children.splice(1, 0, card1)

    history.push({
      type: ACTION_TYPES.MOVE_ELEMENT,
      nodeId: 'card-001',
      fromParentId: 'row-001',
      toParentId: 'row-001',
      fromIndex: 0,
      toIndex: 1,
    })

    history.undo()
    history.redo()

    expect(row.children[1].$id).toBe('card-001')
  })
})

// ─── REORDER_CHILDREN ─────────────────────────────────────────────────────────

describe('HistoryManager — REORDER_CHILDREN', () => {
  it('undo restores original child order', () => {
    const { reg, history } = makeSetup()
    const row = reg.get('row-001')

    const oldOrder = row.children.map(c => c.$id)  // ['card-001', 'card-002']
    const newOrder = ['card-002', 'card-001']

    row.children = newOrder.map(id => reg.get(id))

    history.push({
      type: ACTION_TYPES.REORDER_CHILDREN,
      parentId: 'row-001',
      oldOrder,
      newOrder,
    })

    history.undo()
    expect(row.children.map(c => c.$id)).toEqual(['card-001', 'card-002'])
  })

  it('redo re-applies new order', () => {
    const { reg, history } = makeSetup()
    const row = reg.get('row-001')

    const oldOrder = row.children.map(c => c.$id)
    const newOrder = ['card-002', 'card-001']

    row.children = newOrder.map(id => reg.get(id))

    history.push({
      type: ACTION_TYPES.REORDER_CHILDREN,
      parentId: 'row-001',
      oldOrder,
      newOrder,
    })

    history.undo()
    history.redo()
    expect(row.children.map(c => c.$id)).toEqual(['card-002', 'card-001'])
  })
})

// ─── Mixed operations ─────────────────────────────────────────────────────────

describe('HistoryManager — mixed operations', () => {
  it('alternating undo/redo across different action types', () => {
    const { reg, history } = makeSetup()
    const section = reg.get('section-001')
    const row = reg.get('row-001')

    // Action 1: update option
    history.push({
      type: ACTION_TYPES.UPDATE_OPTION,
      nodeId: 'section-001',
      key: 'paddingY',
      oldValue: 80,
      newValue: 40,
    })
    section.optionValues.paddingY = 40

    // Action 2: add element
    row.addChild({ $id: 'card-extra', tag: 'card', options: {}, children: [] }, 2, true)

    expect(row.children).toHaveLength(3)
    expect(section.optionValues.paddingY).toBe(40)

    // Undo add
    history.undo()
    expect(row.children).toHaveLength(2)
    expect(reg.get('card-extra')).toBeUndefined()

    // Undo option change
    history.undo()
    expect(section.optionValues.paddingY).toBe(80)

    // Redo option change
    history.redo()
    expect(section.optionValues.paddingY).toBe(40)

    // Redo add
    history.redo()
    expect(row.children).toHaveLength(3)
    expect(reg.get('card-extra')).toBeDefined()
  })
})

// ─── MAX_HISTORY cap ──────────────────────────────────────────────────────────

describe('HistoryManager — MAX_HISTORY cap', () => {
  it('stack does not exceed 200 entries', () => {
    const { history } = makeSetup()
    for (let i = 0; i < 250; i++) {
      history.push({
        type: ACTION_TYPES.UPDATE_OPTION,
        nodeId: 'section-001',
        key: 'paddingY',
        oldValue: i,
        newValue: i + 1,
      })
    }
    expect(history.stackSize).toBe(200)
  })
})
