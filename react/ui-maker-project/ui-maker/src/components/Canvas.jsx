import React, { useState } from 'react';
import { getSectionMeta } from '../constants/sectionRegistry.js';
import { buildSectionHtml } from '../utils/sectionBuilders.js';

/* ─────────────────── SectionWrapper ─────────────────── */

function SectionWrapper({ section, index, isSelected, dragOverIndex, onSelect, onReorder, onDropNewSection, onSetDragOver }) {
  const meta = getSectionMeta(section.name);

  function handleDragOver(e) {
    const types = e.dataTransfer.types;
    if (types.includes('application/x-ui-maker-section') || types.includes('application/x-ui-maker-reorder')) {
      e.preventDefault();
      e.stopPropagation();
      onSetDragOver(index);
    }
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      onSetDragOver(null);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    onSetDragOver(null);
    const name = e.dataTransfer.getData('application/x-ui-maker-section');
    if (name) {
      onDropNewSection(name, index);
      return;
    }
    const srcStr = e.dataTransfer.getData('application/x-ui-maker-reorder');
    const srcIdx = parseInt(srcStr, 10);
    if (!isNaN(srcIdx) && srcIdx !== index) {
      onReorder(srcIdx, index);
    }
  }

  return (
    <div
      data-section-uid={section._uid}
      style={{
        position: 'relative',
        outline: isSelected ? '2px solid #8B4513' : '2px solid transparent',
        outlineOffset: '-2px',
        cursor: 'default',
        transition: 'outline-color .12s',
        fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.outlineColor = 'rgba(139,69,19,.3)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.outlineColor = 'transparent';
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* drop-target line — appears at top of hovered section */}
      {dragOverIndex === index && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#8B4513', zIndex: 20, pointerEvents: 'none' }} />
      )}

      {/* selection badge */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: 0, left: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '3px 10px', background: '#8B4513', color: '#fff',
          fontSize: 11, fontWeight: 700, borderBottomRightRadius: 6,
          pointerEvents: 'none', userSelect: 'none'
        }}>
          <span>⣿</span>
          <span>{meta ? meta.label : section.name}</span>
        </div>
      )}

      {/* section content — inline HTML with own inline styles */}
      <div dangerouslySetInnerHTML={{ __html: buildSectionHtml(section) }} />

      {/* drag handle — isolated, always on top */}
      <div
        draggable
        title="Kéo để sắp xếp"
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('application/x-ui-maker-reorder', String(index));
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: 4, right: 6,
          width: 22, height: 22,
          cursor: 'grab',
          background: isSelected ? '#8B4513' : 'rgba(26,26,46,.65)',
          color: '#fff', fontSize: 11, borderRadius: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          userSelect: 'none', zIndex: 30,
          opacity: isSelected ? 1 : 0.45,
          transition: 'opacity .15s, background .15s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = isSelected ? '1' : '0.45'; }}
      >
        ↕
      </div>
    </div>
  );
}

/* ─────────────────── Canvas ─────────────────── */

const VIEWPORT_MAP = { desktop: null, tablet: 768, mobile: 360 };

export function Canvas({ page, selectedUid, viewportMode = 'desktop', onSelectSection, onReorder, onDropNewSection, onDeselect }) {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const maxW = VIEWPORT_MAP[viewportMode] ?? null;

  function handleCanvasDragOver(e) {
    const types = e.dataTransfer.types;
    if (types.includes('application/x-ui-maker-section') || types.includes('application/x-ui-maker-reorder')) {
      e.preventDefault();
    }
  }

  function handleCanvasDrop(e) {
    e.preventDefault();
    setDragOverIndex(null);
    const name = e.dataTransfer.getData('application/x-ui-maker-section');
    if (name) {
      onDropNewSection(name, page?.sections?.length ?? 0);
    }
  }

  if (!page || !Array.isArray(page.sections)) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8e8e8', color: '#bbb', fontSize: 14 }}>
        Chưa có trang nào được chọn.
      </div>
    );
  }

  /* viewport label shown above the card */
  const vpLabels = { desktop: '🖥 Desktop · Full width', tablet: '⬜ Tablet · 768px', mobile: '📱 Mobile · 360px' };

  return (
    <div
      style={{ flex: 1, overflowY: 'auto', background: '#e0e0e0', padding: '20px 24px', display: 'flex', flexDirection: 'column', minHeight: 0 }}
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
      onDragEnd={() => setDragOverIndex(null)}
      onClick={() => onDeselect?.()}
    >
      {/* viewport indicator bar */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 10, userSelect: 'none', gap: 8 }}>
        <span style={{ fontSize: 11, color: '#888', fontFamily: 'ui-monospace, monospace', background: '#d4d4d4', padding: '3px 10px', borderRadius: 4 }}>
          {vpLabels[viewportMode]}
        </span>
        {maxW && (
          <span style={{ fontSize: 10, color: '#aaa' }}>← drag handles still work →</span>
        )}
      </div>

      {/* centering wrapper for tablet/mobile */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flex: 1,
        }}
        onClick={() => onDeselect?.()}
      >
      {/* white card — stopPropagation prevents canvas background click = deselect */}
      <div
        style={{
          background: '#fff',
          borderRadius: maxW ? 12 : 8,
          overflow: 'auto',
          boxShadow: maxW
            ? '0 0 0 6px #1e293b, 0 8px 40px rgba(0,0,0,.35)'
            : '0 2px 16px rgba(0,0,0,.12)',
          width: maxW ? maxW : '100%',
          maxWidth: maxW ? maxW : 'none',
          flexShrink: 0,
          alignSelf: 'flex-start',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* device chrome bar for tablet/mobile */}
        {maxW && (
          <div style={{ height: viewportMode === 'mobile' ? 26 : 18, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: viewportMode === 'mobile' ? 56 : 72, height: 6, background: '#0f172a', borderRadius: 999 }} />
          </div>
        )}
        {page.sections.length === 0 && (
          <div
            style={{ padding: 56, textAlign: 'center', color: '#bbb', fontSize: 14, border: '2px dashed #ddd', margin: 24, borderRadius: 8 }}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes('application/x-ui-maker-section')) e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const name = e.dataTransfer.getData('application/x-ui-maker-section');
              if (name) onDropNewSection(name, 0);
            }}
          >
            Kéo section vào đây hoặc click trong panel bên trái để thêm
          </div>
        )}

        {page.sections.map((section, index) => (
          <SectionWrapper
            key={section._uid}
            section={section}
            index={index}
            isSelected={section._uid === selectedUid}
            dragOverIndex={dragOverIndex}
            onSelect={() => onSelectSection(section._uid)}
            onReorder={onReorder}
            onDropNewSection={onDropNewSection}
            onSetDragOver={setDragOverIndex}
          />
        ))}
      </div>
      </div> {/* centering wrapper */}

      <div style={{ height: 24, flexShrink: 0 }} />
    </div>
  );
}
