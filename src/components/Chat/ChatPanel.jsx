import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../../store/appStore'
import { callAI, parseAIResponse, buildMessages, BASE_SYSTEM_PROMPT } from '../../services/ai/aiService'
import { createTree, createNode, updateTree } from '../../services/firestore'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

const RUNG1_PROMPT = `${BASE_SYSTEM_PROMPT}

RUNG 1 — Frame the Problem. Evaluate the user's description:
- If vague or only one idea: gently prompt for more with warm curiosity.
- If sufficient: reformulate as a "How might I..." problem statement.

Respond ONLY with valid JSON (no other text):
{"type":"depth_prompt","message":"Your warm 1-2 sentence question"}
OR
{"type":"statement","message":"Your 1-2 sentence warm validation","statement":"How might I..."}`

const rung2Prompt = (stmt) => `${BASE_SYSTEM_PROMPT}

RUNG 2 — Explore Outcomes. Problem: "${stmt}"
Evaluate the user's description of what having this resolved would look/feel like:
- If only one idea or vague: gently prompt for more.
- If sufficient: generate exactly 3 distinct outcome options (5-10 words each, phrased as a benefit or state).

Respond ONLY with valid JSON:
{"type":"depth_prompt","message":"Your warm question"}
OR
{"type":"options","message":"Your warm 1-2 sentence intro","options":[{"id":1,"label":"..."},{"id":2,"label":"..."},{"id":3,"label":"..."}]}`

const rung3Prompt = (stmt, outcome) => `${BASE_SYSTEM_PROMPT}

RUNG 3 — Generate Actions. Problem: "${stmt}" | Outcome: "${outcome}"
Evaluate the user's ideas for how they might achieve this outcome:
- If only one idea or vague: gently prompt for more.
- If sufficient: surface 3-5 concrete, small, low-risk action experiments.

Respond ONLY with valid JSON:
{"type":"depth_prompt","message":"Your warm question"}
OR
{"type":"actions","message":"Your warm closing 1-2 sentences","actions":[{"id":1,"label":"..."},{"id":2,"label":"..."},{"id":3,"label":"..."}]}`

const RUNG_LABELS = {
  rung1: 'Rung 1 — Frame the Problem',
  rung1_confirm: 'Rung 1 — Confirm Statement',
  rung2: 'Rung 2 — Explore Outcomes',
  rung2_select: 'Rung 2 — Choose an Outcome',
  rung3: 'Rung 3 — Generate Actions',
  complete: 'Complete',
}

