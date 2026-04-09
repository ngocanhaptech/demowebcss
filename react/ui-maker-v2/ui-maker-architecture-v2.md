# ui-maker v2 — Product Architecture Document (Final)

> Version: 2.0 — Final (post-critique)  
> Date: April 10, 2026  
> Decisions incorporated: fine-grained subscription, tree=DOM, hybrid export  
> Approach: Demo-first — mỗi phase có deliverable chạy được + test data

---

## Quyết định kiến trúc (chốt cứng)

| # | Quyết định | Lý do |
|---|-----------|-------|
| D1 | Tree order = DOM order luôn luôn | Drag-drop nhất quán, xuất HTML đúng thứ tự |
| D2 | Responsive qua CSS property, không reorder DOM | Tránh confusing UX, align với UX Builder |
| D3 | Export: base inline + `<style>` @media block | Inline không override được media query |
| D4 | Fine-grained subscription: `optionVersions[id]`, `structureVersions[id]` | 200 nodes, chỉ 1-2 re-render mỗi thao tác |
| D5 | CSS variables (`var(--x)`) là first-class trong option values | Preset/theme hệ thống thật, không hardcode |
| D6 | JSON file per element type trong `public/data/elements/` | Data-driven, thêm element = thêm file |
| D7 | LocalStorage cho pages, JSON file override cho element defs | Không cần server |

---

## 1. Folder Structure (Final)

```
ui-maker/
│
├── public/
│   └── data/
│       ├── themes/
│       │   ├── default.json          ← CSS variable preset mặc định
│       │   ├── dark.json
│       │   └── minimal.json
│       ├── categories.json
│       └── elements/
│           ├── _root.json            ← wrapper gốc của page
│           ├── section.json          ← outer section (full-width)
│           ├── container.json        ← max-width wrapper
│           ├── row.json              ← flexbox row
│           ├── column.json           ← flex column
│           ├── heading.json
│           ├── paragraph.json
│           ├── button.json
│           ├── image.json
│           ├── divider.json
│           ├── spacer.json
│           ├── card.json
│           ├── hero.json
│           ├── navbar.json
│           └── footer.json
│
├── src/
│   ├── core/
│   │   ├── ElementNode.js            ← tree node, Proxy options, history hook
│   │   ├── ElementRegistry.js        ← Map<id, node> + snapshot/restore
│   │   ├── EventBus.js               ← pub/sub + filter chain
│   │   ├── HistoryManager.js         ← undo/redo action stack
│   │   └── ResponsiveManager.js      ← breakpoint cascade helper
│   │
│   ├── data/
│   │   ├── DataLoader.js             ← fetch('/data/...') + memory cache
│   │   ├── ElementDefService.js      ← CRUD element defs (file + LS override)
│   │   ├── ThemeService.js           ← load/switch CSS variable themes
│   │   ├── PresetService.js          ← CRUD preset trees
│   │   └── PageStorageService.js     ← LocalStorage page CRUD
│   │
│   ├── controllers/
│   │   ├── BaseController.js
│   │   ├── registry.js               ← Map<tag, Controller>
│   │   ├── SectionController.js      ← section, container
│   │   ├── LayoutController.js       ← row, column
│   │   ├── TextController.js         ← heading, paragraph
│   │   ├── ButtonController.js
│   │   ├── ImageController.js
│   │   ├── HeroController.js
│   │   ├── NavbarController.js
│   │   ├── FooterController.js
│   │   └── DecoratorController.js    ← divider, spacer, card
│   │
│   ├── store/
│   │   └── appStore.js               ← Zustand (subscribeWithSelector + immer)
│   │
│   ├── hooks/
│   │   ├── useApp.js
│   │   ├── useHistory.js
│   │   ├── useResponsive.js
│   │   ├── useTheme.js
│   │   └── usePageStorage.js
│   │
│   ├── components/
│   │   ├── App.jsx
│   │   ├── header/
│   │   │   └── Header.jsx
│   │   ├── panels/
│   │   │   ├── ElementsPanel.jsx     ← thêm element
│   │   │   ├── LayersPanel.jsx       ← hierarchy tree
│   │   │   ├── PagesPanel.jsx
│   │   │   ├── ThemePanel.jsx        ← edit CSS variables
│   │   │   └── DataManagerPanel.jsx  ← JSON file CRUD
│   │   ├── canvas/
│   │   │   ├── Canvas.jsx
│   │   │   ├── ViewportFrame.jsx
│   │   │   ├── ElementRenderer.jsx   ← subscribe structureVersion
│   │   │   ├── ElementWrapper.jsx    ← subscribe optionVersion + selection
│   │   │   ├── SelectionToolbar.jsx
│   │   │   ├── DropZone.jsx
│   │   │   └── DragLayer.jsx
│   │   ├── options/
│   │   │   ├── OptionField.jsx       ← router theo type
│   │   │   ├── OptionText.jsx
│   │   │   ├── OptionNumber.jsx
│   │   │   ├── OptionSelect.jsx
│   │   │   ├── OptionColor.jsx       ← color picker + CSS var picker
│   │   │   ├── OptionRange.jsx
│   │   │   ├── OptionCheckbox.jsx
│   │   │   ├── OptionImage.jsx
│   │   │   ├── OptionMargins.jsx
│   │   │   ├── OptionGroup.jsx
│   │   │   └── OptionResponsive.jsx  ← wrapper breakpoint tabs
│   │   ├── props/
│   │   │   ├── PropsPanel.jsx
│   │   │   └── ElementBreadcrumb.jsx
│   │   └── shared/
│   │       ├── Modal.jsx
│   │       ├── ContextMenu.jsx
│   │       └── Tooltip.jsx
│   │
│   ├── export/
│   │   ├── HtmlExporter.js
│   │   ├── StyleResolver.js
│   │   └── ExportTemplate.js
│   │
│   └── utils/
│       ├── idGenerator.js            ← nanoid
│       ├── deepClone.js              ← structuredClone wrapper
│       └── cssHelpers.js
│
├── index.html
├── vite.config.js
└── package.json
```

---

## 2. CSS Variable / Theme System

### Triết lý

Option value của bất kỳ element nào đều có thể là:
- Giá trị thực: `"#2563eb"`, `"20px"`, `"bold"`
- Tham chiếu CSS variable: `"var(--color-primary)"`, `"var(--gutter)"`

Khi export HTML, giá trị được emit nguyên văn → trình duyệt tự resolve variable từ `:root {}` được inject ở đầu file.

### `public/data/themes/default.json`

