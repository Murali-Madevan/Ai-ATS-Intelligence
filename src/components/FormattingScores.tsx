import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import type { RadarData } from '@/types'

interface FormattingScoresProps {
  data: RadarData[]
}

const categories = ['Format', 'Sections', 'Style', 'Content']

export function FormattingScores({ data }: FormattingScoresProps) {
  if (!data || !Array.isArray(data)) return null
  const filtered = categories
    .map((cat) => data.find((d) => d.category === cat))
    .filter(Boolean) as RadarData[]

  return (
    <div className="space-y-4">
      {filtered.map((item, i) => (
        <motion.div
          key={item.category}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
        >
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-text">{item.category}</span>
            <span className="text-xs font-semibold text-text-secondary">{item.value}%</span>
          </div>
          <Progress
            value={item.value}
            indicatorClassName="transition-all duration-1000"
            indicatorStyle={{
              background: `linear-gradient(to right, #5B5BD6, #0EA5E9)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}
