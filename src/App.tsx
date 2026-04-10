import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/auth/LoginForm'
import { ManagerDashboard } from './pages/ManagerDashboard'
import { LearnerDashboard } from './pages/LearnerDashboard'

export default function App() {
  const { user, profile, loading, signIn, signOut } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Yükleniyor...</p>
      </div>
    )
  }

  if (!user || !profile) {
    return <LoginForm onSignIn={signIn} />
  }

  if (profile.role === 'manager') {
    return <ManagerDashboard profile={profile} onSignOut={signOut} />
  }

  return <LearnerDashboard profile={profile} onSignOut={signOut} />
}
