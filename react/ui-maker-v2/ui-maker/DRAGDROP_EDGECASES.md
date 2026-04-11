# Phase 5 — Drag-Drop Edge Cases

> Tài liệu này liệt kê đầy đủ các edge case cần kiểm tra khi triển khai Phase 5 (drag-drop với @dnd-kit).
> Mỗi case có: mô tả, dấu hiệu nhận biết lỗi, và pseudocode xử lý đúng.

---

## Kiến trúc cơ bản

```
DragContext (DndContext)
  └── Canvas
        └── SortableSection (useSortable per node)

onDragEnd(event):
  const { active, over } = event
  if (!over || active.id === over.id) return   ← guard 1
  ...
```

Mỗi `ElementWrapper` mount với `useSortable({ id: node.$id })`.  
Nguồn kéo (`active`) có thể là:
- Element đang có trong canvas (MOVE)
- Element từ ElementsPanel (ADD mới)

---

## Edge Case 1 — Thả vào container rỗng

**Mô tả:**  
Người dùng kéo một element và thả vào một container chưa có con nào (ví dụ: `card` mới tạo chưa có children).

**Dấu hiệu lỗi:**  
- `over.id` trỏ đến container cha, nhưng code cố dùng `overNode.index` để tính vị trí chèn → `index = -1` → crash hoặc chèn sai vị trí.

**Xử lý đúng:**

```js
function handleDragEnd({ active, over }) {
  if (!over || active.id === over.id) return

  const activeNode = registry.get(active.id)
  const overNode   = registry.get(over.id)
  if (!overNode || !activeNode) return

  // Xác định targetParent
  let targetParent, insertIndex

  if (overNode.isParent && overNode.isEmpty) {
    // Drop vào container rỗng → insert as first child
    targetParent = overNode
    insertIndex  = 0                          // ← case 1
  } else if (overNode.isParent && !overNode.isEmpty) {
    // Drop onto parent (not onto a specific child) → append
    targetParent = overNode
    insertIndex  = overNode.children.length   // ← append
  } else {
    // Drop onto a sibling → insert before overNode
    targetParent = overNode.parent
    insertIndex  = overNode.index             // ← case 2/3
  }

  if (!targetParent) return
  if (!targetParent.allows(activeNode)) return  // ← guard: tag constraint
  if (activeNode.isSelfOrDescendantOf(targetParent)) return  // ← guard: ancestor check

  // ... execute move
}
```

**Unit test:**

```js
it('drops into empty container at index 0', () => {
  const emptyCard = reg.get('card-empty')   // has children = []
  const heading   = reg.get('heading-001')
  // Simulate drop
  heading.detach()
  emptyCard.addChild(heading, 0, true)
  expect(emptyCard.children[0].$id).toBe('heading-001')
})
```

---

## Edge Case 2 — Thả giữa các element

**Mô tả:**  
Người dùng thả phần tử giữa hai element trong một row/container.  
`over` là element ở vị trí đích (element "bị đẩy xuống").

**Quan trọng:**  
Phải lấy `overNode.index` **TRƯỚC** khi `detach()` active node, vì `detach()` có thể làm dịch chuyển index.

**Dấu hiệu lỗi:**  
- Active detach trước → overNode.index giảm 1 → element chèn sai vị trí.

**Xử lý đúng:**

```js
// Lấy index đích TRƯỚC khi detach
const fromParentId = activeNode.$parentId
const fromIndex    = activeNode.index
const toIndex      = overNode.index                    // ← capture FIRST

// Nếu cùng cha và active ở trước over → sau khi detach, over dịch lên 1
const sameParent   = activeNode.$parentId === targetParent.$id
const needAdjust   = sameParent && fromIndex < toIndex
const finalIndex   = needAdjust ? toIndex - 1 : toIndex

// Push to history BEFORE mutation
registry.history?.push({
  type: ACTION_TYPES.MOVE_ELEMENT,
  nodeId: activeNode.$id,
  fromParentId,
  toParentId: targetParent.$id,
  fromIndex,
  toIndex: finalIndex,
})

// Mutate
activeNode.detach()
targetParent.addChild(activeNode, finalIndex)
```

