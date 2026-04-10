import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UNIQ Coaching render error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, background: '#f9fafb', fontFamily: 'system-ui, sans-serif',
        }}
        >
          <div style={{ maxWidth: 480, background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
            <h1 style={{ margin: '0 0 12px', fontSize: 18, color: '#1e293b' }}>Sayfa yüklenemedi</h1>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 14, lineHeight: 1.55 }}>
              Arayüzde bir hata oluştu. Tarayıcı konsolunu (F12 → Console) açıp aşağıdaki mesajı veya kırmızı satırları kontrol edin.
            </p>
            <pre style={{
              margin: 0, padding: 12, background: '#f1f5f9', borderRadius: 8, fontSize: 12,
              overflow: 'auto', color: '#0f172a', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}
            >
              {this.state.error.message}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
