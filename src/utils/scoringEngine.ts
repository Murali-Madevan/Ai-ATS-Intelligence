import type { StructuredResume, DeepAnalysis, ScoringResult } from '@/types/resume'
import {
  TECH_KEYWORDS,
  SOFT_SKILLS,
  ACTION_VERBS,
  KEYWORD_SYNONYMS,
  REQUIRED_SECTIONS,
  ALL_SECTIONS,
  MULTI_WORD_TERMS,
  normalizeKeyword,
  expandSynonyms
} from './keywords'

function keywordMatchScore(resumeWordSet: Set<string>, jdWordSet: Set<string>, jdKeywordsList: string[], allText: string): number {
  if (jdKeywordsList.length === 0) return 0

  let matched = 0
  const total = jdKeywordsList.length

  for (const jdKw of jdKeywordsList) {
    const expanded = expandSynonyms(jdKw)
    let found = false
    for (const e of expanded) {
      if (resumeWordSet.has(e)) { found = true; break }
      const regex = new RegExp(`\\b${e.replace(/[.+^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (regex.test(allText)) { found = true; break }
    }
    if (found) matched++
  }

  return Math.round((matched / total) * 100)
}

function extractJDSkills(jdText: string): string[] {
  const found: string[] = []
  const lowerJd = jdText.toLowerCase()

  for (const kw of TECH_KEYWORDS) {
    const expanded = expandSynonyms(kw)
    for (const e of expanded) {
      const regex = new RegExp(`\\b${e.replace(/[.+^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (regex.test(jdText)) { found.push(kw); break }
    }
  }

  for (const term of MULTI_WORD_TERMS) {
    if (lowerJd.includes(term)) {
      found.push(term.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
    }
  }

  const words = jdText.split(/[\s,;.()]+/).map(w => w.replace(/[^a-zA-Z0-9+#./_-]/g, '').trim()).filter(w => w.length >= 3)
  const wordFreq = new Map<string, number>()
  for (const w of words) {
    wordFreq.set(w, (wordFreq.get(w) || 0) + 1)
  }
  const commonWords = new Set(['the', 'this', 'that', 'with', 'from', 'have', 'what', 'will', 'your', 'about', 'would', 'should', 'could', 'there', 'their', 'which', 'they', 'been', 'than', 'into', 'also', 'more', 'some', 'such', 'them', 'then', 'when', 'where', 'while', 'after', 'before', 'just', 'like', 'other', 'over', 'very', 'well', 'each', 'many', 'those', 'through', 'work', 'team', 'role', 'year', 'data', 'time', 'code', 'support', 'develop', 'manage', 'create', 'design', 'build', 'test', 'deploy', 'application', 'system', 'service', 'project', 'product', 'feature', 'requirements', 'responsibilities', 'qualifications', 'experience', 'education', 'skills', 'preferred', 'required', 'ability', 'including'])
  const jdSectionWords = ['about', 'summary', 'overview', 'responsibilities', 'qualifications', 'preferred', 'nice to have', 'benefits']

  for (const [word, freq] of wordFreq) {
    if (freq < 2) continue
    const lower = word.toLowerCase()
    if (commonWords.has(lower)) continue
    if (jdSectionWords.some(s => lower.includes(s))) continue
    if (found.some(f => f.toLowerCase() === lower)) continue
    if (lower.length < 3 || lower.length > 30) continue
    if (/^\d+$/.test(lower)) continue
    if (word[0] === word[0].toUpperCase() && lower !== word) {
      found.push(word)
    }
  }

  return [...new Set(found)]
}

function countActionVerbs(text: string): { count: number; verbs: string[] } {
  const found: string[] = []
  for (const verb of ACTION_VERBS) {
    const regex = new RegExp(`\\b${verb}\\b`, 'g')
    if (regex.test(text)) found.push(verb)
  }
  return { count: found.length, verbs: found }
}

function countQuantifiedResults(text: string): { count: number; examples: string[] } {
  const examples: string[] = []
  const lines = text.split('\n')
  for (const line of lines) {
    const hasPercent = /perce?nt|%\b|\d+\s*%/.test(line)
    const hasNumber = /\b\d{2,}\b/.test(line)
    const hasCurrency = /[£$€]\d+/.test(line)
    const hasMetric = /\d+\s*(x|times?|users?|customers?|clients?|revenue|cost|efficiency|performance|speed|time|day|week|month|year)s?\b/i.test(line)
    if (hasPercent || hasNumber || hasCurrency || hasMetric) {
      examples.push(line.trim().substring(0, 120))
    }
  }
  return { count: examples.length, examples: examples.slice(0, 5) }
}

function checkDateConsistency(text: string): boolean {
  const datePatterns = text.match(/(?:19|20)\d{2}\s*[-–to]+\s*(?:(?:19|20)\d{2}|Present|Current|Now)/gi)
  return (datePatterns?.length || 0) >= 2
}

function detectSections(text: string): { found: string[]; missing: string[] } {
  const lower = text.toLowerCase()
  const found: string[] = []
  const missing: string[] = []
  for (const section of ALL_SECTIONS) {
    const regex = new RegExp(`\\b${section.toLowerCase()}\\b`, 'i')
    if (regex.test(lower)) found.push(section)
    else missing.push(section)
  }
  return { found, missing }
}

export function analyzeJD(text: string): string[] {
  return extractJDSkills(text)
}

export function scoreResume(
  resume: StructuredResume,
  jdKeywordsList: string[],
  jdText: string
): ScoringResult {
  const allText = resume.rawText
  const lowerText = allText.toLowerCase()

  const jdKeywordsSet = new Set(jdKeywordsList.map(k => k.toLowerCase()))
  const resumeSkillSet = new Set(resume.skills.map(s => s.toLowerCase()))

  const resumeWordSet = new Set<string>()
  const normalizedResumeWords = allText.toLowerCase().split(/[\s,;.()]+/).filter(w => w.length > 2)
  for (const w of normalizedResumeWords) resumeWordSet.add(w)

  const jdWordSet = new Set<string>()
  const normalizedJDWords = jdText.toLowerCase().split(/[\s,;.()]+/).filter(w => w.length > 2)
  for (const w of normalizedJDWords) jdWordSet.add(w)

  const matchedSkills = jdKeywordsList.filter(k => resumeSkillSet.has(k.toLowerCase()))
  const missingSkills = jdKeywordsList.filter(k => !resumeSkillSet.has(k.toLowerCase()))

  const allJdSkills = TECH_KEYWORDS.filter(k => {
    const expanded = expandSynonyms(k)
    for (const e of expanded) {
      const regex = new RegExp(`\\b${e.replace(/[.+^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (regex.test(jdText)) return true
    }
    return false
  })
  const totalRequiredSkills = allJdSkills.length || 1
  const matchedRequiredSkills = allJdSkills.filter(s => resumeSkillSet.has(s.toLowerCase()))

  const softSkillMatches: string[] = []
  const softSkillMissing: string[] = []
  for (const ss of SOFT_SKILLS) {
    const pattern = ss.replace(/[.\s-]/g, '[.\\s-]')
    const regex = new RegExp(pattern, 'i')
    const inJd = regex.test(jdText)
    const inResume = regex.test(allText)
    if (inResume) softSkillMatches.push(ss)
    if (inJd && !inResume) softSkillMissing.push(ss)
  }

  const actionVerbs = countActionVerbs(allText)
  const quantified = countQuantifiedResults(allText)

  const totalExperience = resume.experience.reduce((sum, exp) => {
    const years = exp.dates.match(/\d{4}/g)
    if (years && years.length >= 2) {
      return sum + (parseInt(years[years.length - 1]) - parseInt(years[0]))
    }
    return sum + 2
  }, 0)

  const sectionNames = resume.experience.map(e => e.title.toLowerCase())
  const jdTitleWords = jdText.split('\n').slice(0, 3).join(' ').toLowerCase().split(/[\s,]+/).filter(w => w.length > 3)
  const titleOverlap = jdTitleWords.length > 0
    ? jdTitleWords.filter(w => sectionNames.some(s => s.includes(w))).length / jdTitleWords.length
    : 0

  const hasBullets = resume.experience.some(e => e.bullets.length > 0) || resume.projects.some(p => p.description.length > 0)
  const hasConsistentDates = checkDateConsistency(allText)
  const properLength = allText.split('\n').length >= 20 && allText.split('\n').length <= 100

  const foundSections = REQUIRED_SECTIONS.filter(s => {
    const regex = new RegExp(`\\b${s}\\b`, 'i')
    return regex.test(allText)
  })
  const missingSectionsList = REQUIRED_SECTIONS.filter(s => !foundSections.includes(s))

  const allSectionInfo = detectSections(allText)

  const keywordDensityMap = new Map<string, number>()
  for (const kw of [...matchedSkills, ...resume.skills]) {
    const expanded = expandSynonyms(kw)
    let totalCount = 0
    for (const e of expanded) {
      const regex = new RegExp(`\\b${e.replace(/[.+^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      const matches = allText.match(regex)
      if (matches) totalCount += matches.length
    }
    if (totalCount > 0) keywordDensityMap.set(kw, totalCount)
  }
  const overused = [...keywordDensityMap.entries()].filter(([_, c]) => c > 5).map(([k]) => k)
  const underused = [...keywordDensityMap.entries()].filter(([_, c]) => c === 1).map(([k]) => k)

  const s = (value: number, min = 0, max = 100) => Math.round(Math.max(min, Math.min(max, value)))

  const keywordScore = keywordMatchScore(resumeWordSet, jdWordSet, jdKeywordsList, allText)
  const requiredSkillsScore = s((matchedRequiredSkills.length / totalRequiredSkills) * 100)

  const formattingScore = s(
    (hasBullets ? 35 : 0) +
    (hasConsistentDates ? 25 : 0) +
    (properLength ? 20 : 0) +
    (resume.summary ? 20 : 0)
  )

  const experienceScore = s(
    (resume.experience.length > 0 ? 30 : 0) +
    (totalExperience >= 3 ? 20 : totalExperience >= 1 ? 10 : 0) +
    (actionVerbs.count >= 3 ? 25 : actionVerbs.count >= 1 ? 15 : 0) +
    (quantified.count >= 1 ? 15 : 0) +
    (titleOverlap > 0.2 ? 10 : 0)
  )

  const educationScore = s(
    (resume.education.length > 0 ? 50 : 0) +
    (resume.education.some(e => /(Bachelor|Master|PhD|B\.|M\.|BE|ME|BTech|MTech)/i.test(e.degree)) ? 40 : 0) +
    (resume.education.some(e => e.gpa) ? 10 : 0)
  )

  const projectsScore = s(
    (resume.projects.length > 0 ? 50 : 0) +
    (resume.projects.filter(p => p.description.length > 20).length * 15) +
    (resume.projects.some(p => p.tech && p.tech.length > 0) ? 20 : 0)
  )

  // === Grammar check (basic heuristics) ===
  const grammarIssues: { text: string; suggestion: string }[] = []
  const sentences = allText.split(/[.!?]+\s+/).filter(Boolean)
  for (const sent of sentences) {
    const trimmed = sent.trim()
    if (!trimmed) continue
    if (trimmed.length > 0 && trimmed[0] !== trimmed[0].toUpperCase() && trimmed[0].match(/[a-z]/)) {
      grammarIssues.push({ text: trimmed.substring(0, 60), suggestion: 'Capitalize the first letter of this sentence.' })
    }
    if ((trimmed.match(/\s{2,}/g) || []).length > 0) {
      grammarIssues.push({ text: trimmed.substring(0, 60), suggestion: 'Remove extra spaces between words.' })
    }
  }
  const grammarScore = s(grammarIssues.length === 0 ? 100 : Math.max(0, 100 - grammarIssues.length * 20))

  // === Spelling check (basic — flags words with repeated characters or odd patterns) ===
  const spellingIssues: { word: string; suggestion: string }[] = []
  const words = allText.split(/[\s,;.()]+/).filter(w => w.length > 2)
  for (const word of words) {
    const clean = word.replace(/[^a-zA-Z]/g, '')
    if (clean.length > 2 && /(.)\1{2,}/.test(clean)) {
      spellingIssues.push({ word: clean.substring(0, 30), suggestion: `"${clean}" may have repeated characters.` })
    }
  }
  const spellingScore = s(spellingIssues.length === 0 ? 100 : Math.max(0, 100 - spellingIssues.length * 15))

  // === Parse confidence ===
  let parseConfidence: 'high' | 'medium' | 'low' = 'low'
  let parseReason = 'Unable to detect resume structure.'
  const hasName = !!resume.name
  const hasEmail = !!resume.contact.email
  const hasSections = allSectionInfo.found.length > 0
  if (hasName && hasEmail && hasSections) {
    parseConfidence = 'high'
    parseReason = 'Name, email, and multiple sections detected.'
  } else if ((hasName || hasEmail) && hasSections) {
    parseConfidence = 'medium'
    parseReason = 'Some identifying information and sections detected.'
  } else {
    parseConfidence = 'low'
    parseReason = 'Could not reliably identify resume structure.'
  }
  const parseConfidenceScore = s(parseConfidence === 'high' ? 90 : parseConfidence === 'medium' ? 60 : 30)

  // === Recruiter friendliness ===
  const hasProfessionalSummary = !!resume.summary
  const hasQuantifiedResults = quantified.count > 0
  const hasActionVerbsUsed = actionVerbs.count > 0
  const hasConsistentFormatting = hasBullets && hasConsistentDates && properLength
  const recruiterScore = s(
    (hasProfessionalSummary ? 25 : 0) +
    (hasQuantifiedResults ? 25 : 0) +
    (hasActionVerbsUsed ? 25 : 0) +
    (hasConsistentFormatting ? 25 : 0)
  )

  const readabilityScore = s(properLength ? 80 : 40)

  const contactScore = s(
    (resume.name ? 20 : 0) +
    (resume.contact.email ? 25 : 0) +
    (resume.contact.phone ? 25 : 0) +
    (resume.contact.linkedin ? 15 : 0) +
    (resume.contact.website || resume.contact.location ? 15 : 0)
  )

  const sectionsScore = s(
    (foundSections.length / REQUIRED_SECTIONS.length) * 60 +
    (allSectionInfo.found.length / ALL_SECTIONS.length) * 40
  )

  const actionVerbsScore = s(Math.min(actionVerbs.count * 10, 100))
  const quantifiedScore = s(Math.min(quantified.count * 15, 100))
  const jobTitleScore = s(Math.round(titleOverlap * 100))
  const missingSkillsPenaltyScore = s(missingSkills.length === 0 ? 100 : Math.max(0, 100 - missingSkills.length * 15))
  const duplicatesScore = s(Math.max(0, 100 - overused.length * 15))

  const deepAnalysis: DeepAnalysis = {
    contactInfo: { score: contactScore, hasName: !!resume.name, hasEmail: !!resume.contact.email, hasPhone: !!resume.contact.phone, hasLinkedin: !!resume.contact.linkedin },
    resumeSections: { score: sectionsScore, found: [...foundSections, ...allSectionInfo.found.filter(s => !foundSections.includes(s))], missing: allSectionInfo.missing },
    formatting: { score: formattingScore, hasBullets, hasConsistentDates, properLength },
    keywords: { score: keywordScore, matched: matchedSkills, missing: missingSkills, density: [...keywordDensityMap.entries()].slice(0, 10).map(([k, d]) => ({ keyword: k, density: d })) },
    hardSkills: { score: requiredSkillsScore, matched: matchedRequiredSkills, missing: missingSkills, totalRequired: totalRequiredSkills },
    softSkills: { score: s(softSkillMatches.length > 0 ? (softSkillMatches.length / Math.max(softSkillMatches.length + softSkillMissing.length, 1)) * 100 : 40), matched: softSkillMatches, missing: softSkillMissing },
    experience: { score: experienceScore, totalYears: totalExperience, hasActionVerbs: actionVerbs.count > 0, hasQuantifiedResults: quantified.count > 0 },
    education: { score: educationScore, hasDegree: resume.education.length > 0, degreeLevel: resume.education[0]?.degree || 'None', hasRelevantField: resume.education.length > 0 },
    projects: { score: projectsScore, count: resume.projects.length, hasDescriptions: resume.projects.some(p => p.description.length > 20) },
    actionVerbs: { score: actionVerbsScore, count: actionVerbs.count, verbs: actionVerbs.verbs },
    quantifiedAchievements: { score: quantifiedScore, count: quantified.count, examples: quantified.examples },
    jobTitleMatch: { score: jobTitleScore, titleOverlap: Math.round(titleOverlap * 100) },
    missingSkills: { score: missingSkillsPenaltyScore, count: missingSkills.length, critical: missingSkills.slice(0, 5) },
    keywordDensity: { score: s(100 - overused.length * 10), overused, underused },
    duplicateKeywords: { score: duplicatesScore, count: overused.length },
    readability: { score: readabilityScore, avgSentenceLength: Math.round(allText.split(/[.!?]+/).reduce((a, s) => a + s.split(' ').length, 0) / Math.max(allText.split(/[.!?]+/).length, 1)), complexWords: 0 },
    grammar: { score: grammarScore, issues: grammarIssues.slice(0, 5) },
    spelling: { score: spellingScore, issues: spellingIssues.slice(0, 5) },
    parseConfidence: { score: parseConfidenceScore, confidence: parseConfidence, reason: parseReason },
    recruiterFriendliness: { score: recruiterScore, hasProfessionalSummary, hasQuantifiedResults, hasActionVerbs: hasActionVerbsUsed, hasConsistentFormatting },
  }

  const categoryScores = {
    skills: requiredSkillsScore,
    experience: experienceScore,
    keywords: keywordScore,
    formatting: formattingScore,
    sections: sectionsScore,
    actionVerbs: s(actionVerbsScore * 0.5 + quantifiedScore * 0.5),
  }

  const overallScore = s(
    keywordScore * 0.30 +
    requiredSkillsScore * 0.25 +
    formattingScore * 0.10 +
    experienceScore * 0.15 +
    educationScore * 0.05 +
    projectsScore * 0.05 +
    readabilityScore * 0.05 +
    contactScore * 0.05
  )

  return {
    overallScore,
    matchScore: overallScore,
    categoryScores,
    deepAnalysis,
  }
}