```json
{
  "id": "default",
  "name": "Default",
  "description": "Clean professional theme",
  "variables": {
    "colors": {
      "--color-primary":       "#2563eb",
      "--color-primary-dark":  "#1d4ed8",
      "--color-primary-light": "#dbeafe",
      "--color-secondary":     "#7c3aed",
      "--color-accent":        "#f59e0b",
      "--color-success":       "#10b981",
      "--color-danger":        "#ef4444",
      "--color-text":          "#111827",
      "--color-text-muted":    "#6b7280",
      "--color-text-inverse":  "#ffffff",
      "--color-bg":            "#ffffff",
      "--color-bg-alt":        "#f9fafb",
      "--color-bg-dark":       "#111827",
      "--color-border":        "#e5e7eb"
    },
    "spacing": {
      "--gutter":              "20px",
      "--container-max":       "1200px",
      "--section-padding-y":   "80px",
      "--section-padding-x":   "var(--gutter)",
      "--card-padding":        "24px",
      "--btn-padding":         "12px 28px"
    },
    "typography": {
      "--font-base":           "'Inter', system-ui, -apple-system, sans-serif",
      "--font-heading":        "'Inter', system-ui, -apple-system, sans-serif",
      "--font-mono":           "'JetBrains Mono', 'Fira Code', monospace",
      "--font-size-xs":        "12px",
      "--font-size-sm":        "14px",
      "--font-size-base":      "16px",
      "--font-size-lg":        "18px",
      "--font-size-xl":        "20px",
      "--font-size-2xl":       "24px",
      "--font-size-3xl":       "30px",
      "--font-size-4xl":       "36px",
      "--font-size-5xl":       "48px",
      "--line-height-tight":   "1.25",
      "--line-height-base":    "1.6",
      "--font-weight-normal":  "400",
      "--font-weight-medium":  "500",
      "--font-weight-bold":    "700"
    },
    "shape": {
      "--radius-sm":           "4px",
      "--radius-md":           "8px",
      "--radius-lg":           "16px",
      "--radius-xl":           "24px",
      "--radius-full":         "9999px"
    },
    "shadow": {
      "--shadow-sm":           "0 1px 2px rgba(0,0,0,0.05)",
      "--shadow-md":           "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
      "--shadow-lg":           "0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)"
    }
  }
}
```

### `public/data/themes/dark.json`

```json
{
  "id": "dark",
  "name": "Dark Mode",
  "variables": {
    "colors": {
      "--color-primary":       "#60a5fa",
      "--color-primary-dark":  "#3b82f6",
      "--color-text":          "#f9fafb",
      "--color-text-muted":    "#9ca3af",
      "--color-bg":            "#111827",
      "--color-bg-alt":        "#1f2937",
      "--color-bg-dark":       "#030712",
      "--color-border":        "#374151"
    }
  }
}
```

### CSS Variable Picker trong OptionColor

Option Color có 2 mode:
1. **Color picker** → emit hex/rgb trực tiếp
2. **Variable picker** → emit `var(--color-primary)` (dropdown từ theme variables)

```
┌─────────────────────────────────┐
│ Background Color                │
│ ┌──────────┐ ┌───────────────┐  │
│ │ #2563eb  │ │ ⬦ Var picker ▼│  │
│ └──────────┘ └───────────────┘  │
│   ○ Raw color  ● CSS Variable   │
│   var(--color-primary)          │
└─────────────────────────────────┘
```

### ThemeService

```js
// src/data/ThemeService.js
export class ThemeService {
  constructor(loader) { this.loader = loader }

  async getAll() {
    return ['default', 'dark', 'minimal'].map(id =>
      this.loader.fetch(`/data/themes/${id}.json`)
    )
  }

  async get(id) {
    return this.loader.fetch(`/data/themes/${id}.json`)
  }

  apply(theme) {
    const root = document.documentElement
    for (const group of Object.values(theme.variables)) {
      for (const [name, value] of Object.entries(group)) {
        root.style.setProperty(name, value)
      }
    }
  }

  // Lấy danh sách biến để hiển thị trong Variable Picker
  getColorVars(theme) {
    return Object.entries(theme.variables.colors).map(([name, value]) => ({
      varName: name,
      display: name.replace('--color-', ''),
      value,
      cssValue: `var(${name})`
    }))
  }
}
```

---

## 3. JSON Schemas

### 3.1 Element Definition — `public/data/elements/section.json`

```json
{
  "tag": "section",
  "name": "Section",
  "category": "layout",
  "icon": "square",
  "description": "Full-width section wrapper",
  "nested": true,
  "allow": ["container", "row"],
  "require": [],
  "hidden": false,
  "toolbar": {
    "showOnChildActive": true,
    "showChildrenSelector": false
  },
  "options": [
    {
      "$name": "bgColor",
      "name": "Background Color",
      "type": "color",
      "default": "var(--color-bg)",
      "responsive": false,
      "cssProperty": "background-color"
    },
    {
      "$name": "bgImage",
      "name": "Background Image",
      "type": "image",
      "default": "",
      "responsive": false,
      "cssProperty": "background-image",
      "cssTemplate": "url({value})"
    },
    {
      "$name": "paddingY",
      "name": "Padding Vertical",
      "type": "range",
      "default": 80,
      "responsive": true,
      "config": { "min": 0, "max": 200, "step": 4, "unit": "px" },
      "cssProperty": "padding-top padding-bottom"
    },
    {
      "$name": "minHeight",
      "name": "Min Height",
      "type": "select",
      "default": "",
      "responsive": true,
      "config": {
        "options": [
          { "value": "",      "label": "Auto" },
          { "value": "50vh",  "label": "50% viewport" },
          { "value": "100vh", "label": "100% viewport (fullscreen)" }
        ]
      },
      "cssProperty": "min-height"
    },
    {
      "$name": "textAlign",
      "name": "Text Align",
      "type": "radio",
      "default": "left",
      "responsive": true,
      "config": {
        "options": [
          { "value": "left",   "label": "Left" },
          { "value": "center", "label": "Center" },
          { "value": "right",  "label": "Right" }
        ]
      },
      "cssProperty": "text-align"
    }
  ],
  "presets": [
    {
      "name": "Default",
      "content": {
        "tag": "section",
        "options": { "bgColor": "var(--color-bg)", "paddingY": 80 },
        "children": [
          {
            "tag": "container",
            "options": {},
            "children": []
          }
        ]
      }
    },
    {
      "name": "Dark Section",
      "content": {
        "tag": "section",
        "options": { "bgColor": "var(--color-bg-dark)", "paddingY": 80 },
        "children": [
          { "tag": "container", "options": {}, "children": [] }
        ]
      }
    }
  ]
}
```

### 3.2 Element Definition — `public/data/elements/heading.json`

