import { motion } from 'framer-motion'
import { GraduationCap, Award, Wrench } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export function EducationSkillCards() {
  const { analysisResult } = useApp()
  const data = analysisResult
  if (!data) return null

  const matchedSkills = data.skillsAnalysis.hardSkills.filter(s => s.matched).slice(0, 4)
  const missingSkills = data.keywordMatch.missing.slice(0, 3)

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
          <GraduationCap className="h-4 w-4 text-primary" />
          Matched Skills
        </h4>
        {matchedSkills.length > 0 ? (
          <div className="space-y-2">
            {matchedSkills.map((sk, i) => (
              <motion.div
                key={sk.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-xs"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10">
                  <Wrench className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-text">{sk.name}</h4>
                  <p className="text-xs text-text-secondary">
                    {sk.required ? 'Required in JD' : 'Bonus skill'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">No skill data available.</p>
        )}
      </div>

      {missingSkills.length > 0 && (
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
            <Award className="h-4 w-4 text-danger" />
            Skills to Add
          </h4>
          <div className="space-y-2">
            {missingSkills.map((sk, i) => (
              <motion.div
                key={sk}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-xs"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10">
                  <Award className="h-4 w-4 text-danger" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-text">{sk}</h4>
                  <p className="text-xs text-text-secondary">Missing from resume</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
