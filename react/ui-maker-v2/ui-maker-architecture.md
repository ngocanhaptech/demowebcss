# ui-maker v2 — Architecture Design Document

> Kiến trúc sư: Software Architect  
> Ngày: April 10, 2026  
> Tham khảo: UX Builder source analysis (editor-1.js, editor-2.js, content.js)  
> Phiên bản: MVP local-only, LocalStorage + JSON files, export HTML inline style

---

## 1. Triết lý thiết kế

| Nguyên tắc | Giải thích |
|-----------|-----------|
| **Data-driven elements** | Element types định nghĩa bằng JSON — không hardcode trong React |
| **Reactive tree model** | Cây Element doubly-linked, option setter tự record history |
| **Single source of truth** | Một Store Zustand duy nhất, không prop drilling |
| **Controller per element** | Mỗi element type có class controller riêng — render + export + defaultOptions |
| **JSON as database** | `/public/data/*.json` = database tables, CRUD qua DataService |
| **Event-driven** | EventBus trung tâm, UI phản ứng qua subscription |

---

## 2. Folder Structure

```
ui-maker/
│
├── public/
│   └── data/                          # JSON "database" — có thể thêm/sửa/xóa
│       ├── categories.json            # Danh mục element
│       ├── elements/                  # Mỗi file = 1 element type definition
│       │   ├── row.json
│       │   ├── column.json
│       │   ├── text.json
│       │   ├── image.json
│       │   ├── button.json
│       │   ├── hero.json
│       │   ├── tabs.json
│       │   ├── accordion.json
│       │   └── ... (mỗi element 1 file)
│       └── presets/                   # Preset content trees
│           ├── hero-basic.json
│           ├── hero-split.json
│           └── ...
│
├── src/
│   │
│   ├── core/                          # Layer 1: Core logic — framework-agnostic
│   │   ├── ElementNode.js             # Doubly-linked tree node (≈ Shortcode class M)
│   │   ├── ElementRegistry.js         # Flat Map<id, ElementNode> — O(1) lookup
│   │   ├── EventBus.js                # Pub/sub + filter chain (≈ ShortcodeEvent system)
│   │   ├── HistoryManager.js          # Undo/Redo — action stack (≈ history service E)
│   │   └── ResponsiveManager.js       # Breakpoint cascade helper (≈ ResponsiveHelper D)
│   │
│   ├── data/                          # Layer 2: Data access — JSON files + LocalStorage
│   │   ├── DataLoader.js              # fetch('/data/...') + parse JSON, cache in memory
│   │   ├── ElementDefService.js       # CRUD cho element definition JSON files
│   │   ├── PresetService.js           # CRUD cho preset JSON files
│   │   └── PageStorageService.js      # LocalStorage CRUD cho pages + project state
│   │
│   ├── controllers/                   # Layer 3: Element Controllers (render + export logic)
│   │   ├── BaseController.js          # Abstract base: buildHtml(), buildStyle(), defaults()
│   │   ├── registry.js                # Map<tag, Controller> — đăng ký tất cả controllers
│   │   ├── ContainerController.js     # row, section, column, grid
│   │   ├── TextController.js          # heading, paragraph, rich-text
│   │   ├── ImageController.js         # image, image-box, gallery
│   │   ├── ButtonController.js        # button, button-group
│   │   ├── HeroController.js          # hero, banner, banner-split
│   │   ├── CardController.js          # card, feature-box, icon-box
│   │   ├── MediaController.js         # video embed, iframe embed
│   │   ├── FormController.js          # contact-form, newsletter
│   │   ├── NavigationController.js    # navbar, menu
│   │   ├── TabsController.js          # tabs, accordion
│   │   ├── TestimonialController.js   # testimonial, review
│   │   ├── FooterController.js        # footer
│   │   └── DecoratorController.js     # divider, spacer, badge
│   │
│   ├── store/                         # Layer 4: Global state (Zustand)
│   │   ├── appStore.js                # Main Zustand store
│   │   └── slices/
│   │       ├── editorSlice.js         # selection, outline, freeze, viewport
│   │       ├── historySlice.js        # history[], currentAction
│   │       ├── pagesSlice.js          # pages[], currentPageId
│   │       └── dataSlice.js           # elementDefs, presets, categories (loaded from JSON)
│   │
│   ├── hooks/                         # Layer 5: React hooks (bridge store → UI)
│   │   ├── useApp.js                  # useSelectElement, useOutline, useFreeze
│   │   ├── useHistory.js              # useUndo, useRedo, canUndo, canRedo
│   │   ├── useResponsive.js           # useBreakpoint, useSetBreakpoint
│   │   ├── useElementDef.js           # useElementDef(tag), useAllDefs
│   │   └── usePageStorage.js          # useSavePage, useLoadPage, usePages
│   │
│   ├── components/                    # Layer 6: React UI
│   │   │
│   │   ├── App.jsx                    # Root — layout, providers, keyboard shortcuts
│   │   │
│   │   ├── header/
│   │   │   └── Header.jsx             # Logo | Panel toggles | Viewport | Export | Save
│   │   │
│   │   ├── panels/
│   │   │   ├── ElementsPanel.jsx      # Danh sách elements để drag/add
│   │   │   ├── LayersPanel.jsx        # Cây element hierarchy (như Layers panel)
│   │   │   ├── PagesPanel.jsx         # CRUD pages
│   │   │   └── DataManagerPanel.jsx   # Xem/sửa/thêm/xóa JSON files
│   │   │
│   │   ├── canvas/
│   │   │   ├── Canvas.jsx             # Viewport container + scroll
│   │   │   ├── ViewportFrame.jsx      # Desktop/tablet/mobile size constraint
│   │   │   ├── ElementRenderer.jsx    # Recursive tree renderer
│   │   │   ├── ElementWrapper.jsx     # Selection overlay + toolbar trigger
│   │   │   ├── SelectionToolbar.jsx   # Floating toolbar khi element được chọn
│   │   │   ├── DropZone.jsx           # Drop target khi drag element
│   │   │   └── DragLayer.jsx          # Ghost element khi đang kéo
│   │   │
│   │   ├── options/                   # Option field components (như ux-option-*)
│   │   │   ├── OptionField.jsx        # Router → chọn đúng field theo type
│   │   │   ├── OptionText.jsx
│   │   │   ├── OptionNumber.jsx
│   │   │   ├── OptionSelect.jsx
│   │   │   ├── OptionColor.jsx
│   │   │   ├── OptionRange.jsx        # + scrubfield behavior
│   │   │   ├── OptionCheckbox.jsx
│   │   │   ├── OptionRadio.jsx
│   │   │   ├── OptionImage.jsx        # file picker + URL input
│   │   │   ├── OptionTextarea.jsx
│   │   │   ├── OptionMargins.jsx      # top/right/bottom/left
│   │   │   ├── OptionGroup.jsx        # Collapsible group
│   │   │   └── OptionResponsive.jsx   # Wrapper thêm breakpoint tabs
│   │   │
│   │   ├── props/
│   │   │   ├── PropsPanel.jsx         # Right sidebar — options của element đang chọn
│   │   │   └── ElementInfo.jsx        # Tag, name, breadcrumb
│   │   │
│   │   └── shared/
│   │       ├── Modal.jsx
│   │       ├── Tooltip.jsx
│   │       ├── ContextMenu.jsx
│   │       └── EmptyState.jsx
│   │
│   ├── export/                        # Layer 7: HTML Export engine
│   │   ├── HtmlExporter.js            # Traverse tree → HTML string
│   │   ├── StyleResolver.js           # options → inline style object → string
│   │   └── ExportTemplate.js          # Wrap trong full HTML doc (head, fonts, reset CSS)
│   │
│   └── utils/
│       ├── idGenerator.js             # nanoid — tạo unique $id
│       ├── deepClone.js               # structuredClone wrapper
│       └── cssHelpers.js              # px/%, color format, unit parsing
│
├── index.html
├── vite.config.js
└── package.json
```