```json
{
  "tag": "heading",
  "name": "Heading",
  "category": "text",
  "icon": "type",
  "nested": false,
  "allow": [],
  "options": [
    {
      "$name": "level",
      "name": "Level",
      "type": "select",
      "default": "h2",
      "responsive": false,
      "config": {
        "options": [
          { "value": "h1", "label": "H1 — Page Title" },
          { "value": "h2", "label": "H2 — Section Title" },
          { "value": "h3", "label": "H3 — Subsection" },
          { "value": "h4", "label": "H4" }
        ]
      }
    },
    {
      "$name": "color",
      "name": "Color",
      "type": "color",
      "default": "var(--color-text)",
      "responsive": false,
      "cssProperty": "color"
    },
    {
      "$name": "fontSize",
      "name": "Font Size",
      "type": "select",
      "default": "var(--font-size-3xl)",
      "responsive": true,
      "config": {
        "options": [
          { "value": "var(--font-size-xl)",  "label": "XL — 20px" },
          { "value": "var(--font-size-2xl)", "label": "2XL — 24px" },
          { "value": "var(--font-size-3xl)", "label": "3XL — 30px" },
          { "value": "var(--font-size-4xl)", "label": "4XL — 36px" },
          { "value": "var(--font-size-5xl)", "label": "5XL — 48px" }
        ]
      },
      "cssProperty": "font-size"
    },
    {
      "$name": "fontWeight",
      "name": "Weight",
      "type": "select",
      "default": "var(--font-weight-bold)",
      "responsive": false,
      "config": {
        "options": [
          { "value": "var(--font-weight-normal)", "label": "Normal" },
          { "value": "var(--font-weight-medium)", "label": "Medium" },
          { "value": "var(--font-weight-bold)",   "label": "Bold" }
        ]
      },
      "cssProperty": "font-weight"
    },
    {
      "$name": "textAlign",
      "name": "Align",
      "type": "radio",
      "default": "left",
      "responsive": true,
      "config": {
        "options": [
          { "value": "left",   "label": "L" },
          { "value": "center", "label": "C" },
          { "value": "right",  "label": "R" }
        ]
      },
      "cssProperty": "text-align"
    },
    {
      "$name": "marginBottom",
      "name": "Margin Bottom",
      "type": "range",
      "default": 16,
      "responsive": false,
      "config": { "min": 0, "max": 80, "step": 4, "unit": "px" },
      "cssProperty": "margin-bottom"
    }
  ],
  "presets": [
    {
      "name": "Default",
      "content": { "tag": "heading", "content": "Section Title", "options": {} }
    },
    {
      "name": "Hero Title",
      "content": { "tag": "heading", "content": "Welcome to Our Site", "options": { "level": "h1", "fontSize": "var(--font-size-5xl)" } }
    }
  ]
}
```

---

## 4. Sample Page JSON (Test Data)

### `public/data/samples/landing-page.json`

Đây là JSON đầy đủ của một landing page mẫu — dùng để test render, export và undo/redo.

```json
{
  "id": "page-sample-001",
  "name": "Landing Page Demo",
  "slug": "landing-demo",
  "seo": {
    "title": "ui-maker Demo — Landing Page",
    "description": "Built with ui-maker page builder"
  },
  "theme": "default",
  "createdAt": "2026-04-10T00:00:00.000Z",
  "updatedAt": "2026-04-10T00:00:00.000Z",
  "tree": {
    "tag": "_root",
    "$id": "root",
    "options": {},
    "children": [

      // ─── NAVBAR ────────────────────────────────────────────────
      {
        "tag": "navbar",
        "$id": "nav-001",
        "options": {
          "bgColor": "var(--color-bg)",
          "borderBottom": "1px solid var(--color-border)",
          "sticky": true,
          "paddingY": 16
        },
        "children": [
          {
            "tag": "container",
            "$id": "nav-container",
            "options": {},
            "children": [
              {
                "tag": "row",
                "$id": "nav-row",
                "options": { "align": "center", "justify": "space-between" },
                "children": [
                  {
                    "tag": "heading",
                    "$id": "nav-logo",
                    "content": "ui-maker",
                    "options": {
                      "level": "h3",
                      "fontSize": "var(--font-size-xl)",
                      "color": "var(--color-primary)",
                      "marginBottom": 0
                    }
                  },
                  {
                    "tag": "button",
                    "$id": "nav-cta",
                    "content": "Get Started",
                    "options": {
                      "variant": "primary",
                      "size": "sm"
                    }
                  }
                ]
              }
            ]
          }
        ]
      },

      // ─── HERO ──────────────────────────────────────────────────
      {
        "tag": "section",
        "$id": "section-hero",
        "options": {
          "bgColor": "var(--color-bg-dark)",
          "paddingY": 120,
          "textAlign": "center",
          "$responsive": {
            "paddingY": [60, 80, 120]
          }
        },
        "children": [
          {
            "tag": "container",
            "$id": "hero-container",
            "options": {},
            "children": [
              {
                "tag": "heading",
                "$id": "hero-title",
                "content": "Build Stunning Pages, Visually",
                "options": {
                  "level": "h1",
                  "color": "var(--color-text-inverse)",
                  "fontSize": "var(--font-size-5xl)",
                  "textAlign": "center",
                  "marginBottom": 24,
                  "$responsive": {
                    "fontSize": ["var(--font-size-3xl)", "var(--font-size-4xl)", "var(--font-size-5xl)"]
                  }
                }
              },
              {
                "tag": "paragraph",
                "$id": "hero-sub",
                "content": "Drag, drop, and export pixel-perfect HTML. No code required. Runs entirely in your browser.",
                "options": {
                  "color": "var(--color-text-muted)",
                  "fontSize": "var(--font-size-lg)",
                  "textAlign": "center",
                  "maxWidth": "600px",
                  "marginX": "auto",
                  "marginBottom": 40
                }
              },
              {
                "tag": "row",
                "$id": "hero-buttons",
                "options": {
                  "justify": "center",
                  "gap": 16,
                  "flexDirection": "row",
                  "$responsive": {
                    "flexDirection": ["column", "row", "row"]
                  }
                },
                "children": [
                  {
                    "tag": "button",
                    "$id": "hero-btn-primary",
                    "content": "Start Building",
                    "options": { "variant": "primary", "size": "lg" }
                  },
                  {
                    "tag": "button",
                    "$id": "hero-btn-ghost",
                    "content": "View Demo",
                    "options": { "variant": "outline", "size": "lg" }
                  }
                ]
              }
            ]
          }
        ]
      },

      // ─── FEATURES ──────────────────────────────────────────────
      {
        "tag": "section",
        "$id": "section-features",
        "options": {
          "bgColor": "var(--color-bg-alt)",
          "paddingY": 80
        },
        "children": [
          {
            "tag": "container",
            "$id": "features-container",
            "options": {},
            "children": [
              {
                "tag": "heading",
                "$id": "features-title",
                "content": "Why ui-maker?",
                "options": {
                  "level": "h2",
                  "textAlign": "center",
                  "marginBottom": 48
                }
              },
              {
                "tag": "row",
                "$id": "features-grid",
                "options": {
                  "gap": 24,
                  "justify": "stretch",
                  "$responsive": {
                    "flexDirection": ["column", "row", "row"]
                  }
                },
                "children": [
                  {
                    "tag": "card",
                    "$id": "feat-1",
                    "options": { "shadow": "var(--shadow-md)", "radius": "var(--radius-lg)", "bgColor": "var(--color-bg)", "padding": "var(--card-padding)" },
                    "children": [
                      {
                        "tag": "heading",
                        "$id": "feat-1-title",
                        "content": "🎨 Visual Editing",
                        "options": { "level": "h3", "fontSize": "var(--font-size-lg)", "marginBottom": 8 }
                      },
                      {
                        "tag": "paragraph",
                        "$id": "feat-1-desc",
                        "content": "Click to select, drag to reorder. What you see is what you get.",
                        "options": { "color": "var(--color-text-muted)", "fontSize": "var(--font-size-sm)" }
                      }
                    ]
                  },
                  {
                    "tag": "card",
                    "$id": "feat-2",
                    "options": { "shadow": "var(--shadow-md)", "radius": "var(--radius-lg)", "bgColor": "var(--color-bg)", "padding": "var(--card-padding)" },
                    "children": [
                      {
                        "tag": "heading",
                        "$id": "feat-2-title",
                        "content": "📱 Responsive",
                        "options": { "level": "h3", "fontSize": "var(--font-size-lg)", "marginBottom": 8 }
                      },
                      {
                        "tag": "paragraph",
                        "$id": "feat-2-desc",
                        "content": "Preview in Desktop, Tablet, and Mobile. Style per breakpoint.",
                        "options": { "color": "var(--color-text-muted)", "fontSize": "var(--font-size-sm)" }
                      }
                    ]
                  },
                  {
                    "tag": "card",
                    "$id": "feat-3",
                    "options": { "shadow": "var(--shadow-md)", "radius": "var(--radius-lg)", "bgColor": "var(--color-bg)", "padding": "var(--card-padding)" },
                    "children": [
                      {
                        "tag": "heading",
                        "$id": "feat-3-title",
                        "content": "⚡ Export HTML",
                        "options": { "level": "h3", "fontSize": "var(--font-size-lg)", "marginBottom": 8 }
                      },
                      {
                        "tag": "paragraph",
                        "$id": "feat-3-desc",
                        "content": "Self-contained HTML with inline styles. Drop anywhere, works everywhere.",
                        "options": { "color": "var(--color-text-muted)", "fontSize": "var(--font-size-sm)" }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },

      // ─── CTA ───────────────────────────────────────────────────
      {
        "tag": "section",
        "$id": "section-cta",
        "options": {
          "bgColor": "var(--color-primary)",
          "paddingY": 80,
          "textAlign": "center"
        },
        "children": [
          {
            "tag": "container",
            "$id": "cta-container",
            "options": {},
            "children": [
              {
                "tag": "heading",
                "$id": "cta-title",
                "content": "Ready to build?",
                "options": {
                  "level": "h2",
                  "color": "var(--color-text-inverse)",
                  "textAlign": "center",
                  "marginBottom": 24
                }
              },
              {
                "tag": "button",
                "$id": "cta-btn",
                "content": "Open ui-maker →",
                "options": {
                  "variant": "inverse",
                  "size": "lg"
                }
              }
            ]
          }
        ]
      },

      // ─── FOOTER ────────────────────────────────────────────────
      {
        "tag": "section",
        "$id": "section-footer",
        "options": {
          "bgColor": "var(--color-bg-dark)",
          "paddingY": 40
        },
        "children": [
          {
            "tag": "container",
            "$id": "footer-container",
            "options": {},
            "children": [
              {
                "tag": "paragraph",
                "$id": "footer-copy",
                "content": "© 2026 ui-maker. Built with ❤️ and React.",
                "options": {
                  "color": "var(--color-text-muted)",
                  "textAlign": "center",
                  "fontSize": "var(--font-size-sm)"
                }
              }
            ]
          }
        ]
      }

    ]
  }
}
```