**Unit test:**

```js
it('inserts at correct index when dragging within same parent', () => {
  // row: [card-001, card-002, card-003]
  // Drag card-001 to position of card-003 → result: [card-002, card-001, card-003]? 
  // Depends on UX: insert BEFORE over → [card-002, card-003, card-001]
  // With needAdjust: fromIndex=0 < toIndex=2 → finalIndex=1
  // result: [card-002, card-001, card-003]
})
```

---

## Edge Case 3 — Thả ở cuối danh sách

**Mô tả:**  
Người dùng thả element sau phần tử cuối cùng trong parent.  
Với @dnd-kit/sortable, khi over = phần tử cuối, `overNode.index` = `parent.children.length - 1`.  
Nếu insert trước overNode → element luôn nhảy lên 1 slot, không bao giờ đến cuối.

**Dấu hiệu lỗi:**  
- Không thể đặt element vào vị trí cuối cùng của container.

**Xử lý đúng:**  
@dnd-kit cung cấp `dragOverlay` indicator + `DragOverlay` + `closestCenter` strategy. Khi drop indicator ở sau phần tử cuối cùng, `over` sẽ là parent (không phải sibling). Phân loại:

```js
if (over.id === targetParent.$id) {
  // Dropped after last child (over = parent itself)
  insertIndex = targetParent.children.length   // append
} else {
  // Dropped between siblings
  insertIndex = overNode.index
}
```

Nếu dùng `verticalListSortingStrategy` / `rectSortingStrategy`, kiểm tra `deltaRect.top > 0` để quyết định insert before/after:

```js
const isAfter = event.delta.y > 0 && overNode.index === targetParent.children.length - 1
insertIndex = isAfter ? overNode.index + 1 : overNode.index
```

---

## Edge Case 4 — Thả lên chính nó

**Mô tả:**  
`active.id === over.id` → không cần làm gì.

**Xử lý đúng:**

```js
if (!over || active.id === over.id) return   // ← dòng đầu tiên
```

**Không cần unit test riêng** — covered bởi guard đầu tiên.

---

## Edge Case 5 — Thả ancestor vào descendant

**Mô tả:**  
Kéo `section-001` và thả vào `container-001` (con của nó).  
Nếu cho phép, sẽ tạo vòng lặp vô hạn trong cây (circular reference).

**Dấu hiệu lỗi:**  
- Tree bị corrupt, `ancestors` getter loop vô hạn → stack overflow.

**Xử lý đúng:**

```js
// activeNode.isSelfOrDescendantOf(targetParent) nghĩa là:
// "targetParent có phải self hoặc descendant của activeNode không?"
// → nếu đúng, block drop

if (activeNode.isSelfOrDescendantOf(targetParent)) return
```

> **Note:** `isSelfOrDescendantOf(candidate)` đi ngược lên ancestors của `this`. Gọi là `activeNode.isSelfOrDescendantOf(targetParent)` — tức targetParent là ancestor của active? Không đúng hướng.

Cần kiểm tra: "targetParent có phải là descendant của activeNode không?" → nếu đúng thì block.

```js
// Đúng: chặn nếu targetParent là chính active hoặc nằm trong descendants của active
const activeDescendants = activeNode.descendants
const wouldCreateCycle  = 
  targetParent.$id === activeNode.$id ||
  activeDescendants.some(d => d.$id === targetParent.$id)

if (wouldCreateCycle) return
```

**Unit test:**

