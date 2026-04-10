import { FormEvent, useEffect, useRef, useState } from 'react'
import { Task, Note } from '../../lib/types'
import { useChat } from '../../hooks/useChat'
import { supabase } from '../../lib/supabase'

interface Props {
  userId: string
  activeTask?: Task | null
  onClose: () => void
}

export function ChatInterface({ userId, activeTask, onClose }: Props) {
  const { sessions, activeSession, messages, sending, startSession, sendMessage, setActiveSession } = useChat(userId)
  const [input, setInput] = useState('')
  const [taskNotes, setTaskNotes] = useState<Note[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!activeTask) return
    supabase
      .from('notes')
      .select('*')
      .eq('task_id', activeTask.id)
      .eq('author_id', userId)
      .then(({ data }) => setTaskNotes(data ?? []))
  }, [activeTask?.id, userId])

  async function handleStart() {
    await startSession(activeTask?.id)
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    const content = input
    setInput('')

    const context = activeTask ? {
      title: activeTask.title,
      description: activeTask.description,
      notes: taskNotes.map(n => n.content).join('\n'),
    } : undefined

    await sendMessage(content, context)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
      padding: 24, zIndex: 100,
    }}>
      <div style={{
        width: 420, height: '80vh', background: '#fff', borderRadius: 14,
        display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,.2)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Claude ile Sohbet</p>
            {activeTask && <p style={{ margin: 0, fontSize: 12, color: '#6366f1' }}>Bağlam: {activeTask.title}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8' }}>×</button>
        </div>

        {/* Session list or messages */}
        {!activeSession ? (
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            <button onClick={handleStart} style={{
              width: '100%', padding: '12px', background: '#6366f1', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 16,
            }}>
              Yeni Sohbet Başlat
            </button>
            {sessions.length > 0 && (
              <>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 10px' }}>Geçmiş Sohbetler</p>
                {sessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSession(s)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px',
                      background: '#f8fafc', border: 'none', borderRadius: 7,
                      cursor: 'pointer', marginBottom: 6, fontSize: 13, color: '#1e293b',
                    }}
                  >
                    {s.title}
                  </button>
                ))}
              </>
            )}
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => setActiveSession(null)}
                style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#94a3b8', padding: 0, marginBottom: 4 }}
              >
                ← Sohbetler
              </button>
              {messages.length === 0 && (
                <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', margin: 'auto' }}>
                  {activeTask ? `"${activeTask.title}" görevi hakkında soru sorabilirsin.` : 'Bir soru sor.'}
                </p>
              )}
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.role === 'user' ? '#6366f1' : '#f1f5f9',
                    color: msg.role === 'user' ? '#fff' : '#1e293b',
                    padding: '10px 14px', borderRadius: 10,
                    maxWidth: '80%', fontSize: 14, lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              ))}
              {sending && (
                <div style={{ alignSelf: 'flex-start', background: '#f1f5f9', padding: '10px 14px', borderRadius: 10, fontSize: 13, color: '#94a3b8' }}>
                  Yanıt yazılıyor...
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Mesajını yaz..."
                disabled={sending}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
                }}
              />
              <button type="submit" disabled={!input.trim() || sending} style={{
                padding: '10px 18px', background: '#6366f1', color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
              }}>
                Gönder
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