---

## 5. Class Diagrams (Final)

### 5.1 Core — ElementNode

```
┌──────────────────────────────────────────────────────────────┐
│                       ElementNode                            │
├──────────────────────────────────────────────────────────────┤
│ + $id: string                     (nanoid, e.g. "sec-a3f2")  │
│ + tag: string                     ("section", "heading"...)  │
│ + content: string                 (text node content)        │
│ + $parentId: string | null                                   │
│ + children: ElementNode[]         (nếu isParent)             │
│ + optionValues: Record<k,any>     (raw values)               │
│ + responsiveValues: Record<k,any[]> (per breakpoint array)   │
│ + options: Proxy                  (reactive get/set)         │
│ + states: { active, dragging, selected, open }               │
│ - _def: ElementDef                (định nghĩa từ JSON)       │
│ - _updateFns: { option, structure }  (store bump functions)  │
├──────────────────────────────────────────────────────────────┤
│ Constructor:                                                  │
│   new ElementNode(plainObj, parentNode?, registry)           │
│   → setup Proxy cho this.options                             │
│   → khởi tạo responsiveValues từ $responsive nếu có         │
│   → đăng ký vào registry                                     │
│   → đệ quy tạo children                                      │
├──────────────────────────────────────────────────────────────┤
│ Tree Operations:                                             │
│ + addChild(data|ElementNode, index, record?): ElementNode    │
│ + removeChild(index, record?): void                          │
│ + remove(record?): void                                      │
│ + duplicate(afterIndex?): ElementNode                        │
│ + detach(): ElementNode                                      │
│ + copy(transform?): PlainObject   (serialize)                │
│ + allows(node|tag): boolean                                  │
├──────────────────────────────────────────────────────────────┤
│ Render Notification:                                         │
│ + applyOption(): void   → bumpOptionVersion($id)             │
│ + applyStructure(): void → bumpStructureVersion($id)         │
├──────────────────────────────────────────────────────────────┤
│ Getters:                                                     │
│ get parent, index, depth, ancestors, descendants             │
│ get siblings, nextSibling, previousSibling                   │
│ get isRoot, isParent, isEmpty, allowed                       │
└──────────────────────────────────────────────────────────────┘

Proxy setter flow (options.color = "var(--color-primary)"):
  1. Snapshot old value (nếu chưa snapshot trong debounce window)
  2. Apply: optionValues[name] = newValue
  3. Nếu responsive: responsiveValues[name][currentBP] = newValue
  4. startTransition(() => this.applyOption())   ← re-render ngay
  5. debounce 250ms → historyManager.push(UPDATE_OPTION action)
```

### 5.2 Store — AppStore (Zustand)

```
┌──────────────────────────────────────────────────────────────────┐
│                       AppStore (Zustand)                         │
├─────────────────────────┬────────────────────────────────────────┤
│  STATE                  │  ACTIONS                               │
├─────────────────────────┼────────────────────────────────────────┤
│  — Selection —          │                                        │
│  selectedId: str|null   │  selectElement(id|null)                │
│  outlinedId: str|null   │  outlineElement(id|null)               │
│  frozen: boolean        │  freeze(bool)                          │
│                         │                                        │
│  — Fine-grained —       │                                        │
│  optionVersions:        │  bumpOptionVersion(id)                 │
│    Record<id, number>   │  bumpStructureVersion(id)              │
│  structureVersions:     │                                        │
│    Record<id, number>   │                                        │
│                         │                                        │
│  — Viewport —           │                                        │
│  viewportMode: str      │  setViewportMode('desktop'|'tablet'…)  │
│  showLeftPanel: bool    │  toggleLeftPanel()                     │
│  showRightPanel: bool   │  toggleRightPanel()                    │
│  activeLeftTab: str     │  setActiveLeftTab(tab)                 │
│                         │                                        │
│  — History —            │                                        │
│  history: Action[]      │  pushHistory(action)                   │
│  histCursor: number     │  undo()                                │
│                         │  redo()                                │
│                         │                                        │
│  — Pages —              │                                        │
│  pages: PageMeta[]      │  createPage(name)                      │
│  currentPageId: str     │  switchPage(id)                        │
│  isDirty: boolean       │  savePage()                            │
│                         │  deletePage(id)                        │
│                         │                                        │
│  — Data —               │                                        │
│  elementDefs: Map       │  loadAllDefs()                         │
│  categories: Category[] │  updateElementDef(tag, patch)          │
│  activeTheme: Theme     │  setTheme(id)                          │
│                         │                                        │
│  — Responsive —         │                                        │
│  breakpoint: 0|1|2      │  setBreakpoint(0|1|2)                  │
└─────────────────────────┴────────────────────────────────────────┘

Middleware stack: immer + subscribeWithSelector
```

