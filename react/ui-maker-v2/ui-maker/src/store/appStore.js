import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { ElementRegistry } from '../core/ElementRegistry.js'
import { HistoryManager } from '../core/HistoryManager.js'
import {
  loadPages, savePages, savePageTree,
  addPage, deletePage, renamePage, duplicatePage,
  makePage, makeEmptyTree,
} from './pageStore.js'

/**
 * Module-level singletons shared across the entire app.
 * Created once, never recreated (hot-reload safe in Vite via module HMR boundary).
 */
export const registry = new ElementRegistry()
export const historyManager = new HistoryManager(registry)
registry.setHistory(historyManager)

/**
 * AppStore — central Zustand store for the editor.
 *
 * Slices:
 *  - Selection:    selectedId, outlinedId
 *  - Fine-grained: optionVersions, structureVersions  (D4: prevent global re-renders)
 *  - Viewport:     viewportMode, showLeftPanel, showRightPanel, activeLeftTab
 *  - History:      canUndo, canRedo  (mirrors HistoryManager state)
 *  - Page:         currentPageId, isDirty
 *  - Breakpoint:   breakpoint (0=mobile, 1=tablet, 2=desktop)
 *
 * Middleware stack: subscribeWithSelector → immer
 */
export const useAppStore = create(
  subscribeWithSelector(
    immer((set, get) => ({
      // ─── Selection ──────────────────────────────────────────────────────────
      selectedId: null,
      outlinedId: null,
      frozen: false,

      // ─── Fine-grained render versions ───────────────────────────────────────
      /** @type {Record<string, number>} increments when a node's options change */
      optionVersions: {},
      /** @type {Record<string, number>} increments when a node's children change */
      structureVersions: {},

      // ─── Viewport ───────────────────────────────────────────────────────────
      /** @type {'mobile'|'tablet'|'desktop'} */
      viewportMode: 'desktop',
      showLeftPanel: true,
      showRightPanel: true,
      activeLeftTab: 'elements',

      // ─── History mirrors ────────────────────────────────────────────────────
      canUndo: false,
      canRedo: false,

      // ─── Pages ───────────────────────────────────────────────────────────────
      /** @type {Array<{id,name,slug,createdAt,updatedAt,tree}>} */
      pages: [],
      currentPageId: null,
      isDirty: false,

      // ─── Tree version ────────────────────────────────────────────────────────
      /** Increments whenever the entire tree is replaced (openPage / restore). */
      treeVersion: 0,

      // ─── Breakpoint ─────────────────────────────────────────────────────────
      /** 0=mobile, 1=tablet, 2=desktop */
      breakpoint: 2,

      /** ID of the active theme — ThemeService reads CSS vars live from :root. */
      activeTheme: 'default',

      // ─── Drag & Drop ───────────────────────────────────────────────────────────
      /** True while a drag is in progress. */
      isDragging: false,
      /** 'move' for layer reorder drags, null/undefined for palette drops. */
      dragType: null,
      /** Tag being dragged — used to highlight valid drop targets. */
      draggedTag: null,

      // ═══════════════════════════════════════════════════════════════════════
      // ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      selectElement(id) {
        set(state => { state.selectedId = id })
      },

      outlineElement(id) {
        set(state => { state.outlinedId = id })
      },

      freeze(val) {
        set(state => { state.frozen = val })
      },

      /** Called by ElementNode.applyOption() — triggers re-render of that node only. */
      bumpOptionVersion(id) {
        set(state => {
          state.optionVersions[id] = (state.optionVersions[id] ?? 0) + 1
        })
      },

      /** Called by ElementNode.applyStructure() — triggers re-render of node's children list. */
      bumpStructureVersion(id) {
        set(state => {
          state.structureVersions[id] = (state.structureVersions[id] ?? 0) + 1
        })
      },

      setViewportMode(mode) {
        const bpMap = { mobile: 0, tablet: 1, desktop: 2 }
        set(state => {
          state.viewportMode = mode
          state.breakpoint = bpMap[mode] ?? 2
        })
      },

      /** Called by DragDropContext on drag start/end — shows/hides canvas DropZones. */
      setDragging(data) {
        set(state => {
          state.isDragging = !!data
          state.dragType = data?.type ?? null
          state.draggedTag = data?.tag ?? null
        })
      },

      /** Directly set breakpoint index without changing viewportMode label. */
      setBreakpoint(bp) {
        const modeMap = ['mobile', 'tablet', 'desktop']
        set(state => {
          state.breakpoint = bp
          state.viewportMode = modeMap[bp] ?? 'desktop'
        })
      },

      toggleLeftPanel() {
        set(state => { state.showLeftPanel = !state.showLeftPanel })
      },

      toggleRightPanel() {
        set(state => { state.showRightPanel = !state.showRightPanel })
      },

      setActiveLeftTab(tab) {
        set(state => { state.activeLeftTab = tab })
      },

      /**
       * Delete the currently selected element (or a given id).
       * Calls node.remove(true) which records history + unregisters descendants.
       * Selects the parent node afterward (or null for root-level elements).
       */
      deleteElement(id) {
        const targetId = id ?? get().selectedId
        if (!targetId) return
        const node = registry.get(targetId)
        if (!node || !node._parent) return  // cannot delete root
        const parentId = node._parent.$id
        node.remove(true)
        set(state => {
          // Select parent unless it's _root (invisible wrapper)
          state.selectedId = (parentId && parentId !== 'root') ? parentId : null
          state.outlinedId = null
        })
        get().syncHistoryState()
      },

      /** Sync canUndo/canRedo from HistoryManager into the store. */
      syncHistoryState() {
        set(state => {
          state.canUndo = historyManager.canUndo
          state.canRedo = historyManager.canRedo
        })
      },

      undo() {
        historyManager.undo()
        get().syncHistoryState()
      },

      redo() {
        historyManager.redo()
        get().syncHistoryState()
      },

      markDirty() {
        set(state => { state.isDirty = true })
      },

      markClean() {
        set(state => { state.isDirty = false })
      },

      /**
       * Call after registry.restore() to force all Canvas / ElementRenderer
       * components to re-mount with the new tree.
       * Also resets selection and history state.
       */
      reloadTree() {
        set(state => {
          state.treeVersion  += 1
          state.selectedId    = null
          state.outlinedId    = null
          state.optionVersions   = {}
          state.structureVersions = {}
          state.canUndo = false
          state.canRedo = false
          state.isDirty = false
        })
      },

      // ═══════════════════════════════════════════════════════════════════════
      // PAGE MANAGEMENT ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * Initialize pages from localStorage (called by App on mount).
       * If localStorage is empty, creates a default "Home" page from the
       * landing-page.json tree that was already restored into registry.
       * @param {object|null} fallbackTree - tree from landing-page.json fetch
       */
      initPages(fallbackTree) {
        let pages = loadPages()
        let currentPageId

        if (pages.length === 0) {
          // First run — seed with one page using the sample tree
          const home = makePage('Home', fallbackTree ?? makeEmptyTree())
          pages = [home]
          savePages(pages)
          currentPageId = home.id
        } else {
          // Restore last active page (first page as fallback)
          currentPageId = get().currentPageId ?? pages[0].id
          // Validate the stored id still exists
          if (!pages.find(p => p.id === currentPageId)) {
            currentPageId = pages[0].id
          }
          // Load that page's tree into the registry
          const page = pages.find(p => p.id === currentPageId)
          if (page) registry.restore(page.tree)
        }

        set(state => {
          state.pages = pages
          state.currentPageId = currentPageId
          state.treeVersion += 1
        })
      },

      /**
       * Switch to a different page.
       * Saves the current page's tree first, then loads the target page.
       */
      switchPage(pageId) {
        const { pages, currentPageId } = get()
        if (pageId === currentPageId) return

        // Persist current page tree before leaving
        const currentTree = registry.snapshot()
        let updatedPages = currentTree
          ? savePageTree(pages, currentPageId, currentTree)
          : pages

        // Load target page
        const target = updatedPages.find(p => p.id === pageId)
        if (!target) return

        registry.restore(target.tree)
        historyManager.clear?.()  // clear history stack for new page

        set(state => {
          state.pages = updatedPages
          state.currentPageId = pageId
          state.treeVersion += 1
          state.selectedId = null
          state.outlinedId = null
          state.optionVersions = {}
          state.structureVersions = {}
          state.canUndo = false
          state.canRedo = false
          state.isDirty = false
        })
      },

      /** Add a new empty page and switch to it. */
      addNewPage(name = 'New Page') {
        const { pages } = get()
        const { updated, page } = addPage(pages, name)
        registry.restore(page.tree)
        historyManager.clear?.()
        set(state => {
          state.pages = updated
          state.currentPageId = page.id
          state.treeVersion += 1
          state.selectedId = null
          state.outlinedId = null
          state.optionVersions = {}
          state.structureVersions = {}
          state.canUndo = false
          state.canRedo = false
          state.isDirty = false
        })
      },

      /** Delete a page. Cannot delete the last page. */
      deleteCurrentPage(pageId) {
        const { pages, currentPageId } = get()
        if (pages.length <= 1) return  // must have at least one page
        const targetId = pageId ?? currentPageId
        const updated = deletePage(pages, targetId)

        // If deleting active page, switch to the first remaining
        let newCurrentId = currentPageId
        if (targetId === currentPageId) {
          newCurrentId = updated[0].id
          const newPage = updated[0]
          registry.restore(newPage.tree)
          historyManager.clear?.()
        }

        set(state => {
          state.pages = updated
          state.currentPageId = newCurrentId
          if (targetId === currentPageId) {
            state.treeVersion += 1
            state.selectedId = null
            state.outlinedId = null
            state.optionVersions = {}
            state.structureVersions = {}
            state.canUndo = false
            state.canRedo = false
          }
        })
      },

      /** Rename a page by id. */
      renamePage(pageId, newName) {
        const { pages } = get()
        const updated = renamePage(pages, pageId, newName)
        set(state => { state.pages = updated })
      },

      /** Duplicate a page. Inserts clone after original, does NOT switch to it. */
      duplicatePage(pageId) {
        const { pages } = get()
        const { updated } = duplicatePage(pages, pageId)
        set(state => { state.pages = updated })
      },

      /**
       * Persist the current canvas tree into the pages array + localStorage.
       * Called automatically before switching pages, and on manual Save.
       */
      saveCurrentPage() {
        const { pages, currentPageId } = get()
        if (!currentPageId) return
        const tree = registry.snapshot()
        if (!tree) return
        const updated = savePageTree(pages, currentPageId, tree)
        set(state => {
          state.pages = updated
          state.isDirty = false
        })
      },
    }))
  )
)

// Wire registry bump functions → store actions (D4: fine-grained subscriptions)
const { bumpOptionVersion, bumpStructureVersion } = useAppStore.getState()
registry.setUpdateFns({ bumpOptionVersion, bumpStructureVersion })
