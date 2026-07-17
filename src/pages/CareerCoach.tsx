import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageSquare, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { ChatMessage } from '@/types'

const suggestions = [
  'How do I improve my ATS score?',
  'Rewrite my professional summary',
  'What skills should I add for backend roles?',
  'How should I format my experience section?',
]

const chatResponses: Record<string, string> = {
  'Resume optimization tips': 'Start by adding quantifiable achievements to your experience section. Instead of "built APIs", write "built REST APIs serving 10K+ requests/sec". Also ensure you include keywords from the job description — especially technologies like FastAPI, Docker, and cloud platforms.',
  'Backend interview prep': 'Focus on system design, data structures, and your past projects. Be ready to discuss trade-offs (SQL vs NoSQL, monolithic vs microservices). Practice explaining your resume projects in the STAR format — Situation, Task, Action, Result.',
  'Skill gap analysis': 'Based on your resume, you have strong Python skills but are missing Docker and cloud deployment experience. These are critical for most backend roles in 2026. I recommend building a project that uses Docker Compose and deploying it to AWS or GCP.',
  'Salary negotiation advice': 'Research market rates on Levels.fyi and Glassdoor before negotiating. When you receive an offer, thank them enthusiastically, then ask for 24-48 hours to review. Counter with a specific number based on your research, not a range.',
}

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hi! I'm your AI career coach. I can help you optimize your resume, prepare for interviews, and plan your career growth. What would you like help with?",
    timestamp: new Date(),
  },
]

export default function CareerCoach() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [chatHistory, setChatHistory] = useState([
    'Resume optimization tips',
    'Backend interview prep',
    'Skill gap analysis',
    'Salary negotiation advice',
  ])
  const endRef = useRef<HTMLDivElement>(null)
  const msgCounterRef = useRef(0)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function addMessage(role: 'user' | 'assistant', content: string) {
    msgCounterRef.current++
    const msg: ChatMessage = {
      id: Date.now().toString() + msgCounterRef.current.toString(),
      role,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, msg])
  }

  function handleSend() {
    if (!input.trim()) return
    const userText = input.trim()
    addMessage('user', userText)
    setInput('')

    setTimeout(() => {
      const response = Object.entries(chatResponses).find(([key]) =>
        userText.toLowerCase().includes(key.toLowerCase().slice(0, 10))
      )
      addMessage(
        'assistant',
        response
          ? response[1]
          : "Great question! Based on your profile, I recommend focusing on cloud-native technologies and system design. Adding hands-on projects with Docker, Kubernetes, and AWS will significantly strengthen your resume. Would you like me to suggest specific project ideas?"
      )
    }, 600)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleHistoryClick(topic: string) {
    addMessage('user', topic)
    setTimeout(() => {
      const response = chatResponses[topic] || "I'll help you with that! Let me share some insights based on your request."
      addMessage('assistant', response)
    }, 600)
  }

  function handleClearChat() {
    setMessages(initialMessages)
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      <div className="hidden w-64 shrink-0 flex-col gap-2 md:flex">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-semibold text-text-secondary">Chat History</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClearChat} aria-label="Clear chat">
            <Trash2 className="h-3 w-3 text-text-secondary" />
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          {chatHistory.map((item) => (
            <button
              key={item}
              onClick={() => handleHistoryClick(item)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text"
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate">{item}</span>
            </button>
          ))}
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-text-secondary transition-colors hover:border-primary hover:text-primary"
              >
                <Sparkles className="h-3 w-3" />
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-secondary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <Button onClick={handleSend} size="icon" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
