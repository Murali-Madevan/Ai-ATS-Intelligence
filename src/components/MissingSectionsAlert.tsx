import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import type { MissingSection } from '@/utils/analysis/sectionDetector'

interface MissingSectionsAlertProps {
  sections: MissingSection[]
}

const severityConfig = {
  high: { icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/5', border: 'border-danger/20' },
  medium: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/5', border: 'border-warning/20' },
  low: { icon: Info, color: 'text-accent', bg: 'bg-accent/5', border: 'border-accent/20' },
}

export function MissingSectionsAlert({ sections }: MissingSectionsAlertProps) {
  if (!sections || sections.length === 0) return null
  const high = sections.filter(s => s.severity === 'high').length
  return (
    <div className="rounded-2xl border border-danger/20 bg-danger/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-danger" />
        <h4 className="text-sm font-semibold text-text">Missing Sections Detected</h4>
        <span className="rounded-md bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">{high} critical</span>
      </div>
      <div className="space-y-2">
        {sections.map((s, i) => {
          const cfg = severityConfig[s.severity]
          const Icon = cfg.icon
          return (
            <motion.div
              key={s.section}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-start gap-3 rounded-xl border p-3 ${cfg.bg} ${cfg.border}`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.color}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text">{s.section}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${cfg.color} ${cfg.bg}`}>{s.severity}</span>
                </div>
                <p className="mt-0.5 text-xs text-text-secondary">{s.suggestion}</p>
                <p className="mt-0.5 text-[11px] text-primary">Expected ATS improvement: +{s.expectedScoreGain}%</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
