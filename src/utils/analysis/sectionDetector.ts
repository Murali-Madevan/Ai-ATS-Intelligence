import type { StructuredResume } from '@/types/resume'

export interface MissingSection {
  section: string
  severity: 'high' | 'medium' | 'low'
  suggestion: string
  expectedScoreGain: number
}

export function detectMissingSections(resume: StructuredResume): MissingSection[] {
  const missing: MissingSection[] = []

  if (!resume.contact.email) {
    missing.push({ section: 'Email Address', severity: 'high', suggestion: 'Add your email address so recruiters can contact you.', expectedScoreGain: 8 })
  }
  if (!resume.summary) {
    missing.push({ section: 'Professional Summary', severity: 'high', suggestion: 'A professional summary helps ATS systems quickly understand your profile.', expectedScoreGain: 12 })
  }
  if (resume.certifications.length === 0) {
    missing.push({ section: 'Certifications', severity: 'medium', suggestion: 'Adding relevant certifications can boost your credibility.', expectedScoreGain: 5 })
  }
  if (resume.achievements.length === 0) {
    missing.push({ section: 'Achievements', severity: 'medium', suggestion: 'Quantified achievements (metrics, percentages) strengthen your resume.', expectedScoreGain: 8 })
  }
  if (!resume.languages || resume.languages.length === 0) {
    missing.push({ section: 'Languages', severity: 'low', suggestion: 'Listing languages can be beneficial for diverse roles.', expectedScoreGain: 2 })
  }
  if (!resume.contact.github) {
    missing.push({ section: 'GitHub Profile', severity: 'medium', suggestion: 'A GitHub profile showcases your code and project work.', expectedScoreGain: 5 })
  }
  if (!resume.contact.linkedin) {
    missing.push({ section: 'LinkedIn Profile', severity: 'high', suggestion: 'LinkedIn is a critical professional networking tool for recruiters.', expectedScoreGain: 7 })
  }
  if (resume.projects.length === 0) {
    missing.push({ section: 'Projects', severity: 'high', suggestion: 'Projects demonstrate practical application of your skills.', expectedScoreGain: 10 })
  }
  if (!resume.experience.some(e => /\d+/.test(e.bullets.join(' ')))) {
    missing.push({ section: 'Quantifiable Metrics', severity: 'high', suggestion: 'Add numbers, percentages, and metrics to your experience bullets.', expectedScoreGain: 15 })
  }
  if (!resume.experience.some(e => /(19|20)\d{2}/.test(e.dates))) {
    missing.push({ section: 'Dates on Experience', severity: 'high', suggestion: 'Ensure all experience entries have clear start and end dates.', expectedScoreGain: 6 })
  }

  return missing
}
