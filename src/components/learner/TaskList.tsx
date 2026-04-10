import { Task, TaskStatus } from '../../lib/types'

interface Props {
  tasks: Task[]
  selectedId: string | null
  onSelect: (task: Task) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
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

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: null,
}

export function TaskList({ tasks, selectedId, onSelect, onStatusChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {tasks.length === 0 && (
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Henüz görev atanmamış.</p>
      )}
      {tasks.map(task => (
        <div
          key={task.id}
          onClick={() => onSelect(task)}
          style={{
            background: '#fff',
            border: `1px solid ${selectedId === task.id ? '#1e293b' : '#e2e8f0'}`,
            borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
            transition: 'border-color .15s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{task.title}</p>
              {task.due_date && (
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Son: {task.due_date}</p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{
                fontSize: 11, padding: '3px 9px', borderRadius: 99,
                background: STATUS_COLOR[task.status] + '20',
                color: STATUS_COLOR[task.status], fontWeight: 600,
              }}>
                {STATUS_LABEL[task.status]}
              </span>
              {NEXT_STATUS[task.status] && (
                <button
                  onClick={e => { e.stopPropagation(); onStatusChange(task.id, NEXT_STATUS[task.status]!) }}
                  style={{
                    fontSize: 11, padding: '3px 9px', borderRadius: 99,
                    background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#475569',
                  }}
                >
                  {task.status === 'pending' ? 'Başlat' : 'Tamamla'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
