import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Task, Note } from '../../lib/types'

interface Props {
  task: Task
  userId: string
  onOpenChat: (task: Task) => void
}

export function TaskDetail({ task, userId, onOpenChat }: Props) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('notes')
      .select('*')
      .eq('task_id', task.id)
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotes(data ?? []))
  }, [task.id, userId])

  async function handleAddNote(e: FormEvent) {
    e.preventDefault()
    if (!newNote.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('notes')
      .insert({ task_id: task.id, author_id: userId, content: newNote.trim() })
      .select()
      .single()
    if (!error && data) {
      setNotes(prev => [data, ...prev])
      setNewNote('')
    }
    setSaving(false)
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{task.title}</h2>
        <button
          onClick={() => onOpenChat(task)}
          style={{
            background: '#6366f1', color: '#fff', border: 'none',
            borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
          }}
        >
          Claude'a Sor
        </button>
      </div>

      {task.description && (
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{task.description}</p>
      )}

      <div>
        <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Notlarım
        </p>
        <form onSubmit={handleAddNote} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Not ekle..."
            style={{
              flex: 1, padding: '9px 12px', borderRadius: 8,
              border: '1px solid #e2e8f0', fontSize: 14,
            }}
          />
          <button type="submit" disabled={saving || !newNote.trim()} style={{
            padding: '9px 18px', background: '#1e293b', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>
            {saving ? '...' : 'Ekle'}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8' }}>Henüz not yok.</p>}
          {notes.map(note => (
            <div key={note.id} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
              <p style={{ margin: '0 0 4px', fontSize: 14, color: '#1e293b', lineHeight: 1.5 }}>{note.content}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                {new Date(note.created_at).toLocaleString('tr-TR')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
