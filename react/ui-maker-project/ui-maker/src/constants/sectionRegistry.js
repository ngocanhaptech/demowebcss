export const SECTION_REGISTRY = [
  {
    name: 'top-bar-basic',
    label: 'Top Bar',
    icon: '▬',
    category: 'Navigation',
    defaultProps: {
      'html-nav': '<a href="home">Home</a><a href="about">About</a><a href="contact">Contact</a>'
    },
    propSchema: [
      { key: 'html-nav', label: 'Nav HTML', type: 'html' }
    ]
  },
  {
    name: 'header-main',
    label: 'Header Main',
    icon: '🏷',
    category: 'Navigation',
    defaultProps: {
      title: 'Header content title'
    },
    propSchema: [
      { key: 'title', label: 'Title', type: 'text' }
    ]
  },
  {
    name: 'hero-ceramic',
    label: 'Hero / Banner',
    icon: '🖼',
    category: 'Hero',
    defaultProps: {
      'html-content': '<a href="#s1">Slider 1</a><a href="#s2">Slider 2</a>'
    },
    propSchema: [
      { key: 'html-content', label: 'Content HTML', type: 'html' }
    ]
  },
  {
    name: 'intro-studio',
    label: 'Intro / Text Block',
    icon: '📝',
    category: 'Content',
    defaultProps: {
      'html-main': 'S Media <i>Studio</i>'
    },
    propSchema: [
      { key: 'html-main', label: 'Main HTML', type: 'html' }
    ]
  },
  {
    name: 'features-3col',
    label: 'Features 3 Cols',
    icon: '⊞',
    category: 'Content',
    defaultProps: {
      contents: ['Feature 1', 'Feature 2', 'Feature 3']
    },
    propSchema: [
      { key: 'contents', label: 'Items (JSON array)', type: 'json-array' }
    ]
  },
  {
    name: 'cta-html-1',
    label: 'CTA Button',
    icon: '🔘',
    category: 'CTA',
    defaultProps: {
      'cta-link': '#',
      'cta-text': 'Xem chi tiết'
    },
    propSchema: [
      { key: 'cta-link', label: 'Link URL', type: 'text' },
      { key: 'cta-text', label: 'Button Text', type: 'text' }
    ]
  },
  {
    name: 'contact-form',
    label: 'Contact Form',
    icon: '📨',
    category: 'Form',
    defaultProps: {
      'form-title': 'Liên hệ với chúng tôi'
    },
    propSchema: [
      { key: 'form-title', label: 'Form Title', type: 'text' }
    ]
  },
  {
    name: 'footer-basic',
    label: 'Footer Basic',
    icon: '▬',
    category: 'Footer',
    defaultProps: {
      'footer-text': '© 2026 Gốm Đất. All rights reserved.'
    },
    propSchema: [
      { key: 'footer-text', label: 'Footer Text', type: 'text' }
    ]
  }
];

export function getSectionMeta(name) {
  return SECTION_REGISTRY.find((s) => s.name === name) || null;
}

export function createSectionFromRegistry(name) {
  const meta = getSectionMeta(name);
  if (!meta) return { name };
  return { name, ...meta.defaultProps };
}
