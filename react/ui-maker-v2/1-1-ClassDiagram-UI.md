┌─────────────────────────────────────────────────────────────────────────────┐
│                              AppStore (Zustand)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ + optionVersions: Record<id, number>                                        │
│ + structureVersions: Record<id, number>                                     │
│ + selectedId: string | null                                                 │
│ + viewportMode: 'mobile'|'tablet'|'desktop'                                 │
│ + breakpoint: 0|1|2                                                         │
│ + pages: PageData[]                                                         │
│ + currentPageId: string                                                     │
│ + isDragging: boolean                                                       │
│ + dragType: 'move'|'section'|null                                           │
│ + ...                                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ + bumpOptionVersion(id)                                                     │
│ + bumpStructureVersion(id)                                                  │
│ + selectElement(id)                                                         │
│ + setViewportMode(mode)                                                     │
│ + undo() / redo()                                                           │
│ + switchPage(id)                                                            │
│ + ...                                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
           ▲                              ▲
           │                              │
           │ uses                         │ uses
           │                              │
┌──────────┴──────────┐      ┌───────────┴───────────┐
│   ElementWrapper    │      │   ElementRenderer     │
├─────────────────────┤      ├───────────────────────┤
│ - nodeId: string    │      │ - nodeId: string      │
├─────────────────────┤      ├───────────────────────┤
│ + render()          │      │ + render()            │
└─────────────────────┘      └───────────────────────┘
           │                              │
           │ subscribes                   │ subscribes
           │ optionVersions[nodeId]       │ structureVersions[nodeId]
           │                              │
           ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ElementNode (Core)                                 │
│                          (đã mô tả trước đó)                                 │
└─────────────────────────────────────────────────────────────────────────────┘