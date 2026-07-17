export interface StructuredResume {
  name: string
  contact: {
    email: string
    phone: string
    linkedin?: string
    website?: string
    location?: string
    github?: string
    portfolio?: string
  }
  summary: string
  skills: string[]
  hardSkills?: string[]
  softSkills?: string[]
  experience: {
    title: string
    company: string
    location?: string
    dates: string
    bullets: string[]
  }[]
  projects: {
    name: string
    description: string
    tech?: string[]
    link?: string
  }[]
  education: {
    degree: string
    school: string
    year: string
    gpa?: string
    details?: string[]
  }[]
  certifications: string[]
  achievements: string[]
  languages?: string[]
  publications?: string[]
  volunteer?: {
    organization: string
    role: string
    dates: string
    description: string
  }[]
  rawText: string
}

export interface ResumeSection {
  heading: string
  lines: string[]
}

export interface ScoreDetail {
  score: number
  reason: string
  recommendation: string
  priority: 'high' | 'medium' | 'low'
}

export interface HealthScore {
  score: number
  status: 'healthy' | 'moderate' | 'critical'
  label: string
}

export interface DeepAnalysis {
  contactInfo: { score: number; hasName: boolean; hasEmail: boolean; hasPhone: boolean; hasLinkedin: boolean }
  resumeSections: { score: number; found: string[]; missing: string[] }
  formatting: { score: number; hasBullets: boolean; hasConsistentDates: boolean; properLength: boolean }
  keywords: { score: number; matched: string[]; missing: string[]; density: { keyword: string; density: number }[] }
  hardSkills: { score: number; matched: string[]; missing: string[]; totalRequired: number }
  softSkills: { score: number; matched: string[]; missing: string[] }
  experience: { score: number; totalYears: number; hasActionVerbs: boolean; hasQuantifiedResults: boolean }
  education: { score: number; hasDegree: boolean; degreeLevel: string; hasRelevantField: boolean }
  projects: { score: number; count: number; hasDescriptions: boolean }
  actionVerbs: { score: number; count: number; verbs: string[] }
  quantifiedAchievements: { score: number; count: number; examples: string[] }
  jobTitleMatch: { score: number; titleOverlap: number }
  missingSkills: { score: number; count: number; critical: string[] }
  keywordDensity: { score: number; overused: string[]; underused: string[] }
  duplicateKeywords: { score: number; count: number }
  readability: { score: number; avgSentenceLength: number; complexWords: number }
  grammar: { score: number; issues: { text: string; suggestion: string }[] }
  spelling: { score: number; issues: { word: string; suggestion: string }[] }
  parseConfidence: { score: number; confidence: 'high' | 'medium' | 'low'; reason: string }
  recruiterFriendliness: { score: number; hasProfessionalSummary: boolean; hasQuantifiedResults: boolean; hasActionVerbs: boolean; hasConsistentFormatting: boolean }
  scores?: {
    contact: ScoreDetail
    sections: ScoreDetail
    formatting: ScoreDetail
    keywords: ScoreDetail
    hardSkills: ScoreDetail
    softSkills: ScoreDetail
    projects: ScoreDetail
    experience: ScoreDetail
    education: ScoreDetail
    achievements: ScoreDetail
    certifications: ScoreDetail
    grammar: ScoreDetail
    readability: ScoreDetail
    actionVerbs: ScoreDetail
    keywordDensity: ScoreDetail
    atsParsingRisk: ScoreDetail
    sectionOrder: ScoreDetail
    jobTitleMatch: ScoreDetail
  }
  health?: {
    ats: HealthScore
    recruiterReadability: HealthScore
    keywordHealth: HealthScore
    formattingHealth: HealthScore
    contentHealth: HealthScore
    impactHealth: HealthScore
    grammarHealth: HealthScore
    skillsHealth: HealthScore
  }
  missingSections?: { section: string; severity: 'high' | 'medium' | 'low'; suggestion: string }[]
}

export interface ScoringResult {
  overallScore: number
  matchScore: number
  categoryScores: {
    skills: number
    experience: number
    keywords: number
    formatting: number
    sections: number
    actionVerbs: number
  }
  deepAnalysis: DeepAnalysis
}

export interface OptimizedResume {
  sections: ResumeSection[]
  formattedText: string
  addedKeywords: string[]
  changes: { original: string; improved: string; reason: string }[]
}

export const SECTION_WEIGHTS = {
  keywords: 0.30,
  skills: 0.25,
  formatting: 0.15,
  experience: 0.15,
  education: 0.05,
  projects: 0.05,
  readability: 0.05,
}
