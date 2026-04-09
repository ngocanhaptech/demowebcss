/**
 * Inline element definitions — option schemas for all built-in element types.
 *
 * Each definition has:
 *   tag         — matches ElementNode.tag
 *   label       — display name in PropsPanel header
 *   icon        — single emoji/character for visual identity
 *   category    — 'layout' | 'text' | 'media' | 'nav' | 'container'
 *   groups      — ordered list of collapsible option groups shown in PropsPanel
 *   optionDefs  — full schema for each option key
 *
 * optionDef shape:
 *   type        — 'text'|'select'|'color'|'range'|'radio'|'checkbox'|'cssvars'
 *   label       — display label
 *   default     — default value
 *   responsive  — if true, PropsPanel wraps in OptionResponsive
 *   options     — for select/radio: [{value, label}] or string[]
 *   min/max/step/unit — for range
 *   cssVarGroup — 'color'|'fontSize'|'shadow'|'radius' for cssvars type
 */

const ALIGN_OPTIONS = [
  { value: 'left',   label: '⬅ Left'   },
  { value: 'center', label: '↔ Center' },
  { value: 'right',  label: '➡ Right'  },
]

const FONT_WEIGHT_OPTIONS = [
  { value: 'var(--font-weight-normal)', label: 'Normal (400)' },
  { value: 'var(--font-weight-medium)', label: 'Medium (500)' },
  { value: 'var(--font-weight-bold)',   label: 'Bold (700)'   },
]

