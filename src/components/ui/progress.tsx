import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  indicatorClassName?: string
  indicatorStyle?: React.CSSProperties
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, indicatorStyle, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-border', className)}
      {...props}
    >
      <div
        className={cn('h-full rounded-full bg-primary transition-all duration-700', indicatorClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, ...indicatorStyle }}
      />
    </div>
  )
)
Progress.displayName = 'Progress'

export { Progress }
