import React, { useState, useRef } from 'react';
import { getSectionMeta } from '../constants/sectionRegistry.js';
import { TopBarBasic } from '../sections/TopBarBasic.jsx';
import { HeaderMain } from '../sections/HeaderMain.jsx';
import { HeroCeramic } from '../sections/HeroCeramic.jsx';
import { IntroStudio } from '../sections/IntroStudio.jsx';
import { Features3Col } from '../sections/Features3Col.jsx';
import { CtaHtml } from '../sections/CtaHtml.jsx';
import { ContactForm } from '../sections/ContactForm.jsx';
import { FooterBasic } from '../sections/FooterBasic.jsx';

function renderSectionComponent(section) {
  switch (section.name) {
    case 'top-bar-basic':
      return <TopBarBasic section={section} />;
    case 'header-main':
      return <HeaderMain section={section} />;
    case 'hero-ceramic':
      return <HeroCeramic section={section} />;
    case 'intro-studio':
      return <IntroStudio section={section} />;
    case 'features-3col':
      return <Features3Col section={section} />;
    case 'cta-html-1':
      return <CtaHtml section={section} />;
    case 'contact-form':
      return <ContactForm section={section} />;
    case 'footer-basic':
      return <FooterBasic section={section} />;
    default:
      return (
        <div
          style={{
            padding: '16px',
            background: '#fffbe6',
            border: '1px dashed #ccc',
            fontSize: '13px',
            color: '#888'
          }}
        >
          Unknown: <code>{section.name}</code>
        </div>
      );
  }
}

export function Canvas({ page, selectedUid, onSelectSection, onReorder, onDropNewSection }) {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragSrcIndexRef = useRef(null);

  if (!page || !Array.isArray(page.sections)) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f8f8',
          color: '#bbb',
          fontSize: '14px'
        }}
      >
        Chưa có section nào. Thêm section từ panel bên trái.
      </div>
    );
  }

  function handleDragStart(e, index) {
    dragSrcIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-ui-maker-reorder', String(index));
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    const reorderData = e.dataTransfer.types.includes('application/x-ui-maker-reorder');
    const newSectionData = e.dataTransfer.types.includes('application/x-ui-maker-section');
    if (reorderData || newSectionData) {
      e.dataTransfer.dropEffect = reorderData ? 'move' : 'copy';
      setDragOverIndex(index);
    }
  }

  function handleDragLeave() {
    setDragOverIndex(null);
  }

  function handleDrop(e, targetIndex) {
    e.preventDefault();
    setDragOverIndex(null);

    const newSectionName = e.dataTransfer.getData('application/x-ui-maker-section');
    if (newSectionName) {
      onDropNewSection(newSectionName, targetIndex);
      dragSrcIndexRef.current = null;
      return;
    }

    const srcStr = e.dataTransfer.getData('application/x-ui-maker-reorder');
    const srcIndex = dragSrcIndexRef.current !== null ? dragSrcIndexRef.current : parseInt(srcStr, 10);
    dragSrcIndexRef.current = null;

    if (isNaN(srcIndex) || srcIndex === targetIndex) return;
    onReorder(srcIndex, targetIndex);
  }

  function handleCanvasDropZone(e) {
    e.preventDefault();
    setDragOverIndex(null);
    const newSectionName = e.dataTransfer.getData('application/x-ui-maker-section');
    if (newSectionName) {
      onDropNewSection(newSectionName, page.sections.length);
    }
  }

  function handleCanvasDragOver(e) {
    const newSectionData = e.dataTransfer.types.includes('application/x-ui-maker-section');
    if (newSectionData) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        background: '#ececec',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0'
      }}
      onDrop={handleCanvasDropZone}
      onDragOver={handleCanvasDragOver}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          minHeight: 200
        }}
      >
        {page.sections.length === 0 && (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              color: '#bbb',
              fontSize: '14px',
              border: '2px dashed #ddd',
              margin: '24px',
              borderRadius: '8px'
            }}
          >
            Kéo section vào đây hoặc click trong panel bên trái để thêm
          </div>
        )}

        {page.sections.map((section, index) => {
          const isSelected = section._uid === selectedUid;
          const isDragOver = dragOverIndex === index;
          const meta = getSectionMeta(section.name);

          return (
            <div
              key={section._uid || `${section.name}-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSection(section._uid);
              }}
              style={{
                position: 'relative',
                outline: isSelected ? '2px solid #8B4513' : isDragOver ? '2px dashed #8B4513' : '2px solid transparent',
                outlineOffset: '-2px',
                cursor: 'pointer',
                transition: 'outline 0.1s'
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 8px',
                    background: '#8B4513',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderBottomRightRadius: '5px',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                >
                  <span>⣿</span>
                  <span>{meta ? meta.label : section.name}</span>
                </div>
              )}

              {isDragOver && !isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: '#8B4513',
                    zIndex: 20,
                    borderRadius: '2px'
                  }}
                />
              )}

              <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {renderSectionComponent(section)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
