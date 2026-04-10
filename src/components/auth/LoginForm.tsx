import { FormEvent, useState } from 'react'

interface Props {
  onSignIn: (email: string, password: string) => Promise<{ error: unknown }>
}

export function LoginForm({ onSignIn }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await onSignIn(email, password)
    if (error) setError('E-posta veya şifre hatalı.')
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f9fafb',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: '100%', maxWidth: 380,
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>
          UNIQ Coaching
        </h1>
        <p style={{ margin: '0 0 28px', color: '#64748b', fontSize: 14 }}>
          Hesabınıza giriş yapın
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="ornek@email.com"
            />
          </div>
          <div>
            <label style={labelStyle}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ margin: 0, color: '#ef4444', fontSize: 13 }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 6, fontSize: 13,
  fontWeight: 500, color: '#374151',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box',
  outline: 'none',
}

const btnStyle: React.CSSProperties = {
  padding: '11px', background: '#1e293b', color: '#fff',
  border: 'none', borderRadius: 8, fontSize: 14,
  fontWeight: 600, cursor: 'pointer', marginTop: 4,
}
