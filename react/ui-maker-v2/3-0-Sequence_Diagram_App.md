User        App.jsx           AppStore            ElementRegistry        ElementNode
 │            │                  │                      │                     │
 │  load page │                  │                      │                     │
 │───────────>│                  │                      │                     │
 │            │  initPages(tree) │                      │                     │
 │            │─────────────────>│                      │                     │
 │            │                  │  restore(plainTree)  │                     │
 │            │                  │─────────────────────>│                     │
 │            │                  │                      │  new ElementNode()  │
 │            │                  │                      │────────────────────>│
 │            │                  │                      │                     │───┐
 │            │                  │                      │                     │   │ register self
 │            │                  │                      │<────────────────────│<──┘
 │            │                  │                      │                     │
 │            │                  │                      │  (recursive)        │
 │            │                  │                      │────────────────────>│ children
 │            │                  │                      │                     │
 │            │                  │                      │  _root = rootNode   │
 │            │                  │<─────────────────────│                     │
 │            │                  │                      │                     │
 │            │                  │  setUpdateFns, setHistory                  │
 │            │                  │─────────────────────>│                     │
 │            │                  │                      │                     │
 │            │                  │  history = new HistoryManager(registry)    │
 │            │                  │───────────────────────────────────────────>│
 │            │                  │                      │                     │
 │            │  setReady(true)  │                      │                     │
 │            │<─────────────────│                      │                     │
 │            │                  │                      │                     │
 │  render EditorLayout          │                      │                     │
 │<───────────│                  │                      │                     │