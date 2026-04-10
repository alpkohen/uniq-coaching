import { useEffect, useState } from 'react'
import { Profile, Note } from '../lib/types'
import { supabase } from '../lib/supabase'
import { useTasks } from '../hooks/useTasks'
import { Layout } from '../components/shared/Layout'
import { TaskCreator } from '../components/manager/TaskCreator'
import { LearnerOverview } from '../components/manager/LearnerOverview'
import { ChatLogViewer } from '../components/manager/ChatLogViewer'

type Tab = 'tasks' | 'chat'

interface Props {
  profile: Profile
  onSignOut: () => void
}

export function ManagerDashboard({ profile, onSignOut }: Props) {
  const [tab, setTab] = useState<Tab>('tasks')
  const [learners, setLearners] = useState<Profile[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const { tasks, loading, createTask } = useTasks(profile.id, 'manager')

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'learner').then(({ data }) => setLearners(data ?? []))
    supabase.from('notes').select('*').order('created_at', { ascending: false }).then(({ data }) => setNotes(data ?? []))
  }, [])

  return (
    <Layout profile={profile} onSignOut={onSignOut}>
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid #e2e8f0' }}>
        {(['tasks', 'chat'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 22px', background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t ? '#1e293b' : 'transparent'}`,
              color: tab === t ? '#1e293b' : '#64748b',
              cursor: 'pointer', fontSize: 14, fontWeight: tab === t ? 600 : 400,
              marginBottom: -1,
            }}
          >
            {t === 'tasks' ? 'Görevler' : 'Chat Logları'}
          </button>
        ))}
      </div>

      {tab === 'tasks' && (
        <>
          <TaskCreator learners={learners} onCreate={createTask} />
          {loading
            ? <p style={{ color: '#94a3b8' }}>Yükleniyor...</p>
            : <LearnerOverview learners={learners} tasks={tasks} notes={notes} />
          }
        </>
      )}

      {tab === 'chat' && (
        <ChatLogViewer learners={learners} />
      )}
    </Layout>
  )
}
