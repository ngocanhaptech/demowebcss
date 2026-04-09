# Phản biện Kiến trúc & Phương án Hoàn thiện

> Role: Senior Frontend Developer  
> Ngày: April 10, 2026  
> Đối tượng phản biện: ui-maker-architecture.md

---

## Risk 1 — Hiệu năng khi cây có >200 elements

### Chẩn đoán thực sự

Phân tích kiến trúc nói "React.memo + forceUpdate cục bộ" nhưng **chưa mô tả cơ chế subscription chính xác**. Đây là vấn đề thật, không phải lo ngại thừa, vì có 3 lớp re-render cần kiểm soát riêng:

```
Lớp 1 — Structure Change: thêm/xóa/di chuyển node (ít xảy ra)
Lớp 2 — Option Change: user chỉnh padding, color... (rất thường xuyên)
Lớp 3 — Selection Change: click chọn element (rất thường xuyên)
```

**Vấn đề với `node._updateFn = forceUpdate` (đề xuất cũ):**

```
User kéo range slider (padding)
  → option setter chạy mỗi pixel
  → debounce 250ms (OK cho history)
  → nhưng re-render phải ngay lập tức cho UX tốt
  → node.apply() → forceUpdate()
  → ElementWrapper của node đó re-render ✓
  → nhưng nếu parent cũng re-render vì state thay đổi → children cascade ✗
```

**Vấn đề thứ hai: cây 200 node, user chọn một node:**

```
AppStore.selectedId thay đổi
  → tất cả ElementWrapper subscribe selectedId đều re-render (200 lần)
  → chỉ để thay đổi class highlight từ 1 wrapper này sang 1 wrapper khác
```

Đây là **anti-pattern cổ điển** của Zustand nếu dùng sai.

---

### Phương án — Tách biệt 3 loại subscription

#### Nguyên tắc cốt lõi: Không node nào re-render vì thay đổi của node khác

```
subscribeToStructure(parentId) → re-render khi children list của parent thay đổi
subscribeToOptions(nodeId)     → re-render khi options của CHÍNH node đó thay đổi
subscribeToSelection(nodeId)   → re-render khi nodeId === selectedId HOẶC nodeId === outlinedId
```

#### Zustand store với fine-grained version counters

```js
// src/store/appStore.js

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export const useAppStore = create(
  subscribeWithSelector(
    immer((set, get) => ({
      // === Selection (không re-render canvas khi thay đổi) ===
      selectedId: null,
      outlinedId: null,

      // === Fine-grained version map ===
      // Key: nodeId, Value: số lần options thay đổi
      optionVersions: {},         // { [nodeId]: number }
      // Key: nodeId, Value: số lần children list thay đổi
      structureVersions: {},      // { [nodeId]: number }

      // === Actions ===
      bumpOptionVersion(nodeId) {
        set(state => {
          state.optionVersions[nodeId] = (state.optionVersions[nodeId] ?? 0) + 1
        })
      },
      bumpStructureVersion(nodeId) {
        set(state => {
          state.structureVersions[nodeId] = (state.structureVersions[nodeId] ?? 0) + 1
        })
      },

      selectElement(id) {
        set(state => { state.selectedId = id })
      },
      outlineElement(id) {
        set(state => { state.outlinedId = id })
      },
    }))
  )
)
```

#### ElementWrapper — chỉ subscribe đúng những gì nó cần

