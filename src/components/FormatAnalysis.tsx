import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle, Lightbulb, ListChecks, Calendar, FileText, Layers, FileSpreadsheet } from 'lucide-react'
import type { FormatAnalysis as FormatAnalysisType } from '@/types'

interface FormatAnalysisProps {
  data: FormatAnalysisType
}

export function FormatAnalysis({ data }: FormatAnalysisProps) {
  return (
    <div className="space-y-5">
      {/* Date Formatting */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
      >
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${data.dateFormatting.pass ? 'bg-success/10' : 'bg-danger/10'}`}>
          <Calendar className={`h-4 w-4 ${data.dateFormatting.pass ? 'text-success' : 'text-danger'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-text">Date Formatting</h4>
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${data.dateFormatting.pass ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
              {data.dateFormatting.pass ? 'PASS' : 'FAIL'}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-text-secondary">{data.dateFormatting.detail}</p>
        </div>
      </motion.div>

      {/* Resume Length */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
      >
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${data.resumeLength.pass ? 'bg-success/10' : 'bg-danger/10'}`}>
          <FileText className={`h-4 w-4 ${data.resumeLength.pass ? 'text-success' : 'text-danger'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-text">Resume Length</h4>
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${data.resumeLength.pass ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
              {data.resumeLength.pass ? 'PASS' : 'FAIL'}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-text-secondary">{data.resumeLength.detail}</p>
          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-primary/5 p-2.5">
            <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
            <p className="text-[11px] leading-relaxed text-text-secondary">{data.resumeLength.tip}</p>
          </div>
        </div>
      </motion.div>

      {/* Bullet Points */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
      >
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${data.bulletPoints.pass ? 'bg-success/10' : 'bg-amber/10'}`}>
          <ListChecks className={`h-4 w-4 ${data.bulletPoints.pass ? 'text-success' : 'text-amber'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-text">Bullet Points</h4>
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${data.bulletPoints.pass ? 'bg-success/10 text-success' : 'bg-amber/10 text-amber'}`}>
              {data.bulletPoints.pass ? 'PASS' : `${data.bulletPoints.suggestions.length} suggestion${data.bulletPoints.suggestions.length !== 1 ? 's' : ''}`}
            </span>
          </div>
          {data.bulletPoints.suggestions.map((s, i) => (
            <div key={i} className="mt-2 space-y-1.5">
              <p className="text-sm leading-relaxed text-text">{s.text}</p>
              <div className="flex items-start gap-1.5 rounded-lg bg-success/5 p-2.5">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber" />
                <p className="text-xs leading-relaxed text-text-secondary">{s.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Heading Hierarchy */}
      {data.headingHierarchy && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${data.headingHierarchy.pass ? 'bg-success/10' : 'bg-danger/10'}`}>
            <Layers className={`h-4 w-4 ${data.headingHierarchy.pass ? 'text-success' : 'text-danger'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-text">Heading Hierarchy</h4>
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${data.headingHierarchy.pass ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {data.headingHierarchy.pass ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-text-secondary">{data.headingHierarchy.detail}</p>
          </div>
        </motion.div>
      )}

      {/* Page Count */}
      {data.pageCount && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${data.pageCount.pass ? 'bg-success/10' : 'bg-danger/10'}`}>
            <FileSpreadsheet className={`h-4 w-4 ${data.pageCount.pass ? 'text-success' : 'text-danger'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-text">Page Count</h4>
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${data.pageCount.pass ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {data.pageCount.pass ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-text-secondary">{data.pageCount.detail}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
