┌─────────────────────────────────────────────────────────────────────────────┐
│                              <<singleton>>                                  │
│                          ElementRegistry                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ - _map: Map<string, ElementNode>                                            │
│ - _root: ElementNode                                                        │
│ - _updateFns: { bumpOptionVersion, bumpStructureVersion }                   │
│ - _history: HistoryManager                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ + register(node) / unregister(node)                                         │
│ + get(id): ElementNode                                                      │
│ + snapshot(): PlainObject                                                   │
│ + restore(plainTree): void                                                  │
│ + setUpdateFns(fns) / setHistory(history)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ owns
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ElementNode                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ + $id, tag, content                                                         │
│ + children: ElementNode[] | undefined                                       │
│ + optionValues, responsiveValues                                            │
│ + options: Proxy<Record<string,any>>                                        │
│ - _registry: ElementRegistry                                                │
│ - _parent: ElementNode | null                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ + addChild(data, index?, record?)                                           │
│ + removeChild / remove / detach                                             │
│ + allows(nodeOrTag): boolean                                                │
│ + applyOption() / applyStructure()                                          │
│ + getOptionForBreakpoint(key, bp) / setOptionForBreakpoint(...)             │
│ + toPlain(): object                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
           ▲                              ▲
           │                              │
           │ uses                         │ uses
           │                              │
┌──────────┴──────────┐      ┌───────────┴───────────┐
│   HistoryManager    │      │   AppStore (Zustand)  │
├─────────────────────┤      ├───────────────────────┤
│ - _stack: Action[]  │      │ + optionVersions      │
│ - _cursor: number   │      │ + structureVersions   │
├─────────────────────┤      │ + selectedId          │
│ + push(action)      │      │ + viewportMode        │
│ + undo() / redo()   │      │ + pages, currentPageId│
│ - _applyUndo/Redo   │      │ + isDragging, dragType│
└─────────────────────┘      ├───────────────────────┤
                             │ + bumpOptionVersion()  │
                             │ + bumpStructureVersion │
                             │ + undo/redo            │
                             │ + switchPage()         │
                             └───────────────────────┘