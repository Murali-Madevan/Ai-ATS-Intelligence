import { motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { SectionsAnalysis as SectionsAnalysisType } from '@/types'

interface SectionsAnalysisProps {
  data: SectionsAnalysisType
}

export function SectionsAnalysis({ data }: SectionsAnalysisProps) {
  const present = data.sections.filter((s) => s.present).length
  const missing = data.sections.filter((s) => !s.present).length

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span className="flex items-center gap-1 text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {present} found
          </span>
          <span className="mx-1 text-border">|</span>
          <span className="flex items-center gap-1 text-danger">
            <XCircle className="h-3.5 w-3.5" />
            {missing} missing
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {data.sections.map((section, i) => (
          <motion.div
            key={section.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-start gap-3 rounded-xl border p-3.5 shadow-xs transition-all ${
              section.present
                ? 'border-border bg-card'
                : 'border-danger/20 bg-danger/5'
            }`}
          >
            <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${section.present ? 'bg-success/10' : 'bg-danger/10'}`}>
              {section.present ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-danger" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${section.present ? 'text-text' : 'text-danger'}`}>
                  {section.name}
                </span>
                {!section.present && (
                  <span className="rounded-md bg-danger/10 px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                    MISSING
                  </span>
                )}
              </div>
              {section.value && (
                <p className="mt-0.5 truncate text-xs text-text-secondary">{section.value}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
