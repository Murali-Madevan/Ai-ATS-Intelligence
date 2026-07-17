import { motion } from 'framer-motion'
import { Target, SpellCheck, AlertCircle, CheckCheck } from 'lucide-react'
import type { ContentAnalysis as ContentAnalysisType } from '@/types'

interface ContentAnalysisProps {
  data: ContentAnalysisType
}

export function ContentAnalysis({ data }: ContentAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* Measurable Results */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber/10">
            <Target className="h-3.5 w-3.5 text-amber" />
          </div>
          <h4 className="text-sm font-semibold text-text">Measurable Results</h4>
          <span className="rounded-md bg-amber/10 px-2 py-0.5 text-[11px] font-medium text-amber">
            {data.measurableResults.length} suggestion{data.measurableResults.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="space-y-2">
          {data.measurableResults.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-border bg-card p-4 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm leading-relaxed text-text">{item.text}</p>
                  <div className="flex items-start gap-2 rounded-lg bg-success/5 p-2.5">
                    <CheckCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    <p className="text-xs leading-relaxed text-text-secondary">{item.fix}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Spelling & Grammar */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger/10">
            <SpellCheck className="h-3.5 w-3.5 text-danger" />
          </div>
          <h4 className="text-sm font-semibold text-text">Spelling & Grammar</h4>
          <span className="rounded-md bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger">
            {data.spellingGrammar.length} suggestion{data.spellingGrammar.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="space-y-2">
          {data.spellingGrammar.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-border bg-card p-4 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm leading-relaxed text-text">{item.text}</p>
                  <div className="rounded-lg bg-surface p-2.5">
                    <p className="text-xs font-medium text-text">
                      <span className="text-danger line-through">{item.text}</span>
                    </p>
                    <p className="mt-1 text-xs text-success">{item.fix}</p>
                    <p className="mt-0.5 text-[11px] text-text-secondary">{item.reason}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