---

## 3. JSON Database Schema

### `public/data/categories.json`
```json
[
  { "id": "layout",      "name": "Layout",     "icon": "grid" },
  { "id": "text",        "name": "Text",        "icon": "type" },
  { "id": "media",       "name": "Media",       "icon": "image" },
  { "id": "navigation",  "name": "Navigation",  "icon": "menu" },
  { "id": "interactive", "name": "Interactive", "icon": "cursor" },
  { "id": "cards",       "name": "Cards",       "icon": "square" },
  { "id": "form",        "name": "Form",        "icon": "edit" },
  { "id": "footer",      "name": "Footer",      "icon": "minus" }
]
```

### `public/data/elements/row.json` — Element Definition
```json
{
  "tag": "row",
  "name": "Row",
  "category": "layout",
  "icon": "rows",
  "nested": true,
  "allow": ["column"],
  "require": [],
  "hidden": false,
  "toolbar": {
    "showOnChildActive": true,
    "showChildrenSelector": true
  },
  "options": [
    {
      "name": "Background Color",
      "$name": "bgColor",
      "type": "color",
      "default": "",
      "responsive": false
    },
    {
      "name": "Padding",
      "$name": "padding",
      "type": "margins",
      "default": "40px 20px",
      "responsive": true
    },
    {
      "name": "Max Width",
      "$name": "maxWidth",
      "type": "select",
      "default": "1200px",
      "responsive": false,
      "config": {
        "options": [
          { "value": "100%",   "label": "Full Width" },
          { "value": "1440px", "label": "1440px" },
          { "value": "1200px", "label": "1200px (Recommended)" },
          { "value": "960px",  "label": "960px" }
        ]
      }
    },
    {
      "name": "Columns Gap",
      "$name": "gap",
      "type": "range",
      "default": 20,
      "responsive": true,
      "config": { "min": 0, "max": 80, "step": 4, "unit": "px" }
    }
  ],
  "presets": [
    {
      "name": "Default",
      "content": {
        "tag": "row",
        "options": {},
        "children": [
          { "tag": "column", "options": {}, "children": [] }
        ]
      }
    }
  ]
}
```