```js
// src/components/canvas/ElementWrapper.jsx

import { memo, useCallback, useRef } from 'react'
import { useAppStore } from '../../store/appStore.js'
import { ElementRegistry } from '../../core/ElementRegistry.js'

// Selector riêng biệt: tránh object literal mới mỗi render
const selectOptionVersion = (nodeId) => (s) => s.optionVersions[nodeId] ?? 0
const selectIsSelected = (nodeId) => (s) => s.selectedId === nodeId
const selectIsOutlined = (nodeId) => (s) => s.outlinedId === nodeId

export const ElementWrapper = memo(function ElementWrapper({ nodeId }) {
  // Re-render chỉ khi OPTIONS của node này thay đổi
  const optionVersion = useAppStore(selectOptionVersion(nodeId))

  // Re-render chỉ khi SELECTION liên quan đến node này thay đổi
  const isSelected = useAppStore(selectIsSelected(nodeId))
  const isOutlined = useAppStore(selectIsOutlined(nodeId))

  const node = ElementRegistry.get(nodeId)
  const controller = ControllerRegistry.get(node.tag)

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    useAppStore.getState().selectElement(nodeId)
  }, [nodeId])

  const handleMouseEnter = useCallback(() => {
    useAppStore.getState().outlineElement(nodeId)
  }, [nodeId])

  const style = {
    position: 'relative',
    outline: isSelected ? '2px solid #2563eb' : isOutlined ? '1px dashed #93c5fd' : 'none',
    ...controller.resolveBaseStyle(node.optionValues)
  }

  // Leaf node: dùng dangerouslySetInnerHTML
  if (!node.isParent) {
    return (
      <div
        style={style}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        dangerouslySetInnerHTML={{ __html: controller.buildInnerHtml(node) }}
      />
    )
  }

  // Container node: render children qua ElementRenderer
  return (
    <div style={style} onClick={handleClick} onMouseEnter={handleMouseEnter}>
      <ElementRenderer nodeId={nodeId} />
    </div>
  )
})

// ElementRenderer chỉ subscribe structureVersion của PARENT node
export const ElementRenderer = memo(function ElementRenderer({ nodeId }) {
  const structureVersion = useAppStore(s => s.structureVersions[nodeId] ?? 0)
  const node = ElementRegistry.get(nodeId)

  return (
    <>
      {node.children.map(child => (
        <ElementWrapper key={child.$id} nodeId={child.$id} />
      ))}
    </>
  )
})
```

#### ElementNode.apply() — notify đúng subscriber

```js
// src/core/ElementNode.js (method apply)

apply(type = 'option') {
  const store = getAppStore()          // import lazy để tránh circular
  if (type === 'option') {
    store.getState().bumpOptionVersion(this.$id)
  } else if (type === 'structure') {
    store.getState().bumpStructureVersion(this.$id)
  }
}
```

#### Kết quả đạt được

| Hành động | Nodes re-render |
|-----------|----------------|
| User kéo slider padding của node X | 1 (chỉ ElementWrapper của X) |
| User click chọn node X (từ node Y) | 2 (wrapper X và wrapper Y — isSelected thay đổi) |
| User thêm child vào node P | 1 (ElementRenderer của P) |
| User undo (option change) | 1 (chỉ node bị ảnh hưởng) |
| User undo (add element) | 1 (parent của element bị xóa) |

#### startTransition cho option changes (React 19)

```js
// Trong option setter của ElementNode
import { startTransition } from 'react'

set(target, name, value) {
  // Apply value ngay lập tức
  target._optionValues[name] = value

  // Re-render là low-priority (không block input)
  startTransition(() => {
    target.apply('option')
  })

  // History recording vẫn debounce 250ms
  scheduleHistoryRecord(target, name)
  return true
}
```

> **Kết luận Risk 1:** Vấn đề thật nhưng hoàn toàn giải quyết được. Chìa khóa là **tách subscription thành 3 loại** (option version, structure version, selection) và **không subscribe vào selectedId toàn cục** từ 200 ElementWrapper.

---

## Risk 2 — Drag-drop và Breakpoints

### Chẩn đoán thực sự

Kiến trúc PA **chưa quyết định** điều quan trọng nhất: drag-drop hoạt động trên **DOM order** hay **tree order**? Đây không chỉ là UX question — đây là **câu hỏi data model**.

**Hai trường phái:**

```
Trường phái A — DOM Order = Tree Order (UX Builder dùng)
  → Cây data luôn = thứ tự DOM
  → Responsive thay đổi qua CSS flex/grid property, KHÔNG reorder DOM
  → Drag-drop luôn nhất quán bất kể breakpoint
  → Đơn giản, dễ implement

Trường phái B — Responsive Reordering
  → Mỗi element có responsive.order per breakpoint
  → DOM order = tree order, visual order = CSS order property
  → Drag-drop trên mobile preview kéo element "thứ 2 về mặt visual" = element "thứ 3 trong tree"
  → Phức tạp, dễ nhầm lẫn, ngay cả UX Builder không support đầy đủ
```

