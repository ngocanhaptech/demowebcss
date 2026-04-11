/**
 * elementTemplates.js — default JSON trees for each droppable element tag.
 * Used by DragDropContext.onDragEnd to create a new ElementNode when dropped.
 *
 * ELEMENT_CATALOG — ordered groups for ElementsPanel display.
 */

export const ELEMENT_TEMPLATES = {
  heading: {
    tag: 'heading',
    content: 'Heading Text',
    options: { level: 'h2' },
  },
  paragraph: {
    tag: 'paragraph',
    content: 'Your paragraph text goes here.',
    options: {},
  },
  button: {
    tag: 'button',
    content: 'Click Me',
    options: { variant: 'primary', size: 'md' },
  },
  section: {
    tag: 'section',
    options: { bgColor: 'var(--color-bg)', paddingY: 80 },
    children: [
      { tag: 'container', options: {}, children: [] },
    ],
  },
  container: {
    tag: 'container',
    options: {},
    children: [],
  },
  row: {
    tag: 'row',
    options: { gap: 16 },
    children: [],
  },
  column: {
    tag: 'column',
    options: {},
    children: [],
  },
  card: {
    tag: 'card',
    options: {
      shadow: 'var(--shadow-md)',
      radius: 'var(--radius-md)',
      bgColor: 'var(--color-bg)',
      padding: 'var(--card-padding)',
    },
    children: [],
  },
  navbar: {
    tag: 'navbar',
    options: { bgColor: 'var(--color-bg)', paddingY: 16 },
    children: [
      { tag: 'container', options: {}, children: [] },
    ],
  },

  image: {
    tag: 'image',
    options: {
      src: '',
      alt: '',
      width: '100%',
      height: 'auto',
      objectFit: 'cover',
      borderRadius: '0',
      marginTop: 0,
      marginBottom: 0,
    },
  },
}

export const ELEMENT_CATALOG = [
  {
    category: 'Layout',
    items: [
      { tag: 'section',   icon: '▬',  label: 'Section',   desc: 'Full-width section wrapper' },
      { tag: 'container', icon: '⬜', label: 'Container', desc: 'Max-width centered box'     },
      { tag: 'row',       icon: '↔',  label: 'Row',       desc: 'Horizontal flex row'        },
      { tag: 'column',    icon: '↕',  label: 'Column',    desc: 'Vertical flex column'       },
      { tag: 'card',      icon: '🃏', label: 'Card',      desc: 'Card with shadow & radius'  },
    ],
  },
  {
    category: 'Text',
    items: [
      { tag: 'heading',   icon: 'H',  label: 'Heading',   desc: 'H1–H4 heading text'   },
      { tag: 'paragraph', icon: '¶',  label: 'Paragraph', desc: 'Body text block'       },
      { tag: 'button',    icon: '⬛', label: 'Button',    desc: 'Styled CTA button'     },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { tag: 'navbar', icon: '≡', label: 'Navbar', desc: 'Top navigation bar' },
    ],
  },
  {
    category: 'Media',
    items: [
      { tag: 'image', icon: '🖼', label: 'Image', desc: 'Upload or pick from library' },
    ],
  },
]
