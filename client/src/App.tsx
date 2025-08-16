import { useEffect, useState } from 'react'
import './App.css'

type HealthResponse = {
  status: string
  uptimeSeconds: number
  timestamp: string
}

type Message = { id: number; text: string }

type MessagesResponse = { messages: Message[] }

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        const [healthRes, messagesRes] = await Promise.all([
          fetch('/api/health'),
          fetch('/api/messages')
        ])
        const healthJson: HealthResponse = await healthRes.json()
        const messagesJson: MessagesResponse = await messagesRes.json()
        setHealth(healthJson)
        setMessages(messagesJson.messages)
      } catch (err) {
        setError('Failed to load data')
      }
    }
    fetchData()
  }, [])

  const submitMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMessage })
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || 'Request failed')
      }
      const { message } = await res.json() as { message: Message }
      setMessages(prev => [...prev, message])
      setNewMessage("")
    } catch (err: any) {
      setError(err?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1>Server + Client GUI</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Health</h2>
        {health ? (
          <div>
            <div>Status: <strong>{health.status}</strong></div>
            <div>Uptime: <strong>{health.uptimeSeconds}s</strong></div>
            <div>Time: <strong>{new Date(health.timestamp).toLocaleString()}</strong></div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Messages</h2>
        <ul>
          {messages.map(m => (
            <li key={m.id}>{m.text}</li>
          ))}
        </ul>
        <form onSubmit={submitMessage} style={{ display: 'flex', gap: 8 }}>
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message"
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
        </form>
      </section>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}

export default App