### 5.3 Export Pipeline

```
HtmlExporter.export(pageData)
      │
      ▼
ElementRegistry.restore(pageData.tree)   ← xây cây từ plain JSON
      │
      ▼  DFS traverse
for each node:
  ├── controller = ControllerRegistry.get(node.tag)
  ├── def = ElementDefService.getCached(node.tag)
  ├── StyleResolver.resolveNode(node, def.options)
  │     ├── → inlineStyle: "background-color:var(--color-bg);padding-top:80px"
  │     └── → mediaStyles: { 0: "padding-top:60px", 1: "padding-top:80px" }
  ├── Collect mediaStyles → this.mediaCollector[bp].push(...)
  └── controller.buildHtml(node, inlineStyle, childrenHtml)
          └── → <section data-uid="sec-001" style="...">...</section>
      │
      ▼
buildMediaBlock()
  → @media(max-width:768px){ [data-uid="..."]{...} ... }
  → @media(max-width:360px){ [data-uid="..."]{...} ... }
      │
      ▼
ThemeService.buildRootVars(activeTheme)
  → :root { --color-primary:#2563eb; ... }
      │
      ▼
ExportTemplate.wrap(bodyHtml, meta, mediaBlock, rootVars)
  → full self-contained HTML file
```

---

## 6. Phase Plan — Demo First

> **Nguyên tắc:** Mỗi phase kết thúc bằng một thứ CÓ THỂ THẤY hoặc CÓ THỂ TEST trong browser.

---

### Phase 0 — Bootstrap + Static Render (Ngày 1)
**Goal:** Chạy app, render `landing-page.json` trực tiếp lên màn hình. Không có interaction.

**Deliverable:** Page mẫu hiện ra đúng layout trong browser.

**Files tạo:**
```
package.json              (React 19, Vite, Zustand, dnd-kit, nanoid)
vite.config.js
index.html
src/main.jsx
src/App.jsx               (chỉ render <StaticPreview />)
src/components/canvas/StaticPreview.jsx   ← render JSON → HTML thuần
src/controllers/BaseController.js
src/controllers/SectionController.js
src/controllers/LayoutController.js      (row, column, container)
src/controllers/TextController.js        (heading, paragraph)
src/controllers/ButtonController.js
src/controllers/registry.js
public/data/themes/default.json
public/data/samples/landing-page.json
```

**Test data:** Load `landing-page.json`, pass vào `StaticPreview`, expect:
- Navbar hiện đúng
- Hero section với background dark
- 3 cards features
- CTA section màu primary
- Footer

**StaticPreview.jsx — minimal implementation:**
```jsx
// src/components/canvas/StaticPreview.jsx
import { useEffect, useState } from 'react'
import { ControllerRegistry } from '../../controllers/registry.js'

function renderNode(node) {
  const controller = ControllerRegistry.get(node.tag)
  if (!controller) return null

  const style = controller.resolveBaseStyle(node.optionValues)
  const children = node.children?.map(child => renderNode(child)) ?? null
  const Tag = controller.getHtmlTag(node)

  return (
    <Tag key={node.$id} style={style}>
      {children ?? (node.content || null)}
    </Tag>
  )
}

export function StaticPreview() {
  const [pageData, setPageData] = useState(null)

  useEffect(() => {
    fetch('/data/samples/landing-page.json')
      .then(r => r.json())
      .then(setPageData)
  }, [])

  if (!pageData) return <div>Loading...</div>

  return <div>{pageData.tree.children.map(renderNode)}</div>
}
```

**Acceptance test Phase 0:**
- [ ] `npm run dev` → không lỗi
- [ ] Page mẫu render trong browser
- [ ] CSS variables resolve đúng màu sắc
- [ ] Layout responsive khi resize trình duyệt

---

### Phase 1 — Core Classes + ElementRegistry (Ngày 2-3)
**Goal:** Xây cây `ElementNode` từ JSON, truy vấn tree, undo/redo qua console.

**Deliverable:** Mở DevTools Console, chạy lệnh test cây hoạt động.

**Files tạo:**
```
src/utils/idGenerator.js
src/utils/deepClone.js
src/core/EventBus.js
src/core/ResponsiveManager.js
src/core/ElementRegistry.js
src/core/ElementNode.js          ← phức tạp nhất, ưu tiên test kỹ
src/core/HistoryManager.js
src/data/DataLoader.js
src/data/ElementDefService.js    ← load + cache def JSONs
```

**Test script (chạy trong DevTools console):**
```js
// Paste vào console sau khi app chạy
const { ElementRegistry } = await import('/src/core/ElementRegistry.js')
const { ElementNode } = await import('/src/core/ElementNode.js')
const { HistoryManager } = await import('/src/core/HistoryManager.js')

const reg = new ElementRegistry()
const history = new HistoryManager(reg)

// Load page sample
const page = await fetch('/data/samples/landing-page.json').then(r => r.json())
reg.restore(page.tree)

// Test tree traversal
console.log('Root children:', reg.getRoot().children.length)  // expect 5
console.log('Hero section:', reg.get('section-hero').tag)     // "section"
console.log('Hero depth:', reg.get('section-hero').depth)     // 1
console.log('Hero title depth:', reg.get('hero-title').depth) // 3

// Test option change + undo
const heroTitle = reg.get('hero-title')
console.log('Before:', heroTitle.optionValues.color)           // "var(--color-text-inverse)"
heroTitle.options.color = '#ff0000'
console.log('After:', heroTitle.optionValues.color)            // "#ff0000"
history.undo()
console.log('Undo:', heroTitle.optionValues.color)             // "var(--color-text-inverse)"
history.redo()
console.log('Redo:', heroTitle.optionValues.color)             // "#ff0000"

// Test addChild + undo
const featGrid = reg.get('features-grid')
const newCard = featGrid.addChild({ tag: 'card', options: {} }, 3, true)
console.log('Children after add:', featGrid.children.length)   // 4
history.undo()
console.log('Children after undo:', featGrid.children.length)  // 3

console.log('✓ All Phase 1 tests passed')
```

**Acceptance test Phase 1:**
- [ ] `reg.restore()` → `reg.snapshot()` → output bằng input gốc (roundtrip)
- [ ] Undo/redo hoạt động cho tất cả 6 action types
- [ ] `allows()` đúng: column không thể chứa section
- [ ] `reg.get(id)` O(1), không traverse
- [ ] `descendants` trả đúng số lượng

---

### Phase 2 — AppStore + Canvas Interactive (Ngày 4-5)
**Goal:** Click vào element → highlight. Canvas render từ `ElementRegistry` thật (không phải static).

**Deliverable:** Click bất kỳ element nào → border highlight xuất hiện. DevTools show đúng selectedId.

**Files tạo:**
```
src/store/appStore.js
src/hooks/useApp.js
src/components/canvas/Canvas.jsx
src/components/canvas/ViewportFrame.jsx
src/components/canvas/ElementRenderer.jsx   ← subscribe structureVersions
src/components/canvas/ElementWrapper.jsx    ← subscribe optionVersions + selection
src/components/header/Header.jsx            ← viewport toggle buttons
```

