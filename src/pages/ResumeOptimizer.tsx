import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, FileSpreadsheet, Upload, AlertCircle, CheckCheck, TrendingUp, ArrowRight, LayoutDashboard, GitCompare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useApp } from '@/context/AppContext'
import { buildStructuredResume } from '@/utils/resumeParser'
import { optimizeResume, formatStructuredResume } from '@/utils/resumeOptimizer'
import { exportToPDF, exportToDOCX } from '@/utils/fileExport'
import { analyzeJD, scoreResume } from '@/utils/scoringEngine'
import { useNavigate } from 'react-router-dom'
import { ResumeHealthDashboard } from '@/components/ResumeHealthDashboard'
import { MissingSectionsAlert } from '@/components/MissingSectionsAlert'
import { ResumeDiffView } from '@/components/ResumeDiffView'
import { detectMissingSections } from '@/utils/analysis/sectionDetector'
import { computeResumeHealth } from '@/utils/analysis/healthAnalyzer'
import { categorizeKeywords } from '@/utils/analysis/keywordAnalyzer'
import { computeDiff, buildComparisonSummary } from '@/utils/analysis/resumeDiff'
import type { StructuredResume } from '@/types/resume'

function highlightWords(text: string, words: string[]) {
  if (!words.length) return text
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`\\b(${words.map(w => esc(w)).join('|')})\\b`, 'gi')
  const parts = text.split(pattern)
  return parts.map((part, i) =>
    words.some(w => w.toLowerCase() === part.toLowerCase()) ? (
      <mark key={i} className="bg-success/20 text-success rounded px-0.5">{part}</mark>
    ) : part
  )
}

