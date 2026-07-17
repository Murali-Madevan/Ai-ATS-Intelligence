import * as pdfjsLib from 'pdfjs-dist'
import * as mammoth from 'mammoth'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

import type { StructuredResume, ResumeSection } from '@/types/resume'
import { TECH_KEYWORDS } from './keywords'

const SECTION_HEADINGS = [
  'summary', 'professional summary', 'profile', 'about me',
  'experience', 'work experience', 'employment', 'work history', 'professional experience',
  'education', 'academic background', 'education and training',
  'skills', 'technical skills', 'core competencies', 'key skills', 'expertise', 'skill',
  'projects', 'personal projects', 'academic projects', 'key projects',
  'certifications', 'certificates', 'licenses', 'professional certifications',
  'achievements', 'awards', 'honors', 'accomplishments',
  'publications', 'research', 'research experience',
  'languages', 'language',
  'interests', 'activities',
  'volunteering', 'volunteer experience', 'community service',
  'references',
  'additional', 'additional information',
  'contact', 'contact information',
  'internship', 'internships', 'internship experience',
  'leadership', 'leadership experience',
  'training', 'courses', 'coursework', 'relevant coursework',
  'patents',
  'affiliations', 'professional affiliations',
  'honors', 'distinctions',
  'extracurricular', 'extracurricular activities',
]

function isSectionHeading(line: string): string | null {
  const trimmed = line.trim().replace(/:$/, '').toLowerCase()
  for (const sh of SECTION_HEADINGS) {
    if (trimmed === sh) return sh.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    if (trimmed.startsWith(sh) && trimmed.length < sh.length + 5) return sh.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }
  return null
}

function detectSectionHeadings(text: string): { heading: string; startIndex: number }[] {
  const lines = text.split('\n')
  const sections: { heading: string; startIndex: number }[] = []
  lines.forEach((line, i) => {
    const heading = isSectionHeading(line)
    if (heading) {
      sections.push({ heading, startIndex: i })
    }
  })
  return sections
}

export function parseResumeIntoSections(text: string): ResumeSection[] {
  const sections = detectSectionHeadings(text)
  const lines = text.split('\n')

  if (sections.length === 0) {
    return [{ heading: 'Raw Text', lines: lines.filter(l => l.trim()) }]
  }

  const result: ResumeSection[] = []

  const headerLines = lines.slice(0, sections[0].startIndex).filter(l => l.trim())
  if (headerLines.length > 0) {
    result.push({ heading: 'Header', lines: headerLines })
  }

  for (let i = 0; i < sections.length; i++) {
    const start = sections[i].startIndex + 1
    const end = i + 1 < sections.length ? sections[i + 1].startIndex : lines.length
    const sectionLines = lines.slice(start, end).map(l => l.replace(/\r$/, ''))

    result.push({
      heading: sections[i].heading,
      lines: sectionLines,
    })
  }

  return result
}

