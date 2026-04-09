import React, { useEffect, useState, useCallback } from 'react';
import pageDataDefault from './data/page-1.json';
import { SectionsPanel } from './components/SectionsPanel.jsx';
import { Canvas } from './components/Canvas.jsx';
import { PropsPanel } from './components/PropsPanel.jsx';
import { PagesPanel } from './components/PagesPanel.jsx';
import { PageSettingsModal } from './components/PageSettingsModal.jsx';
import { loadPageFromStorage, savePageToStorage, deletePageFromStorage, getPagesIndex } from './utils/storage.js';
import { downloadHtmlFile } from './utils/htmlExporter.js';
import { createSectionFromRegistry } from './constants/sectionRegistry.js';

/* ── constants ───────────────────────────────────────────────── */

const VIEWPORT_MODES = [
  { key: 'desktop', icon: '🖥', label: '1280', width: null },
  { key: 'tablet',  icon: '⬜', label: '768',  width: 768  },
  { key: 'mobile',  icon: '📱', label: '360',  width: 360  },
];

/* ── helpers ─────────────────────────────────────────────────── */

function generateUid() {
  return '_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function generatePageId() {
  return 'page-' + Date.now().toString(36);
}

function ensureSectionUids(page) {
  if (!page || !Array.isArray(page.sections)) return page;
  return {
    ...page,
    sections: page.sections.map((s) =>
      s._uid ? s : { ...s, _uid: generateUid() }
    )
  };
}

function createNewPage(title) {
  return ensureSectionUids({
    id: generatePageId(),
    version: '1.0.0',
    title: title || 'Trang mới',
    language: 'vi',
    seo: {
      description: '',
      keywords: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      canonicalUrl: ''
    },
    sections: []
  });
}

function loadAllPages() {
  const index = getPagesIndex();
  if (index.length === 0) {
    const def = ensureSectionUids(pageDataDefault);
    savePageToStorage(def);
    return [def];
  }
  const pages = index
    .map((id) => loadPageFromStorage(id))
    .filter(Boolean)
    .map(ensureSectionUids);
  if (pages.length === 0) {
    const def = ensureSectionUids(pageDataDefault);
    savePageToStorage(def);
    return [def];
  }
  return pages;
}

/* ── shared button styles (computed inline) ─────────────────── */

