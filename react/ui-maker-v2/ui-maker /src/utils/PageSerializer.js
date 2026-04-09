/**
 * PageSerializer — save/load the page tree as a JSON file.
 *
 * Save: registry.snapshot() → JSON string → download .json file
 * Open: file picker → parse JSON → registry.restore(tree)
 *
 * File format (matches existing landing-page.json schema):
 * {
 *   "version": "2",
 *   "savedAt": "<ISO timestamp>",
 *   "tree": { ... ElementNode plain tree ... }
 * }
 */

/**
 * Download the current page tree as a JSON file.
 * @param {import('../core/ElementRegistry.js').ElementRegistry} registry
 * @param {string} [filename]
 */
export function savePage(registry, filename = 'page.json') {
  const tree = registry.snapshot()
  if (!tree) {
    console.warn('PageSerializer.savePage: registry has no tree to save')
    return
  }

  const payload = {
    version: '2',
    savedAt: new Date().toISOString(),
    tree,
  }

  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Open a JSON file from disk and restore the page tree.
 *
 * Returns a Promise that resolves with the parsed payload when
 * the user selects a valid file, or rejects with an Error on failure.
 *
 * @param {import('../core/ElementRegistry.js').ElementRegistry} registry
 * @returns {Promise<{ version: string, savedAt: string, tree: object }>}
 */
export function openPage(registry) {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'

    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const payload = JSON.parse(e.target.result)

          // Support both the full payload format and a bare tree object
          const tree = payload.tree ?? payload

          if (!tree || !tree.tag) {
            throw new Error('Invalid page file: missing root tree node')
          }

          registry.restore(tree)
          resolve(payload)
        } catch (err) {
          reject(new Error(`Failed to parse page file: ${err.message}`))
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })

    // Cancelled without selecting a file
    input.addEventListener('cancel', () => {
      reject(new Error('File picker cancelled'))
    })

    // Append briefly to satisfy some browser security constraints
    document.body.appendChild(input)
    input.click()
    // Remove after a short delay (click is async)
    setTimeout(() => document.body.removeChild(input), 500)
  })
}