```js
it('prevents dropping ancestor into its own descendant', () => {
  const section  = reg.get('section-001')
  const container = reg.get('container-001')  // child of section

  // Simulate attempted move
  const wouldCreateCycle =
    container.$id === section.$id ||
    section.descendants.some(d => d.$id === container.$id)

  expect(wouldCreateCycle).toBe(true)
})
```

---

## Edge Case 6 — Thả tag không được phép

**Mô tả:**  
Kéo `section` và thả vào `card` (card không cho phép section con).  
Hoặc kéo `heading` và thả vào `_root` (root chỉ nhận section/navbar).

**Dấu hiệu lỗi:**  
- Tree corrupt: `heading` nằm thẳng trong `_root` → render lỗi, export lỗi.

**Xử lý đúng:**

```js
if (!targetParent.allows(activeNode)) return
```

`allows(tag)` dựa vào `ALLOWED_CHILDREN[this.tag]` trong `ElementNode.js`.

**Unit test:**

```js
it('blocks dropping section inside card', () => {
  const card    = reg.get('card-001')
  const section = reg.get('section-001')
  expect(card.allows(section)).toBe(false)
})

it('blocks dropping heading into root', () => {
  const root    = reg.get('root')
  const heading = reg.get('heading-001')
  expect(root.allows(heading)).toBe(false)
})
```

---

## Edge Case 7 — Multiple rapid drops

**Mô tả:**  
Người dùng kéo-thả nhiều lần liên tục (ví dụ: rearrange 5 cards).  
Mỗi drop phải tạo một history entry riêng biệt.

**Dấu hiệu lỗi:**  
- History collapse: nhiều move được gộp thành 1 entry → undo chỉ hoàn tác bước cuối.

**Xử lý đúng:**  
`MOVE_ELEMENT` KHÔNG dùng debounce (khác `UPDATE_OPTION`).  
`history.push()` được gọi synchronously trong `onDragEnd`.

```js
// onDragEnd — KHÔNG debounce
registry.history?.push({
  type: ACTION_TYPES.MOVE_ELEMENT,
  nodeId: activeNode.$id,
  fromParentId,
  toParentId: targetParent.$id,
  fromIndex,
  toIndex: finalIndex,
})
```

**Unit test:**

```js
it('each drop creates a separate history entry', () => {
  const { history } = setup
  // 3 moves
  history.push({ type: ACTION_TYPES.MOVE_ELEMENT, ... })
  history.push({ type: ACTION_TYPES.MOVE_ELEMENT, ... })
  history.push({ type: ACTION_TYPES.MOVE_ELEMENT, ... })
  expect(history.stackSize).toBe(3)
})
```

---

## Checklist triển khai Phase 5

Trước khi merge drag-drop:

- [ ] **EC-1:** Thả vào container rỗng → element xuất hiện ở index 0
- [ ] **EC-2:** Thả giữa 2 element → index tính đúng sau khi detach
- [ ] **EC-3:** Thả ở cuối danh sách → element nằm sau phần tử cuối
- [ ] **EC-4:** `active.id === over.id` → early return, không mutate tree
- [ ] **EC-5:** Thả ancestor vào descendant → blocked, tree nguyên vẹn
- [ ] **EC-6:** Thả tag không hợp lệ → blocked theo `allows()` rules
- [ ] **EC-7:** 5 drops liên tiếp → 5 entries trong history; 5x undo về đúng thứ tự

---

## Tham chiếu codebase

| Symbol | File |
|--------|------|
| `ElementNode.allows()` | `src/core/ElementNode.js` |
| `ElementNode.isSelfOrDescendantOf()` | `src/core/ElementNode.js` |
| `ElementNode.detach()` | `src/core/ElementNode.js` |
| `ElementNode.addChild()` | `src/core/ElementNode.js` |
| `ACTION_TYPES.MOVE_ELEMENT` | `src/core/ElementNode.js` |
| `HistoryManager.push()` | `src/core/HistoryManager.js` |
| `ElementRegistry.get()` | `src/core/ElementRegistry.js` |
