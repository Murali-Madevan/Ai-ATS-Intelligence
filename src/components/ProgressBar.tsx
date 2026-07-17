import * as React from 'react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  label: string
  value: number
  color?: string
}

export function ProgressBar({ label, value, color }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-text">{label}</span>
        <span className="text-text-secondary">{clamped}%</span>
      </div>
      <Progress
        value={clamped}
        indicatorClassName={cn('transition-all duration-700')}
        indicatorStyle={
          color
            ? { background: color }
            : { backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-accent))' }
        }
      />
    </div>
  )
}
