import { callAnthropic } from './anthropic'
import { callOpenAI } from './openai'
import { callGemini } from './gemini'

export const BASE_SYSTEM_PROMPT = `You are a warm, encouraging life design facilitator in the tradition of Stanford's Life Design Lab.
You guide users through the Reframe Your Life framework — moving from feeling stuck to having an actionable plan.
Keep messages short: 2-3 sentences, then structured output. Use plain, warm language. Frame everything as low-stakes experiments.`

export async function callAI({ messages, systemPrompt, provider, apiKey }) {
  switch (provider) {
    case 'openai': return callOpenAI({ messages, systemPrompt, apiKey })
    case 'gemini': return callGemini({ messages, systemPrompt, apiKey })
    default: return callAnthropic({ messages, systemPrompt, apiKey })
  }
}

export function parseAIResponse(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]) } catch { /* fall through */ }
  }
  return { type: 'message', message: text }
}

export function buildMessages(history, newUserMessage) {
  const all = [...history, { role: 'user', content: newUserMessage }]
  const firstUserIdx = all.findIndex(m => m.role === 'user')
  const sliced = all.slice(firstUserIdx).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }))
  // Merge consecutive same-role messages (Anthropic requires alternating)
  return sliced.reduce((acc, msg) => {
    if (acc.length && acc[acc.length - 1].role === msg.role) {
      acc[acc.length - 1].content += '\n' + msg.content
    } else {
      acc.push({ ...msg })
    }
    return acc
  }, [])
}
