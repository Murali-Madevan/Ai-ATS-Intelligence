import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/context/AppContext'
import { ExternalLink, AlertCircle, Upload, TrendingUp, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  matched: 'success',
  partial: 'warning',
  missing: 'danger',
}

const statusLabel: Record<string, string> = {
  matched: 'Matched',
  partial: 'Partial',
  missing: 'Missing',
}

const importanceIcon: Record<string, typeof TrendingUp> = {
  high: TrendingUp,
  medium: AlertTriangle,
  low: Info,
}

const importanceColor: Record<string, string> = {
  high: 'text-danger',
  medium: 'text-warning',
  low: 'text-text-secondary',
}

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function SkillGap() {
  const { analysisResult } = useApp()
  const navigate = useNavigate()
  const data = analysisResult

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-text-tertiary" />
          <h3 className="mb-2 text-lg font-medium">No Analysis Data</h3>
          <p className="mb-6 max-w-sm text-sm text-text-secondary">
            Analyze a resume first to see skill gap analysis.
          </p>
          <Button onClick={() => navigate('/')}>
            <Upload className="mr-2 h-4 w-4" />
            Analyze Resume
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { skillGap } = data

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Skill Gap Analysis</CardTitle>
            <CardDescription>Compare your skills against the target role</CardDescription>
          </CardHeader>
          <CardContent>
            {skillGap.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="mb-4 h-12 w-12 text-text-tertiary" />
                <h3 className="mb-2 text-lg font-medium">No skill data available</h3>
                <p className="mb-2 max-w-md text-sm text-text-secondary">
                  The job description did not contain enough technical keywords for a skill gap analysis.
                  Try pasting a more detailed job description.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-text-secondary">
                      <th className="px-4 py-3 font-medium">Skill</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Importance</th>
                      <th className="px-4 py-3 font-medium hidden md:table-cell">Evidence from JD</th>
                      <th className="px-4 py-3 font-medium">Learning Resource</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                    }}
                    initial="hidden"
                    animate="show"
                  >
                    {skillGap.map((gap) => {
                      const ImpIcon = importanceIcon[gap.importance] || Info
                      return (
                        <motion.tr
                          key={gap.skill}
                          variants={rowVariants}
                          className="border-b border-border transition-colors hover:bg-surface"
                        >
                          <td className="px-4 py-3 font-medium text-text">{gap.skill}</td>
                          <td className="px-4 py-3">
                            <Badge variant={statusVariant[gap.status]}>
                              {statusLabel[gap.status]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${importanceColor[gap.importance] || 'text-text-secondary'}`}>
                              <ImpIcon className="h-3.5 w-3.5" />
                              {gap.importance.charAt(0).toUpperCase() + gap.importance.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {gap.evidence ? (
                              <span className="text-xs text-text-secondary leading-relaxed block max-w-xs truncate" title={gap.evidence}>
                                {gap.evidence}
                              </span>
                            ) : (
                              <span className="text-xs text-text-tertiary">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {gap.resource ? (
                              <button
                                onClick={() => {
                                  const query = encodeURIComponent(`${gap.skill} tutorial`)
                                  window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer')
                                }}
                                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline text-xs"
                              >
                                Learn
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            ) : (
                              <span className="text-text-tertiary text-xs">—</span>
                            )}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </motion.tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
