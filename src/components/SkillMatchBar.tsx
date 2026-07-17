import { motion } from 'framer-motion'

interface SkillData {
  skill: string
  status: 'matched' | 'partial' | 'missing'
  priority: 'high' | 'medium' | 'low'
  resource: string
}

interface SkillMatchBarProps {
  skills: SkillData[]
}

const statusConfig = {
  matched: { color: '#22C55E', bg: '#22C55E15', label: 'Matched' },
  partial: { color: '#F59E0B', bg: '#F59E0B15', label: 'Partial' },
  missing: { color: '#F43F5E', bg: '#F43F5E15', label: 'Missing' },
}

const priorityOrder = { high: 3, medium: 2, low: 1 }

export function SkillMatchBar({ skills }: SkillMatchBarProps) {
  const sorted = [...skills].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

  return (
    <div className="space-y-3">
      {sorted.map((s, i) => {
        const cfg = statusConfig[s.status]
        return (
          <motion.div
            key={s.skill}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text">{s.skill}</span>
                  <span
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <span className="text-xs text-text-secondary">{s.resource}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${cfg.color}, ${cfg.color}88)`,
                    width: s.status === 'matched' ? '100%' : s.status === 'partial' ? '50%' : '8%',
                  }}
                  initial={{ width: 0 }}
                  animate={{
                    width: s.status === 'matched' ? '100%' : s.status === 'partial' ? '50%' : '8%',
                  }}
                  transition={{ duration: 1, delay: i * 0.05, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
