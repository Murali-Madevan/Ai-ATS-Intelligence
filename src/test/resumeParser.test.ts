import { describe, it, expect } from 'vitest'
import { buildStructuredResume, parseResumeIntoSections } from '@/utils/resumeParser'

const sampleResume = `John Doe
john@example.com | 555-123-4567 | linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5 years in full-stack development.

TECHNICAL SKILLS
Python, JavaScript, React, Docker, PostgreSQL

EXPERIENCE
Senior Developer  —  TechCorp  |  2020 – Present
  •  Developed REST APIs serving 10k+ requests/day
  •  Led team of 3 engineers on microservices migration

Junior Developer  —  StartupInc  |  2018 – 2020
  •  Built React components for customer-facing dashboard

EDUCATION
B.S. Computer Science  —  University of Tech  (2018)

PROJECTS
E-Commerce Platform
  •  Built full-stack e-commerce platform with React and Node.js

CERTIFICATIONS
  •  AWS Certified Developer`

describe('resumeParser', () => {
  it('parses resume into sections', () => {
    const sections = parseResumeIntoSections(sampleResume)
    expect(sections.length).toBeGreaterThan(0)
    const headings = sections.map(s => s.heading)
    expect(headings.some(h => h.toLowerCase().includes('summary'))).toBe(true)
    expect(headings.some(h => h.toLowerCase().includes('experience'))).toBe(true)
  })

  it('builds structured resume from text', () => {
    const resume = buildStructuredResume(sampleResume)
    expect(resume.name).toBe('John Doe')
    expect(resume.contact.email).toBe('john@example.com')
    expect(resume.contact.phone).toBe('555-123-4567')
    expect(resume.skills.length).toBeGreaterThan(0)
    expect(resume.experience.length).toBe(2)
    expect(resume.education.length).toBeGreaterThan(0)
  })

  it('extracts experience with title, company, and dates', () => {
    const resume = buildStructuredResume(sampleResume)
    const firstExp = resume.experience[0]
    expect(firstExp.title).toBe('Senior Developer')
    expect(firstExp.company).toBe('TechCorp')
    expect(firstExp.dates).toContain('2020')
    expect(firstExp.bullets.length).toBeGreaterThan(0)
  })

  it('extracts education details', () => {
    const resume = buildStructuredResume(sampleResume)
    const edu = resume.education[0]
    expect(edu.degree).toContain('B.S.')
    expect(edu.school).toContain('University')
  })

  it('extracts certifications', () => {
    const resume = buildStructuredResume(sampleResume)
    expect(resume.certifications.length).toBeGreaterThan(0)
  })
})