**ElementWrapper.jsx — core subscription pattern:**
```jsx
import { memo, useCallback } from 'react'
import { useAppStore } from '../../store/appStore.js'
import { ElementRegistry } from '../../core/ElementRegistry.js'
import { ControllerRegistry } from '../../controllers/registry.js'

export const ElementWrapper = memo(function ElementWrapper({ nodeId }) {
  // ✓ Fine-grained: chỉ re-render khi options của NODE NÀY thay đổi
  const optionVersion = useAppStore(s => s.optionVersions[nodeId] ?? 0)

  // ✓ Fine-grained: chỉ re-render khi SELECTION thay đổi liên quan đến node này
  const isSelected = useAppStore(s => s.selectedId === nodeId)
  const isOutlined = useAppStore(s => s.outlinedId === nodeId)

  const node = ElementRegistry.get(nodeId)
  const controller = ControllerRegistry.get(node.tag)
  const style = {
    ...controller.resolveBaseStyle(node.optionValues),
    outline: isSelected
      ? '2px solid #2563eb'
      : isOutlined ? '1px dashed #93c5fd' : 'none',
    outlineOffset: '2px',
    position: 'relative',
  }

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    useAppStore.getState().selectElement(nodeId)
  }, [nodeId])

  const handleMouseEnter = useCallback(() => {
    useAppStore.getState().outlineElement(nodeId)
  }, [nodeId])

  const handleMouseLeave = useCallback(() => {
    useAppStore.getState().outlineElement(null)
  }, [])

  if (!node.isParent) {
    return (
      <div
        style={style}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        dangerouslySetInnerHTML={{ __html: controller.buildInnerHtml(node) }}
      />
    )
  }

  return (
    <div
      style={style}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ElementRenderer nodeId={nodeId} />
    </div>
  )
})

export const ElementRenderer = memo(function ElementRenderer({ nodeId }) {
  // ✓ Fine-grained: chỉ re-render khi CHILDREN LIST của node này thay đổi
  const structVersion = useAppStore(s => s.structureVersions[nodeId] ?? 0)
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

**Acceptance test Phase 2:**
- [ ] Canvas render đúng page sample
- [ ] Click element → selectedId cập nhật trong Zustand DevTools
- [ ] Hover → outline dashed xuất hiện
- [ ] Click container → không chọn child (stopPropagation)
- [ ] Header viewport toggle → canvas đổi width
- [ ] Re-render profiler: chỉ 1-2 component re-render khi click/hover

---

### Phase 3 — PropsPanel + Option Fields (Ngày 6-7)
**Goal:** Chọn element → sidebar phải hiện options. Thay đổi option → canvas cập nhật ngay.

**Deliverable:** Click hero title → đổi được màu, font size, text align trong PropsPanel → canvas update realtime.

**Files tạo:**
```
src/data/ThemeService.js
src/components/props/PropsPanel.jsx
src/components/props/ElementBreadcrumb.jsx
src/components/options/OptionField.jsx     ← router
src/components/options/OptionText.jsx
src/components/options/OptionSelect.jsx
src/components/options/OptionColor.jsx     ← color picker + CSS var picker
src/components/options/OptionRange.jsx
src/components/options/OptionRadio.jsx
src/components/options/OptionCheckbox.jsx
src/components/options/OptionGroup.jsx
src/components/options/OptionResponsive.jsx
src/hooks/useResponsive.js
```

**OptionColor.jsx — CSS variable integration:**
```jsx
import { useState } from 'react'
import { useAppStore } from '../../store/appStore.js'

