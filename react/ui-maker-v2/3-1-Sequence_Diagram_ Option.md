User                OptionField          ElementNode (Proxy)       AppStore           ElementWrapper
 │                      │                        │                     │                     │
 │  change value        │                        │                     │                     │
 │─────────────────────>│                        │                     │                     │
 │                      │  node.options.padding = "30px"             │                     │
 │                      │───────────────────────>│                     │                     │
 │                      │                        │                     │                     │
 │                      │                        │ 1. Update internal  │                     │
 │                      │                        │    _optionValues     │                     │
 │                      │                        │ 2. Debounced history │                     │
 │                      │                        │    record scheduled   │                     │
 │                      │                        │                     │                     │
 │                      │                        │  apply('option')     │                     │
 │                      │                        │────────────────────>│                     │
 │                      │                        │                     │ bumpOptionVersion() │
 │                      │                        │                     │ (optionVersions[id] │
 │                      │                        │                     │  = old + 1)         │
 │                      │                        │                     │                     │
 │                      │                        │                     │  (Zustand notify)   │
 │                      │                        │                     │────────────────────>│
 │                      │                        │                     │                     │  selector: optionVersions[id]
 │                      │                        │                     │                     │  → re‑render
 │                      │                        │                     │                     │
 │                      │                        │                     │                     │  Render with new style
 │                      │                        │                     │                     │