function extractName(sections: ResumeSection[]): string {
  const header = sections.find(s => s.heading === 'Header')
  if (header) {
    for (const line of header.lines) {
      const trimmed = line.trim()
      if (trimmed.length > 2 && trimmed.length < 50 && /^[A-Z][a-zA-Z\s\-'.]+$/.test(trimmed) && !trimmed.includes('|') && !trimmed.includes('@') && !trimmed.includes('http')) {
        return trimmed
      }
    }
  }
  for (const section of sections) {
    for (const line of section.lines) {
      const trimmed = line.trim()
      if (trimmed.length > 2 && trimmed.length < 50 && /^[A-Z][a-zA-Z\s\-'.]+$/.test(trimmed) && !trimmed.includes('|') && !trimmed.includes('@') && !trimmed.includes('http')) {
        return trimmed
      }
    }
  }
  const allLines = sections.flatMap(s => s.lines)
  for (const line of allLines) {
    const cleaned = line.replace(/[^a-zA-Z\s]/g, '').trim()
    if (cleaned.length > 2 && cleaned.length < 50) return cleaned
  }
  return ''
}

function extractEmail(text: string): string {
  const match = text.match(/[\w.-]+@[\w.-]+\.\w+/)
  return match ? match[0] : ''
}

function extractPhone(text: string): string {
  const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  return match ? match[0].trim() : ''
}

function extractLinkedin(text: string): string | undefined {
  const match = text.match(/linkedin\.com\/[\w/-]+/i)
  return match?.[0]
}

function extractWebsite(text: string): string | undefined {
  const match = text.match(/https?:\/\/(?!.*linkedin)[^\s]+/)
  return match?.[0]
}

function extractLocation(text: string): string | undefined {
  const header = text.split('\n').slice(0, 5).join(' ')
  const patterns = [
    /([A-Z][a-z]+,\s*[A-Z]{2})/,
    /([A-Z][a-z]+\s[A-Z][a-z]+,\s*[A-Z]{2})/,
    /([A-Za-z\s]+,\s*[A-Za-z\s]+)/,
  ]
  for (const p of patterns) {
    const m = header.match(p)
    if (m && !m[1].includes('@') && !m[1].includes('http')) return m[1].trim()
  }
  return undefined
}

function extractSummary(sections: ResumeSection[]): string {
  const summarySection = sections.find(s =>
    ['Summary', 'Professional Summary', 'Profile', 'About Me'].includes(s.heading)
  )
  if (summarySection) {
    return summarySection.lines.map(l => l.trim()).filter(Boolean).join(' ')
  }
  return ''
}

function extractSkills(sections: ResumeSection[]): string[] {
  const skillsSection = sections.find(s =>
    ['Skills', 'Technical Skills', 'Core Competencies', 'Key Skills', 'Expertise'].includes(s.heading)
  )
  const allText = sections.map(s => s.lines.join('\n')).join('\n')

  if (skillsSection) {
    const text = skillsSection.lines.join(' ')
    const parts = text.split(/[,|•\n;]+/).map(s => s.trim().replace(/^[-*]\s*/, '')).filter(Boolean)
    if (parts.length > 1) return [...new Set(parts)]
  }

  const lower = allText.toLowerCase()
  const found = TECH_KEYWORDS.filter(sk => {
    const regex = new RegExp(`\\b${sk.toLowerCase().replace(/[.+^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    return regex.test(allText)
  })
  return [...new Set(found)]
}

function extractExperience(sections: ResumeSection[]): {
  title: string; company: string; location?: string; dates: string; bullets: string[]
}[] {
  const expSection = sections.find(s =>
    ['Experience', 'Work Experience', 'Employment', 'Work History', 'Professional Experience'].includes(s.heading)
  )
  if (!expSection) return []

  const result: { title: string; company: string; location?: string; dates: string; bullets: string[] }[] = []
  let current: { title: string; company: string; location?: string; dates: string; bullets: string[] } | null = null

  for (const line of expSection.lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (current && current.title) result.push(current)
      current = null
      continue
    }

    const dateMatch = trimmed.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*[-–to]+\s*(?:Present|Current|Now|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4})/i)
      || trimmed.match(/\b(19\d{2}|20\d{2})\s*[-–to]+\s*(?:Present|Current|Now|(?:19\d{2}|20\d{2}))/i)

    const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*') || /^\d+[.)]/.test(trimmed)

    if (isBullet && current) {
      current.bullets.push(trimmed.replace(/^[-•*\d.)\s]+/, '').trim())
    } else if (dateMatch || (trimmed.includes('—') || trimmed.includes('–') || trimmed.includes('|')) && !isBullet) {
      if (current && current.title) result.push(current)

      const parts = trimmed.split(/[—–|]/).map(s => s.trim())
      const title = parts[0] || ''
      const company = parts[1] || ''
      const extra = parts[2] || ''
      const dates = dateMatch ? dateMatch[0] : extra

      let location: string | undefined
      if (extra && !dateMatch && /^[A-Z][a-z]+,?\s*[A-Z]{2}$/.test(extra)) {
        location = extra
      }

      current = {
        title,
        company,
        location,
        dates: dates || '',
        bullets: [],
      }
    } else if (current === null) {
      current = {
        title: trimmed,
        company: '',
        dates: '',
        bullets: [],
      }
    }
  }
  if (current && current.title) result.push(current)

  return result
}

function extractEducation(sections: ResumeSection[]): {
  degree: string; school: string; year: string; gpa?: string; details?: string[]
}[] {
  const eduSection = sections.find(s =>
    ['Education', 'Academic Background', 'Education and Training'].includes(s.heading)
  )
  if (!eduSection) return []

  const result: { degree: string; school: string; year: string; gpa?: string; details?: string[] }[] = []
  let current: { degree: string; school: string; year: string; gpa?: string; details?: string[] } | null = null

  for (const line of eduSection.lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (current && current.degree) result.push(current)
      current = null
      continue
    }

    const yearMatch = trimmed.match(/\b(19\d{2}|20\d{2})\b/g)
    const gpaMatch = trimmed.match(/(?:GPA|CGPA)[:\s]*([\d.]+)/i)
    const schoolMatch = trimmed.match(/(?:University|College|Institute|School|Academy)[^,\d]*/i)

    if (schoolMatch || /^(Bachelor|Master|PhD|B\.|M\.|BSc|MSc|BE|ME|BTech|MTech|BA|MA|Associate|Doctorate)/i.test(trimmed)) {
      if (current && current.degree) result.push(current)
      current = {
        degree: trimmed.replace(/(?:University|College|Institute|School|Academy).*$/i, '').trim() || trimmed,
        school: schoolMatch?.[0]?.trim() || '',
        year: yearMatch?.[yearMatch.length - 1] || yearMatch?.[0] || '',
        gpa: gpaMatch?.[1],
        details: [],
      }
    }
  }
  if (current && current.degree) result.push(current)

  return result
}

function extractProjects(sections: ResumeSection[]): {
  name: string; description: string; tech?: string[]; link?: string
}[] {
  const projSection = sections.find(s =>
    ['Projects', 'Personal Projects', 'Academic Projects', 'Key Projects'].includes(s.heading)
  )
  if (!projSection) return []

  const result: { name: string; description: string; tech?: string[]; link?: string }[] = []
  let current: { name: string; description: string; tech?: string[]; link?: string } | null = null

  for (const line of projSection.lines) {
    const trimmed = line.trim()
    if (!trimmed) { if (current && current.name) result.push(current); current = null; continue }

    const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•')
    const linkMatch = trimmed.match(/https?:\/\/[^\s]+/)

    if (!isBullet && trimmed.length > 2) {
      if (current && current.name) result.push(current)
      current = { name: trimmed, description: '', tech: [], link: linkMatch?.[0] }
    } else if (current && isBullet) {
      current.description += (current.description ? ' ' : '') + trimmed.replace(/^[-•*]\s*/, '')
      if (linkMatch && !current.link) current.link = linkMatch[0]
    }
  }
  if (current && current.name) result.push(current)

  return result
}

function extractCertifications(sections: ResumeSection[]): string[] {
  const certSection = sections.find(s =>
    ['Certifications', 'Certificates', 'Licenses', 'Professional Certifications'].includes(s.heading)
  )
  if (!certSection) return []

  return certSection.lines
    .map(l => l.trim().replace(/^[-•*]\s*/, ''))
    .filter(Boolean)
}

function extractAchievements(sections: ResumeSection[]): string[] {
  const achSection = sections.find(s =>
    ['Achievements', 'Awards', 'Honors', 'Accomplishments'].includes(s.heading)
  )
  if (!achSection) return []

  return achSection.lines
    .map(l => l.trim().replace(/^[-•*]\s*/, ''))
    .filter(Boolean)
}

function extractGithub(text: string): string | undefined {
  const match = text.match(/github\.com\/[\w/-]+/i)
  return match?.[0]
}

function extractLanguages(sections: ResumeSection[]): string[] {
  const langSection = sections.find(s =>
    ['Languages', 'Language'].includes(s.heading)
  )
  if (!langSection) return []
  return langSection.lines
    .map(l => l.trim().replace(/^[-•*]\s*/, ''))
    .filter(Boolean)
}

function extractPublications(sections: ResumeSection[]): string[] {
  const pubSection = sections.find(s =>
    ['Publications', 'Research', 'Research Experience'].includes(s.heading)
  )
  if (!pubSection) return []
  return pubSection.lines
    .map(l => l.trim().replace(/^[-•*]\s*/, ''))
    .filter(Boolean)
}

function extractVolunteer(sections: ResumeSection[]): { organization: string; role: string; dates: string; description: string }[] {
  const volSection = sections.find(s =>
    ['Volunteering', 'Volunteer Experience', 'Community Service'].includes(s.heading)
  )
  if (!volSection) return []
  const result: { organization: string; role: string; dates: string; description: string }[] = []
  let current: { organization: string; role: string; dates: string; description: string } | null = null
  for (const line of volSection.lines) {
    const trimmed = line.trim()
    if (!trimmed) { if (current?.organization) result.push(current); current = null; continue }
    const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•')
    const dateMatch = trimmed.match(/\b(19\d{2}|20\d{2})\s*[-–to]+\s*(?:Present|Current|Now|(?:19\d{2}|20\d{2}))/i)
    const pipeCount = (trimmed.match(/\|/g) || []).length
    if ((dateMatch || pipeCount >= 1) && !isBullet) {
      if (current?.organization) result.push(current)
      const parts = trimmed.split(/[|—–]/).map(s => s.trim())
      current = {
        organization: parts[0] || trimmed,
        role: parts[1] || '',
        dates: dateMatch?.[0] || parts[2] || '',
        description: '',
      }
    } else if (current && isBullet) {
      current.description += (current.description ? ' ' : '') + trimmed.replace(/^[-•*]\s*/, '')
    }
  }
  if (current?.organization) result.push(current)
  return result
}

export function buildStructuredResume(text: string): StructuredResume {
  const sections = parseResumeIntoSections(text)
  const allText = sections.map(s => s.lines.join('\n')).join('\n')

  const name = extractName(sections) || text.split('\n')[0]?.replace(/[^a-zA-Z\s]/g, '').trim() || ''
  const email = extractEmail(allText)
  const phone = extractPhone(allText)
  const linkedin = extractLinkedin(allText)
  const website = extractWebsite(allText)
  const location = extractLocation(allText)
  const github = extractGithub(allText)

  return {
    name,
    contact: { email, phone, linkedin, website, location, github },
    summary: extractSummary(sections),
    skills: extractSkills(sections),
    experience: extractExperience(sections),
    education: extractEducation(sections),
    projects: extractProjects(sections),
    certifications: extractCertifications(sections),
    achievements: extractAchievements(sections),
    languages: extractLanguages(sections),
    publications: extractPublications(sections),
    volunteer: extractVolunteer(sections),
    rawText: text,
  }
}

export async function parseFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'pdf' || file.type === 'application/pdf') {
    try {
      return await parsePDF(file)
    } catch {
      return await readFileAsTextSimple(file)
    }
  }

  if (ext === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      return await parseDOCX(file)
    } catch {
      return await readFileAsTextSimple(file)
    }
  }

  return await readFileAsTextSimple(file)
}

async function parsePDF(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const pageTexts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const items = content.items as TextItem[]

    if (items.length === 0) continue

    const textItems = items.map(item => ({
      text: item.str,
      y: Math.round((item.transform?.[5] || 0) * 10) / 10,
      x: Math.round((item.transform?.[4] || 0) * 10) / 10,
    }))

    textItems.sort((a, b) => b.y - a.y || a.x - b.x)

    const groupedLines: string[] = []
    let currentLine: string[] = []
    let lastY = textItems[0]?.y ?? 0
    let lastX = textItems[0]?.x ?? 0

    for (const item of textItems) {
      const yDiff = Math.abs(item.y - lastY)
      const xDiff = item.x - lastX

      if (yDiff > 3) {
        if (currentLine.length > 0) {
          groupedLines.push(currentLine.join(' '))
          currentLine = []
        }
        lastY = item.y
        lastX = item.x
      } else if (xDiff > 10) {
        currentLine.push(item.text)
        lastX = item.x
        continue
      }
      currentLine.push(item.text)
      lastX = item.x
    }
    if (currentLine.length > 0) {
      groupedLines.push(currentLine.join(' '))
    }

    pageTexts.push(groupedLines.join('\n'))
  }

  const rawText = pageTexts.join('\n\n').replace(/\n{3,}/g, '\n\n')
  const sections = parseResumeIntoSections(rawText)

  if (sections.length === 1 && sections[0].heading === 'Raw Text') {
    return rawText
  }

  return sections.map(s => {
    if (s.heading === 'Header') return s.lines.join('\n')
    if (s.heading === 'Raw Text') return s.lines.join('\n')
    return `${s.heading}\n${s.lines.join('\n')}`
  }).join('\n\n')
}

async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer }, { styleMap: [
    "p[style-name='Heading 1'] => h1:fresh",
    "p[style-name='Heading 2'] => h2:fresh",
    "p[style-name='Heading 3'] => h3:fresh",
    "p[style-name='Title'] => h1:fresh",
    "p[style-name='Subtitle'] => h2:fresh",
    "r[style-name='Strong'] => strong",
  ] })
  const html = result.value

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  const textParts: string[] = []

  function traverse(node: Node, depth = 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      if (text.trim()) textParts.push(text)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()

      if (tag === 'p') {
        const innerText = el.textContent?.trim()
        if (innerText) textParts.push(innerText)
        textParts.push('\n')
      } else if (tag === 'li') {
        const prefix = el.parentElement?.tagName?.toLowerCase() === 'ol' ? '  ' : '  •  '
        const innerText = el.textContent?.trim()
        if (innerText) textParts.push(`${prefix}${innerText}`)
        textParts.push('\n')
      } else if (tag === 'ul' || tag === 'ol') {
        textParts.push('\n')
        for (const child of el.childNodes) traverse(child, depth + 1)
        if (depth === 0) textParts.push('\n')
      } else if (tag === 'br') {
        textParts.push('\n')
      } else if (['h1', 'h2', 'h3', 'h4'].includes(tag)) {
        const innerText = el.textContent?.trim()
        if (innerText) textParts.push(innerText)
        textParts.push('\n')
      } else if (tag === 'table') {
        textParts.push('\n')
        for (const row of el.querySelectorAll('tr')) {
          const cells = Array.from(row.querySelectorAll('td, th')).map(c => c.textContent?.trim() || '')
          textParts.push(cells.join(' | '))
          textParts.push('\n')
        }
        textParts.push('\n')
      } else if (tag === 'strong' || tag === 'b') {
        textParts.push(el.textContent || '')
      } else {
        for (const child of el.childNodes) traverse(child, depth)
      }
    }
  }

  for (const child of tempDiv.childNodes) traverse(child)

  const rawText = textParts.join('').replace(/\n{4,}/g, '\n\n\n').trim()
  const sections = parseResumeIntoSections(rawText)

  if (sections.length === 1 && sections[0].heading === 'Raw Text') {
    return rawText
  }

  return sections.map(s => {
    if (s.heading === 'Header') return s.lines.join('\n')
    if (s.heading === 'Raw Text') return s.lines.join('\n')
    return `${s.heading}\n${s.lines.join('\n')}`
  }).join('\n\n')
}

function readFileAsTextSimple(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function resumeToText(sections: ResumeSection[]): string {
  return sections.map(s => {
    if (s.heading === 'Header') return s.lines.join('\n')
    return `${s.heading}\n${s.lines.join('\n')}`
  }).join('\n\n')
}
