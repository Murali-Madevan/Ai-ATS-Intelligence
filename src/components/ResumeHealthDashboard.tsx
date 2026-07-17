import { motion } from 'framer-motion'
import type { HealthScore } from '@/types/resume'

interface ResumeHealthDashboardProps {
  health: Record<string, HealthScore>
}

const statusColors = {
  healthy: { bg: 'bg-success/10', text: 'text-success', bar: '#22C55E' },
  moderate: { bg: 'bg-warning/10', text: 'text-warning', bar: '#F59E0B' },
  critical: { bg: 'bg-danger/10', text: 'text-danger', bar: '#F43F5E' },
}

export function ResumeHealthDashboard({ health }: ResumeHealthDashboardProps) {
  const items = Object.entries(health)
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(([key, h], i) => {
        const colors = statusColors[h.status]
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="rounded-2xl border border-border bg-card p-4 shadow-xs"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className={`text-xs font-bold ${colors.text}`}>{h.score}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface">
              <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${h.score}%`, background: colors.bar }} />
            </div>
            <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors.bg} ${colors.text}`}>
              {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