**Kết luận kiến trúc: chọn Trường phái A**

Lý do:
1. UX Builder dùng cách này và hoạt động tốt với hàng triệu user
2. Responsive reordering CSS (`order`) là edge case hiếm, không phải MVP need
3. Đơn giản hóa export: DOM order = visual order trong HTML export
4. Tránh bug: user kéo element trên mobile view nhưng thực ra đang reorder tree theo visual position lộn xộn

---

### Phương án — 3 quy tắc cứng

#### Quy tắc 1: Drag-drop chỉ hoạt động trên Tree Order, bất kể breakpoint

```js
// src/components/canvas/DropZone.jsx
// dnd-kit: useSortable luôn dùng tree index, không phụ thuộc viewport

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function SortableElementWrapper({ nodeId }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: nodeId,
    data: { nodeId },  // payload để xác định source trong onDragEnd
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <DragHandle {...listeners} />
      <ElementWrapper nodeId={nodeId} />
    </div>
  )
}
```

```js
// src/components/canvas/Canvas.jsx — DnD context

import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export function Canvas() {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }  // tránh accidental drag khi click
    })
  )

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return

    const activeNode = ElementRegistry.get(active.id)
    const overNode = ElementRegistry.get(over.id)

    // Kiểm tra move hợp lệ (target parent phải allows activeNode.tag)
    const targetParent = overNode.isParent ? overNode : overNode.parent
    if (!targetParent.allows(activeNode)) return

    // Move trong tree — history tự record trong addChild
    const toIndex = targetParent.children.indexOf(overNode)
    activeNode.remove(false)           // remove không record history
    targetParent.addChild(activeNode, toIndex, true)  // addChild record history (MOVE_ELEMENT)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <ViewportFrame>
        <RootElementRenderer />
      </ViewportFrame>
    </DndContext>
  )
}
```

#### Quy tắc 2: Canvas ở Tablet/Mobile view → Drag-drop vẫn hoạt động, visual phản ánh đúng layout responsive

Khi user đang xem Mobile preview (360px):
- Container column flex-direction: column → elements xếp dọc
- Drag-drop vẫn reorder theo visual (dọc) = tree order → nhất quán

```js
// Viewport preview CHỈ thay đổi width container, không thay đổi cách drag hoạt động
// src/components/canvas/ViewportFrame.jsx

const VIEWPORT_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '360px',
}

export function ViewportFrame({ children }) {
  const viewportMode = useAppStore(s => s.viewportMode)

  return (
    <div style={{
      width: VIEWPORT_WIDTHS[viewportMode],
      margin: '0 auto',
      minHeight: '100%',
      backgroundColor: '#fff',
      // Canvas thu nhỏ visual nhưng drag coordinates vẫn work vì dnd-kit dùng pointer events
    }}>
      {children}
    </div>
  )
}
```

#### Quy tắc 3: Responsive "reordering" được thực hiện bằng option, không phải drag

Cho phép user set `display: none` ở breakpoint cụ thể — ẩn element, không cần reorder.

```json
// public/data/elements/column.json — option "Visibility"
{
  "$name": "visibility",
  "name": "Visibility",
  "type": "checkbox_group",
  "responsive": true,
  "config": {
    "options": [
      { "value": "desktop", "label": "Desktop" },
      { "value": "tablet",  "label": "Tablet"  },
      { "value": "mobile",  "label": "Mobile"  }
    ]
  },
  "default": ["desktop", "tablet", "mobile"]
}
```

```js
// StyleResolver: visibility option → display CSS
resolveVisibility(value, bp) {
  const visible = Array.isArray(value) ? value.includes(BP_NAMES[bp]) : true
  return { display: visible ? undefined : 'none' }  // undefined = không emit
}
```

