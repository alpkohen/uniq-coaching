export type Role = 'manager' | 'learner'
export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type MessageRole = 'user' | 'assistant'

export interface Profile {
  id: string
  role: Role
  full_name: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  created_by: string
  assigned_to: string
  status: TaskStatus
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  task_id: string
  author_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  task_id: string | null
  title: string
  created_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: MessageRole
  content: string
  created_at: string
}
