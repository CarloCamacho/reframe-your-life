export async function callAnthropic({ messages, systemPrompt, apiKey }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  })
  if (!res.ok) throw new Error(`Anthropic error ${res.status}`)
  const data = await res.json()
  return data.content[0].text
}
