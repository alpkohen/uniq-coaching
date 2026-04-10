import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ChatSession, ChatMessage, Profile } from '../../lib/types'

interface Props {
  learners: Profile[]
}

export function ChatLogViewer({ learners }: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selected, setSelected] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    if (learners.length === 0) return
    const ids = learners.map(l => l.id)
    supabase
      .from('chat_sessions')
      .select('*')
      .in('user_id', ids)
      .order('created_at', { ascending: false })
      .then(({ data }) => setSessions(data ?? []))
  }, [learners])

  async function openSession(session: ChatSession) {
    setSelected(session)
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
  }

  function learnerName(userId: string) {
    return learners.find(l => l.id === userId)?.full_name ?? userId
  }

  return (
    <div style={{ display: 'flex', gap: 20, height: 460 }}>
      <div style={{ width: 240, overflowY: 'auto', borderRight: '1px solid #e2e8f0', paddingRight: 16 }}>
        <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Sohbetler
        </p>
        {sessions.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8' }}>Henüz sohbet yok.</p>}
        {sessions.map(s => (
          <button
            key={s.id}
            onClick={() => openSession(s)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px',
              background: selected?.id === s.id ? '#f1f5f9' : 'none',
              border: 'none', borderRadius: 7, cursor: 'pointer', marginBottom: 4,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', marginBottom: 2 }}>{s.title}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{learnerName(s.user_id)}</div>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!selected && (
          <p style={{ margin: 'auto', color: '#94a3b8', fontSize: 14 }}>Sol taraftan bir sohbet seçin.</p>
        )}
        {selected && messages.map(msg => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? '#1e293b' : '#f1f5f9',
              color: msg.role === 'user' ? '#fff' : '#1e293b',
              padding: '10px 14px', borderRadius: 10, maxWidth: '75%', fontSize: 14, lineHeight: 1.5,
            }}
          >
            {msg.content}
          </div>
        ))}
      </div>
    </div>
  )
}