> **Kết luận Risk 2:** Giải pháp rõ ràng — **tree order = DOM order luôn luôn**, responsive thay đổi qua CSS property, không reorder. Drag-drop luôn nhất quán. Visibility per breakpoint giải quyết 90% nhu cầu thực tế.

---

## Risk 3 — Export HTML với Responsive Values

### Chẩn đoán thực sự

Đây là **lỗi thiết kế thật** trong PA gốc. "Inline style" và "responsive" là **hai thứ không thể kết hợp** về mặt CSS fundamentals:

```
Inline style: style="padding:20px"
  → không thể override bằng @media query (inline style có specificity cao nhất)
  → nếu dùng pure inline, responsive values bị bỏ qua hoàn toàn trong export
```

PA gốc nói "chấp nhận được" — **không chấp nhận được**. Một page builder mà export ra HTML không responsive là product broken, không phải MVP đơn giản.

**Phân tích kích thước file:**

```
200 nodes × trung bình 5 options responsive × 2 breakpoints override = 2000 declarations
Mỗi declaration ~ 40 chars: "[data-uid='abc123'] { padding: 10px 15px; }\n"
2000 × 40 = ~80KB raw CSS
Gzip → ~15KB → HOÀN TOÀN chấp nhận được

So sánh: Bootstrap CSS = 140KB minified, Tailwind = 3MB unminified
```

Kích thước không phải vấn đề. **Cấu trúc CSS mới là vấn đề cần giải quyết đúng**.

---

### Phương án — Hybrid: Base inline + Responsive `<style>` block

#### Chiến lược

```
Base styles (non-responsive, desktop values) → inline style=""
Tablet/Mobile override styles               → <style> block với @media
```

Kết quả: HTML vẫn self-contained (không file ngoài), responsive hoạt động đúng, specificity không bị conflict.

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Chỉ emit @media cho những node CÓ giá trị khác desktop -->
  <style>
    @media (max-width: 768px) {
      [data-uid="row-abc123"] { padding: 30px 15px; flex-direction: column; }
      [data-uid="col-def456"] { width: 100%; }
    }
    @media (max-width: 360px) {
      [data-uid="row-abc123"] { padding: 20px 10px; }
      [data-uid="hero-ghi789"] { min-height: 400px; font-size: 28px; }
    }
  </style>
</head>
<body>
  <!-- Base styles inline, responsive styles từ <style> block -->
  <div data-uid="row-abc123" style="display:flex;padding:60px 20px;background:#1a1a2e;">
    <div data-uid="col-def456" style="flex:1;width:50%;">
      ...
    </div>
  </div>
</body>
</html>
```

#### StyleResolver — tách base và responsive

```js
// src/export/StyleResolver.js

import { ResponsiveManager } from '../core/ResponsiveManager.js'

const BP_MAX_WIDTHS = {
  1: '768px',   // tablet
  0: '360px',   // mobile
}

export class StyleResolver {
  /**
   * Resolve style cho một node
   * @returns {{ inlineStyle: string, mediaStyles: { [bp]: string } }}
   */
  resolveNode(node, optionDefs) {
    const inlineProps = {}
    const mediaProps = { 0: {}, 1: {} }   // 0=mobile, 1=tablet
    const namedDefs = Object.fromEntries(optionDefs.map(d => [d.$name, d]))

    for (const [optName, desktopVal] of Object.entries(node.optionValues)) {
      const def = namedDefs[optName]
      if (!def) continue

      const cssRules = this.optionToCss(optName, desktopVal, def)
      Object.assign(inlineProps, cssRules)

      if (!def.responsive) continue

      const responsiveArr = node.responsiveValues[optName] ?? []

      for (const bp of [1, 0]) {   // tablet trước, mobile sau
        const bpVal = responsiveArr[bp]
        if (bpVal == null || bpVal === desktopVal) continue   // skip nếu không override
        if (bp === 0 && bpVal === (responsiveArr[1] ?? desktopVal)) continue   // skip nếu = tablet

        const bpRules = this.optionToCss(optName, bpVal, def)
        Object.assign(mediaProps[bp], bpRules)
      }
    }

    return {
      inlineStyle: this.toInlineString(inlineProps),
      mediaStyles: mediaProps,
    }
  }

