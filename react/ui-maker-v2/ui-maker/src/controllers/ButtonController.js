import { BaseController } from './BaseController.js'

const VARIANT_STYLES = {
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
  },
  'primary-dark': {
    backgroundColor: 'var(--color-primary-dark)',
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'var(--color-secondary)',
    color: '#ffffff',
    border: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '2px solid var(--color-primary)',
  },
  'outline-light': {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '2px solid rgba(255,255,255,0.7)',
  },
  inverse: {
    backgroundColor: '#ffffff',
    color: 'var(--color-primary)',
    border: 'none',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  danger: {
    backgroundColor: 'var(--color-danger)',
    color: '#ffffff',
    border: 'none',
  },
}

const SIZE_STYLES = {
  xs: { padding: '4px 12px',  fontSize: 'var(--font-size-xs)', borderRadius: 'var(--radius-sm)' },
  sm: { padding: '6px 16px',  fontSize: 'var(--font-size-sm)', borderRadius: 'var(--radius-md)' },
  md: { padding: '10px 24px', fontSize: 'var(--font-size-base)', borderRadius: 'var(--radius-md)' },
  lg: { padding: '14px 32px', fontSize: 'var(--font-size-lg)', borderRadius: 'var(--radius-md)' },
  xl: { padding: '18px 40px', fontSize: 'var(--font-size-xl)', borderRadius: 'var(--radius-lg)' },
}

export class ButtonController extends BaseController {
  tag = 'button'

  resolveBaseStyle(optionValues) {
    const variant = optionValues.variant ?? 'primary'
    const size    = optionValues.size    ?? 'md'

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'var(--font-weight-medium)',
      cursor: 'pointer',
      textDecoration: 'none',
      lineHeight: '1',
      whiteSpace: 'nowrap',
      ...(VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary),
      ...(SIZE_STYLES[size] ?? SIZE_STYLES.md),
    }
  }

  getHtmlTag(_node) {
    return 'button'
  }

  buildInnerHtml(node) {
    return node.content ?? 'Button'
  }
}
