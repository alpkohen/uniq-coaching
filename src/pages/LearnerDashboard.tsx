import { useState } from 'react'
import { Profile, Task } from '../lib/types'
import { useTasks } from '../hooks/useTasks'
import { Layout } from '../components/shared/Layout'
import { TaskList } from '../components/learner/TaskList'
import { TaskDetail } from '../components/learner/TaskDetail'
import { ChatInterface } from '../components/learner/ChatInterface'

interface Props {
  profile: Profile
  onSignOut: () => void
}

export function LearnerDashboard({ profile, onSignOut }: Props) {
  const { tasks, loading, updateStatus } = useTasks(profile.id, 'learner')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [chatTask, setChatTask] = useState<Task | null | undefined>(undefined) // undefined = closed

  return (
    <Layout profile={profile} onSignOut={onSignOut}>
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sol: Task listesi */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Görevlerim</h2>
            <button
              onClick={() => setChatTask(null)}
              style={{
                background: '#6366f1', color: '#fff', border: 'none',
                borderRadius: 7, padding: '7px 14px', cursor: 'pointer',
                fontSize: 12, fontWeight: 600,
              }}
            >
              Claude'a Sor
            </button>
          </div>
          {loading
            ? <p style={{ color: '#94a3b8', fontSize: 14 }}>Yükleniyor...</p>
            : (
              <TaskList
                tasks={tasks}
                selectedId={selectedTask?.id ?? null}
                onSelect={setSelectedTask}
                onStatusChange={updateStatus}
              />
            )
          }
        </div>

        {/* Sağ: Task detayı */}
        <div style={{ flex: 1 }}>
          {selectedTask
            ? (
              <TaskDetail
                task={selectedTask}
                userId={profile.id}
                onOpenChat={(task) => setChatTask(task)}
              />
            )
            : (
              <div style={{
                height: 200, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#94a3b8', fontSize: 14,
              }}>
                Sol taraftan bir görev seçin.
              </div>
            )
          }
        </div>
      </div>

      {/* Chat overlay */}
      {chatTask !== undefined && (
        <ChatInterface
          userId={profile.id}
          activeTask={chatTask}
          onClose={() => setChatTask(undefined)}
        />
      )}
    </Layout>
  )
}
