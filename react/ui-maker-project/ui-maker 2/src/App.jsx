import React, { useEffect, useState, useCallback } from 'react';
import pageDataDefault from './data/page-1.json';
import { SectionsPanel } from './components/SectionsPanel.jsx';
import { Canvas } from './components/Canvas.jsx';
import { PropsPanel } from './components/PropsPanel.jsx';
import { PageRenderer } from './PageRenderer.jsx';
import { loadPageFromStorage, savePageToStorage } from './utils/storage.js';
import { downloadHtmlFile } from './utils/htmlExporter.js';
import { createSectionFromRegistry } from './constants/sectionRegistry.js';

function generateUid() {
  return '_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
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

export default function App() {
  const [page, setPage] = useState(null);
  const [selectedUid, setSelectedUid] = useState(null);
  const [savedBadge, setSavedBadge] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const stored = loadPageFromStorage(pageDataDefault.id);
    const raw = stored || pageDataDefault;
    setPage(ensureSectionUids(raw));
  }, []);

  function getSelectedSection() {
    if (!page || !selectedUid) return null;
    return page.sections.find((s) => s._uid === selectedUid) || null;
  }

  function updatePage(newPage) {
    setPage(newPage);
    savePageToStorage(newPage);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1500);
  }

  const handleAddSection = useCallback(
    (sectionName) => {
      const newSection = { ...createSectionFromRegistry(sectionName), _uid: generateUid() };
      const newPage = {
        ...page,
        sections: [...(page.sections || []), newSection]
      };
      updatePage(newPage);
      setSelectedUid(newSection._uid);
    },
    [page]
  );

  const handleDropNewSection = useCallback(
    (sectionName, atIndex) => {
      const newSection = { ...createSectionFromRegistry(sectionName), _uid: generateUid() };
      const sections = [...(page.sections || [])];
      sections.splice(atIndex, 0, newSection);
      const newPage = { ...page, sections };
      updatePage(newPage);
      setSelectedUid(newSection._uid);
    },
    [page]
  );

  const handleReorder = useCallback(
    (fromIndex, toIndex) => {
      if (!page) return;
      const sections = [...page.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      updatePage({ ...page, sections });
    },
    [page]
  );

  const handleSelectSection = useCallback((uid) => {
    setSelectedUid((prev) => (prev === uid ? null : uid));
  }, []);

  const handleUpdateSection = useCallback(
    (updatedSection) => {
      if (!page) return;
      const sections = page.sections.map((s) =>
        s._uid === updatedSection._uid ? updatedSection : s
      );
      updatePage({ ...page, sections });
    },
    [page]
  );

  const handleDeleteSection = useCallback(
    (uid) => {
      if (!page) return;
      const sections = page.sections.filter((s) => s._uid !== uid);
      updatePage({ ...page, sections });
      setSelectedUid(null);
    },
    [page]
  );

  const handleExportHtml = useCallback(() => {
    if (!page) return;
    downloadHtmlFile(page);
  }, [page]);

  const handleResetPage = useCallback(() => {
    if (!window.confirm('Reset về dữ liệu mẫu ban đầu?')) return;
    const fresh = ensureSectionUids(pageDataDefault);
    setPage(fresh);
    savePageToStorage(fresh);
    setSelectedUid(null);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedUid(null);
  }, []);

  if (!page) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontSize: '14px',
          color: '#888',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        Đang tải...
      </div>
    );
  }

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
      <header
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: '#1a1a2e',
          color: '#fff',
          borderBottom: '1px solid #2d2d4e',
          flexShrink: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '-0.02em',
              color: '#e8b87d'
            }}
          >
            ui-maker
          </span>
          <span
            style={{
              fontSize: '11px',
              color: '#888',
              background: '#2a2a3e',
              padding: '2px 8px',
              borderRadius: '4px'
            }}
          >
            MVP v1
          </span>
          {savedBadge && (
            <span
              style={{
                fontSize: '11px',
                color: '#4ade80'
              }}
            >
              ✓ Đã lưu LocalStorage
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              color: '#999',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {page.title}
          </span>

          <button
            type="button"
            onClick={() => setPreviewMode((v) => !v)}
            style={{
              padding: '5px 12px',
              borderRadius: '5px',
              border: '1px solid',
              borderColor: previewMode ? '#e8b87d' : '#444',
              background: previewMode ? '#e8b87d' : 'transparent',
              color: previewMode ? '#1a1a2e' : '#ccc',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {previewMode ? '◀ Editor' : '👁 Preview'}
          </button>

          <button
            type="button"
            onClick={handleResetPage}
            style={{
              padding: '5px 12px',
              borderRadius: '5px',
              border: '1px solid #444',
              background: 'transparent',
              color: '#ccc',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleExportHtml}
            style={{
              padding: '5px 14px',
              borderRadius: '5px',
              border: 'none',
              background: '#16a34a',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            ↓ Export HTML
          </button>
        </div>
      </header>

      {previewMode ? (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            background: '#ececec',
            padding: '24px'
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              maxWidth: 1100,
              margin: '0 auto'
            }}
          >
            <PageRenderer page={page} />
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            minHeight: 0
          }}
          onClick={handleCanvasClick}
        >
          <SectionsPanel onAddSection={handleAddSection} />

          <Canvas
            page={page}
            selectedUid={selectedUid}
            onSelectSection={handleSelectSection}
            onReorder={handleReorder}
            onDropNewSection={handleDropNewSection}
          />

          <PropsPanel
            selectedSection={getSelectedSection()}
            onUpdateSection={handleUpdateSection}
            onDeleteSection={handleDeleteSection}
          />
        </div>
      )}

      <footer
        style={{
          height: 26,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: '#1a1a2e',
          color: '#555',
          fontSize: '11px',
          flexShrink: 0
        }}
      >
        <span>
          {page.sections.length} sections · id: {page.id}
        </span>
        <span>ui-maker MVP · React + Vite · LocalStorage only</span>
      </footer>
    </div>
  );
}
