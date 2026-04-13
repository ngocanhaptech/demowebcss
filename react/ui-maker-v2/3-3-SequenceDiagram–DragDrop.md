User                ElementsPalette       DragDropContext        Canvas           AppStore
 │                       │                      │                   │                 │
 │  drag start           │                      │                   │                 │
 │──────────────────────>│                      │                   │                 │
 │                       │  setDragging(true,   │                   │                 │
 │                       │  type:'section')     │                   │                 │
 │                       │─────────────────────>│                   │                 │
 │                       │                      │                   │                 │
 │                       │                      │  render DropZones │                 │
 │                       │                      │──────────────────>│                 │
 │                       │                      │                   │                 │
 │  drop onto DropZone   │                      │                   │                 │
 │──────────────────────────────────────────────┼──────────────────>│                 │
 │                       │                      │                   │  handleDragEnd  │
 │                       │                      │                   │  (addChild)     │
 │                       │                      │                   │────────────────>│
 │                       │                      │                   │                 │ bumpStructure
 │                       │                      │                   │                 │ + syncHistory
 │                       │                      │                   │<────────────────│
 │                       │                      │                   │                 │
 │                       │                      │  setDragging(false)│                 │
 │                       │                      │<──────────────────│                 │