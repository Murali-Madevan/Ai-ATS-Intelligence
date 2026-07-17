import type { ATSResult } from '@/types'
import type { StructuredResume, ScoringResult } from '@/types/resume'
import { buildStructuredResume } from '@/utils/resumeParser'
import { scoreResume, analyzeJD } from '@/utils/scoringEngine'

function calculateImportance(keyword: string, jdText: string, jdKeywordsList: string[]): 'high' | 'medium' | 'low' {
  const lowerJd = jdText.toLowerCase()
  const lowerKw = keyword.toLowerCase()

  const count = (lowerJd.match(new RegExp(`\\b${lowerKw.replace(/[.+^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')) || []).length

  if (count >= 3) return 'high'
  if (count >= 2) return 'medium'

  const firstThird = jdText.substring(0, Math.ceil(jdText.length / 3)).toLowerCase()
  if (firstThird.includes(lowerKw)) return 'high'

  const idx = jdKeywordsList.findIndex(k => k.toLowerCase() === lowerKw)
  if (idx >= 0 && idx < jdKeywordsList.length * 0.3) return 'high'

  return 'low'
}

function findEvidenceInJD(keyword: string, jdText: string): string {
  const lines = jdText.split('\n').filter(l => l.trim())
  const lower = keyword.toLowerCase()
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.toLowerCase().includes(lower)) {
      return trimmed.length > 150 ? trimmed.substring(0, 147) + '...' : trimmed
    }
  }
  for (const line of lines) {
    const trimmed = line.trim()
    if (keyword.split(' ').some(w => w.length > 2 && trimmed.toLowerCase().includes(w.toLowerCase()))) {
      return trimmed.length > 150 ? trimmed.substring(0, 147) + '...' : trimmed
    }
  }
  return ''
}

export async function analyzeResume(resumeText: string, jdText: string): Promise<ATSResult> {
  let structured: StructuredResume
  try {
    structured = buildStructuredResume(resumeText)
  } catch (e) {
    throw new Error('Failed to parse resume structure. Please check your resume text.')
  }

  let jdKeywordList: string[]
  try {
    jdKeywordList = analyzeJD(jdText)
  } catch (e) {
    throw new Error('Failed to analyze job description. Please check your JD text.')
  }

  let scoring: ScoringResult
  try {
    scoring = scoreResume(structured, jdKeywordList, jdText)
  } catch (e) {
    throw new Error('Failed to score resume. Please try again.')
  }

  const { deepAnalysis: d } = scoring

  const matched = d.keywords.matched
  const missing = d.keywords.missing

  const radarData = [
    { category: 'Keywords', value: scoring.categoryScores.keywords, fullMark: 100 },
    { category: 'Skills', value: scoring.categoryScores.skills, fullMark: 100 },
    { category: 'Experience', value: scoring.categoryScores.experience, fullMark: 100 },
    { category: 'Formatting', value: scoring.categoryScores.formatting, fullMark: 100 },
    { category: 'Sections', value: scoring.categoryScores.sections, fullMark: 100 },
    { category: 'Impact', value: scoring.categoryScores.actionVerbs, fullMark: 100 },
  ]

  const highlights: string[] = []
  if (d.contactInfo.score >= 70) highlights.push('Contact information is complete and professional')
  if (d.resumeSections.found.length >= 3) highlights.push('Resume includes all critical ATS sections')
  if (d.hardSkills.matched.length >= 3) highlights.push(`Strong technical match: ${d.hardSkills.matched.slice(0, 3).join(', ')}`)
  if (d.experience.hasActionVerbs) highlights.push('Uses strong action verbs throughout experience')
  if (d.experience.hasQuantifiedResults) highlights.push('Includes quantified achievements with metrics')
  if (d.keywords.matched.length >= 5) highlights.push(`High keyword density with ${d.keywords.matched.length} matched terms`)
  if (d.formatting.hasBullets) highlights.push('Well-structured with bullet points for readability')
  if (d.education.hasDegree) highlights.push('Education section with relevant degree')
  if (d.projects.count > 0) highlights.push(`Includes ${d.projects.count} project(s) demonstrating practical skills`)
  if (highlights.length === 0) highlights.push('Resume submitted for analysis')

  const improvements: string[] = []
  if (d.missingSkills.count > 0) improvements.push(`Add missing skills: ${d.missingSkills.critical.slice(0, 3).join(', ')}`)
  if (!d.experience.hasQuantifiedResults) improvements.push('Quantify achievements with metrics (percentages, numbers)')
  if (!d.experience.hasActionVerbs) improvements.push('Use strong action verbs to start bullet points')
  if (d.jobTitleMatch.score < 50) improvements.push('Align job titles with target role keywords')
  if (d.keywordDensity.overused.length > 0) improvements.push(`Reduce overused keywords: ${d.keywordDensity.overused.slice(0, 3).join(', ')}`)
  if (d.keywordDensity.underused.length > 0) improvements.push(`Increase usage of: ${d.keywordDensity.underused.slice(0, 3).join(', ')}`)
  if (d.formatting.score < 60) improvements.push('Improve resume formatting for better ATS readability')
  if (d.resumeSections.missing.length > 0) improvements.push(`Add missing sections: ${d.resumeSections.missing.join(', ')}`)
  if (d.projects.count === 0) improvements.push('Include relevant projects to demonstrate practical experience')
  if (improvements.length === 0) improvements.push('Continue refining bullet points for stronger impact')

  const allSkillsForGap = [...new Set([...matched, ...missing])]
  const skillGap = allSkillsForGap.slice(0, 20).map(sk => {
    const isMatched = matched.includes(sk)
    const imp = calculateImportance(sk, jdText, jdKeywordList)
    return {
      skill: sk,
      status: (isMatched ? 'matched' : 'missing') as 'matched' | 'missing' | 'partial',
      priority: imp as 'high' | 'medium' | 'low',
      resource: isMatched ? '' : `https://www.google.com/search?q=learn+${encodeURIComponent(sk)}`,
      importance: imp,
      evidence: findEvidenceInJD(sk, jdText),
    }
  })

  skillGap.sort((a, b) => {
    const pri = { high: 0, medium: 1, low: 2 }
    return pri[a.importance as keyof typeof pri] - pri[b.importance as keyof typeof pri]
  })

  return {
    overallScore: scoring.overallScore,
    matchScore: scoring.matchScore,
    categoryScores: scoring.categoryScores,
    deepAnalysis: d,
    structuredResume: structured,
    summary: `Your resume scored ${scoring.overallScore}% overall. ${d.hardSkills.matched.length} of ${d.hardSkills.totalRequired} required technical skills matched. ${missing.length} keyword gaps identified. ${d.experience.hasActionVerbs ? 'Action verbs detected.' : 'Add action verbs to strengthen impact.'} ${d.experience.hasQuantifiedResults ? 'Quantified results found — good.' : 'Add metrics to quantify achievements.'} ATS compatibility is ${scoring.overallScore >= 80 ? 'strong' : scoring.overallScore >= 60 ? 'moderate' : 'needing improvement'}.`,
    candidate: {
      name: structured.name || 'Candidate',
      role: structured.experience[0]?.title || 'Professional',
      company: jdText.split('\n')[0]?.replace(/^[#*]*\s*/, '').trim() || 'Target Company',
      email: structured.contact.email || '',
      phone: structured.contact.phone || '',
    },
    radarData,
    highlights: highlights.slice(0, 4),
    improvements: improvements.slice(0, 4),
    platformScores: [],
    keywordMatch: {
      matched: matched.slice(0, 12),
      missing: missing.slice(0, 10),
      density: d.keywords.density.slice(0, 10),
      priority: d.missingSkills.critical.slice(0, 5).map(sk => ({
        keyword: sk,
        priority: 'high' as const,
      })),
    },
    skillGap,
    contentAnalysis: {
      measurableResults: d.quantifiedAchievements.count > 0 ? d.quantifiedAchievements.examples.slice(0, 3).map(ex => ({
        text: ex,
        fix: 'Good — quantified result present',
        reason: 'Metrics strengthen resume impact',
      })) : [
        { text: 'No quantified achievements found', fix: 'Add specific numbers, percentages, or metrics to your bullet points', reason: 'Hiring managers prioritize quantifiable impact' },
      ],
      spellingGrammar: [],
    },
    formatAnalysis: {
      dateFormatting: { pass: d.formatting.hasConsistentDates, detail: d.formatting.hasConsistentDates ? 'Date formatting is consistent.' : 'Ensure date formats are consistent across all entries.' },
      resumeLength: {
        pass: d.formatting.properLength,
        detail: `Resume length is ${d.formatting.properLength ? 'appropriate' : 'suboptimal'} for ATS parsing.`,
        tip: 'Keep resume to 1-2 pages for optimal ATS processing.',
      },
      bulletPoints: {
        pass: d.formatting.hasBullets,
        suggestions: d.formatting.hasBullets ? [] : [
          { text: 'Use bullet points for experience entries', fix: 'Convert paragraphs into scannable bullet points', reason: 'ATS parsers extract bullet points more reliably' },
        ],
      },
      headingHierarchy: {
        pass: !!(structured?.name && structured?.summary && (structured?.experience?.length > 0 || structured?.projects?.length > 0)),
        detail: 'Section headings are detected and organized.',
      },
      pageCount: {
        pass: d.formatting.properLength,
        detail: d.formatting.properLength ? 'Resume length is within optimal 1-2 page range.' : 'Consider condensing to 1-2 pages.',
      },
    },
    sectionsAnalysis: {
      sections: [
        { name: 'Name', present: !!structured.name, value: structured.name || undefined },
        { name: 'Email Address', present: !!structured.contact.email, value: structured.contact.email || undefined },
        { name: 'Phone Number', present: !!structured.contact.phone, value: structured.contact.phone || undefined },
        { name: 'LinkedIn', present: !!structured.contact.linkedin },
        { name: 'Professional Summary', present: !!structured.summary },
        { name: 'Work Experience', present: structured.experience.length > 0 },
        { name: 'Education', present: structured.education.length > 0 },
        { name: 'Technical Skills', present: structured.skills.length > 0 },
        { name: 'Projects', present: structured.projects.length > 0 },
        { name: 'Certifications', present: structured.certifications.length > 0 },
        { name: 'Achievements', present: structured.achievements.length > 0 },
        { name: 'Publications', present: !!structured.rawText.match(/\bpublications?\b/i) },
        { name: 'Languages', present: !!structured.rawText.match(/\blanguages?\b/i) },
        { name: 'Volunteer', present: !!structured.rawText.match(/\bvolunteer(ing)?\b/i) },
        { name: 'Internships', present: !!structured.rawText.match(/\bintern(ship)?\b/i) },
      ],
    },
    styleAnalysis: {
      voice: {
        pass: d.experience.hasActionVerbs,
        detail: d.experience.hasActionVerbs ? 'Professional tone with action-oriented language.' : 'Consider using more active, achievement-oriented language.',
        tones: ['professional', 'action-oriented'],
      },
      buzzwords: {
        pass: d.keywordDensity.overused.length === 0,
        suggestions: d.keywordDensity.overused.length > 0 ? [
          { text: `Overused keywords: ${d.keywordDensity.overused.slice(0, 3).join(', ')}`, fix: 'Vary terminology and reduce repetition', reason: 'ATS systems flag keyword stuffing' },
        ] : [],
      },
    },
    skillsAnalysis: {
      hardSkills: [...new Set([...d.hardSkills.matched, ...d.hardSkills.missing])].slice(0, 12).map(sk => ({
        name: sk,
        required: d.hardSkills.missing.includes(sk) || d.hardSkills.matched.includes(sk),
        matched: d.hardSkills.matched.includes(sk),
        jdCount: 1,
        resumeCount: d.hardSkills.matched.includes(sk) ? 1 : 0,
      })),
      softSkills: d.softSkills.matched.map(sk => ({
        name: sk,
        required: d.softSkills.missing.includes(sk),
        matched: true,
        jdCount: d.softSkills.missing.includes(sk) ? 1 : 0,
        resumeCount: 1,
      })),
    },
  }
}
