import { motion } from 'framer-motion'
import { FileText, Code2, Briefcase, Layout, GraduationCap, FolderGit2, Lightbulb, TrendingUp } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export function OverviewCards() {
  const { analysisResult } = useApp()
  if (!analysisResult) return null
  const data = analysisResult

  const hardMatched = data.skillsAnalysis.hardSkills.filter(s => s.matched).length
  const hardTotal = data.skillsAnalysis.hardSkills.length || 1
  const softMatched = data.skillsAnalysis.softSkills.filter(s => s.matched).length
  const softTotal = data.skillsAnalysis.softSkills.length || 1
  const totalSuggestions =
    data.contentAnalysis.measurableResults.length +
    data.contentAnalysis.spellingGrammar.length +
    data.formatAnalysis.bulletPoints.suggestions.length +
    data.styleAnalysis.buzzwords.suggestions.length

  const cs = data.categoryScores || { skills: 0, experience: 0, keywords: 0, formatting: 0 }

  const cards = [
    { label: 'Skills', value: `${cs.skills}%`, icon: FileText, color: '#5B5BD6', desc: 'score' },
    { label: 'Hard Skills', value: `${hardMatched}/${hardTotal}`, icon: Code2, color: '#0EA5E9', desc: 'matched' },
    { label: 'Experience', value: `${data.deepAnalysis.experience.score}%`, icon: Briefcase, color: '#22C55E', desc: 'score' },
    { label: 'Formatting', value: `${data.deepAnalysis.formatting.score}%`, icon: Layout, color: '#F59E0B', desc: 'score' },
    { label: 'Soft Skills', value: `${softMatched}/${softTotal}`, icon: GraduationCap, color: '#8B5CF6', desc: 'matched' },
    { label: 'Projects', value: `${data.deepAnalysis.projects.score}%`, icon: FolderGit2, color: '#EC4899', desc: 'score' },
    { label: 'Suggestions', value: `${totalSuggestions}`, icon: Lightbulb, color: '#F43F5E', desc: 'to review' },
    { label: 'Keywords', value: `${cs.keywords}%`, icon: TrendingUp, color: '#22C55E', desc: 'score' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <div
            className="absolute right-0 top-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full opacity-[0.06] transition-all duration-500 group-hover:opacity-[0.1] group-hover:scale-110"
            style={{ background: card.color }}
          />
          <div
            className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: `${card.color}15` }}
          >
            <card.icon className="h-4 w-4" style={{ color: card.color }} />
          </div>
          <span className="text-xs font-medium text-text-secondary">{card.label}</span>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-text">{card.value}</span>
            <span className="text-[11px] text-text-secondary">{card.desc}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