export function OptionColor({ value, onChange, label }) {
  const [mode, setMode] = useState(
    value?.startsWith('var(') ? 'var' : 'raw'
  )
  const theme = useAppStore(s => s.activeTheme)
  const colorVars = getColorVars(theme)  // [{ varName, display, value, cssValue }]

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
        {label}
      </label>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        <button
          onClick={() => setMode('raw')}
          style={{ fontSize: 11, padding: '2px 8px', background: mode === 'raw' ? '#2563eb' : '#eee', color: mode === 'raw' ? '#fff' : '#333', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >Color</button>
        <button
          onClick={() => setMode('var')}
          style={{ fontSize: 11, padding: '2px 8px', background: mode === 'var' ? '#2563eb' : '#eee', color: mode === 'var' ? '#fff' : '#333', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >Theme</button>
      </div>

      {mode === 'raw' ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="color"
            value={value?.startsWith('#') ? value : '#000000'}
            onChange={e => onChange(e.target.value)}
            style={{ width: 36, height: 28, border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', padding: 2 }}
          />
          <input
            type="text"
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            style={{ flex: 1, fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4 }}
            placeholder="#000000 or rgba(...)"
          />
        </div>
      ) : (
        <select
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4 }}
        >
          <option value="">— Select theme color —</option>
          {colorVars.map(v => (
            <option key={v.varName} value={v.cssValue}>
              {v.display} ({v.value})
            </option>
          ))}
        </select>
      )}

      {/* Preview */}
      <div style={{
        marginTop: 4, height: 4, borderRadius: 2,
        background: value || 'transparent',
        border: '1px solid #eee'
      }} />
    </div>
  )
}
```

**OptionResponsive.jsx — breakpoint tabs:**
```jsx
import { useAppStore } from '../../store/appStore.js'
import { OptionField } from './OptionField.jsx'
import { ResponsiveManager } from '../../core/ResponsiveManager.js'

const BP_LABELS = ['📱', '📲', '🖥'];
const BP_NAMES  = ['Mobile', 'Tablet', 'Desktop'];

export function OptionResponsive({ optDef, node }) {
  const bp = useAppStore(s => s.breakpoint)
  const setBp = useAppStore(s => s.setBreakpoint)

  const responsiveArr = node.responsiveValues[optDef.$name] ?? []
  const resolvedValue = ResponsiveManager.resolve(responsiveArr, bp)
    ?? node.optionValues[optDef.$name]

  function handleChange(newVal) {
    if (!node.options.$responsive[optDef.$name]) {
      node.options.$responsive[optDef.$name] = [null, null, null]
    }
    node.options[optDef.$name] = newVal  // setter proxy xử lý breakpoint
  }

  return (
    <div>
      {/* Breakpoint tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
        {[0, 1, 2].map(bpIndex => (
          <button
            key={bpIndex}
            onClick={() => setBp(bpIndex)}
            style={{
              fontSize: 12, padding: '2px 6px',
              background: bp === bpIndex ? '#2563eb' : '#f0f0f0',
              color: bp === bpIndex ? '#fff' : '#555',
              border: 'none', borderRadius: 3, cursor: 'pointer',
              opacity: responsiveArr[bpIndex] != null ? 1 : 0.5
            }}
            title={BP_NAMES[bpIndex]}
          >
            {BP_LABELS[bpIndex]}
          </button>
        ))}
      </div>

      <OptionField
        def={optDef}
        value={resolvedValue}
        onChange={handleChange}
      />
    </div>
  )
}
```

**Acceptance test Phase 3:**
- [ ] Click heading → PropsPanel hiện đúng options từ `heading.json`
- [ ] Đổi color bằng color picker → canvas cập nhật ngay (không cần save)
- [ ] Đổi color bằng CSS var picker → `var(--color-primary)` được set, canvas resolve đúng màu
- [ ] Đổi fontSize ở Mobile breakpoint → chỉ ảnh hưởng responsive array, không override desktop
- [ ] Undo (Ctrl+Z) → option hoàn về giá trị cũ

---

### Phase 4 — Elements Panel + Add Element (Ngày 8-9)
**Goal:** Drag element từ panel trái vào canvas. Element mới xuất hiện đúng vị trí.

**Deliverable:** Kéo "Heading" từ panel → thả vào section trên canvas → heading mới xuất hiện.

**Files tạo:**
```
src/components/panels/ElementsPanel.jsx
src/components/canvas/DropZone.jsx
src/components/canvas/DragLayer.jsx
src/components/canvas/SelectionToolbar.jsx  (duplicate, delete, move up/down)
```

**Drag-drop rule (D1 cứng):**
```js
// onDragEnd handler trong Canvas.jsx
function handleDragEnd({ active, over }) {
  if (!over) return

  const { type, nodeId, tag } = active.data.current

  if (type === 'NEW_ELEMENT') {
    // Kéo từ ElementsPanel → tạo node mới
    const targetNode = ElementRegistry.get(over.id)
    if (!targetNode.allows(tag)) return
    const def = ElementDefService.getCached(tag)
    const newNode = targetNode.addChild(def.presets[0].content, undefined, true)
    useAppStore.getState().selectElement(newNode.$id)

  } else if (type === 'EXISTING_ELEMENT') {
    // Kéo reorder trong canvas — TREE ORDER = DOM ORDER
    const activeNode = ElementRegistry.get(nodeId)
    const overNode = ElementRegistry.get(over.id)
    if (activeNode.$id === over.id) return

    const targetParent = overNode.parent
    if (!targetParent.allows(activeNode)) return

    const toIndex = overNode.index
    activeNode.remove(false)           // xóa không record
    targetParent.addChild(activeNode, toIndex, true)  // thêm record MOVE_ELEMENT
  }
}
```

**Acceptance test Phase 4:**
- [ ] Kéo element mới từ panel → thả vào container → element xuất hiện
- [ ] Element mới tự được select
- [ ] Drag reorder trong canvas → thứ tự thay đổi
- [ ] Không thể thả column vào heading (allows() block)
- [ ] Undo sau khi add → element biến mất
- [ ] Undo sau khi reorder → về vị trí cũ
- [ ] Drag hoạt động ở cả 3 viewport modes (desktop/tablet/mobile)

---

### Phase 5 — Undo/Redo + Keyboard Shortcuts (Ngày 10)
**Goal:** Ctrl+Z/Y hoạt động. History panel hiện danh sách actions.

**Deliverable:** Thực hiện 5 thao tác → Ctrl+Z 5 lần → về đúng trạng thái ban đầu.

**Files tạo:**
```
src/hooks/useHistory.js         ← keyboard listener + canUndo/canRedo
src/components/panels/LayersPanel.jsx
```

**useHistory.js:**
```js
import { useEffect } from 'react'
import { useAppStore } from '../store/appStore.js'

export function useKeyboardShortcuts() {
  const undo = useAppStore(s => s.undo)
  const redo = useAppStore(s => s.redo)

  useEffect(() => {
    function handler(e) {
      const isMac = navigator.platform.includes('Mac')
      const ctrl = isMac ? e.metaKey : e.ctrlKey

      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = document.activeElement
        if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') return
        const { selectedId } = useAppStore.getState()
        if (selectedId) ElementRegistry.get(selectedId)?.remove(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [undo, redo])
}

export function useCanUndo() {
  return useAppStore(s => s.histCursor >= 0)
}

export function useCanRedo() {
  return useAppStore(s => s.histCursor < s.history.length - 1)
}
```

**Acceptance test Phase 5:**
- [ ] Ctrl+Z undo add element
- [ ] Ctrl+Z undo option change
- [ ] Ctrl+Z undo move element
- [ ] Ctrl+Shift+Z / Ctrl+Y redo
- [ ] Delete key xóa selected element
- [ ] Undo sau delete → element phục hồi đúng vị trí
- [ ] canUndo/canRedo reflect đúng trong Header buttons

---

### Phase 6 — Export HTML (Ngày 11-12)
**Goal:** Click Export → download file HTML. Mở file HTML trong browser → page hiện đúng, responsive.

**Deliverable:** `landing-demo.html` mở trong browser hoàn toàn không cần server.

**Files tạo:**
```
src/export/StyleResolver.js
src/export/HtmlExporter.js
src/export/ExportTemplate.js
```

**StyleResolver — xử lý CSS variables + responsive:**
```js
// src/export/StyleResolver.js

const OPTION_TO_CSS = {
  bgColor:       v => ({ 'background-color': v }),
  color:         v => ({ 'color': v }),
  fontSize:      v => ({ 'font-size': numToPx(v) }),
  fontWeight:    v => ({ 'font-weight': v }),
  textAlign:     v => ({ 'text-align': v }),
  paddingY:      v => ({ 'padding-top': numToPx(v), 'padding-bottom': numToPx(v) }),
  paddingX:      v => ({ 'padding-left': numToPx(v), 'padding-right': numToPx(v) }),
  marginBottom:  v => ({ 'margin-bottom': numToPx(v) }),
  maxWidth:      v => ({ 'max-width': v, 'margin-left': 'auto', 'margin-right': 'auto' }),
  minHeight:     v => ({ 'min-height': v }),
  gap:           v => ({ 'gap': numToPx(v) }),
  flexDirection: v => ({ 'display': 'flex', 'flex-direction': v }),
  justify:       v => ({ 'justify-content': v }),
  align:         v => ({ 'align-items': v }),
  borderRadius:  v => ({ 'border-radius': numToPx(v) }),
  shadow:        v => ({ 'box-shadow': v }),
  padding:       v => ({ 'padding': v }),
  border:        v => ({ 'border': v }),
  opacity:       v => ({ 'opacity': v }),
  display:       v => ({ 'display': v }),
}

function numToPx(v) {
  return typeof v === 'number' ? `${v}px` : v
}

export class StyleResolver {
  resolveNode(node, optionDefs) {
    const baseProps = {}
    const mediaProps = { 0: {}, 1: {} }

    for (const def of optionDefs) {
      const desktopVal = node.optionValues[def.$name]
      if (!desktopVal && desktopVal !== 0) continue

      const cssRules = OPTION_TO_CSS[def.$name]?.(desktopVal) ?? {}
      Object.assign(baseProps, cssRules)

      if (!def.responsive) continue

      const respArr = node.responsiveValues?.[def.$name] ?? []
      for (const bp of [1, 0]) {
        const bpVal = respArr[bp]
        if (bpVal == null) continue
        if (bpVal === desktopVal) continue
        if (bp === 0 && bpVal === (respArr[1] ?? desktopVal)) continue

        const bpRules = OPTION_TO_CSS[def.$name]?.(bpVal) ?? {}
        Object.assign(mediaProps[bp], bpRules)
      }
    }

    return {
      inlineStyle: this.toCssString(baseProps),
      mediaStyles: mediaProps,
    }
  }

  toCssString(props) {
    return Object.entries(props)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${k}:${v}`)
      .join(';')
  }
}
```

**ExportTemplate — inject CSS variables:**
```js
// src/export/ExportTemplate.js

export const ExportTemplate = {
  wrap(bodyHtml, meta, mediaBlock, theme) {
    const rootVars = buildRootVars(theme)
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(meta.title ?? 'Untitled')}</title>
  ${meta.description ? `<meta name="description" content="${esc(meta.description)}">` : ''}
  <style>
    :root{${rootVars}}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:var(--font-base,system-ui);line-height:var(--line-height-base,1.6);color:var(--color-text,#111)}
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

function buildRootVars(theme) {
  return Object.values(theme.variables)
    .flatMap(group => Object.entries(group))
    .map(([name, value]) => `${name}:${value}`)
    .join(';')
}

function esc(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  )
}
```

**Acceptance test Phase 6:**
- [ ] Export → download `landing-demo.html`
- [ ] Mở HTML trong browser → layout hiện đúng
- [ ] Resize browser → responsive breakpoints hoạt động
- [ ] HTML không có external dependencies (tự chứa hoàn toàn)
- [ ] CSS variables resolve đúng trong `:root {}`
- [ ] Inspect element → `data-uid` attribute hiện
- [ ] File size < 50KB (không gzip) cho landing page mẫu

---

### Phase 7 — Pages + Theme + DataManager (Ngày 13-15)
**Goal:** CRUD pages, đổi theme, sửa element definition JSON.

**Deliverable:** Tạo page mới, lưu, đổi sang dark theme, export page với màu dark.

**Files tạo:**
```
src/data/PageStorageService.js
src/data/PresetService.js
src/components/panels/PagesPanel.jsx
src/components/panels/ThemePanel.jsx        ← edit CSS vars real-time
src/components/panels/DataManagerPanel.jsx  ← xem/sửa JSON files
src/hooks/usePageStorage.js
src/hooks/useTheme.js
```

**ThemePanel — live editing:**
```jsx
export function ThemePanel() {
  const theme = useAppStore(s => s.activeTheme)
  const [localVars, setLocalVars] = useState({ ...theme.variables.colors })

  function handleVarChange(varName, newValue) {
    setLocalVars(prev => ({ ...prev, [varName]: newValue }))
    // Apply ngay lập tức vào document (live preview)
    document.documentElement.style.setProperty(varName, newValue)
  }

  function handleSave() {
    // Lưu theme override vào LocalStorage
    ThemeService.saveOverride(theme.id, localVars)
  }

  return (
    <div>
      <h3>Colors</h3>
      {Object.entries(localVars).map(([varName, value]) => (
        <div key={varName} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <input type="color" value={value} onChange={e => handleVarChange(varName, e.target.value)} />
          <span style={{ fontSize: 12, flex: 1 }}>{varName.replace('--color-', '')}</span>
          <code style={{ fontSize: 10, color: '#888' }}>{value}</code>
        </div>
      ))}
      <button onClick={handleSave}>Save Theme</button>
    </div>
  )
}
```

**DataManagerPanel — JSON file CRUD:**
```jsx
export function DataManagerPanel() {
  const [defs, setDefs] = useState([])
  const [editing, setEditing] = useState(null)   // { tag, jsonStr }
  const [error, setError] = useState(null)

  useEffect(() => {
    ElementDefService.getAll().then(setDefs)
  }, [])

  function handleEdit(def) {
    setEditing({ tag: def.tag, jsonStr: JSON.stringify(def, null, 2) })
    setError(null)
  }

  async function handleSave() {
    try {
      const parsed = JSON.parse(editing.jsonStr)
      if (!parsed.tag || !parsed.options) throw new Error('Missing required fields: tag, options')
      await ElementDefService.update(parsed.tag, parsed)
      setEditing(null)
      setDefs(await ElementDefService.getAll())
    } catch (e) {
      setError(e.message)
    }
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      const text = await file.text()
      try {
        const def = JSON.parse(text)
        await ElementDefService.create(def.tag, def)
        setDefs(await ElementDefService.getAll())
      } catch (err) {
        alert('Invalid JSON: ' + err.message)
      }
    }
    input.click()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3>Element Definitions</h3>
        <button onClick={handleImport}>+ Import JSON</button>
      </div>
      {defs.map(def => (
        <div key={def.tag} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
          <span>{def.name} <code style={{ fontSize: 10, color: '#888' }}>{def.tag}</code></span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => handleEdit(def)}>Edit</button>
            <button onClick={() => { const blob = new Blob([JSON.stringify(def, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${def.tag}.json`; a.click() }}>⬇</button>
          </div>
        </div>
      ))}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <h3>Edit: {editing.tag}</h3>
            <textarea
              value={editing.jsonStr}
              onChange={e => { setEditing(p => ({ ...p, jsonStr: e.target.value })); setError(null) }}
              style={{ flex: 1, fontFamily: 'monospace', fontSize: 12, border: '1px solid #ddd', borderRadius: 4, padding: 8, marginTop: 12, minHeight: 300, resize: 'vertical' }}
            />
            {error && <p style={{ color: 'red', fontSize: 12, marginTop: 4 }}>Error: {error}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditing(null)}>Cancel</button>
              <button onClick={handleSave} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 4 }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Acceptance test Phase 7:**
- [ ] Tạo page mới → lưu → refresh app → page vẫn còn
- [ ] Switch page → canvas đổi content
- [ ] Đổi primary color trong ThemePanel → canvas update ngay (live)
- [ ] Export → HTML dùng màu mới
- [ ] Edit element JSON → save → ElementsPanel cập nhật
- [ ] Import JSON file → element mới xuất hiện trong panel
- [ ] Export element JSON → file download đúng

---

## 7. Acceptance Test Tổng hợp (End-to-End)

```
1. Mở app → page mẫu load (landing page)
2. Click vào hero title → PropsPanel hiện options
3. Đổi color sang var(--color-accent) → canvas cập nhật
4. Đổi font size ở Mobile → chỉ mobile đổi
5. Kéo card mới vào features grid
6. Ctrl+Z → card biến mất
7. Ctrl+Y → card quay lại
8. Drag card sang vị trí khác trong grid
9. Switch sang Tablet view → layout responsive đúng
10. Click Export → download HTML
11. Mở HTML trong browser → 
    - Responsive đúng khi resize
    - CSS variables resolve đúng
    - Không file ngoài
12. Đổi sang dark theme → export lại → HTML có màu dark
```

---

## 8. Setup Commands

```bash
# Tạo project
npm create vite@latest ui-maker -- --template react-swc
cd ui-maker

# Install dependencies
npm install zustand immer @dnd-kit/core @dnd-kit/sortable nanoid

# Dev server
npm run dev

# Build test
npm run build && npm run preview
```

---

## 9. Không làm trong MVP

| Feature | Lý do |
|---------|-------|
| Responsive DOM reorder | D1: tree order = DOM order |
| TinyMCE / rich text editor | Quá phức tạp, text content dùng input |
| Image upload | Dùng URL trực tiếp |
| Multi-user / cloud sync | LocalStorage only |
| Custom CSS input | Thay bằng CSS variable system |
| Undo history > 100 steps | Limit = 100 |
| Animation / transition builder | Post-MVP |
| Template marketplace | Post-MVP |
