import type { DeepAnalysis, HealthScore, ScoreDetail } from '@/types/resume'

function toHealth(score: number, label: string): HealthScore {
  return {
    score,
    status: score >= 70 ? 'healthy' : score >= 40 ? 'moderate' : 'critical',
    label,
  }
}

export function computeResumeHealth(analysis: DeepAnalysis): {
  ats: HealthScore
  recruiterReadability: HealthScore
  keywordHealth: HealthScore
  formattingHealth: HealthScore
  contentHealth: HealthScore
  impactHealth: HealthScore
  grammarHealth: HealthScore
  skillsHealth: HealthScore
} {
  const overall = (analysis.keywords.score + analysis.hardSkills.score) / 2
  return {
    ats: toHealth(overall, 'ATS Compatibility'),
    recruiterReadability: toHealth(analysis.recruiterFriendliness.score, 'Recruiter Readability'),
    keywordHealth: toHealth(analysis.keywords.score, 'Keyword Coverage'),
    formattingHealth: toHealth(analysis.formatting.score, 'Formatting Quality'),
    contentHealth: toHealth(analysis.resumeSections.score, 'Content Completeness'),
    impactHealth: toHealth(analysis.actionVerbs.score * 0.5 + analysis.quantifiedAchievements.score * 0.5, 'Impact Strength'),
    grammarHealth: toHealth(analysis.grammar.score, 'Grammar & Accuracy'),
    skillsHealth: toHealth(analysis.hardSkills.score, 'Skills Match'),
  }
}

