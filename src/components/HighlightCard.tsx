import * as React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { KeywordChip } from '@/components/KeywordChip'
import { cn } from '@/lib/utils'

interface HighlightCardProps {
  title: string
  items: string[]
  variant: 'highlight' | 'improve'
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

export function HighlightCard({ title, items, variant }: HighlightCardProps) {
  const isHighlight = variant === 'highlight'
  const Icon = isHighlight ? CheckCircle2 : AlertTriangle

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={cn('h-5 w-5', isHighlight ? 'text-success' : 'text-warning')} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap gap-2"
        >
          {items.map((label) => (
            <motion.div key={label} variants={item}>
              <KeywordChip
                label={label}
                variant={isHighlight ? 'matched' : 'missing'}
              />
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  )
}
