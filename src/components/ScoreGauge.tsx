import { motion } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'

interface ScoreGaugeProps {
  value: number
  size?: number
  label?: string
}

function scoreColor(v: number) {
  if (v >= 80) return '#22C55E'
  if (v >= 60) return '#0EA5E9'
  if (v >= 40) return '#F59E0B'
  return '#F43F5E'
}

export function ScoreGauge({ value, size = 180, label }: ScoreGaugeProps) {
  const { value: animated, ref } = useCountUp(value)
  const stroke = 10
  const radius = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, animated))
  const offset = circumference - (clamped / 100) * circumference
  const color = scoreColor(clamped)

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <filter id="gauge-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-border"
          />
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke={color}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            filter="url(#gauge-glow)"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold tracking-tight"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            {clamped}
          </motion.span>
          {label && (
            <span className="mt-1 text-xs font-medium text-text-secondary">{label}</span>
          )}
        </div>
      </div>
    </div>
  )
}