export function buildScoreDetails(analysis: DeepAnalysis): Record<string, ScoreDetail> {
  return {
    contact: { score: analysis.contactInfo.score, reason: analysis.contactInfo.hasEmail ? 'Contact info complete' : 'Missing email or phone', recommendation: 'Ensure all contact fields are filled', priority: analysis.contactInfo.hasEmail ? 'low' : 'high' },
    sections: { score: analysis.resumeSections.score, reason: `${analysis.resumeSections.found.length} sections found, ${analysis.resumeSections.missing.length} missing`, recommendation: `Add missing sections: ${analysis.resumeSections.missing.slice(0, 3).join(', ')}`, priority: analysis.resumeSections.missing.length > 0 ? 'high' : 'low' },
    formatting: { score: analysis.formatting.score, reason: `${analysis.formatting.hasBullets ? 'Has' : 'No'} bullets, ${analysis.formatting.hasConsistentDates ? 'consistent' : 'inconsistent'} dates`, recommendation: analysis.formatting.score < 70 ? 'Use bullet points and consistent date formats' : 'Formatting looks good', priority: analysis.formatting.score < 70 ? 'medium' : 'low' },
    keywords: { score: analysis.keywords.score, reason: `${analysis.keywords.matched.length} matched, ${analysis.keywords.missing.length} missing`, recommendation: `Add missing keywords: ${analysis.keywords.missing.slice(0, 5).join(', ')}`, priority: analysis.keywords.missing.length > 0 ? 'high' : 'low' },
    hardSkills: { score: analysis.hardSkills.score, reason: `${analysis.hardSkills.matched.length}/${analysis.hardSkills.totalRequired} required skills matched`, recommendation: analysis.hardSkills.matched.length < analysis.hardSkills.totalRequired ? `Learn or add: ${analysis.hardSkills.missing.slice(0, 3).join(', ')}` : 'All required skills present', priority: analysis.hardSkills.matched.length < analysis.hardSkills.totalRequired ? 'high' : 'low' },
    softSkills: { score: analysis.softSkills.score, reason: `${analysis.softSkills.matched.length} soft skills detected`, recommendation: 'Include teamwork, communication, and leadership keywords', priority: analysis.softSkills.matched.length < 2 ? 'medium' : 'low' },
    projects: { score: analysis.projects.score, reason: `${analysis.projects.count} project(s) with ${analysis.projects.hasDescriptions ? 'descriptions' : 'no descriptions'}`, recommendation: analysis.projects.count === 0 ? 'Add relevant projects' : analysis.projects.hasDescriptions ? 'Projects look good' : 'Add descriptions to projects', priority: analysis.projects.score < 50 ? 'medium' : 'low' },
    experience: { score: analysis.experience.score, reason: `${analysis.experience.totalYears}+ years, ${analysis.experience.hasActionVerbs ? 'action verbs present' : 'missing action verbs'}, ${analysis.experience.hasQuantifiedResults ? 'quantified results found' : 'no quantified results'}`, recommendation: !analysis.experience.hasActionVerbs ? 'Start bullets with strong action verbs' : !analysis.experience.hasQuantifiedResults ? 'Add metrics to bullets' : 'Experience section is strong', priority: analysis.experience.hasQuantifiedResults ? 'low' : 'high' },
    education: { score: analysis.education.score, reason: analysis.education.hasDegree ? `Degree: ${analysis.education.degreeLevel}` : 'No degree detected', recommendation: analysis.education.hasDegree ? 'Education section complete' : 'Add your education details', priority: analysis.education.hasDegree ? 'low' : 'medium' },
    achievements: { score: analysis.quantifiedAchievements.score, reason: `${analysis.quantifiedAchievements.count} quantified achievement(s) found`, recommendation: analysis.quantifiedAchievements.count < 2 ? 'Add metrics (%, $, numbers) to bullet points' : 'Good use of quantified achievements', priority: analysis.quantifiedAchievements.count < 2 ? 'high' : 'low' },
    certifications: { score: 0, reason: 'Certification scoring available in extended analysis', recommendation: 'Add industry-recognized certifications', priority: 'low' },
    grammar: { score: analysis.grammar.score, reason: `${analysis.grammar.issues.length} grammar issue(s) detected`, recommendation: analysis.grammar.score < 70 ? 'Review sentence capitalization and spacing' : 'Good grammar quality', priority: analysis.grammar.score < 70 ? 'medium' : 'low' },
    readability: { score: analysis.readability.score, reason: `Average sentence length: ${analysis.readability.avgSentenceLength} words`, recommendation: analysis.readability.score < 60 ? 'Shorten sentences for better ATS parsing' : 'Readable content', priority: analysis.readability.score < 60 ? 'medium' : 'low' },
    actionVerbs: { score: analysis.actionVerbs.score, reason: `${analysis.actionVerbs.count} action verb(s) used`, recommendation: analysis.actionVerbs.count < 3 ? 'Use more action verbs (Developed, Built, Led, etc.)' : 'Good variety of action verbs', priority: analysis.actionVerbs.count < 3 ? 'high' : 'low' },
    keywordDensity: { score: analysis.keywordDensity.score, reason: analysis.keywordDensity.overused.length > 0 ? `Overused: ${analysis.keywordDensity.overused.join(', ')}` : 'Good keyword balance', recommendation: analysis.keywordDensity.overused.length > 0 ? 'Reduce repetition of overused keywords' : 'Keyword density is balanced', priority: analysis.keywordDensity.overused.length > 0 ? 'medium' : 'low' },
    atsParsingRisk: { score: analysis.parseConfidence.score, reason: `Parse confidence: ${analysis.parseConfidence.confidence}`, recommendation: analysis.parseConfidence.confidence === 'low' ? 'Improve resume formatting for better parsing' : 'Low ATS parsing risk', priority: analysis.parseConfidence.confidence === 'low' ? 'high' : 'low' },
    sectionOrder: { score: analysis.resumeSections.score, reason: `${analysis.resumeSections.found.length} sections in resume`, recommendation: 'Order: Contact > Summary > Experience > Education > Skills > Projects', priority: 'low' },
    jobTitleMatch: { score: analysis.jobTitleMatch.score, reason: `${analysis.jobTitleMatch.titleOverlap}% title overlap with JD`, recommendation: analysis.jobTitleMatch.score < 50 ? 'Align your job titles with the target role' : 'Job titles align well', priority: analysis.jobTitleMatch.score < 50 ? 'medium' : 'low' },
  }
}