### `public/data/presets/hero-basic.json` — Preset Tree
```json
{
  "id": "hero-basic",
  "name": "Hero Basic",
  "thumbnail": "",
  "content": {
    "tag": "row",
    "options": { "bgColor": "#1a1a2e", "padding": "80px 20px" },
    "children": [
      {
        "tag": "column",
        "options": { "align": "center" },
        "children": [
          { "tag": "heading", "content": "Welcome to Our Site", "options": { "level": "h1", "color": "#fff" } },
          { "tag": "paragraph", "content": "Build beautiful pages with drag and drop.", "options": { "color": "#ccc" } },
          { "tag": "button", "content": "Get Started", "options": { "variant": "primary", "size": "lg" } }
        ]
      }
    ]
  }
}
```

### LocalStorage Schema (`PageStorageService`)
```
ui-maker:pages-index      → ["page-abc123", "page-def456"]
ui-maker:page:page-abc123 → { id, name, slug, createdAt, updatedAt, tree: ElementNode.copy() }
ui-maker:settings         → { lastOpenedPageId, theme, language }
```

---

## 4. Class Diagrams

### 4.1 Core Layer

```
┌─────────────────────────────────────────────────────────┐
│                       ElementNode                       │
├─────────────────────────────────────────────────────────┤
│ + $id: string                                           │
│ + tag: string                                           │
│ + $parentId: string | null                              │
│ + children: ElementNode[]   (nếu isParent)              │
│ + content: string           (text content)              │
│ + optionValues: Record<string, any>                     │
│ + responsiveValues: Record<string, any[]>               │
│ + options: Proxy            (reactive getter/setter)    │
│ + states: { active, dragging, selected, open }          │
│ - _def: ElementDef          (tham chiếu definition)     │
├─────────────────────────────────────────────────────────┤
│ + addChild(data, index?, record?): ElementNode          │
│ + removeChild(index, record?): ElementNode              │
│ + remove(record?): void                                 │
│ + duplicate(afterIndex?): ElementNode                   │
│ + detach(): ElementNode                                 │
│ + copy(transform?): PlainObject                         │
│ + allows(node): boolean                                 │
│ + apply(): void             (trigger React re-render)   │
├─────────────────────────────────────────────────────────┤
│ get parent: ElementNode | null                          │
│ get index: number                                       │
│ get depth: number                                       │
│ get ancestors: ElementNode[]                            │
│ get descendants: ElementNode[]                          │
│ get siblings: ElementNode[]                             │
│ get isRoot: boolean                                     │
│ get isParent: boolean                                   │
│ get isEmpty: boolean                                    │
│ get allowed: Record<string, ElementDef>                 │
└─────────────────────────────────────────────────────────┘
         ↑ references
┌────────────────────────────┐
│     ElementRegistry        │
├────────────────────────────┤
│ - map: Map<id, ElementNode>│
│ - root: ElementNode        │
├────────────────────────────┤
│ + register(node): void     │
│ + unregister(id): void     │
│ + get(id): ElementNode     │
│ + getRoot(): ElementNode   │
│ + clear(): void            │
│ + snapshot(): PlainObject  │ → serialize toàn cây
│ + restore(data): void      │ ← deserialize từ storage
└────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                    EventBus                      │
├─────────────────────────────────────────────────┤
│ - listeners: Map<string, Set<Function>>          │
│ - filters: Map<string, Function[]>               │
├─────────────────────────────────────────────────┤
│ + on(event, handler): () => void  (unsubscribe)  │
│ + off(event, handler): void                      │
│ + emit(event, ...args): void                     │
│ + once(event, handler): void                     │
│ + addFilter(event, fn): void                     │
│ + applyFilter(event, value, ...args): any        │
└─────────────────────────────────────────────────┘

Constants: ElementEvent
  SELECTED   OUTLINED   CONFIGURE
  ADDED      MOVED      REMOVED
  DUPLICATED CONTENT_CHANGED
  OPTION_CHANGED

┌──────────────────────────────────────────────────────────┐
│                    HistoryManager                        │
├──────────────────────────────────────────────────────────┤
│ - stack: Action[]                                        │
│ - cursor: number           (-1 = trước action đầu tiên) │
│ - registry: ElementRegistry                              │
│ - maxSize: number          (default 100)                 │
├──────────────────────────────────────────────────────────┤
│ + push(action): void       (thêm action, xóa redo stack)│
│ + undo(): Action | null                                  │
│ + redo(): Action | null                                  │
│ + canUndo(): boolean                                     │
│ + canRedo(): boolean                                     │
│ + clear(): void                                          │
│ - doAction(action, dir): void  (dir: -1=undo, 1=redo)   │
└──────────────────────────────────────────────────────────┘

Action Types:
  { type: "ADD_ELEMENT",      payload: { id, parentId, index, data } }
  { type: "REMOVE_ELEMENT",   payload: { id, parentId, index, data } }
  { type: "MOVE_ELEMENT",     payload: { id, fromParentId, fromIndex, toParentId, toIndex } }
  { type: "UPDATE_OPTION",    payload: { id, optionName, oldValue, newValue, bp? } }
  { type: "UPDATE_CONTENT",   payload: { id, oldContent, newContent } }
  { type: "REORDER_CHILDREN", payload: { parentId, fromIndex, toIndex } }

┌─────────────────────────────────────────────────────────┐
│                  ResponsiveManager                       │
├─────────────────────────────────────────────────────────┤
│ + BREAKPOINTS: { mobile:0, tablet:1, desktop:2 }        │
│ + WIDTHS: { mobile:"360px", tablet:"768px", desktop:"" }│
├─────────────────────────────────────────────────────────┤
│ + resolve(arr, bpIndex?): any   (cascade-down)          │
│ + set(arr, bpIndex, value): any[]                        │
│ + clear(arr, bpIndex): any[]                            │
│ + hasValueAt(arr, bpIndex): boolean                     │
│ + hasValueBetween(arr, from, to): boolean               │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Data Layer

```
┌──────────────────────────────────────────────────────────────┐
│                       DataLoader                             │
├──────────────────────────────────────────────────────────────┤
│ - cache: Map<string, any>                                    │
├──────────────────────────────────────────────────────────────┤
│ + fetch(path): Promise<any>        (cache-first)             │
│ + invalidate(path): void                                     │
│ + preload(paths[]): Promise<void>                            │
└──────────────────────────────────────────────────────────────┘
         ↑ used by
