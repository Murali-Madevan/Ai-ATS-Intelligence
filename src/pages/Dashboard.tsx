import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScoreGauge } from '@/components/ScoreGauge'
import { ATSPlatformBadges } from '@/components/ATSPlatformBadges'
import { OverviewCards } from '@/components/OverviewCards'
import { ScoreRadar } from '@/components/ScoreRadar'
import { HighlightCard } from '@/components/HighlightCard'
import { ContentAnalysis } from '@/components/ContentAnalysis'
import { FormatAnalysis } from '@/components/FormatAnalysis'
import { SectionsAnalysis } from '@/components/SectionsAnalysis'
import { StyleAnalysis } from '@/components/StyleAnalysis'
import { SkillsAnalysisTable } from '@/components/SkillsAnalysisTable'
import { useApp } from '@/context/AppContext'
import { ScanLine, Sparkles, ArrowUpRight, Briefcase, Mail, Phone, AlertCircle, Upload, RotateCcw } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { analysisResult, resetAll } = useApp()
  const data = analysisResult

  if (!data) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-[1400px] space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-text-tertiary" />
            <h3 className="mb-2 text-lg font-medium">No Analysis Data</h3>
            <p className="mb-6 max-w-sm text-sm text-text-secondary">
              Analyze a resume first to see your dashboard.
            </p>
            <Button onClick={() => navigate('/')}>
              <Upload className="mr-2 h-4 w-4" />
              Analyze Resume
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const trendData = [
    { name: 'Keywords', value: data.categoryScores.keywords },
    { name: 'Skills', value: data.categoryScores.skills },
    { name: 'Exp', value: data.categoryScores.experience },
    { name: 'Fmt', value: data.categoryScores.formatting },
    { name: 'Sections', value: data.categoryScores.sections },
    { name: 'Impact', value: data.categoryScores.actionVerbs },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-[1400px] space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Resume Analysis</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Results for <span className="font-semibold text-text">{data.candidate.role}</span> at <span className="font-semibold text-text">{data.candidate.company}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
            <ScanLine className="h-4 w-4" />
            History
          </Button>
          <Button size="sm" onClick={() => { resetAll(); navigate('/'); }}>
            <RotateCcw className="h-4 w-4" />
            New Scan
          </Button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
            {data.candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'NA'}
          </div>
          <div>
            <p className="text-sm font-semibold text-text">{data.candidate.name}</p>
            <p className="text-xs text-text-secondary">{data.candidate.role}</p>
          </div>
        </div>
        <div className="hidden h-8 w-px bg-border sm:block" />
        <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
          {data.candidate.company && (
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              {data.candidate.company}
            </span>
          )}
          {data.candidate.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {data.candidate.email}
            </span>
          )}
          {data.candidate.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {data.candidate.phone}
            </span>
          )}
        </div>
        <div className="ml-auto">
          <Badge variant={data.matchScore >= 70 ? 'success' : 'warning'} className="px-3 py-1 text-xs">
            {data.matchScore >= 80 ? 'ATS Friendly' : data.matchScore >= 60 ? 'Moderate Match' : 'Needs Work'}
          </Badge>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 overflow-hidden">
          <div className="relative">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #5B5BD6, transparent)' }} />
            <CardHeader>
              <CardTitle className="text-lg">ATS Score</CardTitle>
              <CardDescription>Overall ATS compatibility</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-6">
              <ScoreGauge value={data.overallScore} size={200} />
              <div className="mt-4 flex items-center gap-2">
                <Badge variant={data.matchScore >= 70 ? 'success' : 'warning'} className="px-3 py-1">
                  {data.overallScore >= 80 ? 'ATS Friendly' : data.overallScore >= 60 ? 'Moderate' : 'Needs Improvement'}
                </Badge>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">ATS Analysis</CardTitle>
            <CardDescription>How your resume performs across key dimensions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {data.platformScores && data.platformScores.length > 0 && (
              <ATSPlatformBadges platforms={data.platformScores} />
            )}
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text">AI Analysis</h4>
                  <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">{data.summary}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <OverviewCards />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HighlightCard title="Strengths" items={data.highlights} variant="highlight" />
        <HighlightCard title="Weaknesses" items={data.improvements} variant="improve" />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills Radar</CardTitle>
            <CardDescription>Multi-dimensional resume analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreRadar data={data.radarData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Scores</CardTitle>
            <CardDescription>Weighted score breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.map((d) => (
              <div key={d.name} className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text-secondary">{d.name}</span>
                  <span className="font-semibold text-text">{d.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${d.value}%`,
                      background: d.value >= 80 ? '#22C55E' : d.value >= 60 ? '#F59E0B' : '#F43F5E',
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-4 text-xs text-text-tertiary">
              Keyword Match 30% · Required Skills 25% · Formatting 10% · Experience 15% · Education 5% · Projects 5% · Readability 5% · Contact 5%
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deep Dive Analysis</CardTitle>
            <CardDescription>Comprehensive breakdown across all resume dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="mb-6 flex-wrap">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="format">Format</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
                <TabsTrigger value="scoring">Scoring</TabsTrigger>
              </TabsList>

              <TabsContent value="content">
                <ContentAnalysis data={data.contentAnalysis} />
              </TabsContent>

              <TabsContent value="skills">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <SkillsAnalysisTable data={data.skillsAnalysis} />
                  <div className="space-y-6">
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-text">Missing Critical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.keywordMatch.missing.length > 0 ? data.keywordMatch.missing.map((kw) => (
                          <span key={kw} className="inline-flex items-center gap-1.5 rounded-full bg-danger/15 px-3 py-1 text-xs font-medium text-danger">
                            {kw}
                          </span>
                        )) : <span className="text-sm text-text-secondary">No critical skills missing</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-text">Matched Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.keywordMatch.matched.length > 0 ? data.keywordMatch.matched.map((kw) => (
                          <span key={kw} className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
                            {kw}
                          </span>
                        )) : <span className="text-sm text-text-secondary">No keywords matched</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="format">
                <FormatAnalysis data={data.formatAnalysis} />
              </TabsContent>

              <TabsContent value="sections">
                <SectionsAnalysis data={data.sectionsAnalysis} />
              </TabsContent>

              <TabsContent value="style">
                <StyleAnalysis data={data.styleAnalysis} />
              </TabsContent>

              <TabsContent value="scoring">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: 'Contact Info', score: data.deepAnalysis.contactInfo.score, detail: `${data.deepAnalysis.contactInfo.hasName ? '✓' : '✗'} Name · ${data.deepAnalysis.contactInfo.hasEmail ? '✓' : '✗'} Email · ${data.deepAnalysis.contactInfo.hasPhone ? '✓' : '✗'} Phone` },
                    { label: 'Resume Sections', score: data.deepAnalysis.resumeSections.score, detail: `Found: ${data.deepAnalysis.resumeSections.found.join(', ')}` },
                    { label: 'Formatting', score: data.deepAnalysis.formatting.score, detail: `${data.deepAnalysis.formatting.hasBullets ? '✓' : '✗'} Bullets · ${data.deepAnalysis.formatting.hasConsistentDates ? '✓' : '✗'} Dates` },
                    { label: 'Keywords', score: data.deepAnalysis.keywords.score, detail: `${data.deepAnalysis.keywords.matched.length} matched · ${data.deepAnalysis.keywords.missing.length} missing` },
                    { label: 'Hard Skills', score: data.deepAnalysis.hardSkills.score, detail: `${data.deepAnalysis.hardSkills.matched.length}/${data.deepAnalysis.hardSkills.totalRequired} required matched` },
                    { label: 'Soft Skills', score: data.deepAnalysis.softSkills.score, detail: `${data.deepAnalysis.softSkills.matched.length} found` },
                    { label: 'Experience', score: data.deepAnalysis.experience.score, detail: `${data.deepAnalysis.experience.totalYears}+ years · ${data.deepAnalysis.experience.hasActionVerbs ? '✓' : '✗'} action verbs` },
                    { label: 'Education', score: data.deepAnalysis.education.score, detail: data.deepAnalysis.education.hasDegree ? data.deepAnalysis.education.degreeLevel : 'No degree detected' },
                    { label: 'Projects', score: data.deepAnalysis.projects.score, detail: `${data.deepAnalysis.projects.count} project(s)` },
                    { label: 'Action Verbs', score: data.deepAnalysis.actionVerbs.score, detail: `${data.deepAnalysis.actionVerbs.count} verbs found` },
                    { label: 'Quantified Results', score: data.deepAnalysis.quantifiedAchievements.score, detail: `${data.deepAnalysis.quantifiedAchievements.count} metrics found` },
                    { label: 'Job Title Match', score: data.deepAnalysis.jobTitleMatch.score, detail: `${data.deepAnalysis.jobTitleMatch.titleOverlap}% overlap` },
                    { label: 'Missing Skills Penalty', score: data.deepAnalysis.missingSkills.score, detail: `${data.deepAnalysis.missingSkills.count} missing` },
                    { label: 'Keyword Density', score: data.deepAnalysis.keywordDensity.score, detail: data.deepAnalysis.keywordDensity.overused.length > 0 ? `Overused: ${data.deepAnalysis.keywordDensity.overused.slice(0, 3).join(', ')}` : 'Good balance' },
                    { label: 'Readability', score: data.deepAnalysis.readability.score, detail: `${data.deepAnalysis.readability.avgSentenceLength} words/sentence avg` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-text">{item.label}</span>
                        <span className={`text-sm font-bold ${item.score >= 70 ? 'text-success' : item.score >= 40 ? 'text-warning' : 'text-danger'}`}>
                          {item.score}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${item.score}%`,
                            background: item.score >= 70 ? '#22C55E' : item.score >= 40 ? '#F59E0B' : '#F43F5E',
                          }}
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-text-tertiary leading-tight">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="flex justify-center pb-4">
        <Button
          variant="outline"
          className="group gap-2 border-primary/20 text-primary hover:bg-primary/5"
          onClick={() => navigate('/resume')}
        >
          Generate Optimized Resume
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Button>
      </motion.div>
    </motion.div>
  )
}
