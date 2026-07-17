import { useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { DiffLine } from '@/utils/analysis/resumeDiff'

interface ResumeDiffViewProps {
  original: string
  optimized: string
  diff: DiffLine[]
}

const typeStyles = {
  added: 'bg-success/10 text-success border-l-2 border-success',
  removed: 'bg-danger/10 text-danger border-l-2 border-danger line-through',
  modified: 'bg-warning/10 text-warning border-l-2 border-warning',
  unchanged: 'text-text-secondary border-l-2 border-transparent',
}

export function ResumeDiffView({ original, optimized, diff }: ResumeDiffViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === 'added').length
    const removed = diff.filter(d => d.type === 'removed').length
    const modified = diff.filter(d => d.type === 'modified').length
    return { added, removed, modified }
  }, [diff])

  if (!diff || diff.length === 0) {
    return <div className="text-sm text-text-secondary">No changes to display.</div>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-success"><span className="h-2 w-2 rounded-full bg-success" /> +{stats.added} added</span>
        <span className="flex items-center gap-1 text-warning"><span className="h-2 w-2 rounded-full bg-warning" /> {stats.modified} modified</span>
        <span className="flex items-center gap-1 text-danger"><span className="h-2 w-2 rounded-full bg-danger" /> {stats.removed} removed</span>
      </div>
      <div ref={scrollRef} className="max-h-[500px] overflow-y-auto rounded-xl border border-border bg-surface p-4 font-mono text-xs leading-relaxed">
        {diff.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.002 }}
            className={`px-3 py-0.5 ${typeStyles[line.type]}`}
          >
            <span className="mr-2 inline-block w-6 text-right text-text-tertiary select-none">{line.lineNumber}</span>
            {line.type === 'added' && <span className="mr-1 text-success">+</span>}
            {line.type === 'removed' && <span className="mr-1 text-danger">-</span>}
            {line.type === 'modified' && <span className="mr-1 text-warning">~</span>}
            {line.text || '\u00A0'}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
