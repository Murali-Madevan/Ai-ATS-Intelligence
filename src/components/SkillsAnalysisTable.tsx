import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import type { SkillsAnalysis } from '@/types'

interface SkillsAnalysisTableProps {
  data: SkillsAnalysis
}

export function SkillsAnalysisTable({ data }: SkillsAnalysisTableProps) {
  const renderRow = (skill: { name: string; required: boolean; matched: boolean; jdCount: number; resumeCount: number }, i: number) => (
    <motion.div
      key={skill.name}
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.03 }}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface"
    >
      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${skill.matched ? 'bg-success/10' : 'bg-danger/10'}`}>
        {skill.matched ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <X className="h-3.5 w-3.5 text-danger" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${skill.matched ? 'text-text' : 'text-danger'}`}>
            {skill.name}
          </span>
          {skill.required && (
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              required
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-text-secondary">
        <span className="tabular-nums">JD: {skill.jdCount}</span>
        <span className="tabular-nums">Resume: {skill.resumeCount}</span>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-text">Hard Skills</h4>
        <div className="rounded-xl border border-border bg-card shadow-xs">
          {data.hardSkills.map((s, i) => renderRow(s, i))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-text">Soft Skills</h4>
        <div className="rounded-xl border border-border bg-card shadow-xs">
          {data.softSkills.map((s, i) => renderRow(s, i))}
        </div>
      </div>
    </div>
  )
}
