import { describe, it, expect } from 'vitest'
import { scoreResume, analyzeJD } from '@/utils/scoringEngine'
import type { StructuredResume } from '@/types/resume'

const mockResume: StructuredResume = {
  name: 'John Doe',
  contact: { email: 'john@example.com', phone: '555-1234' },
  summary: 'Experienced software engineer with 5 years in full-stack development.',
  skills: ['Python', 'JavaScript', 'React', 'Docker', 'PostgreSQL'],
  experience: [
    {
      title: 'Senior Developer',
      company: 'TechCorp',
      dates: '2020 – Present',
      bullets: [
        'Developed REST APIs serving 10k+ requests/day',
        'Led team of 3 engineers on microservices migration',
        'Reduced deployment time by 40% using CI/CD pipelines',
      ],
    },
    {
      title: 'Junior Developer',
      company: 'StartupInc',
      dates: '2018 – 2020',
      bullets: [
        'Built React components for customer-facing dashboard',
        'Implemented automated testing with 90% coverage',
      ],
    },
  ],
  education: [
    { degree: 'B.S. Computer Science', school: 'University of Tech', year: '2018' },
  ],
  projects: [
    { name: 'E-Commerce Platform', description: 'Built full-stack e-commerce platform with React and Node.js' },
  ],
  certifications: ['AWS Certified Developer'],
  achievements: [],
  rawText: '',
}

mockResume.rawText = `John Doe
john@example.com | 555-1234

PROFESSIONAL SUMMARY
Experienced software engineer with 5 years in full-stack development.

TECHNICAL SKILLS
Python, JavaScript, React, Docker, PostgreSQL

EXPERIENCE
Senior Developer  —  TechCorp  |  2020 – Present
  •  Developed REST APIs serving 10k+ requests/day
  •  Led team of 3 engineers on microservices migration
  •  Reduced deployment time by 40% using CI/CD pipelines

Junior Developer  —  StartupInc  |  2018 – 2020
  •  Built React components for customer-facing dashboard
  •  Implemented automated testing with 90% coverage

EDUCATION
B.S. Computer Science  —  University of Tech  (2018)

PROJECTS
E-Commerce Platform
  •  Built full-stack e-commerce platform with React and Node.js

CERTIFICATIONS
  •  AWS Certified Developer`

describe('scoringEngine', () => {
  const jdText = `Senior Software Engineer
  We're looking for a Senior Software Engineer with strong Python, React, Docker, and PostgreSQL skills.
  Must have experience with REST APIs, CI/CD, and microservices.
  Preferred: AWS certification, 5+ years experience, full-stack development background.`

  const jdKeywords = analyzeJD(jdText)

  it('extracts keywords from job description', () => {
    expect(jdKeywords.length).toBeGreaterThan(0)
    expect(jdKeywords.some(k => k.toLowerCase().includes('python'))).toBe(true)
    expect(jdKeywords.some(k => k.toLowerCase().includes('react'))).toBe(true)
  })

  it('scores resume deterministically', () => {
    const result1 = scoreResume(mockResume, jdKeywords, jdText)
    const result2 = scoreResume(mockResume, jdKeywords, jdText)
    expect(result1.overallScore).toBe(result2.overallScore)
  })

  it('produces a score between 0 and 100', () => {
    const result = scoreResume(mockResume, jdKeywords, jdText)
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
  })

  it('returns all required deep analysis fields', () => {
    const result = scoreResume(mockResume, jdKeywords, jdText)
    const d = result.deepAnalysis
    expect(d.contactInfo).toBeDefined()
    expect(d.resumeSections).toBeDefined()
    expect(d.formatting).toBeDefined()
    expect(d.keywords).toBeDefined()
    expect(d.hardSkills).toBeDefined()
    expect(d.softSkills).toBeDefined()
    expect(d.experience).toBeDefined()
    expect(d.education).toBeDefined()
    expect(d.projects).toBeDefined()
    expect(d.actionVerbs).toBeDefined()
    expect(d.quantifiedAchievements).toBeDefined()
    expect(d.jobTitleMatch).toBeDefined()
    expect(d.missingSkills).toBeDefined()
    expect(d.keywordDensity).toBeDefined()
    expect(d.readability).toBeDefined()
    expect(d.grammar).toBeDefined()
    expect(d.spelling).toBeDefined()
    expect(d.parseConfidence).toBeDefined()
    expect(d.recruiterFriendliness).toBeDefined()
  })

  it('returns category scores', () => {
    const result = scoreResume(mockResume, jdKeywords, jdText)
    expect(result.categoryScores.skills).toBeGreaterThanOrEqual(0)
    expect(result.categoryScores.experience).toBeGreaterThanOrEqual(0)
    expect(result.categoryScores.keywords).toBeGreaterThanOrEqual(0)
  })

  it('handles empty JD keywords gracefully', () => {
    const result = scoreResume(mockResume, [], '')
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
  })
})
