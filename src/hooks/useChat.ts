import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ChatSession, ChatMessage } from '../lib/types'

export function useChat(userId: string) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [userId])

  useEffect(() => {
    if (activeSession) fetchMessages(activeSession.id)
  }, [activeSession])

  async function fetchSessions() {
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setSessions(data ?? [])
  }

  async function fetchMessages(sessionId: string) {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
  }

  async function startSession(taskId?: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: userId, task_id: taskId ?? null, title: 'Yeni sohbet' })
      .select()
      .single()
    if (!error && data) {
      setSessions(prev => [data, ...prev])
      setActiveSession(data)
      setMessages([])
    }
    return { error }
  }

  async function sendMessage(content: string, taskContext?: { title: string; description: string; notes: string }) {
    if (!activeSession) return { error: new Error('Aktif oturum yok') }
    setSending(true)

    // Kullanıcı mesajını kaydet
    const { data: userMsg, error: insertError } = await supabase
      .from('chat_messages')
      .insert({ session_id: activeSession.id, role: 'user', content })
      .select()
      .single()

    if (insertError || !userMsg) {
      setSending(false)
      return { error: insertError }
    }

    setMessages(prev => [...prev, userMsg])

    // İlk mesajsa session başlığını güncelle
    if (messages.length === 0) {
      const title = content.slice(0, 60)
      await supabase.from('chat_sessions').update({ title }).eq('id', activeSession.id)
      setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, title } : s))
    }

    // Claude API'ye gönder
    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

    const res = await fetch('/.netlify/functions/claude-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history, taskContext }),
    })

    const json = await res.json()
    const assistantContent: string = json.content ?? 'Bir hata oluştu.'

    const { data: assistantMsg } = await supabase
      .from('chat_messages')
      .insert({ session_id: activeSession.id, role: 'assistant', content: assistantContent })
      .select()
      .single()

    if (assistantMsg) setMessages(prev => [...prev, assistantMsg])
    setSending(false)
    return { error: null }
  }

  return { sessions, activeSession, messages, sending, startSession, sendMessage, setActiveSession }
}
