import type { StructuredResume } from '@/types/resume'
import { TECH_KEYWORDS } from '@/utils/keywords'

const TECH_KEYWORDS_SET = new Set(TECH_KEYWORDS.map(k => k.toLowerCase()))

export interface CategorizedKeyword {
  keyword: string
  category: 'matched' | 'missing' | 'overused' | 'recommended' | 'required' | 'optional'
  priority: 'high' | 'medium' | 'low'
  density: number
  suggestion: string
}

export function categorizeKeywords(
  jdKeywords: string[],
  resume: StructuredResume,
  jdText: string
): CategorizedKeyword[] {
  const result: CategorizedKeyword[] = []
  const resumeText = resume.rawText.toLowerCase()
  const resumeSkills = new Set(resume.skills.map(s => s.toLowerCase()))
  const lowerJd = jdText.toLowerCase()

  for (const kw of jdKeywords) {
    const lower = kw.toLowerCase()
    const density = (resumeText.match(new RegExp(`\\b${lower.replace(/[.+^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')) || []).length
    const isTech = TECH_KEYWORDS_SET.has(lower)
    const inJd = lowerJd.includes(lower)
    const inSkills = resumeSkills.has(lower)
    const inText = resumeText.includes(lower)

    const count = (lowerJd.match(new RegExp(`\\b${lower.replace(/[.+^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')) || []).length
    const firstThird = jdText.substring(0, Math.ceil(jdText.length / 3)).toLowerCase()
    const isRequired = inJd && (count >= 3 || firstThird.includes(lower))

    if (inSkills) {
      if (density > 5) {
        result.push({ keyword: kw, category: 'overused', priority: 'medium', density, suggestion: `Reduce usage of "${kw}" to avoid keyword stuffing.` })
      } else {
        result.push({ keyword: kw, category: 'matched', priority: 'low', density, suggestion: `"${kw}" is well-represented in your resume.` })
      }
    } else if (inText && !inSkills) {
      result.push({ keyword: kw, category: 'recommended', priority: isRequired ? 'high' : 'medium', density, suggestion: `Mention "${kw}" explicitly in your skills section for better ATS matching.` })
    } else {
      const cat: CategorizedKeyword['category'] = isRequired ? 'required' : isTech ? 'missing' : 'optional'
      const pri: CategorizedKeyword['priority'] = isRequired ? 'high' : isTech ? 'medium' : 'low'
      result.push({ keyword: kw, category: cat, priority: pri, density, suggestion: isRequired ? `Critical missing keyword "${kw}". Add it to your resume.` : `Consider adding "${kw}" if relevant to your experience.` })
    }
  }

  return result.sort((a, b) => {
    const pri = { high: 0, medium: 1, low: 2 }
    return pri[a.priority] - pri[b.priority]
  })
}
