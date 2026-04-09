/**
 * pageStore.js — manages multiple pages in localStorage.
 *
 * Each page is stored as:
 * {
 *   id:        string,   // uuid-like
 *   name:      string,   // display name, editable
 *   slug:      string,   // auto-derived from name, used as filename hint
 *   createdAt: string,   // ISO
 *   updatedAt: string,   // ISO
 *   tree:      object,   // ElementNode plain tree (_root → children)
 * }
 *
 * localStorage key: "ui-maker-v2-pages"
 *
 * This module is a plain singleton (NOT a Zustand store) so it can be
 * called from App.jsx initialization without hook constraints.
 * The Zustand appStore reads/writes via the actions below.
 */

import { generateId } from '../utils/idGenerator.js'

const STORAGE_KEY = 'ui-maker-v2-pages'

/** Default empty page tree */
export function makeEmptyTree() {
  return {
    tag: '_root',
    $id: 'root',
    options: {},
    children: [],
  }
}

/** Build a new page object */
export function makePage(name = 'New Page', tree = null) {
  const now = new Date().toISOString()
  return {
    id:        generateId('page'),
    name:      name.trim() || 'Untitled',
    slug:      slugify(name),
    createdAt: now,
    updatedAt: now,
    tree:      tree ?? makeEmptyTree(),
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'page'
}

// ─── Persistence ──────────────────────────────────────────────────────────────

/** Load all pages from localStorage. Returns [] if nothing saved. */
export function loadPages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Save all pages to localStorage. */
export function savePages(pages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages))
  } catch (e) {
    console.warn('pageStore: failed to save to localStorage', e)
  }
}

/** Save a single page's updated tree back into the pages array and persist. */
export function savePageTree(pages, pageId, tree) {
  const now = new Date().toISOString()
  const updated = pages.map(p =>
    p.id === pageId ? { ...p, tree, updatedAt: now } : p
  )
  savePages(updated)
  return updated
}

/** Add a new page, persist, return updated array. */
export function addPage(pages, name, tree = null) {
  const page = makePage(name, tree)
  const updated = [...pages, page]
  savePages(updated)
  return { updated, page }
}

/** Delete a page, persist, return updated array. */
export function deletePage(pages, pageId) {
  const updated = pages.filter(p => p.id !== pageId)
  savePages(updated)
  return updated
}

/** Rename a page, persist, return updated array. */
export function renamePage(pages, pageId, newName) {
  const now = new Date().toISOString()
  const updated = pages.map(p =>
    p.id === pageId
      ? { ...p, name: newName.trim() || 'Untitled', slug: slugify(newName), updatedAt: now }
      : p
  )
  savePages(updated)
  return updated
}

/** Duplicate a page (deep clone tree, new id), persist, return { updated, page }. */
export function duplicatePage(pages, pageId) {
  const src = pages.find(p => p.id === pageId)
  if (!src) return { updated: pages, page: null }
  const cloned = makePage(`${src.name} (copy)`, JSON.parse(JSON.stringify(src.tree)))
  const srcIdx = pages.indexOf(src)
  const updated = [
    ...pages.slice(0, srcIdx + 1),
    cloned,
    ...pages.slice(srcIdx + 1),
  ]
  savePages(updated)
  return { updated, page: cloned }
}
