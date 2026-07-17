import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ScanLine, FileText, Briefcase, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/FileUpload'
import { PasteModal } from '@/components/PasteModal'
import { useApp } from '@/context/AppContext'
import { analyzeResume } from '@/services/api'
import { parseFile } from '@/utils/resumeParser'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

async function readFileAsText(file: File): Promise<string> {
  try {
    return await parseFile(file)
  } catch (err) {
    throw new Error('Could not parse file. Please paste the text manually.')
  }
}

export default function Home() {
  const navigate = useNavigate()
  const {
    resumeFile, setResumeFile, resumeText, setResumeText,
    jobDescription, setJobDescription, jdFile, setJdFile,
    analysisStatus, analysisError, setAnalysisStatus, setAnalysisResult, setAnalysisError,
  } = useApp()

  const [showResumePaste, setShowResumePaste] = useState(false)
  const [showJdPaste, setShowJdPaste] = useState(false)

  const hasResume = !!resumeFile || !!resumeText
  const hasJob = !!jobDescription || !!jdFile
  const canAnalyze = hasResume && hasJob && analysisStatus !== 'loading'

  useEffect(() => {
    if (analysisStatus === 'loading') return
    if (analysisStatus === 'complete') {
      navigate('/dashboard', { replace: true })
    }
  }, [analysisStatus, navigate])

  async function handleResumeFile(file: File) {
    try {
      const text = await readFileAsText(file)
      setResumeFile({ name: file.name, size: file.size, type: file.type, text })
      setResumeText(text)
    } catch {
      setResumeFile({ name: file.name, size: file.size, type: file.type, text: '' })
    }
  }

  async function handleJdFile(file: File) {
    try {
      const text = await readFileAsText(file)
      setJdFile({ name: file.name, size: file.size, type: file.type, text })
      setJobDescription(text)
    } catch {
      setJdFile({ name: file.name, size: file.size, type: file.type, text: '' })
    }
  }

  async function handleAnalyze() {
    if (!canAnalyze) return

    const resumeContent = resumeText || resumeFile?.text || ''
    const jdContent = jobDescription || jdFile?.text || ''

    if (!resumeContent || !jdContent) {
      setAnalysisError('Both resume and job description are required.')
      return
    }

    setAnalysisStatus('loading')
    setAnalysisError(null)

    try {
      const result = await analyzeResume(resumeContent, jdContent)
      setAnalysisResult(result)
      setAnalysisStatus('complete')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
      setAnalysisStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
          <ScanLine className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
          Resume Intelligence
        </h1>
        <p className="mt-2 text-base text-text-secondary max-w-lg mx-auto">
          Upload your resume and job description for an instant ATS compatibility analysis.
        </p>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Resume Section */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text">Resume</h2>
                <p className="text-xs text-text-secondary">Upload or paste your resume</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(hasResume) && (
                <Button variant="ghost" size="sm" onClick={() => { setResumeFile(null); setResumeText('') }}>
                  Clear
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowResumePaste(true)}>
                Paste Text
              </Button>
            </div>
          </div>
          <FileUpload
            onFileSelect={handleResumeFile}
            onClear={() => { setResumeFile(null); setResumeText('') }}
            fileName={resumeFile?.name || null}
            accept=".pdf,.doc,.docx"
            label="Upload File"
          />
          {resumeText && !resumeFile && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">Pasted Resume</p>
                <p className="text-xs text-text-secondary">{resumeText.length} characters</p>
              </div>
              <button
                onClick={() => setResumeText('')}
                className="text-xs text-danger hover:underline"
              >
                Remove
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Job Description Section */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                <Briefcase className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text">Job Description</h2>
                <p className="text-xs text-text-secondary">Upload or paste the job description</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(hasJob) && (
                <Button variant="ghost" size="sm" onClick={() => { setJdFile(null); setJobDescription('') }}>
                  Clear
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowJdPaste(true)}>
                Paste Text
              </Button>
            </div>
          </div>
          <FileUpload
            onFileSelect={handleJdFile}
            onClear={() => { setJdFile(null); setJobDescription('') }}
            fileName={jdFile?.name || null}
            accept=".txt,.pdf,.docx"
            label="Upload File"
          />
          {jobDescription && !jdFile && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                <Briefcase className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">Pasted Job Description</p>
                <p className="text-xs text-text-secondary">{jobDescription.length} characters</p>
              </div>
              <button
                onClick={() => setJobDescription('')}
                className="text-xs text-danger hover:underline"
              >
                Remove
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Analyze Button */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3">
          <Button
            size="lg"
            disabled={!canAnalyze}
            onClick={handleAnalyze}
            className="w-full sm:w-auto min-w-[240px] h-12 text-base gap-2 transition-all duration-300"
          >
            {analysisStatus === 'loading' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Analyze Resume
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          {!hasResume && (
            <p className="text-sm text-text-secondary">Upload or paste a resume to get started</p>
          )}
          {hasResume && !hasJob && (
            <p className="text-sm text-text-secondary">Add a job description to enable analysis</p>
          )}
        </motion.div>
      </motion.div>

      {/* Error State */}
      {analysisStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-center"
        >
          <p className="text-sm text-danger">{analysisError || 'Analysis failed. Please try again.'}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setAnalysisStatus('idle')}>
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* Loading Overlay */}
      {analysisStatus === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4 rounded-2xl bg-card p-8 shadow-xl border border-border"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-base font-semibold text-text">Analyzing Your Resume</p>
              <p className="text-sm text-text-secondary mt-1">Comparing against job requirements...</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Paste Modals */}
      <PasteModal
        open={showResumePaste}
        onClose={() => setShowResumePaste(false)}
        onSave={(text) => setResumeText(text)}
        title="Paste Resume Text"
        placeholder="Paste your full resume text here..."
        initialValue={resumeText}
      />
      <PasteModal
        open={showJdPaste}
        onClose={() => setShowJdPaste(false)}
        onSave={(text) => setJobDescription(text)}
        title="Paste Job Description"
        placeholder="Paste the job description text here..."
        initialValue={jobDescription}
      />
    </div>
  )
}