┌──────────────────────────────────────────────────────────────┐
│                   ElementDefService                          │
├──────────────────────────────────────────────────────────────┤
│ - loader: DataLoader                                         │
│ - overrides: Map<tag, ElementDef>  (LocalStorage overrides)  │
├──────────────────────────────────────────────────────────────┤
│ + getAll(): Promise<ElementDef[]>                            │
│ + get(tag): Promise<ElementDef>                              │
│ + create(tag, def): Promise<void>  → ghi LocalStorage        │
│ + update(tag, patch): Promise<void>                          │
│ + delete(tag): Promise<void>                                 │
│ + export(tag): string              → JSON string             │
│ + import(jsonStr): Promise<void>   ← parse + validate        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    PresetService                             │
├──────────────────────────────────────────────────────────────┤
│ + getAll(tag?): Promise<Preset[]>                            │
│ + get(id): Promise<Preset>                                   │
│ + create(preset): void         → LocalStorage                │
│ + delete(id): void                                           │
│ + export(id): string                                         │
│ + import(jsonStr): void                                      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  PageStorageService                          │
├──────────────────────────────────────────────────────────────┤
│ - STORAGE_KEY: "ui-maker:pages-index"                        │
├──────────────────────────────────────────────────────────────┤
│ + getIndex(): string[]             (list of page IDs)        │
│ + getPage(id): PageData | null                               │
│ + getAllPages(): PageData[]                                   │
│ + savePage(page: PageData): void                             │
│ + deletePage(id): void                                       │
│ + createPage(name): PageData       (returns new page)        │
│ + duplicatePage(id): PageData                                │
└──────────────────────────────────────────────────────────────┘

PageData = {
  id: string,
  name: string,
  slug: string,
  seo: { title, description },
  createdAt: ISO string,
  updatedAt: ISO string,
  tree: PlainObject            (ElementRegistry.snapshot())
}
```

### 4.3 Controller Layer

```
┌──────────────────────────────────────────────────────────┐
│                   BaseController (abstract)              │
├──────────────────────────────────────────────────────────┤
│ + tag: string                                            │
├──────────────────────────────────────────────────────────┤
│ + getDefaultOptions(): Record<string, any>               │
│ + resolveStyle(options, bp): CSSProperties               │
│ + buildHtml(node, bp): string       ← for export         │
│ + buildChildrenHtml(node, bp): string                    │
│ + canContain(childTag): boolean                          │
└──────────────────────────────────────────────────────────┘
         ↑ extends
  ContainerController  TextController  ImageController
  ButtonController     HeroController  CardController
  MediaController      FormController  TabsController
  NavigationController FooterController DecoratorController

