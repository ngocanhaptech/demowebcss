import { Component } from 'react'

/**
 * ErrorBoundary – bắt lỗi runtime trong cây component con.
 * Ngăn toàn bộ ứng dụng crash trắng màn hình.
 *
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để lần render tiếp theo hiển thị fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Ghi log lỗi ra console hoặc gửi đến dịch vụ theo dõi (nếu có)
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    // Nếu có callback onReset từ props, gọi nó
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI khi có lỗi
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.icon}>⚠️</div>
            <h2 style={styles.title}>Đã xảy ra lỗi không mong muốn</h2>
            <p style={styles.message}>
              Ứng dụng gặp sự cố. Vui lòng thử tải lại trang hoặc nhấn nút bên dưới.
            </p>

            {this.props.showDetails !== false && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Chi tiết kỹ thuật</summary>
                <pre style={styles.pre}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={styles.actions}>
              <button style={styles.button} onClick={this.handleReset}>
                Thử lại
              </button>
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={() => window.location.reload()}
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Không có lỗi – render children bình thường
    return this.props.children
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: 20,
  },
  card: {
    maxWidth: 600,
    width: '100%',
    background: '#ffffff',
    borderRadius: 16,
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
    padding: 32,
    textAlign: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 1.6,
    marginBottom: 24,
  },
  details: {
    textAlign: 'left',
    marginTop: 16,
    marginBottom: 24,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 16,
  },
  summary: {
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: '#475569',
    marginBottom: 8,
  },
  pre: {
    background: '#1e293b',
    color: '#e2e8f0',
    padding: 12,
    borderRadius: 8,
    fontSize: 11,
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxHeight: 200,
    overflowY: 'auto',
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: '#ffffff',
    background: '#2563eb',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  },
  buttonSecondary: {
    background: '#f1f5f9',
    color: '#475569',
  },
}