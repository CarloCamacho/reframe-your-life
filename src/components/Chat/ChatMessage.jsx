export default function ChatMessage({ message }) {
  const isAI = message.role === 'assistant'
  const paragraphs = message.content.split('\n').filter(p => p.trim())
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-3`}>
      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed space-y-1 ${
        isAI ? 'bg-surface-raised text-text-primary rounded-tl-sm' : 'bg-rung-2-active text-white rounded-tr-sm'
      }`}>
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  )
}
