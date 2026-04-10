import Anthropic from '@anthropic-ai/sdk'
import { Handler } from '@netlify/functions'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface MessageParam {
  role: 'user' | 'assistant'
  content: string
}

interface TaskContext {
  title: string
  description: string
  notes: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let messages: MessageParam[]
  let taskContext: TaskContext | undefined

  try {
    const body = JSON.parse(event.body ?? '{}')
    messages = body.messages
    taskContext = body.taskContext
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const systemPrompt = taskContext
    ? `Sen UNIQ Coaching platformunda bir koçluk asistanısın. Kullanıcı aşağıdaki görev üzerinde çalışıyor:

Görev: ${taskContext.title}
Açıklama: ${taskContext.description}
${taskContext.notes ? `Kullanıcının notları:\n${taskContext.notes}` : ''}

Kullanıcıya bu görevle ilgili rehberlik et. Kısa, pratik ve destekleyici ol.`
    : 'Sen UNIQ Coaching platformunda bir koçluk asistanısın. Kullanıcıya kariyer ve öğrenme konularında yardımcı ol. Kısa, pratik ve destekleyici ol.'

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  const content = response.content[0].type === 'text' ? response.content[0].text : ''

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  }
}
