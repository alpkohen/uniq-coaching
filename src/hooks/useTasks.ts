import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Task, TaskStatus } from '../lib/types'

export function useTasks(userId: string, role: 'manager' | 'learner') {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [userId, role])

  async function fetchTasks() {
    setLoading(true)
    const query = supabase.from('tasks').select('*').order('created_at', { ascending: false })

    if (role === 'learner') {
      query.eq('assigned_to', userId)
    } else {
      query.eq('created_by', userId)
    }

    const { data } = await query
    setTasks(data ?? [])
    setLoading(false)
  }

  async function createTask(title: string, description: string, assignedTo: string, dueDate?: string) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, description, created_by: userId, assigned_to: assignedTo, due_date: dueDate ?? null })
      .select()
      .single()
    if (!error && data) setTasks(prev => [data, ...prev])
    return { error }
  }

  async function updateStatus(taskId: string, status: TaskStatus) {
    const { error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)
    if (!error) setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
    return { error }
  }

  return { tasks, loading, createTask, updateStatus, refetch: fetchTasks }
}