  /**
   * Map option name + value → CSS property object
   */
  optionToCss(optName, value, def) {
    if (value == null || value === '') return {}

    // Mapping từ option name sang CSS property
    const mappings = {
      bgColor:        { 'background-color': value },
      padding:        { 'padding': value },
      margin:         { 'margin': value },
      color:          { 'color': value },
      fontSize:       { 'font-size': typeof value === 'number' ? `${value}px` : value },
      fontWeight:     { 'font-weight': value },
      textAlign:      { 'text-align': value },
      maxWidth:       { 'max-width': value, 'margin-left': 'auto', 'margin-right': 'auto' },
      width:          { 'width': value },
      minHeight:      { 'min-height': typeof value === 'number' ? `${value}px` : value },
      gap:            { 'gap': typeof value === 'number' ? `${value}px` : value },
      flexDirection:  { 'flex-direction': value },
      display:        { 'display': value },
      borderRadius:   { 'border-radius': typeof value === 'number' ? `${value}px` : value },
      border:         { 'border': value },
      opacity:        { 'opacity': value },
      visibility:     { 'display': this.resolveVisibility(value) },
      // Thêm mappings theo nhu cầu
    }

    return mappings[optName] ?? {}
  }

  resolveVisibility(value) {
    if (Array.isArray(value)) return value.length > 0 ? '' : 'none'
    return value ? '' : 'none'
  }