export default function ChatPanel() {
  const uid = useAppStore(s => s.uid)
  const activeTreeId = useAppStore(s => s.activeTreeId)
  const activeProvider = useAppStore(s => s.activeProvider)
  const apiKeys = useAppStore(s => s.apiKeys)
  const setActiveTreeIdOnly = useAppStore(s => s.setActiveTreeIdOnly)
  const closeChat = useAppStore(s => s.closeChat)
  const setApiKey = useAppStore(s => s.setApiKey)

  const apiKey = apiKeys[activeProvider] || ''

  const [phase, setPhase] = useState('intro')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [pendingStatement, setPendingStatement] = useState(null)
  const [pendingOptions, setPendingOptions] = useState([])
  const [treeId, setTreeId] = useState(activeTreeId !== 'new' ? activeTreeId : null)
  const [rootNodeId, setRootNodeId] = useState(null)
  const [selectedRung2NodeId, setSelectedRung2NodeId] = useState(null)
  const [selectedOptionLabel, setSelectedOptionLabel] = useState(null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const messagesEndRef = useRef(null)

  const addAI = (content) => setMessages(prev => [...prev, { role: 'assistant', content }])
  const addUser = (content) => setMessages(prev => [...prev, { role: 'user', content }])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!apiKey) { setPhase('api_key_needed'); return }
    setPhase('rung1')
    addAI("Welcome! I'm here to help you work through what's on your mind using the Reframe Your Life approach.\n\nWhat's the problem or situation you'd like to explore today? Just describe it in your own words — there's no wrong answer.")
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(async (userInput) => {
    if (loading) return
    addUser(userInput)
    setLoading(true)
    try {
      const history = [...messages, { role: 'user', content: userInput }]
      const apiMessages = buildMessages(messages, userInput)

      if (phase === 'rung1') {
        const text = await callAI({ messages: apiMessages, systemPrompt: RUNG1_PROMPT, provider: activeProvider, apiKey })
        const parsed = parseAIResponse(text)
        if (parsed.type === 'statement') {
          addAI(`${parsed.message}\n\nHere's how I'd reframe that:\n\n"${parsed.statement}"\n\nDoes that capture it?`)
          setPendingStatement(parsed.statement)
          setPhase('rung1_confirm')
        } else {
          addAI(parsed.message || text)
        }

      } else if (phase === 'rung1_confirm') {
        const isYes = /yes|yeah|yep|looks good|correct|perfect|that'?s? it/i.test(userInput)
        if (isYes) {
          const newTreeId = await createTree(uid, pendingStatement)
          const rootNId = await createNode(uid, newTreeId, {
            treeId: newTreeId, parentId: null, rung: 1,
            questionStem: "What's the problem you'd like to reframe?",
            userRawResponse: messages.find(m => m.role === 'user')?.content || '',
            aiFormulation: pendingStatement,
            userNote: '', status: 'active', deepenedTreeId: null, children: [],
          })
          setTreeId(newTreeId)
          setRootNodeId(rootNId)
          setActiveTreeIdOnly(newTreeId)
          addAI("Wonderful — that's your foundation.\n\nNow, imagine this is fully resolved. What would you have, feel, or experience? Paint me a picture.")
          setPhase('rung2')
        } else {
          addAI("No problem at all. How would you describe it in your own words? Take another pass.")
          setPhase('rung1')
        }

      } else if (phase === 'rung2') {
        const text = await callAI({ messages: apiMessages, systemPrompt: rung2Prompt(pendingStatement), provider: activeProvider, apiKey })
        const parsed = parseAIResponse(text)
        if (parsed.type === 'options') {
          addAI(parsed.message || "Here are three possible outcomes I'm seeing:")
          setPendingOptions(parsed.options || [])
          setPhase('rung2_select')
        } else {
          addAI(parsed.message || text)
        }

      } else if (phase === 'rung3') {
        const text = await callAI({ messages: apiMessages, systemPrompt: rung3Prompt(pendingStatement, selectedOptionLabel), provider: activeProvider, apiKey })
        const parsed = parseAIResponse(text)
        if (parsed.type === 'actions') {
          for (const action of (parsed.actions || [])) {
            await createNode(uid, treeId, {
              treeId, parentId: selectedRung2NodeId, rung: 3,
              questionStem: `How might you achieve: ${selectedOptionLabel}?`,
              userRawResponse: userInput,
              aiFormulation: action.label,
              userNote: '', status: 'active', deepenedTreeId: null, children: [],
            })
          }
          await updateTree(uid, treeId, { conversationPhase: 'complete' })
          addAI(`${parsed.message || "Your tree is taking shape!"}\n\nTap any node to explore it, or use "Go Deeper" on any action to start a linked reframe.`)
          setPhase('complete')
        } else {
          addAI(parsed.message || text)
        }
      }
    } catch (err) {
      console.error(err)
      addAI("Something went wrong connecting to the AI. Please check your API key and try again.")
    } finally {
      setLoading(false)
    }
  }, [phase, messages, loading, uid, treeId, rootNodeId, pendingStatement, selectedOptionLabel, selectedRung2NodeId, activeProvider, apiKey, setActiveTreeIdOnly])

  const handleSelectOption = useCallback(async (option) => {
    if (loading) return
    setLoading(true)
    try {
      const rung2NodeId = await createNode(uid, treeId, {
        treeId, parentId: rootNodeId, rung: 2,
        questionStem: 'If this was fully resolved, what would you have, feel, or experience?',
        userRawResponse: messages.filter(m => m.role === 'user').pop()?.content || '',
        aiFormulation: option.label,
        userNote: '', status: 'active', deepenedTreeId: null, children: [],
      })
      for (const dormant of pendingOptions.filter(o => o.id !== option.id)) {
        await createNode(uid, treeId, {
          treeId, parentId: rootNodeId, rung: 2,
          questionStem: 'If this was fully resolved, what would you have, feel, or experience?',
          userRawResponse: '', aiFormulation: dormant.label,
          userNote: '', status: 'dormant', deepenedTreeId: null, children: [],
        })
      }
      setSelectedRung2NodeId(rung2NodeId)
      setSelectedOptionLabel(option.label)
      setPendingOptions([])
      addAI(`Great choice — "${option.label}" is your Rung 2 outcome.\n\nNow the real question: how might you actually get there? What ideas, experiments, or small steps come to mind?`)
      setPhase('rung3')
    } catch (err) {
      console.error(err)
      addAI("Something went wrong saving your choice. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [uid, treeId, rootNodeId, pendingOptions, messages, loading])

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) return
    setApiKey(activeProvider, apiKeyInput.trim())
    setApiKeyInput('')
    setPhase('rung1')
    addAI("Welcome! I'm here to help you work through what's on your mind using the Reframe Your Life approach.\n\nWhat's the problem or situation you'd like to explore today? Just describe it in your own words — there's no wrong answer.")
  }

  const rungLabel = RUNG_LABELS[phase] || 'Conversation'

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-raised">
        <span className="text-xs text-text-muted uppercase tracking-widest">{rungLabel}</span>
        <button onClick={closeChat} className="text-text-muted hover:text-text-primary text-lg leading-none">×</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
        {loading && <p className="text-text-muted text-sm animate-pulse px-2 mb-3">Thinking…</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom area */}
      <div className="px-4 pb-4 space-y-2">
        {phase === 'api_key_needed' && (
          <div className="space-y-2">
            <p className="text-xs text-text-muted">Enter your {activeProvider} API key to begin:</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="flex-1 bg-surface-raised text-text-primary placeholder-text-muted rounded-full px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-rung-2-active"
              />
              <button onClick={handleSaveApiKey} className="bg-rung-2-active text-white rounded-full px-5 py-3 text-sm font-medium">
                Save
              </button>
            </div>
          </div>
        )}

        {phase === 'rung1_confirm' && (
          <div className="flex gap-2">
            <button onClick={() => handleSend('yes')} disabled={loading}
              className="flex-1 py-3 bg-rung-2-active text-white rounded-full text-sm font-medium disabled:opacity-40">
              Yes, that's it ✓
            </button>
            <button onClick={() => handleSend('not quite')} disabled={loading}
              className="flex-1 py-3 bg-surface-raised text-text-muted rounded-full text-sm disabled:opacity-40">
              Not quite
            </button>
          </div>
        )}

        {phase === 'rung2_select' && pendingOptions.map(opt => (
          <button key={opt.id} onClick={() => handleSelectOption(opt)} disabled={loading}
            className="w-full text-left px-4 py-3 bg-surface-raised rounded-xl text-sm text-text-primary hover:opacity-80 transition-opacity disabled:opacity-40">
            {opt.id}. {opt.label}
          </button>
        ))}

        {phase === 'complete' && (
          <button onClick={closeChat}
            className="w-full py-3 bg-surface-raised text-text-muted rounded-full text-sm hover:opacity-80">
            View your tree →
          </button>
        )}

        {!['api_key_needed', 'rung1_confirm', 'rung2_select', 'complete'].includes(phase) && (
          <ChatInput onSend={handleSend} disabled={loading} />
        )}
      </div>
    </div>
  )
}
