import { useState } from 'react'

export default function ChatInput({ onSend, disabled, placeholder = 'Type your response…' }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim() || disabled) return
    onSend(value.trim())
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-surface-raised text-text-primary placeholder-text-muted rounded-full px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-rung-2-active"
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="bg-rung-2-active text-white rounded-full px-5 py-3 text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        Send
      </button>
    </form>
  )
}
