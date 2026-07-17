import { motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { PlatformScore } from '@/types'

interface ATSPlatformBadgesProps {
  platforms: PlatformScore[]
}

export function ATSPlatformBadges({ platforms }: ATSPlatformBadgesProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {platforms.map((p, i) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            {p.pass ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <XCircle className="h-4 w-4 text-danger" />
            )}
            <span className="text-sm font-medium text-text">{p.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-16 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${p.score}%`,
                  background: p.pass
                    ? 'linear-gradient(to right, #22C55E, #0EA5E9)'
                    : '#F43F5E',
                }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums" style={{ color: p.pass ? '#22C55E' : '#F43F5E' }}>
              {p.score}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