┌───────────────────────────────────────────────┐
│          ControllerRegistry (singleton)        │
├───────────────────────────────────────────────┤
│ - map: Map<tag, BaseController>               │
├───────────────────────────────────────────────┤
│ + register(tag, controller): void             │
│ + get(tag): BaseController                    │
│ + getAll(): Map<tag, BaseController>          │
└───────────────────────────────────────────────┘
```

### 4.4 Store Layer (Zustand)

```
┌────────────────────────────────────────────────────────────────┐
│                       AppStore (Zustand)                       │
├──────────────────────┬─────────────────────────────────────────┤
│  Editor State        │  Actions                                │
├──────────────────────┼─────────────────────────────────────────┤
│ selectedId: string?  │ selectElement(id)                       │
│ outlinedId: string?  │ outlineElement(id)                      │
│ configuringId: str?  │ configureElement(id)                    │
│ frozen: boolean      │ freeze(bool)                            │
│ viewportMode: str    │ setViewportMode('desktop'|'tablet'|...) │
│ showLeftPanel: bool  │ toggleLeftPanel()                       │
│ showRightPanel: bool │ toggleRightPanel()                      │
│ activeLeftTab: str   │ setActiveLeftTab(tab)                   │
├──────────────────────┼─────────────────────────────────────────┤
│  History State       │                                         │
├──────────────────────┼─────────────────────────────────────────┤
│ history: Action[]    │ pushHistory(action)                     │
│ histCursor: number   │ undo()                                  │
│                      │ redo()                                  │
├──────────────────────┼─────────────────────────────────────────┤
│  Pages State         │                                         │
├──────────────────────┼─────────────────────────────────────────┤
│ pages: PageData[]    │ createPage(name)                        │
│ currentPageId: str   │ switchPage(id)                          │
│ isDirty: boolean     │ savePage()                              │
│                      │ deletePage(id)                          │
├──────────────────────┼─────────────────────────────────────────┤
│  Data State          │                                         │
├──────────────────────┼─────────────────────────────────────────┤
│ elementDefs: Map     │ loadElementDefs()                       │
│ categories: array    │ updateElementDef(tag, patch)            │
│ presets: Map         │ deleteElementDef(tag)                   │
├──────────────────────┼─────────────────────────────────────────┤
│  Responsive State    │                                         │
├──────────────────────┼─────────────────────────────────────────┤
│ breakpoint: number   │ setBreakpoint(0|1|2)                    │
└──────────────────────┴─────────────────────────────────────────┘
```

### 4.5 Export Layer

```
┌──────────────────────────────────────────────────────────┐
│                    HtmlExporter                          │
├──────────────────────────────────────────────────────────┤
│ - registry: ElementRegistry                              │
│ - controllers: ControllerRegistry                        │
│ - breakpoint: number   (dùng bp nào khi export, mặc định 2) │
├──────────────────────────────────────────────────────────┤
│ + export(pageData): string      (full HTML document)     │
│ + exportPartial(nodeId): string (chỉ 1 element + children)│
│ - buildNode(node): string                                │
│ - buildChildren(node): string                            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    StyleResolver                         │
├──────────────────────────────────────────────────────────┤
│ + resolve(optionDefs, optionValues, respValues, bp): CSSObject │
│ + toCssString(cssObj): string   ("color:red;padding:10px")│
│ + toInlineAttr(cssObj): string  ("style=\"...\"")          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                   ExportTemplate                         │
├──────────────────────────────────────────────────────────┤
│ + wrap(bodyHtml, meta): string  (full HTML doc)          │
│   → includes: CSS reset, Google Fonts link, viewport meta│
│   → all styles inline, zero external dependencies        │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Data Flow Diagram

```
User click "Add Element"
        │
        ▼
ElementsPanel → dispatch addElement(tag, parentId, index)
        │
        ▼
AppStore.addElement()
  → ElementNode.addChild(def, index)        ← tree mutation
    → options Proxy setup (reactive setter)
    → ElementRegistry.register(newNode)
    → HistoryManager.push({ type:"ADD_ELEMENT", payload })
    → EventBus.emit(ElementEvent.ADDED, newNode)
        │
        ▼
ElementRegistry updated → React re-render triggered
  → Canvas → ElementRenderer re-renders tree
  → PropsPanel shows new element options
  → LayersPanel updates hierarchy
```

```
User changes option value (e.g. padding)
        │
        ▼
OptionMargins onChange → node.options.padding = "30px"
        │
        ▼
Proxy setter runs:
  1. Record old value snapshot
  2. Debounce 250ms
  3. HistoryManager.push({ type:"UPDATE_OPTION", ... })
  4. optionValues[name] = newValue
  5. If responsive: responsiveValues[name][currentBP] = newValue
  6. node.apply() → setState trigger
        │
        ▼
ElementRenderer re-renders affected node only
```

```
User click Undo (Ctrl+Z)
        │
        ▼
AppStore.undo()
  → HistoryManager.undo()
    → doAction(action, direction: -1)
      → switch action.type:
        "UPDATE_OPTION" → swap old/new value
        "ADD_ELEMENT"   → remove element
        "REMOVE_ELEMENT"→ restore element
        "MOVE_ELEMENT"  → move back
        ...
    → cursor--
    → EventBus.emit → re-render
```

