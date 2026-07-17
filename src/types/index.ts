import type { DeepAnalysis, StructuredResume } from './resume'

export interface ATSResult {
  overallScore: number
  matchScore: number
  summary: string
  candidate: CandidateInfo
  radarData: RadarData[]
  highlights: string[]
  improvements: string[]
  platformScores: PlatformScore[]
  keywordMatch: KeywordMatch
  skillGap: SkillGap[]
  contentAnalysis: ContentAnalysis
  formatAnalysis: FormatAnalysis
  sectionsAnalysis: SectionsAnalysis
  styleAnalysis: StyleAnalysis
  skillsAnalysis: SkillsAnalysis
  deepAnalysis: DeepAnalysis
  categoryScores: {
    skills: number
    experience: number
    keywords: number
    formatting: number
    sections: number
    actionVerbs: number
  }
  structuredResume?: StructuredResume
}

export interface CandidateInfo {
  name: string
  role: string
  company: string
  email: string
  phone: string
}

export interface RadarData {
  category: string
  value: number
  fullMark: number
}

export interface PlatformScore {
  name: string
  score: number
  pass: boolean
}

export interface KeywordMatch {
  matched: string[]
  missing: string[]
  density: { keyword: string; density: number }[]
  priority: { keyword: string; priority: 'high' | 'medium' | 'low' }[]
}

export interface SkillGap {
  skill: string
  status: 'matched' | 'partial' | 'missing'
  priority: 'high' | 'medium' | 'low'
  resource: string
  importance: 'high' | 'medium' | 'low'
  evidence: string
}

export interface ContentAnalysis {
  measurableResults: SuggestionItem[]
  spellingGrammar: SuggestionItem[]
}

export interface SuggestionItem {
  text: string
  fix?: string
  reason?: string
}

export interface FormatAnalysis {
  dateFormatting: { pass: boolean; detail: string }
  resumeLength: { pass: boolean; detail: string; tip: string }
  bulletPoints: { pass: boolean; suggestions: SuggestionItem[] }
  headingHierarchy?: { pass: boolean; detail: string }
  pageCount?: { pass: boolean; detail: string }
}

export interface SectionsAnalysis {
  sections: SectionItem[]
}

export interface SectionItem {
  name: string
  present: boolean
  value?: string
}

export interface StyleAnalysis {
  voice: { pass: boolean; detail: string; tones: string[] }
  buzzwords: { pass: boolean; suggestions: SuggestionItem[] }
}

export interface SkillsAnalysis {
  hardSkills: SkillMatchItem[]
  softSkills: SkillMatchItem[]
}

export interface SkillMatchItem {
  name: string
  required: boolean
  matched: boolean
  jdCount: number
  resumeCount: number
}

export interface ScanRecord {
  id: string
  date: string
  role: string
  company: string
  score: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface CoverLetterTone {
  value: string
  label: string
}
