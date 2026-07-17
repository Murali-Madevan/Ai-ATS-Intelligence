import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, Copy, RefreshCw, FileText, User, Briefcase, AlignLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

const tones = [
  { value: 'professional', label: 'Professional', icon: Briefcase },
  { value: 'friendly', label: 'Friendly', icon: User },
  { value: 'executive', label: 'Executive', icon: FileText },
  { value: 'concise', label: 'Concise', icon: AlignLeft },
]

function buildLetter(name: string, role: string, company: string, skills: string[], tone: string): string {
  const skillStr = skills.slice(0, 4).join(', ')
  const templates: Record<string, string> = {
    professional: `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${role} position at ${company}. With expertise in ${skillStr}, I am confident in my ability to contribute to your engineering team.\n\nIn my career, I have delivered scalable solutions and collaborated effectively with cross-functional teams. I am excited about the opportunity to bring my skills to ${company}.\n\nBest regards,\n${name}`,
    friendly: `Hi Team,\n\nI was thrilled to find the ${role} opening at ${company}! I've been following your work and believe my experience with ${skillStr} aligns perfectly with what you're building.\n\nI'd love to chat about how I can contribute to your team's success.\n\nCheers,\n${name}`,
    executive: `Dear Hiring Manager,\n\nI am pleased to submit my candidacy for the ${role} position at ${company}. With extensive experience in ${skillStr}, I bring a track record of delivering high-impact solutions.\n\nI look forward to discussing how my expertise can drive value at ${company}.\n\nSincerely,\n${name}`,
    concise: `Dear Hiring Manager,\n\nI am applying for the ${role} role at ${company}. I bring strong ${skillStr} skills and a proven ability to deliver results.\n\nI am available for an interview at your earliest convenience.\n\nBest,\n${name}`,
  }
  return templates[tone] || templates.professional
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function CoverLetter() {
  const { analysisResult } = useApp()
  const candidate = analysisResult?.candidate
  const name = candidate?.name || 'Your Name'
  const role = candidate?.role || 'Target Role'
  const company = candidate?.company || 'Target Company'
  const skills = analysisResult?.skillsAnalysis.hardSkills.filter(s => s.matched).map(s => s.name) || []
  const [tone, setTone] = useState('professional')

  const content = useMemo(() =>
    buildLetter(name, role, company, skills, tone),
    [name, role, company, skills, tone]
  )

  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    downloadText(content, `cover-letter-${tone}.txt`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Cover Letter Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {tones.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTone(value)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                  tone === value
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border bg-card text-text-secondary hover:border-primary/50 hover:text-text'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => {
              /* editable but we don't need to store changes */
            }}
            className="w-full min-h-[350px] rounded-xl border border-border bg-surface p-5 text-sm leading-relaxed text-text placeholder:text-text-secondary outline-none resize-y focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="Start typing your cover letter..."
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              {content.length} characters
            </span>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button onClick={() => setTone(tones[(tones.findIndex(t => t.value === tone) + 1) % tones.length].value)}>
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
