export interface DiffLine {
  text: string
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  lineNumber: number
}

function normalizeLine(line: string): string {
  return line.replace(/\s+/g, ' ').trim()
}

export function computeDiff(original: string, optimized: string): DiffLine[] {
  const origLines = original.split('\n').map(normalizeLine)
  const optLines = optimized.split('\n').map(normalizeLine)
  const result: DiffLine[] = []
  const maxLen = Math.max(origLines.length, optLines.length)
  let lineNum = 0

  for (let i = 0; i < maxLen; i++) {
    const orig = origLines[i] || ''
    const opt = optLines[i] || ''

    if (orig === opt) {
      if (orig) {
        result.push({ text: orig, type: 'unchanged', lineNumber: ++lineNum })
      }
    } else if (!orig && opt) {
      result.push({ text: opt, type: 'added', lineNumber: ++lineNum })
    } else if (orig && !opt) {
      result.push({ text: orig, type: 'removed', lineNumber: ++lineNum })
    } else {
      const origWords = orig.split(/\s+/)
      const optWords = opt.split(/\s+/)
      const overlap = origWords.filter(w => optWords.includes(w)).length
      const total = Math.max(origWords.length, optWords.length)
      const similarity = total > 0 ? overlap / total : 0
      result.push({ text: opt, type: similarity > 0.3 ? 'modified' : 'added', lineNumber: ++lineNum })
    }
  }

  return result
}

export interface ComparisonSummary {
  originalScore: number
  optimizedScore: number
  improvement: number
  keywordsAdded: number
  sectionsAdded: string[]
  bulletsImproved: number
  grammarFixed: number
  formattingFixed: number
  newSkillsAdded: number
  actionVerbsAdded: number
  changedLines: number
}

export function buildComparisonSummary(
  originalScore: number,
  optimizedScore: number,
  diff: DiffLine[],
  optimizedChanges: { original: string; improved: string; reason: string }[]
): ComparisonSummary {
  const changedLines = diff.filter(d => d.type !== 'unchanged').length
  const addedSections = new Set<string>()
  const reasonKeywords = optimizedChanges.map(c => c.reason.toLowerCase())
  const keywordsAdded = reasonKeywords.filter(r => r.includes('ats keyword')).length
  const bulletsImproved = reasonKeywords.filter(r => r.includes('action verb')).length
  const actionVerbsAdded = reasonKeywords.filter(r => r.includes('action verb')).length
  const newSkillsAdded = keywordsAdded
  const sectionsMap: Record<string, string> = {
    certifications: 'Certifications',
    achievements: 'Achievements',
    languages: 'Languages',
    summary: 'Professional Summary',
  }

  for (const c of optimizedChanges) {
    const reason = c.reason.toLowerCase()
    for (const [key, label] of Object.entries(sectionsMap)) {
      if (reason.includes(key)) addedSections.add(label)
    }
  }

  return {
    originalScore,
    optimizedScore,
    improvement: optimizedScore - originalScore,
    keywordsAdded,
    sectionsAdded: [...addedSections],
    bulletsImproved,
    grammarFixed: 0,
    formattingFixed: 0,
    newSkillsAdded,
    actionVerbsAdded,
    changedLines,
  }
}