export const ELEMENT_DEFS = {
  heading: {
    tag: 'heading',
    label: 'Heading',
    icon: 'H',
    category: 'text',
    groups: [
      { label: 'Typography', defaultOpen: true,  fields: ['level', 'color', 'fontSize', 'fontWeight', 'textAlign'] },
      { label: 'Spacing',    defaultOpen: false, fields: ['marginBottom', 'marginTop'] },
    ],
    optionDefs: {
      level:        { type: 'radio',   label: 'Level',
                      options: [{value:'h1',label:'H1'},{value:'h2',label:'H2'},{value:'h3',label:'H3'},{value:'h4',label:'H4'}],
                      default: 'h2' },
      color:        { type: 'color',   label: 'Color',       default: 'var(--color-text)' },
      fontSize:     { type: 'cssvars', label: 'Font Size',   default: 'var(--font-size-base)', cssVarGroup: 'fontSize' },
      fontWeight:   { type: 'select',  label: 'Font Weight', default: 'var(--font-weight-normal)', options: FONT_WEIGHT_OPTIONS },
      textAlign:    { type: 'radio',   label: 'Align',       default: 'left', options: ALIGN_OPTIONS },
      marginBottom: { type: 'range',   label: 'Margin Bottom', default: 0, min: 0, max: 80, step: 4, unit: 'px', responsive: true },
      marginTop:    { type: 'range',   label: 'Margin Top',    default: 0, min: 0, max: 80, step: 4, unit: 'px' },
    },
  },

  paragraph: {
    tag: 'paragraph',
    label: 'Paragraph',
    icon: '¶',
    category: 'text',
    groups: [
      { label: 'Typography', defaultOpen: true,  fields: ['color', 'fontSize', 'fontWeight', 'textAlign', 'lineHeight'] },
      { label: 'Spacing',    defaultOpen: false, fields: ['marginBottom', 'marginTop', 'maxWidth'] },
    ],
    optionDefs: {
      color:        { type: 'color',   label: 'Color',       default: 'var(--color-text)' },
      fontSize:     { type: 'cssvars', label: 'Font Size',   default: 'var(--font-size-base)', cssVarGroup: 'fontSize' },
      fontWeight:   { type: 'select',  label: 'Font Weight', default: 'var(--font-weight-normal)', options: FONT_WEIGHT_OPTIONS },
      textAlign:    { type: 'radio',   label: 'Align',       default: 'left', options: ALIGN_OPTIONS },
      lineHeight:   { type: 'text',    label: 'Line Height', default: 'var(--line-height-base)', placeholder: '1.6 or var(...)' },
      marginBottom: { type: 'range',   label: 'Margin Bottom', default: 0, min: 0, max: 80, step: 4, unit: 'px', responsive: true },
      marginTop:    { type: 'range',   label: 'Margin Top',    default: 0, min: 0, max: 80, step: 4, unit: 'px' },
      maxWidth:     { type: 'text',    label: 'Max Width',   default: '', placeholder: '600px, 100%, ...' },
    },
  },

  button: {
    tag: 'button',
    label: 'Button',
    icon: '⬛',
    category: 'text',
    groups: [
      { label: 'Style',   defaultOpen: true,  fields: ['variant', 'size'] },
      { label: 'Spacing', defaultOpen: false, fields: ['marginBottom', 'marginTop'] },
    ],
    optionDefs: {
      variant: {
        type: 'select', label: 'Variant', default: 'primary',
        options: [
          { value: 'primary',       label: 'Primary'       },
          { value: 'primary-dark',  label: 'Primary Dark'  },
          { value: 'secondary',     label: 'Secondary'     },
          { value: 'outline',       label: 'Outline'       },
          { value: 'outline-light', label: 'Outline Light' },
          { value: 'inverse',       label: 'Inverse'       },
          { value: 'ghost',         label: 'Ghost'         },
          { value: 'danger',        label: 'Danger'        },
        ],
      },
      size: {
        type: 'radio', label: 'Size', default: 'md',
        options: [{value:'xs',label:'XS'},{value:'sm',label:'SM'},{value:'md',label:'MD'},{value:'lg',label:'LG'},{value:'xl',label:'XL'}],
      },
      marginBottom: { type: 'range', label: 'Margin Bottom', default: 0, min: 0, max: 48, step: 4, unit: 'px' },
      marginTop:    { type: 'range', label: 'Margin Top',    default: 0, min: 0, max: 48, step: 4, unit: 'px' },
    },
  },

  section: {
    tag: 'section',
    label: 'Section',
    icon: '▬',
    category: 'layout',
    groups: [
      { label: 'Background', defaultOpen: true,  fields: ['bgColor'] },
      { label: 'Spacing',    defaultOpen: true,  fields: ['paddingY', 'paddingX'] },
      { label: 'Layout',     defaultOpen: false, fields: ['textAlign', 'minHeight'] },
    ],
    optionDefs: {
      bgColor:    { type: 'color', label: 'Background', default: 'var(--color-bg)' },
      paddingY:   { type: 'range', label: 'Padding Y', default: 80, min: 0, max: 200, step: 8, unit: 'px', responsive: true },
      paddingX:   { type: 'range', label: 'Padding X', default: 0,  min: 0, max: 80,  step: 8, unit: 'px' },
      textAlign:  { type: 'radio', label: 'Text Align', default: 'left', options: ALIGN_OPTIONS },
      minHeight:  { type: 'text',  label: 'Min Height', default: '', placeholder: '500px, 100vh, ...' },
    },
  },

  container: {
    tag: 'container',
    label: 'Container',
    icon: '⬜',
    category: 'layout',
    groups: [
      { label: 'Layout',  defaultOpen: true,  fields: ['maxWidth', 'paddingX', 'paddingY'] },
    ],
    optionDefs: {
      maxWidth:  { type: 'text',  label: 'Max Width', default: 'var(--container-max)', placeholder: '1200px or var(...)' },
      paddingX:  { type: 'range', label: 'Padding X', default: 0, min: 0, max: 80, step: 4, unit: 'px' },
      paddingY:  { type: 'range', label: 'Padding Y', default: 0, min: 0, max: 80, step: 4, unit: 'px' },
    },
  },

  row: {
    tag: 'row',
    label: 'Row',
    icon: '↔',
    category: 'layout',
    groups: [
      { label: 'Flex', defaultOpen: true,  fields: ['flexDirection', 'align', 'justify', 'gap'] },
      { label: 'Spacing', defaultOpen: false, fields: ['paddingY', 'paddingX'] },
    ],
    optionDefs: {
      flexDirection: {
        type: 'radio', label: 'Direction', default: 'row', responsive: true,
        options: [{value:'row',label:'→ Row'},{value:'column',label:'↓ Col'}],
      },
      align: {
        type: 'select', label: 'Align Items', default: 'stretch',
        options: [
          { value: 'stretch',      label: 'Stretch'      },
          { value: 'flex-start',   label: 'Start'        },
          { value: 'center',       label: 'Center'       },
          { value: 'flex-end',     label: 'End'          },
        ],
      },
      justify: {
        type: 'select', label: 'Justify', default: 'flex-start',
        options: [
          { value: 'flex-start',    label: 'Start'        },
          { value: 'center',        label: 'Center'       },
          { value: 'flex-end',      label: 'End'          },
          { value: 'space-between', label: 'Space Between'},
          { value: 'space-around',  label: 'Space Around' },
        ],
      },
      gap:      { type: 'range', label: 'Gap', default: 0, min: 0, max: 64, step: 4, unit: 'px', responsive: true },
      paddingY: { type: 'range', label: 'Padding Y', default: 0, min: 0, max: 80, step: 4, unit: 'px' },
      paddingX: { type: 'range', label: 'Padding X', default: 0, min: 0, max: 80, step: 4, unit: 'px' },
    },
  },

  column: {
    tag: 'column',
    label: 'Column',
    icon: '↕',
    category: 'layout',
    groups: [
      { label: 'Layout',  defaultOpen: true,  fields: ['flex', 'paddingX', 'paddingY'] },
      { label: 'Background', defaultOpen: false, fields: ['bgColor'] },
    ],
    optionDefs: {
      flex:     { type: 'text',  label: 'Flex',      default: '1',  placeholder: '1, 0 0 auto, ...' },
      paddingX: { type: 'range', label: 'Padding X', default: 0, min: 0, max: 80, step: 4, unit: 'px' },
      paddingY: { type: 'range', label: 'Padding Y', default: 0, min: 0, max: 80, step: 4, unit: 'px' },
      bgColor:  { type: 'color', label: 'Background', default: '' },
    },
  },

  card: {
    tag: 'card',
    label: 'Card',
    icon: '🃏',
    category: 'layout',
    groups: [
      { label: 'Style',   defaultOpen: true,  fields: ['bgColor', 'shadow', 'radius'] },
      { label: 'Spacing', defaultOpen: true,  fields: ['padding', 'paddingX', 'paddingY'] },
      { label: 'Layout',  defaultOpen: false, fields: ['flex', 'minHeight'] },
    ],
    optionDefs: {
      bgColor:  { type: 'color',   label: 'Background', default: 'var(--color-bg)' },
      shadow:   { type: 'cssvars', label: 'Shadow',     default: 'var(--shadow-md)', cssVarGroup: 'shadow' },
      radius:   { type: 'cssvars', label: 'Radius',     default: 'var(--radius-md)', cssVarGroup: 'radius' },
      padding:  { type: 'text',    label: 'Padding',    default: 'var(--card-padding)', placeholder: '24px or var(...)' },
      paddingX: { type: 'range',   label: 'Padding X',  default: 0, min: 0, max: 80, step: 4, unit: 'px' },
      paddingY: { type: 'range',   label: 'Padding Y',  default: 0, min: 0, max: 80, step: 4, unit: 'px' },
      flex:     { type: 'text',    label: 'Flex',       default: '1', placeholder: '1, 0 0 auto, ...' },
      minHeight:{ type: 'text',    label: 'Min Height', default: '', placeholder: '300px ...' },
    },
  },

  navbar: {
    tag: 'navbar',
    label: 'Navbar',
    icon: '≡',
    category: 'nav',
    groups: [
      { label: 'Style',   defaultOpen: true,  fields: ['bgColor', 'borderBottom'] },
      { label: 'Layout',  defaultOpen: true,  fields: ['sticky', 'paddingY'] },
    ],
    optionDefs: {
      bgColor:      { type: 'color',    label: 'Background',     default: 'var(--color-bg)' },
      borderBottom: { type: 'text',     label: 'Border Bottom',  default: '1px solid var(--color-border)', placeholder: 'e.g. 1px solid #eee' },
      sticky:       { type: 'checkbox', label: 'Sticky',         default: false },
      paddingY:     { type: 'range',    label: 'Padding Y',      default: 16, min: 0, max: 48, step: 4, unit: 'px' },
    },
  },

  _root: {
    tag: '_root',
    label: 'Page Root',
    icon: '⬡',
    category: 'layout',
    groups: [],
    optionDefs: {},
  },

  image: {
    tag: 'image',
    label: 'Image',
    icon: '🖼',
    category: 'media',
    groups: [
      { label: 'Nguồn ảnh', defaultOpen: true,  fields: ['src', 'alt'] },
      { label: 'Kích thước', defaultOpen: true,  fields: ['width', 'height', 'objectFit'] },
      { label: 'Style',      defaultOpen: false, fields: ['borderRadius', 'marginTop', 'marginBottom'] },
    ],
    optionDefs: {
      src: {
        type: 'image',
        label: 'Image Source',
        default: '',
      },
      alt: {
        type: 'text',
        label: 'Alt Text',
        default: '',
        placeholder: 'Mô tả ảnh...',
      },
      width: {
        type: 'text',
        label: 'Width',
        default: '100%',
        placeholder: '100%, 400px, auto...',
      },
      height: {
        type: 'text',
        label: 'Height',
        default: 'auto',
        placeholder: 'auto, 300px...',
      },
      objectFit: {
        type: 'select',
        label: 'Object Fit',
        default: 'cover',
        options: [
          { value: 'cover',      label: 'Cover'      },
          { value: 'contain',    label: 'Contain'    },
          { value: 'fill',       label: 'Fill'       },
          { value: 'none',       label: 'None'       },
          { value: 'scale-down', label: 'Scale Down' },
        ],
      },
      borderRadius: {
        type: 'text',
        label: 'Border Radius',
        default: '0',
        placeholder: '8px, 50%...',
      },
      marginTop: {
        type: 'range',
        label: 'Margin Top',
        default: 0,
        min: 0, max: 80, step: 4, unit: 'px',
      },
      marginBottom: {
        type: 'range',
        label: 'Margin Bottom',
        default: 0,
        min: 0, max: 80, step: 4, unit: 'px',
      },
    },
  },
}

/**
 * Get element def for a tag, with a minimal fallback.
 * @param {string} tag
 * @returns {object}
 */
export function getElementDef(tag) {
  return ELEMENT_DEFS[tag] ?? {
    tag,
    label: tag,
    icon: '□',
    category: 'custom',
    groups: [],
    optionDefs: {},
  }
}
