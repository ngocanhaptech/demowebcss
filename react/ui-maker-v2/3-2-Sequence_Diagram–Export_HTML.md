User                Header              HtmlExporter           ControllerRegistry      DOM
 │                    │                      │                         │                 │
 │  Click "Xuất HTML" │                      │                         │                 │
 │───────────────────>│                      │                         │                 │
 │                    │  exportHtml(root)    │                         │                 │
 │                    │─────────────────────>│                         │                 │
 │                    │                      │  readThemeVarsFromDOM() │                 │
 │                    │                      │────────────────────────────────────────>│
 │                    │                      │<────────────────────────────────────────│
 │                    │                      │                         │                 │
 │                    │                      │  walkNode (đệ quy)       │                 │
 │                    │                      │────────────────────────>│                 │
 │                    │                      │                         │ getHtmlTag()    │
 │                    │                      │                         │ resolveBaseStyle│
 │                    │                      │<────────────────────────│                 │
 │                    │                      │                         │                 │
 │                    │                      │  resolveVarString()      │                 │
 │                    │                      │  (thay var(--x) = giá trị)│                 │
 │                    │                      │                         │                 │
 │                    │                      │  buildResponsiveCss()    │                 │
 │                    │                      │  (so sánh diff breakpoint)│                 │
 │                    │                      │                         │                 │
 │                    │                      │  Tạo HTML string         │                 │
 │                    │<─────────────────────│                         │                 │
 │                    │                      │                         │                 │
 │  download file     │                      │                         │                 │
 │<───────────────────│                      │                         │                 │