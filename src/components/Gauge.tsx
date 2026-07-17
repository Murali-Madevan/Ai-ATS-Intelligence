import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCountUp } from '@/hooks/useCountUp'

interface GaugeProps {
  value: number
  size?: number
  label?: string
}

function colorForValue(v: number) {
  if (v >= 70) return '#10b981'
  if (v >= 40) return '#f59e0b'
  return '#ef4444'
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = (Math.PI / 180) * (angleDeg - 180)
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  }
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1'
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

export function Gauge({ value, size = 200, label }: GaugeProps) {
  const { value: animatedValue, ref } = useCountUp(Math.min(100, Math.max(0, value)))
  const stroke = 14
  const radius = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const clamped = Math.min(100, Math.max(0, animatedValue))
  const angle = (clamped / 100) * 180
  const color = colorForValue(clamped)

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + stroke }}>
        <svg width={size} height={size / 2 + stroke} viewBox={`0 0 ${size} ${size / 2 + stroke}`}>
          <path
            d={arcPath(cx, cy, radius, 0, 180)}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            className="stroke-border"
          />
          <motion.path
            d={arcPath(cx, cy, radius, 0, 180)}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke={color}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: clamped / 100 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-3xl font-bold text-text" style={{ color }}>
            {clamped}
          </span>
          {label && <span className="text-xs text-text-secondary">{label}</span>}
        </div>
      </div>
      <div
        className="mt-1 h-1 w-1 rounded-full"
        style={{ background: color, transform: `rotate(${angle}deg) translateX(${radius}px)`, transition: 'transform 1.5s ease-out' }}
      />
    </div>
  )
}