export default function ResumeOptimizer() {
  const { resumeText, jobDescription, analysisResult, setResumeText, setAnalysisResult, setAnalysisStatus } = useApp()
  const navigate = useNavigate()
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx' | null>(null)
  const [applied, setApplied] = useState(false)

  const uploadedResume = resumeText

  const parsedResume = useMemo(() => {
    if (!resumeText) return null
    return buildStructuredResume(resumeText)
  }, [resumeText])

  const structuredResume = parsedResume

  const analysisData = analysisResult

  const jdKeywords = useMemo(() => {
    if (!jobDescription) return []
    return analyzeJD(jobDescription)
  }, [jobDescription])

  const originalScore = useMemo(() => {
    if (!structuredResume || jdKeywords.length === 0) return null
    return scoreResume(structuredResume, jdKeywords, jobDescription || '')
  }, [structuredResume, jdKeywords, jobDescription])

  const optimizationOutput = useMemo(() => {
    if (!structuredResume || jdKeywords.length === 0) return null
    return optimizeResume(structuredResume, jdKeywords, jobDescription || '')
  }, [structuredResume, jdKeywords, jobDescription])

  const optimized = optimizationOutput

  const optimizedResume = optimized?.optimizedResume

  const optimizedScore = useMemo(() => {
    if (!optimized?.optimizedResume) return null
    return scoreResume(optimized.optimizedResume, jdKeywords, jobDescription || '')
  }, [optimized, jdKeywords, jobDescription])

  const originalFormatted = useMemo(() => {
    if (!structuredResume) return ''
    return formatStructuredResume(structuredResume)
  }, [structuredResume])

  const addedWords = useMemo(() => {
    if (!originalFormatted || !optimized) return []
    const originalSet = new Set(originalFormatted.toLowerCase().split(/\W+/).filter(w => w.length > 2))
    const optWords = optimized.formatted.toLowerCase().split(/\W+/).filter(w => w.length > 2)
    return [...new Set(optWords.filter(w => !originalSet.has(w)))]
  }, [originalFormatted, optimized])

  const handleDownloadPDF = () => {
    if (!optimized || !structuredResume) return
    setDownloadFormat('pdf')
    try {
      exportToPDF(optimized.optimizedResume, 'optimized-resume')
    } finally {
      setDownloadFormat(null)
    }
  }

  const handleDownloadDOCX = async () => {
    if (!optimized || !structuredResume) return
    setDownloadFormat('docx')
    try {
      await exportToDOCX(optimized.optimizedResume, 'optimized-resume')
    } finally {
      setDownloadFormat(null)
    }
  }

  function handleApply() {
    if (!optimized) return
    setResumeText(optimized.formatted)
    setAnalysisResult(null)
    setAnalysisStatus('idle')
    setApplied(true)
    setTimeout(() => setApplied(false), 3000)
  }

  if (!resumeText) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-semibold tracking-tight">Resume Optimizer</h1>
          <p className="text-text-secondary">Generate an ATS-optimized version of your resume.</p>
        </motion.div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-text-tertiary" />
            <h3 className="mb-2 text-lg font-medium">No Resume Uploaded</h3>
            <p className="mb-6 max-w-sm text-sm text-text-secondary">
              Upload a resume on the home page first to see optimization suggestions.
            </p>
            <Button onClick={() => navigate('/')}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Resume
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const missingSections = useMemo(() => {
    if (!structuredResume) return []
    return detectMissingSections(structuredResume)
  }, [structuredResume])

  const healthDashboard = useMemo(() => {
    if (!originalScore?.deepAnalysis) return null
    return computeResumeHealth(originalScore.deepAnalysis)
  }, [originalScore])

  const categorizedKws = useMemo(() => {
    if (!structuredResume || !jdKeywords.length) return []
    return categorizeKeywords(jdKeywords, structuredResume, jobDescription || '')
  }, [structuredResume, jdKeywords, jobDescription])

  const diff = useMemo(() => {
    if (!originalFormatted || !optimized?.formatted) return []
    return computeDiff(originalFormatted, optimized.formatted)
  }, [originalFormatted, optimized])

  const comparisonSummary = useMemo(() => {
    if (!originalScore || !optimizedScore || !optimized) return null
    return buildComparisonSummary(originalScore.overallScore, optimizedScore.overallScore, diff, optimized.changes)
  }, [originalScore, optimizedScore, diff, optimized])

  const scoreImproved = optimizedScore && originalScore
    ? optimizedScore.overallScore >= originalScore.overallScore
    : false
  const scoreDiff = optimizedScore && originalScore
    ? optimizedScore.overallScore - originalScore.overallScore
    : 0

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Resume Optimizer</h1>
        <p className="text-text-secondary">
          Compare your original resume with an ATS-optimized version.
        </p>
      </motion.div>

      {originalScore && optimizedScore && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <Card className="bg-card/50">
            <CardContent className="flex flex-col items-center py-4">
              <span className="text-xs text-text-secondary mb-1">Original ATS Score</span>
              <span className="text-2xl font-bold text-text">{originalScore.overallScore}%</span>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="flex flex-col items-center py-4">
              <span className="text-xs text-text-secondary mb-1">Optimized ATS Score</span>
              <span className={`text-2xl font-bold ${scoreImproved ? 'text-success' : 'text-warning'}`}>
                {optimizedScore.overallScore}%
              </span>
              {scoreDiff !== 0 && (
                <span className={`text-xs mt-1 inline-flex items-center gap-0.5 ${scoreImproved ? 'text-success' : 'text-danger'}`}>
                  <TrendingUp className={`h-3 w-3 ${!scoreImproved ? 'rotate-180' : ''}`} />
                  {scoreImproved ? '+' : ''}{scoreDiff}%
                </span>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="flex flex-col items-center py-4">
              <span className="text-xs text-text-secondary mb-1">Keywords Added</span>
              <span className="text-2xl font-bold text-primary">{addedWords.length}</span>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {optimized && optimized.changes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-success/20 bg-success/5 p-4"
        >
          <h4 className="mb-2 text-sm font-semibold text-success">Changes Applied ({optimized.changes.length})</h4>
          <ul className="space-y-1">
            {optimized.changes.slice(0, 5).map((c, i) => (
              <li key={i} className="text-xs text-text-secondary">
                <span className="font-medium text-text">{c.reason}</span>
                {c.original && (
                  <span className="ml-1 text-text-tertiary line-through">{c.original.substring(0, 60)}{c.original.length > 60 ? '...' : ''}</span>
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {missingSections.length > 0 && originalScore && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <MissingSectionsAlert sections={missingSections} />
        </motion.div>
      )}

      {healthDashboard && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LayoutDashboard className="h-4 w-4 text-primary" />
                Resume Health
              </CardTitle>
              <CardDescription>ATS compatibility across key dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeHealthDashboard health={healthDashboard} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {comparisonSummary && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card><CardContent className="flex flex-col items-center py-3"><span className="text-xs text-text-secondary">Improvement</span><span className={`text-xl font-bold ${scoreImproved ? 'text-success' : 'text-danger'}`}>{scoreImproved ? '+' : ''}{comparisonSummary.improvement}%</span></CardContent></Card>
          <Card><CardContent className="flex flex-col items-center py-3"><span className="text-xs text-text-secondary">Keywords Added</span><span className="text-xl font-bold text-primary">{comparisonSummary.keywordsAdded}</span></CardContent></Card>
          <Card><CardContent className="flex flex-col items-center py-3"><span className="text-xs text-text-secondary">Bullets Improved</span><span className="text-xl font-bold text-primary">{comparisonSummary.bulletsImproved}</span></CardContent></Card>
          <Card><CardContent className="flex flex-col items-center py-3"><span className="text-xs text-text-secondary">Lines Changed</span><span className="text-xl font-bold text-primary">{comparisonSummary.changedLines}</span></CardContent></Card>
        </motion.div>
      )}

      {optimized && diff.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitCompare className="h-4 w-4 text-primary" />
              Detailed Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="diff">
              <TabsList className="mb-4">
                <TabsTrigger value="diff">Side-by-Side Diff</TabsTrigger>
                <TabsTrigger value="keywords">Keyword Analysis</TabsTrigger>
                <TabsTrigger value="changes">All Changes</TabsTrigger>
              </TabsList>
              <TabsContent value="diff">
                <ResumeDiffView original={originalFormatted} optimized={optimized.formatted} diff={diff} />
              </TabsContent>
              <TabsContent value="keywords">
                <div className="max-h-[400px] overflow-y-auto space-y-1.5">
                  {categorizedKws.map((kw, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${kw.category === 'matched' ? 'bg-success' : kw.category === 'missing' || kw.category === 'required' ? 'bg-danger' : kw.category === 'overused' ? 'bg-warning' : 'bg-accent'}`} />
                      <span className="font-medium text-text min-w-[120px]">{kw.keyword}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${kw.category === 'matched' ? 'bg-success/10 text-success' : kw.category === 'missing' || kw.category === 'required' ? 'bg-danger/10 text-danger' : kw.category === 'overused' ? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent'}`}>{kw.category}</span>
                      <span className="text-xs text-text-secondary ml-auto">{kw.suggestion}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="changes">
                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {optimized.changes.map((c, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card px-3 py-2 text-xs">
                      <span className="font-medium text-text">{c.reason}</span>
                      {c.original && <span className="ml-2 text-text-tertiary line-through">{c.original.substring(0, 80)}</span>}
                      <span className="ml-2 text-success">→ {c.improved.substring(0, 80)}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Original Resume</CardTitle>
              <CardDescription>
                {structuredResume?.name || 'Your'} resume with detected sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[460px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-text-secondary font-mono">
                {structuredResume && (
                  <div className="space-y-3">
                    {structuredResume.name && (
                      <div className="text-base font-bold text-text">{structuredResume.name.toUpperCase()}</div>
                    )}
                    {structuredResume.summary && (
                      <div>
                        <div className="text-xs font-semibold text-primary mb-1">SUMMARY</div>
                        <p>{structuredResume.summary}</p>
                      </div>
                    )}
                    {structuredResume.skills.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-primary mb-1">SKILLS</div>
                        <p className="text-text-secondary">{structuredResume.skills.join(', ')}</p>
                      </div>
                    )}
                    {structuredResume.experience.map((exp, i) => (
                      <div key={i}>
                        <div className="text-xs font-semibold text-primary mb-1">{i === 0 ? 'EXPERIENCE' : ''}</div>
                        <div className="font-medium text-text">{exp.title} — {exp.company}</div>
                        {exp.dates && <div className="text-xs text-text-tertiary">{exp.dates}</div>}
                        {exp.bullets.map((b, j) => (
                          <div key={j} className="ml-3 text-text-secondary">- {b}</div>
                        ))}
                      </div>
                    ))}
                    {structuredResume.education.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-primary mb-1">EDUCATION</div>
                        {structuredResume.education.map((edu, i) => (
                          <div key={i} className="text-text-secondary">
                            {edu.degree} — {edu.school}{edu.year ? ` (${edu.year})` : ''}
                          </div>
                        ))}
                      </div>
                    )}
                    {structuredResume.projects.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-primary mb-1">PROJECTS</div>
                        {structuredResume.projects.map((p, i) => (
                          <div key={i}>
                            <div className="font-medium text-text">{p.name}</div>
                            {p.description && <div className="ml-3 text-text-secondary">{p.description}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Optimized Resume</CardTitle>
              <CardDescription>
                {addedWords.length > 0
                  ? `${addedWords.length} ATS keywords added`
                  : 'Keyword improvements applied'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[460px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-text font-mono">
                {optimized ? (
                  <div className="space-y-3">
                    {structuredResume?.name && (
                      <div className="text-base font-bold text-text">{structuredResume.name.toUpperCase()}</div>
                    )}
                    {optimized.formatted.split('\n').map((line, i) => {
                      if (!line.trim()) return <div key={i} className="h-2" />
                      const isHeading = /^[A-Z][A-Z\s]{2,}$/.test(line.trim())
                      const isBullet = line.trim().startsWith('•')
                      const isName = structuredResume?.name && line.trim().toUpperCase() === structuredResume.name.toUpperCase()
                      if (isName) return null
                      if (isHeading) {
                        return <div key={i} className="text-xs font-bold text-primary mt-3 mb-1">{line}</div>
                      }
                      if (isBullet) {
                        return <div key={i} className="ml-3 text-text">{
                          highlightWords(line, addedWords)
                        }</div>
                      }
                      return <div key={i} className="text-text-secondary">{
                        highlightWords(line, addedWords)
                      }</div>
                    })}
                  </div>
                ) : (
                  <div className="text-text-tertiary">Generating optimized version...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-wrap items-center gap-3"
      >
        <Button onClick={handleApply} disabled={!optimized} className={applied ? 'bg-success hover:bg-success' : ''}>
          {applied ? (
            <><CheckCheck className="mr-2 h-4 w-4" />Applied!</>
          ) : (
            <><CheckCheck className="mr-2 h-4 w-4" />Apply Changes</>
          )}
        </Button>
        <Button variant="outline" onClick={handleDownloadPDF} disabled={downloadFormat !== null || !optimized}>
          {downloadFormat === 'pdf' ? 'Processing...' : <><FileText className="mr-2 h-4 w-4" />Download PDF</>}
        </Button>
        <Button variant="outline" onClick={handleDownloadDOCX} disabled={downloadFormat !== null || !optimized}>
          {downloadFormat === 'docx' ? 'Processing...' : <><FileSpreadsheet className="mr-2 h-4 w-4" />Download DOCX</>}
        </Button>
      </motion.div>
    </div>
  )
}
