import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ATSResult } from '@/types'

export interface FileInfo {
  name: string
  size: number
  type: string
  text: string
}

interface AppContextValue {
  resumeFile: FileInfo | null
  resumeText: string
  jobDescription: string
  jdFile: FileInfo | null
  analysisResult: ATSResult | null
  analysisStatus: 'idle' | 'loading' | 'complete' | 'error'
  analysisError: string | null
  setResumeFile: (file: FileInfo | null) => void
  setResumeText: (text: string) => void
  setJobDescription: (text: string) => void
  setJdFile: (file: FileInfo | null) => void
  setAnalysisResult: (result: ATSResult | null) => void
  setAnalysisStatus: (status: 'idle' | 'loading' | 'complete' | 'error') => void
  setAnalysisError: (error: string | null) => void
  resetAnalysis: () => void
  resetAll: () => void
  hasResume: boolean
  hasJobDescription: boolean
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [resumeFile, setResumeFile] = useState<FileInfo | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jdFile, setJdFile] = useState<FileInfo | null>(null)
  const [analysisResult, setAnalysisResult] = useState<ATSResult | null>(null)
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'loading' | 'complete' | 'error'>('idle')
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const hasResume = !!resumeFile || !!resumeText
  const hasJobDescription = !!jobDescription || !!jdFile

  function resetAnalysis() {
    setAnalysisResult(null)
    setAnalysisStatus('idle')
    setAnalysisError(null)
  }

  function resetAll() {
    setResumeFile(null)
    setResumeText('')
    setJobDescription('')
    setJdFile(null)
    resetAnalysis()
    try { localStorage.removeItem('resonance_scan_history') } catch {}
  }

  return (
    <AppContext.Provider
      value={{
        resumeFile, resumeText, jobDescription, jdFile,
        analysisResult, analysisStatus, analysisError,
        setResumeFile, setResumeText, setJobDescription, setJdFile,
        setAnalysisResult, setAnalysisStatus, setAnalysisError,
        resetAnalysis, resetAll,
        hasResume, hasJobDescription,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
