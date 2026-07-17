import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Sparkles, Hash } from 'lucide-react'
import type { StyleAnalysis as StyleAnalysisType } from '@/types'

interface StyleAnalysisProps {
  data: StyleAnalysisType
}

export function StyleAnalysis({ data }: StyleAnalysisProps) {
  return (
    <div className="space-y-5">
      {/* Voice */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
      >
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${data.voice.pass ? 'bg-success/10' : 'bg-amber/10'}`}>
          <Sparkles className={`h-4 w-4 ${data.voice.pass ? 'text-success' : 'text-amber'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-text">Voice</h4>
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${data.voice.pass ? 'bg-success/10 text-success' : 'bg-amber/10 text-amber'}`}>
              {data.voice.pass ? 'PASS' : 'NEEDS WORK'}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-text-secondary">{data.voice.detail}</p>
          <p className="mt-1.5 text-xs text-text-secondary">The tone of the job description emphasizes</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {data.voice.tones.map((tone) => (
              <span
                key={tone}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
              >
                <Hash className="h-3 w-3" />
                {tone}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Buzzwords & Clichés */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
      >
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${data.buzzwords.pass ? 'bg-success/10' : 'bg-amber/10'}`}>
          <Hash className={`h-4 w-4 ${data.buzzwords.pass ? 'text-success' : 'text-amber'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-text">Buzzwords & Clichés</h4>
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${data.buzzwords.pass ? 'bg-success/10 text-success' : 'bg-amber/10 text-amber'}`}>
              {data.buzzwords.pass ? 'PASS' : `${data.buzzwords.suggestions.length} suggestion${data.buzzwords.suggestions.length !== 1 ? 's' : ''}`}
            </span>
          </div>
          {data.buzzwords.suggestions.map((s, i) => (
            <div key={i} className="mt-2 space-y-1.5">
              <p className="text-sm leading-relaxed text-text">{s.text}</p>
              <div className="flex items-start gap-1.5 rounded-lg bg-success/5 p-2.5">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                <div>
                  <p className="text-xs leading-relaxed text-text-secondary">{s.fix}</p>
                  <p className="mt-0.5 text-[11px] text-text-secondary">{s.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
