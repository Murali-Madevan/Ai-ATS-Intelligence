import { motion } from 'framer-motion'
import { Briefcase, Calendar } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export function ExperienceTimeline() {
  const { analysisResult } = useApp()
  const data = analysisResult
  if (!data) return null

  const experience = [
    { role: data.candidate.role, company: data.candidate.company, period: 'Current', match: data.matchScore },
    ...data.platformScores.slice(0, 3).map((p, i) => ({
      role: `${p.name} Score`,
      company: p.pass ? 'ATS Compatible' : 'Needs Work',
      period: `${p.score}%`,
      match: p.score,
    })),
  ]

  if (experience.length === 0) {
    return <p className="text-sm text-text-secondary py-8 text-center">No experience data available.</p>
  }

  return (
    <div className="relative space-y-0">
      {experience.map((exp, i) => (
        <motion.div
          key={`${exp.role}-${i}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="relative flex gap-4 pb-6 last:pb-0"
        >
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            {i < experience.length - 1 && (
              <div className="mt-1 w-px flex-1 bg-border" />
            )}
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-text">{exp.role}</h4>
                <p className="text-xs text-text-secondary">{exp.company}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                  <Calendar className="h-3 w-3" />
                  {exp.period}
                </div>
                <div
                  className="rounded-md px-2 py-0.5 text-[11px] font-bold"
                  style={{
                    background: exp.match >= 80 ? '#22C55E15' : '#F59E0B15',
                    color: exp.match >= 80 ? '#22C55E' : '#F59E0B',
                  }}
                >
                  {exp.match}%
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