  toInlineString(props) {
    return Object.entries(props)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${k}:${v}`)
      .join(';')
  }
}
```

#### HtmlExporter — build full document

```js
// src/export/HtmlExporter.js

import { StyleResolver } from './StyleResolver.js'
import { ExportTemplate } from './ExportTemplate.js'
import { ElementRegistry } from '../core/ElementRegistry.js'
import { ControllerRegistry } from '../controllers/registry.js'
import { ElementDefService } from '../data/ElementDefService.js'

export class HtmlExporter {
  constructor() {
    this.styleResolver = new StyleResolver()
    this.mediaCollector = { 0: [], 1: [] }   // tablet, mobile media declarations
  }

  async export(pageData) {
    const registry = new ElementRegistry()
    registry.restore(pageData.tree)

    // Reset collector
    this.mediaCollector = { 0: [], 1: [] }

    const bodyHtml = this.buildNode(registry.getRoot(), registry)
    const mediaBlock = this.buildMediaBlock()

    return ExportTemplate.wrap(bodyHtml, pageData.seo, mediaBlock)
  }

  buildNode(node, registry) {
    if (node.tag === '_root') {
      return node.children.map(c => this.buildNode(c, registry)).join('\n')
    }

    const controller = ControllerRegistry.get(node.tag)
    const def = ElementDefService.getCached(node.tag)
    const { inlineStyle, mediaStyles } = this.styleResolver.resolveNode(node, def.options)

    // Thu thập responsive styles
    for (const bp of [0, 1]) {
      const bpStyle = this.styleResolver.toInlineString(mediaStyles[bp])
      if (bpStyle) {
        this.mediaCollector[bp].push(`[data-uid="${node.$id}"]{${bpStyle}}`)
      }
    }

    const childrenHtml = node.isParent
      ? node.children.map(c => this.buildNode(c, registry)).join('\n')
      : ''

    return controller.buildHtml(node, inlineStyle, childrenHtml)
  }

  buildMediaBlock() {
    const lines = []

    if (this.mediaCollector[1].length > 0) {
      lines.push(`@media(max-width:768px){`)
      lines.push(...this.mediaCollector[1])
      lines.push(`}`)
    }

    if (this.mediaCollector[0].length > 0) {
      lines.push(`@media(max-width:360px){`)
      lines.push(...this.mediaCollector[0])
      lines.push(`}`)
    }

    return lines.join('\n')
  }
}
```

#### BaseController.buildHtml() — emit `data-uid`

```js
// src/controllers/BaseController.js

export class BaseController {
  buildHtml(node, inlineStyle, childrenHtml = '') {
    const tag = this.getHtmlTag(node)
    const styleAttr = inlineStyle ? ` style="${inlineStyle}"` : ''
    const uidAttr = ` data-uid="${node.$id}"`

    return `<${tag}${uidAttr}${styleAttr}>${childrenHtml || this.buildInnerHtml(node)}</${tag}>`
  }

  getHtmlTag(node) { return 'div' }   // override trong subclass

  buildInnerHtml(node) { return node.content ?? '' }
}
```

#### ExportTemplate

```js
// src/export/ExportTemplate.js

export const ExportTemplate = {
  wrap(bodyHtml, seo = {}, mediaBlock = '') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(seo.title ?? 'Untitled')}</title>
  ${seo.description ? `<meta name="description" content="${escapeHtml(seo.description)}">` : ''}
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#111}
    img{max-width:100%;height:auto;display:block}
    a{color:inherit;text-decoration:none}
    ${mediaBlock}
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]))
}
```

#### Tại sao `data-uid` không gây vấn đề?

```
✓ Self-contained HTML — không cần server hay JavaScript
✓ data-uid là attribute hợp lệ HTML5, không ảnh hưởng visual
✓ Nếu user muốn "sạch" → export minified (bỏ data-uid, inline mọi thứ nhưng mất responsive)
✓ Cung cấp 2 mode export: "responsive" (data-uid + <style>) và "static" (pure inline)
```

```js
// Trong PropsPanel hoặc Export dialog: toggle
export function ExportDialog({ pageData }) {
  const [mode, setMode] = useState('responsive')  // 'responsive' | 'static'

  async function handleExport() {
    const exporter = new HtmlExporter()
    const html = mode === 'responsive'
      ? await exporter.export(pageData)
      : await exporter.exportStatic(pageData)    // chỉ desktop, pure inline

    downloadHtml(html, pageData.name)
  }
  // ...
}
```

> **Kết luận Risk 3:** PA gốc sai — "inline style cho toàn bộ" không hỗ trợ responsive. Giải pháp đúng: **base styles inline + responsive overrides trong `<style>` block với `data-uid` selectors**. File size không phải vấn đề (gzip ~15KB cho 200 nodes). Cung cấp thêm "Static Export" (chỉ desktop, pure inline) cho user cần simplicity tuyệt đối.

---

## Bảng tổng kết phán quyết

| Risk | Mức độ thật | PA gốc | Phán quyết | Giải pháp |
|------|-------------|--------|-----------|-----------|
| Hiệu năng >200 nodes | ⚠️ Trung bình | Chưa đủ cụ thể | Giải quyết được với version counters + fine-grained selectors | `optionVersions[id]`, `structureVersions[id]`, `subscribeWithSelector` |
| Drag-drop + breakpoints | ⚠️ Cao (thiếu quyết định) | Chưa quyết định | Cần quyết định ngay từ đầu | Tree order = DOM order luôn, responsive = CSS property |
| Export responsive | 🔴 Cao (lỗi thiết kế) | Sai — "chấp nhận được" | KHÔNG chấp nhận được | Hybrid: inline base + `<style>` @media block |

---

## Điều chỉnh Architecture Document

Cập nhật `ui-maker-architecture.md` với 3 thay đổi:

**1. Thêm vào AppStore:**
```
optionVersions: Map<nodeId, number>
structureVersions: Map<nodeId, number>
bumpOptionVersion(id)
bumpStructureVersion(id)
```

**2. Thêm quy tắc Drag-Drop:**
```
RULE: Tree order = DOM order. Không hỗ trợ responsive reordering via drag.
Responsive thay đổi qua: flex-direction, visibility, width, column-count.
```

**3. Cập nhật Export Strategy:**
```
THAY: "export inline style"
BẰNG: "export hybrid — base inline + @media block với data-uid selectors"
Cung cấp 2 mode: Responsive Export và Static Export (desktop-only inline).
```
