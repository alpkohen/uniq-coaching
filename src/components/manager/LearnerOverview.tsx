import { Task, Note, Profile } from '../../lib/types'

interface Props {
  learners: Profile[]
  tasks: Task[]
  notes: Note[]
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Bekliyor',
  in_progress: 'Devam Ediyor',
  completed: 'Tamamlandı',
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  completed: '#10b981',
}

export function LearnerOverview({ learners, tasks, notes }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {learners.map(learner => {
        const learnerTasks = tasks.filter(t => t.assigned_to === learner.id)
        return (
          <div key={learner.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{learner.full_name}</h3>
            {learnerTasks.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8' }}>Henüz görev yok.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {learnerTasks.map(task => {
                const taskNotes = notes.filter(n => n.task_id === task.id)
                return (
                  <div key={task.id} style={{ borderLeft: `3px solid ${STATUS_COLOR[task.status]}`, paddingLeft: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{task.title}</span>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 99,
                        background: STATUS_COLOR[task.status] + '20',
                        color: STATUS_COLOR[task.status], fontWeight: 600,
                      }}>
                        {STATUS_LABEL[task.status]}
                      </span>
                    </div>
                    {task.description && (
                      <p style={{ margin: '0 0 8px', fontSize: 13, color: '#64748b' }}>{task.description}</p>
                    )}
                    {taskNotes.length > 0 && (
                      <div style={{ background: '#f8fafc', borderRadius: 7, padding: '10px 14px' }}>
                        <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Notlar</p>
                        {taskNotes.map(note => (
                          <p key={note.id} style={{ margin: '0 0 4px', fontSize: 13, color: '#334155' }}>{note.content}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
