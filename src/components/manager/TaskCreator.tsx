import { FormEvent, useState } from 'react'
import { Profile } from '../../lib/types'

interface Props {
  learners: Profile[]
  onCreate: (title: string, description: string, assignedTo: string, dueDate?: string) => Promise<{ error: unknown }>
}

export function TaskCreator({ learners, onCreate }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState(learners[0]?.id ?? '')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await onCreate(title, description, assignedTo, dueDate || undefined)
    if (!error) {
      setTitle('')
      setDescription('')
      setDueDate('')
      setOpen(false)
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={addBtnStyle}>
        + Yeni Görev
      </button>
    )
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 24, marginBottom: 24 }}>
      <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Yeni Görev Oluştur</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Başlık</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Açıklama</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Atanan Kişi</label>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} style={inputStyle}>
              {learners.map(l => (
                <option key={l.id} value={l.id}>{l.full_name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Son Tarih (opsiyonel)</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => setOpen(false)} style={cancelBtnStyle}>İptal</button>
          <button type="submit" disabled={loading} style={submitBtnStyle}>
            {loading ? 'Kaydediliyor...' : 'Oluştur'}
          </button>
        </div>
      </form>
    </div>
  )
}

const addBtnStyle: React.CSSProperties = {
  background: '#1e293b', color: '#fff', border: 'none',
  borderRadius: 8, padding: '10px 20px', fontSize: 14,
  fontWeight: 600, cursor: 'pointer', marginBottom: 24,
}
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500, color: '#374151' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 11px', borderRadius: 7, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }
const cancelBtnStyle: React.CSSProperties = { padding: '9px 18px', background: 'none', border: '1px solid #e2e8f0', borderRadius: 7, cursor: 'pointer', fontSize: 13 }
const submitBtnStyle: React.CSSProperties = { padding: '9px 20px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }
