import { vi, beforeEach } from 'vitest'

/**
 * Global test setup — runs before every test file.
 * - Resets localStorage (jsdom provides a working implementation)
 * - Clears all mocks
 */
beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})