```
User click Export
        │
        ▼
HtmlExporter.export(pageData)
  → traverse ElementRegistry tree (DFS)
  → for each node:
      controller = ControllerRegistry.get(node.tag)
      styleObj = StyleResolver.resolve(def.options, node.optionValues, node.responsiveValues, bp=2)
      html = controller.buildHtml(node) + style="..."
  → children recursively
  → ExportTemplate.wrap(html, pageMeta)
        │
        ▼
download "page-name.html" → self-contained, inline styles
```

---

## 6. Kế hoạch Code — 6 Phases

### Phase 1 — Core Infrastructure (3-4 ngày)
> _Không có UI, chạy test thuần JS_

**File cần viết:**

```
src/core/EventBus.js
src/core/ResponsiveManager.js
src/core/ElementRegistry.js
src/core/ElementNode.js           ← phức tạp nhất
src/core/HistoryManager.js
src/utils/idGenerator.js
src/utils/deepClone.js
src/utils/cssHelpers.js
```

**Checklist:**
- [ ] EventBus: on/off/emit/once/addFilter/applyFilter
- [ ] ResponsiveManager: resolve cascade, set, clear
- [ ] ElementRegistry: Map CRUD + snapshot/restore
- [ ] ElementNode: tree operations, Proxy options, history recording (debounce 250ms)
- [ ] HistoryManager: push/undo/redo với tất cả 6 action types

**Test (browser console):**
```js
const reg = new ElementRegistry()
const root = reg.getRoot()
const child = root.addChild({ tag: "row" }, 0)
child.options.padding = "20px"
history.undo()  // padding về ""
history.redo()  // padding về "20px"
reg.snapshot()  // serialize cây
```

---

### Phase 2 — Data Layer + JSON Schema (1-2 ngày)

**File cần viết:**
```
src/data/DataLoader.js
src/data/ElementDefService.js
src/data/PresetService.js
src/data/PageStorageService.js
public/data/categories.json
public/data/elements/row.json      (+ tất cả elements)
public/data/elements/column.json
public/data/elements/text.json
public/data/elements/heading.json
public/data/elements/image.json
public/data/elements/button.json
public/data/elements/hero.json
... (20+ elements)
public/data/presets/hero-basic.json
```

**Checklist:**
- [ ] DataLoader fetch + memory cache
- [ ] ElementDefService: getAll, get, create (LocalStorage override), update, delete, import/export JSON
- [ ] PresetService: getAll(tag), create, delete, import/export
- [ ] PageStorageService: CRUD pages trong LocalStorage
- [ ] JSON schema đầy đủ cho 20+ elements

---

### Phase 3 — Controllers + Export (2-3 ngày)

**File cần viết:**
```
src/controllers/BaseController.js
src/controllers/registry.js
src/controllers/ContainerController.js   (row, column, section)
src/controllers/TextController.js        (heading, paragraph, rich-text)
src/controllers/ImageController.js       (image, image-box, gallery)
src/controllers/ButtonController.js      (button, button-group)
src/controllers/HeroController.js        (hero, banner)
src/controllers/CardController.js        (card, feature, icon-box, testimonial)
src/controllers/MediaController.js       (video, embed)
src/controllers/FormController.js        (contact-form, newsletter)
src/controllers/TabsController.js        (tabs, accordion)
src/controllers/NavigationController.js  (navbar, menu)
src/controllers/FooterController.js      (footer)
src/controllers/DecoratorController.js   (divider, spacer, badge, separator)
src/export/StyleResolver.js
src/export/HtmlExporter.js
src/export/ExportTemplate.js
```

**Checklist:**
- [ ] BaseController.resolveStyle() → map options → CSS
- [ ] Mỗi Controller: buildHtml() trả string HTML có inline style
- [ ] StyleResolver: options → cssObject → inline attr string
- [ ] HtmlExporter: DFS traverse, gọi controller per node
- [ ] ExportTemplate: full HTML doc với CSS reset + viewport meta
- [ ] Test export một page phức tạp

---

### Phase 4 — Zustand Store + Hooks (1-2 ngày)

**File cần viết:**
```
src/store/appStore.js
src/store/slices/editorSlice.js
src/store/slices/historySlice.js
src/store/slices/pagesSlice.js
src/store/slices/dataSlice.js
src/hooks/useApp.js
src/hooks/useHistory.js
src/hooks/useResponsive.js
src/hooks/useElementDef.js
src/hooks/usePageStorage.js
```

**Checklist:**
- [ ] Zustand store với immer middleware (immutable updates)
- [ ] editorSlice: selection, outline, freeze, viewport, panels
- [ ] historySlice: bridge HistoryManager ↔ Zustand
- [ ] pagesSlice: pages CRUD, bridge PageStorageService
- [ ] dataSlice: load element defs + presets on startup
- [ ] Keyboard shortcuts: Ctrl+Z/Y trong useHistory, Delete element

