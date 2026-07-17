import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCountUp } from '@/hooks/useCountUp'

interface ScoreCardProps {
  title: string
  score: number
  subtitle?: string
  suggestions?: number
}

export function ScoreCard({ title, score, subtitle, suggestions }: ScoreCardProps) {
  const { value, ref } = useCountUp(score)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div
      ref={ref}
      className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-text shadow-sm"
    >
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            className="stroke-border"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            stroke="url(#score-gradient)"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold text-text">{value}</span>
          <span className="text-xs text-text-secondary">/ 100</span>
        </div>
      </div>
      <h3 className="mt-4 text-base font-semibold text-text">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
      {typeof suggestions === 'number' && (
        <span className="mt-3 inline-flex items-center rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning">
          {suggestions} suggestion{suggestions === 1 ? '' : 's'}
        </span>
      )}
    </div>
  )
}