function headerBtn(active) {
  return {
    padding: '4px 10px',
    borderRadius: '4px',
    border: '1px solid',
    borderColor: active ? '#e8b87d' : '#333',
    background: active ? '#e8b87d22' : 'transparent',
    color: active ? '#e8b87d' : '#999',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: active ? 700 : 400,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all .15s',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };
}

/* ── App ─────────────────────────────────────────────────────── */

export default function App() {
  const [pages, setPages]               = useState([]);
  const [activePageId, setActivePageId] = useState(null);
  const [selectedUid, setSelectedUid]   = useState(null);
  const [savedBadge, setSavedBadge]     = useState(false);
  const [previewMode, setPreviewMode]   = useState(false);
  const [settingsPageId, setSettingsPageId] = useState(null);

  /* ── responsive / sidebar ── */
  const [viewportMode, setViewportMode]     = useState('desktop');
  const [showLeftPanel, setShowLeftPanel]   = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  useEffect(() => {
    const loaded = loadAllPages();
    setPages(loaded);
    setActivePageId(loaded[0].id);
  }, []);

  const activePage = pages.find((p) => p.id === activePageId) || null;

  function getSelectedSection() {
    if (!activePage || !selectedUid) return null;
    return activePage.sections.find((s) => s._uid === selectedUid) || null;
  }

  const updateActivePage = useCallback((newPage) => {
    setPages((prev) => prev.map((p) => (p.id === newPage.id ? newPage : p)));
    savePageToStorage(newPage);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1500);
  }, []);

  const handleAddSection = useCallback(
    (sectionName) => {
      if (!activePage) return;
      const newSection = { ...createSectionFromRegistry(sectionName), _uid: generateUid() };
      updateActivePage({ ...activePage, sections: [...activePage.sections, newSection] });
      setSelectedUid(newSection._uid);
    },
    [activePage, updateActivePage]
  );

  const handleDropNewSection = useCallback(
    (sectionName, atIndex) => {
      if (!activePage) return;
      const newSection = { ...createSectionFromRegistry(sectionName), _uid: generateUid() };
      const sections = [...activePage.sections];
      sections.splice(atIndex, 0, newSection);
      updateActivePage({ ...activePage, sections });
      setSelectedUid(newSection._uid);
    },
    [activePage, updateActivePage]
  );

  const handleReorder = useCallback(
    (fromIndex, toIndex) => {
      if (!activePage) return;
      const sections = [...activePage.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      updateActivePage({ ...activePage, sections });
    },
    [activePage, updateActivePage]
  );

  const handleSelectSection = useCallback((uid) => {
    setSelectedUid((prev) => (prev === uid ? null : uid));
  }, []);

  const handleUpdateSection = useCallback(
    (updatedSection) => {
      if (!activePage) return;
      const sections = activePage.sections.map((s) =>
        s._uid === updatedSection._uid ? updatedSection : s
      );
      updateActivePage({ ...activePage, sections });
    },
    [activePage, updateActivePage]
  );

  const handleDeleteSection = useCallback(
    (uid) => {
      if (!activePage) return;
      updateActivePage({ ...activePage, sections: activePage.sections.filter((s) => s._uid !== uid) });
      setSelectedUid(null);
    },
    [activePage, updateActivePage]
  );

  const handleExportHtml = useCallback(() => {
    if (!activePage) return;
    downloadHtmlFile(activePage);
  }, [activePage]);

  const handleAddPage = useCallback(() => {
    const title = window.prompt('Tên page mới:', 'Trang mới');
    if (title === null) return;
    const newPage = createNewPage(title.trim() || 'Trang mới');
    setPages((prev) => [...prev, newPage]);
    savePageToStorage(newPage);
    setActivePageId(newPage.id);
    setSelectedUid(null);
  }, []);

  const handleDeletePage = useCallback(
    (pageId) => {
      deletePageFromStorage(pageId);
      setPages((prev) => {
        const next = prev.filter((p) => p.id !== pageId);
        if (activePageId === pageId && next.length > 0) setActivePageId(next[0].id);
        return next;
      });
      setSelectedUid(null);
    },
    [activePageId]
  );

  const handleSelectPage = useCallback((pageId) => {
    setActivePageId(pageId);
    setSelectedUid(null);
    setPreviewMode(false);
  }, []);

  const handleSavePageSettings = useCallback(
    (updatedPage) => {
      const oldId = settingsPageId;
      setPages((prev) => prev.map((p) => (p.id === oldId ? updatedPage : p)));
      if (oldId !== updatedPage.id) {
        deletePageFromStorage(oldId);
        if (activePageId === oldId) setActivePageId(updatedPage.id);
      }
      savePageToStorage(updatedPage);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 1500);
      setSettingsPageId(null);
    },
    [settingsPageId, activePageId]
  );

  const handleDeselect = useCallback(() => setSelectedUid(null), []);

  if (pages.length === 0 || !activePage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '14px', color: '#888', fontFamily: 'system-ui, sans-serif' }}>
        Đang tải...
      </div>
    );
  }

  const settingsPage = settingsPageId ? pages.find((p) => p.id === settingsPageId) || null : null;

  /* ── viewport width info ── */
  const vpInfo = VIEWPORT_MODES.find((v) => v.key === viewportMode);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: '#fff',
        overflow: 'hidden'
      }}
    >
      {/* ══════════════ HEADER ══════════════ */}
      <header
        style={{
          height: 46,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          background: '#1a1a2e',
          color: '#fff',
          borderBottom: '1px solid #2d2d4e',
          flexShrink: 0,
          zIndex: 100,
          gap: 8,
        }}
      >
        {/* ── LEFT: logo + sidebar toggle ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.02em', color: '#e8b87d' }}>
            ui-maker
          </span>
          <span style={{ fontSize: '10px', color: '#666', background: '#2a2a3e', padding: '2px 7px', borderRadius: '4px' }}>
            MVP v2
          </span>
          {savedBadge && (
            <span style={{ fontSize: '11px', color: '#4ade80' }}>✓ Đã lưu</span>
          )}

          <div style={{ width: 1, height: 20, background: '#2d2d4e', margin: '0 2px' }} />

          {/* Left panel toggle */}
          <button
            type="button"
            onClick={() => setShowLeftPanel((v) => !v)}
            title={showLeftPanel ? 'Ẩn panels trái' : 'Hiện panels trái'}
            style={headerBtn(showLeftPanel)}
          >
            <span style={{ fontSize: 13 }}>{showLeftPanel ? '◀' : '▶'}</span>
            <span>Panels</span>
          </button>
        </div>

        {/* ── CENTER: Viewport toggles ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #2d2d4e', borderRadius: 5, overflow: 'hidden', flexShrink: 0 }}>
          {VIEWPORT_MODES.map(({ key, icon, label, width }, i) => {
            const isActive = viewportMode === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setViewportMode(key)}
                title={`${icon} ${width ? width + 'px' : 'Full width'}`}
                style={{
                  padding: '5px 11px',
                  border: 'none',
                  borderRight: i < VIEWPORT_MODES.length - 1 ? '1px solid #2d2d4e' : 'none',
                  background: isActive ? '#e8b87d' : 'transparent',
                  color: isActive ? '#1a1a2e' : '#888',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'background .12s, color .12s',
                  userSelect: 'none',
                }}
              >
                <span>{icon}</span>
                <span style={{ fontFamily: 'ui-monospace, monospace' }}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* ── RIGHT: props toggle + page settings + preview + export ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Right panel toggle */}
          <button
            type="button"
            onClick={() => setShowRightPanel((v) => !v)}
            title={showRightPanel ? 'Ẩn panel props' : 'Hiện panel props'}
            style={headerBtn(showRightPanel)}
          >
            <span>Props</span>
            <span style={{ fontSize: 13 }}>{showRightPanel ? '▶' : '◀'}</span>
          </button>

          <div style={{ width: 1, height: 20, background: '#2d2d4e' }} />

          <button
            type="button"
            onClick={() => setSettingsPageId(activePage.id)}
            title="Cài đặt page: title, SEO..."
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid #444',
              background: 'transparent',
              color: '#bbb',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>⚙</span>
            <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activePage.title}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setPreviewMode((v) => !v); setSelectedUid(null); }}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid',
              borderColor: previewMode ? '#e8b87d' : '#444',
              background: previewMode ? '#e8b87d' : 'transparent',
              color: previewMode ? '#1a1a2e' : '#ccc',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {previewMode ? '◀ Editor' : '👁 Preview'}
          </button>

          <button
            type="button"
            onClick={handleExportHtml}
            style={{
              padding: '4px 12px',
              borderRadius: '4px',
              border: 'none',
              background: '#16a34a',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ↓ Export HTML
          </button>
        </div>
      </header>

      {/* ══════════════ BODY ══════════════ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Left sidebars (Pages + Sections panels) */}
        {showLeftPanel && !previewMode && (
          <PagesPanel
            pages={pages}
            activePageId={activePageId}
            onSelectPage={handleSelectPage}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
            onOpenSettings={(id) => setSettingsPageId(id)}
          />
        )}

        {previewMode ? (
          /* ── PREVIEW MODE ── */
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              background: '#e0e0e0',
              padding: '16px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            {/* Viewport indicator */}
            <div style={{ textAlign: 'center', padding: '8px 0 12px', userSelect: 'none' }}>
              {VIEWPORT_MODES.map(({ key, icon, label, width }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setViewportMode(key)}
                  style={{
                    padding: '3px 10px',
                    border: '1px solid',
                    borderColor: viewportMode === key ? '#e8b87d' : '#bbb',
                    borderRadius: 4,
                    background: viewportMode === key ? '#e8b87d22' : 'transparent',
                    color: viewportMode === key ? '#e8b87d' : '#888',
                    fontSize: 11,
                    fontWeight: viewportMode === key ? 700 : 400,
                    cursor: 'pointer',
                    margin: '0 3px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>{icon}</span>
                  <span style={{ fontFamily: 'ui-monospace, monospace' }}>{width ? width + 'px' : 'Full'}</span>
                </button>
              ))}
            </div>

            <ViewportFrame viewportMode={viewportMode}>
              <PreviewRenderer page={activePage} />
            </ViewportFrame>
          </div>
        ) : (
          <>
            {showLeftPanel && (
              <SectionsPanel onAddSection={handleAddSection} />
            )}

            <Canvas
              page={activePage}
              selectedUid={selectedUid}
              viewportMode={viewportMode}
              onSelectSection={handleSelectSection}
              onReorder={handleReorder}
              onDropNewSection={handleDropNewSection}
              onDeselect={handleDeselect}
            />

            {showRightPanel && (
              <PropsPanel
                selectedSection={getSelectedSection()}
                onUpdateSection={handleUpdateSection}
                onDeleteSection={handleDeleteSection}
              />
            )}
          </>
        )}
      </div>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer
        style={{
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          background: '#1a1a2e',
          color: '#444',
          fontSize: '10px',
          flexShrink: 0,
        }}
      >
        <span>
          {pages.length} pages · {activePage.sections.length} sections · id: {activePage.id}
        </span>
        <span style={{ fontFamily: 'ui-monospace, monospace', color: '#555' }}>
          {vpInfo.icon} {vpInfo.width ? vpInfo.width + 'px' : 'Full'} · ui-maker MVP v2 · React + Vite
        </span>
      </footer>

      {settingsPage && (
        <PageSettingsModal
          page={settingsPage}
          onSave={handleSavePageSettings}
          onClose={() => setSettingsPageId(null)}
        />
      )}
    </div>
  );
}

/* ── ViewportFrame ───────────────────────────────────────────── */

function ViewportFrame({ viewportMode, children }) {
  const vpData = VIEWPORT_MODES.find((v) => v.key === viewportMode);
  const maxW = vpData.width;
  const isConstrained = maxW !== null;

  if (!isConstrained) {
    return (
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          overflow: 'auto',
          boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: maxW,
          maxWidth: '100%',
          background: '#fff',
          borderRadius: viewportMode === 'mobile' ? 24 : 12,
          overflow: 'auto',
          boxShadow: '0 0 0 8px #1e293b, 0 8px 40px rgba(0,0,0,.45)',
          position: 'relative',
        }}
      >
        {/* device top notch bar */}
        <div style={{
          height: viewportMode === 'mobile' ? 28 : 20,
          background: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ width: viewportMode === 'mobile' ? 60 : 80, height: viewportMode === 'mobile' ? 8 : 6, background: '#0f172a', borderRadius: 999 }} />
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── PreviewRenderer ─────────────────────────────────────────── */

function PreviewRenderer({ page }) {
  const [PageRenderer, setPageRenderer] = React.useState(null);
  React.useEffect(() => {
    import('./PageRenderer.jsx').then((mod) => setPageRenderer(() => mod.PageRenderer));
  }, []);
  if (!PageRenderer) return null;
  return <PageRenderer page={page} />;
}