---

### Phase 5 — React UI (5-7 ngày)

**Thứ tự ưu tiên (bottom-up):**

**5a. Option Fields (Foundation)**
```
src/components/options/OptionField.jsx       (router)
src/components/options/OptionText.jsx
src/components/options/OptionNumber.jsx
src/components/options/OptionSelect.jsx
src/components/options/OptionColor.jsx       (color input + hex text)
src/components/options/OptionRange.jsx       (slider + scrub)
src/components/options/OptionCheckbox.jsx
src/components/options/OptionRadio.jsx
src/components/options/OptionImage.jsx       (file picker + preview)
src/components/options/OptionMargins.jsx     (4 inputs linked/unlinked)
src/components/options/OptionTextarea.jsx
src/components/options/OptionGroup.jsx       (collapsible)
src/components/options/OptionResponsive.jsx  (BP tabs wrapper)
```

**5b. Canvas**
```
src/components/canvas/Canvas.jsx
src/components/canvas/ViewportFrame.jsx     (360/768/full width)
src/components/canvas/ElementRenderer.jsx   (recursive, dangerouslySetInnerHTML)
src/components/canvas/ElementWrapper.jsx    (hover outline, click select)
src/components/canvas/SelectionToolbar.jsx  (floating: move up/down, duplicate, delete)
src/components/canvas/DropZone.jsx          (drag-over target)
src/components/canvas/DragLayer.jsx         (ghost preview khi kéo)
```

**5c. Panels**
```
src/components/panels/ElementsPanel.jsx    (search + grid + drag-to-add)
src/components/panels/LayersPanel.jsx      (tree, click select, drag reorder)
src/components/panels/PagesPanel.jsx       (CRUD pages)
src/components/panels/DataManagerPanel.jsx (xem/sửa JSON files)
src/components/props/PropsPanel.jsx        (tabs: Style, Layout, Advanced)
src/components/props/ElementInfo.jsx       (breadcrumb: root > row > column > ...)
```

**5d. Shared + Layout**
```
src/components/shared/Modal.jsx
src/components/shared/ContextMenu.jsx      (right-click: duplicate, delete, move...)
src/components/shared/Tooltip.jsx
src/components/header/Header.jsx
src/components/App.jsx                     (root layout, keyboard handler)
```

---

### Phase 6 — DataManager UI + Polish (2-3 ngày)

**DataManagerPanel — tính năng đặc biệt:**
- Xem danh sách tất cả element definition JSONs
- Click → editor JSON trực tiếp (textarea với syntax highlight đơn giản)
- "Save" → ghi vào LocalStorage override
- "Reset to default" → xóa override, dùng lại file gốc
- "Export as .json" → download file
- "Import .json" → FileReader API → parse → validate schema → lưu
- "New element" → wizard: tag, name, category, options builder
- "Delete" → xóa override (custom element) hoặc ẩn built-in

---

## 7. Dependency Map

```
App.jsx
├── uses: AppStore (Zustand)
├── uses: useHistory (keyboard shortcuts)
│
├── Header.jsx
│   └── uses: useHistory, useResponsive, usePageStorage
│
├── ElementsPanel.jsx
│   └── uses: useElementDef, ElementDefService
│
├── LayersPanel.jsx
│   └── uses: ElementRegistry, AppStore.selectedId
│
├── PagesPanel.jsx
│   └── uses: usePageStorage
│
├── DataManagerPanel.jsx
│   └── uses: ElementDefService, PresetService
│
├── Canvas.jsx
│   └── ViewportFrame
│       └── ElementRenderer (recursive)
│           └── ElementWrapper
│               └── dangerouslySetInnerHTML (controller.buildHtml preview)
│                   OR ElementRenderer.children
│
└── PropsPanel.jsx
    └── uses: AppStore.selectedId → ElementRegistry.get(id)
        → def.options → OptionField[]
            → OptionResponsive (nếu responsive: true)
                → OptionField (inner)
```

---

## 8. Tech Stack

| Concern | Choice | Lý do |
|---------|--------|-------|
| Framework | React 19 + Vite | Hiện tại, hot reload |
| State | Zustand + Immer | Đơn giản hơn Redux, không boilerplate |
| Drag-Drop | `@dnd-kit/core` | Modern, accessible, không jQuery |
| IDs | `nanoid` | Nhỏ, nhanh, URL-safe |
| JSON handling | native JSON | Không cần thư viện |
| Styling | Inline styles (all) | Không CSS conflict, export-ready |
| Type hints | JSDoc comments | Không cần TypeScript setup |

