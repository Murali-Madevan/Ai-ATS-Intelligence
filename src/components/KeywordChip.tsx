import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, X, AlertTriangle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type ChipVariant = 'matched' | 'missing' | 'priority'
type Priority = 'high' | 'medium' | 'low'

interface KeywordChipProps {
  label: string
  variant: ChipVariant
  priority?: Priority
}

const variantConfig: Record<ChipVariant, { icon: LucideIcon; className: string }> = {
  matched: { icon: Check, className: 'bg-success/15 text-success' },
  missing: { icon: X, className: 'bg-danger/15 text-danger' },
  priority: { icon: AlertTriangle, className: 'bg-warning/15 text-warning' },
}

export function KeywordChip({ label, variant, priority }: KeywordChipProps) {
  const cfg = variantConfig[variant]
  if (!cfg) return <span className="text-xs text-text-secondary">{label}</span>
  const { icon: Icon, className } = cfg

  const priorityDot =
    variant === 'priority' && priority
      ? {
          high: 'bg-danger',
          medium: 'bg-warning',
          low: 'bg-accent',
        }[priority]
      : ''

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      {priorityDot && <span className={cn('ml-0.5 h-1.5 w-1.5 rounded-full', priorityDot)} />}
    </motion.span>
  )
}
