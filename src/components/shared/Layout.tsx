import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Profile } from '../../lib/types'

interface Props {
  profile: Profile
  onSignOut: () => void
  children: ReactNode
}

export function Layout({ profile, onSignOut, children }: Props) {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <nav style={{
        background: '#1e293b',
        color: '#fff',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
        >
          UNIQ Coaching
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>
            {profile.full_name} · {profile.role === 'manager' ? 'Yönetici' : 'Öğrenen'}
          </span>
          <button
            onClick={onSignOut}
            style={{
              background: 'none', border: '1px solid #475569',
              color: '#cbd5e1', padding: '6px 14px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13,
            }}
          >
            Çıkış
          </button>
        </div>
      </nav>
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  )
}