**Package.json dependencies:**
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "immer": "^10.0.0",
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^8.0.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react-swc": "^3.0.0",
    "vite": "^6.0.0"
  }
}
```

---

## 9. Implementation Notes — Điểm quan trọng

### ElementNode.options Proxy
```js
// Pattern từ UX Builder: setter tự record history + debounce
const handler = {
  get(target, name) {
    if (name === '$responsive') return target._responsiveValues
    const def = target._def.options.named[name]
    if (def?.responsive) {
      return ResponsiveManager.resolve(target._responsiveValues[name])
    }
    return target._optionValues[name]
  },
  set(target, name, value) {
    const def = target._def.options.named[name]
    const bp = appStore.getState().breakpoint
    
    // Snapshot trước khi thay đổi (debounce 250ms)
    clearTimeout(optionDebounceTimers[target.$id + name])
    if (!optionSnapshots[target.$id]) optionSnapshots[target.$id] = {}
    if (!optionSnapshots[target.$id][name]) {
      optionSnapshots[target.$id][name] = {
        oldValue: deepClone(target._optionValues[name]),
        oldResp:  deepClone(target._responsiveValues[name])
      }
    }
    
    // Apply value
    target._optionValues[name] = value
    if (def?.responsive) {
      target._responsiveValues[name] ??= [null, null, null]
      target._responsiveValues[name][bp] = value
    }
    
    optionDebounceTimers[target.$id + name] = setTimeout(() => {
      historyManager.push({
        type: 'UPDATE_OPTION',
        payload: {
          id: target.$id,
          optionName: name,
          oldValue: optionSnapshots[target.$id][name].oldValue,
          newValue: deepClone(target._optionValues[name]),
          oldResp:  optionSnapshots[target.$id][name].oldResp,
          newResp:  deepClone(target._responsiveValues[name]),
          bp
        }
      })
      delete optionSnapshots[target.$id][name]
    }, 250)
    
    // Trigger re-render
    target.apply()
    return true
  }
}
```

### DataManager — LocalStorage Override Pattern
```js
// ElementDefService: JSON file gốc + LocalStorage overrides
async get(tag) {
  // Kiểm tra LocalStorage override trước
  const override = localStorage.getItem(`ui-maker:def:${tag}`)
  if (override) return JSON.parse(override)
  
  // Fallback về file JSON gốc
  return this.loader.fetch(`/data/elements/${tag}.json`)
}

update(tag, patch) {
  const current = await this.get(tag)
  const updated = { ...current, ...patch }
  localStorage.setItem(`ui-maker:def:${tag}`, JSON.stringify(updated))
  this.loader.invalidate(`/data/elements/${tag}.json`)
}
```

### Canvas Re-render Strategy
```js
// ElementRenderer chỉ re-render node thay đổi
// Dùng React.memo + custom compare function
const ElementRenderer = React.memo(({ nodeId }) => {
  // Subscribe trực tiếp vào node cụ thể
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  
  useEffect(() => {
    // node.apply() sẽ gọi forceUpdate
    const node = ElementRegistry.get(nodeId)
    node._updateFn = forceUpdate
    return () => { node._updateFn = null }
  }, [nodeId])
  
  // ...render
}, (prev, next) => prev.nodeId === next.nodeId)
```

### Export — HTML tự chứa
```js
// ExportTemplate.wrap()
export function wrapHtml(bodyHtml, meta) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.title || 'Untitled'}</title>
  <meta name="description" content="${meta.description || ''}">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
    img { max-width: 100%; height: auto; display: block; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`
}
```

---

## 10. Migration từ ui-maker v1

| v1 Component | v2 Tương đương |
|-------------|---------------|
| `src/constants/sectionRegistry.js` | `public/data/elements/*.json` |
| `src/utils/sectionBuilders.js` | `src/controllers/*Controller.js` |
| `src/utils/htmlExporter.js` | `src/export/HtmlExporter.js` |
| `src/components/Canvas.jsx` | `src/components/canvas/Canvas.jsx` + `ElementRenderer.jsx` |
| `src/components/PropsPanel.jsx` | `src/components/props/PropsPanel.jsx` + `src/components/options/` |
| App.jsx (state) | `src/store/appStore.js` |
| LocalStorage (flat) | `PageStorageService` (structured) |
| — | `ElementNode.js` (tree model, mới) |
| — | `HistoryManager.js` (undo/redo, mới) |
| — | `ElementDefService.js` (JSON CRUD, mới) |
| — | `DataManagerPanel.jsx` (UI quản lý JSON, mới) |

---

## 11. Checklist Khởi động

```
□ npx create vite@latest ui-maker-v2 -- --template react-swc
□ npm install zustand immer @dnd-kit/core @dnd-kit/sortable nanoid
□ Tạo folder structure như mục 2
□ Viết core/ (Phase 1) — test trong browser console
□ Tạo 5 elements JSON đầu tiên: row, column, heading, image, button
□ Viết 3 controllers đầu tiên: Container, Text, Image
□ Setup Zustand store cơ bản
□ Render Canvas với hardcoded tree để kiểm tra visual
□ Gắn PropsPanel + 3 option fields đầu tiên
□ Export HTML test
□ Tích hợp dần các phases còn lại
```
