import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lightbulb, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'

const priorityColors: Record<string, string> = {
  high: '#F43F5E',
  medium: '#F59E0B',
  low: '#0EA5E9',
}

export function SuggestionsPanel() {
  const navigate = useNavigate()
  const { analysisResult } = useApp()
  const data = analysisResult
  if (!data) return null

  const suggestions = [
    ...data.keywordMatch.missing.slice(0, 3).map(sk => ({
      text: `Add ${sk} to improve keyword match`,
      priority: 'high' as const,
    })),
    ...data.improvements.map(text => ({
      text,
      priority: (text.toLowerCase().includes('metric') || text.toLowerCase().includes('keyword')) ? 'high' as const : 'medium' as const,
    })),
  ]

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Sparkles className="mb-2 h-8 w-8 text-text-tertiary" />
        <p className="text-sm text-text-secondary">No specific suggestions yet. Analyze your resume first.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/')}>
          Analyze Resume
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {suggestions.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 shadow-xs transition-all duration-200 hover:border-primary/20 hover:shadow-sm cursor-pointer"
          onClick={() => navigate('/resume')}
        >
          <div
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
            style={{ background: `${priorityColors[s.priority]}15`, color: priorityColors[s.priority] }}
          >
            <Lightbulb className="h-3.5 w-3.5" />
          </div>
          <p className="flex-1 text-sm leading-relaxed text-text">{s.text}</p>
          <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-secondary opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
        </motion.div>
      ))}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Button variant="ghost" size="sm" className="mt-2 w-full text-xs text-primary" onClick={() => navigate('/resume')}>
          Optimize resume
        </Button>
      </motion.div>
    </div>
  )
}
