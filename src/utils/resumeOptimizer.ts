import type { StructuredResume } from '@/types/resume'
import { ACTION_VERBS } from './keywords'

const REAL_SKILLS = new Set([
  'Python', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Vue.js',
  'Node.js', 'Node', 'Java', 'C#', 'C++', 'Go', 'Rust', 'SQL', 'NoSQL',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'GCP', 'Azure', 'CI/CD', 'Git', 'Linux', 'REST', 'GraphQL',
  'FastAPI', 'Flask', 'Django', 'Express', 'Spring', '.NET', 'ASP.NET',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  'LangChain', 'OpenAI', 'RAG', 'LLM', 'Agile', 'Scrum', 'Jira',
  'Kafka', 'RabbitMQ', 'Elasticsearch', 'Terraform', 'Ansible',
  'Jenkins', 'GitHub Actions', 'Microservices', 'API', 'REST API',
  'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap', 'Redux', 'Next.js',
  'Express.js', 'NestJS', 'TypeORM', 'Prisma', 'WebSocket', 'Socket.io',
  'OAuth', 'JWT', 'Celery', 'Nginx', 'Apache',
].map(s => s.toLowerCase()))

function hashToIndex(str: string, max: number): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash) % max
}

function pickActionVerb(seed: string): string {
  return ACTION_VERBS[hashToIndex(seed, ACTION_VERBS.length)]
}

function improveProjectDescription(desc: string, jdKeywords: string[]): string {
  let improved = desc
  if (!improved) return improved
  const missingKw = jdKeywords.filter(kw =>
    kw.length > 2 && !improved.toLowerCase().includes(kw.toLowerCase()) && REAL_SKILLS.has(kw.toLowerCase())
  )
  if (missingKw.length > 0 && improved.length < 300) {
    const toAdd = missingKw.slice(0, 3).join(', ')
    if (!improved.endsWith('.')) improved += '.'
    improved += ` Leveraged ${toAdd} to deliver the solution.`
  }
  return improved
}

function improveJobTitle(title: string, jdText: string): string {
  const firstLine = jdText.split('\n')[0]?.replace(/^[#*]*\s*/, '').trim() || ''
  const titleWords = firstLine.match(/[A-Z][A-Za-z\s/]+?(?:Engineer|Developer|Architect|Scientist|Analyst|Manager|Lead|Intern|Associate|Specialist)/)
  if (titleWords) return titleWords[0].trim()
  const jdLines = jdText.split('\n').slice(0, 5).join(' ')
  const titlePatterns = jdLines.match(/[A-Z][A-Za-z\s/]+?(?:Engineer|Developer|Architect|Scientist|Analyst|Manager|Lead|Intern|Associate|Specialist)/g)
  if (titlePatterns && titlePatterns.length > 0) {
    const preferred = titlePatterns.filter(t => t.length < 50).sort((a, b) => b.length - a.length)[0].trim()
    const lower = title.toLowerCase()
    const preferredLower = preferred.toLowerCase()
    if (lower.includes('engineer') && preferredLower.includes('engineer')) return preferred
    if (lower.includes('developer') && preferredLower.includes('developer')) return preferred
    if (lower.includes('scientist') && preferredLower.includes('scientist')) return preferred
  }
  return title
}

function fixDates(dates: string): string {
  if (!dates) return dates
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  let fixed = dates
  for (const m of monthNames) {
    const regex = new RegExp(`\\b${m}[a-z]+\\.?`, 'gi')
    fixed = fixed.replace(regex, m)
  }
  fixed = fixed.replace(/\s*[-–—]\s*/g, ' – ')
  fixed = fixed.replace(/\s*to\s+/gi, ' – ')
  fixed = fixed.replace(/\bpresent\b/gi, 'Present')
  fixed = fixed.replace(/\bcurrent\b/gi, 'Present')
  fixed = fixed.replace(/–\s*$/, '– Present')
  return fixed.trim()
}

function ensureEmail(contact: StructuredResume['contact'], rawText: string): string {
  if (contact.email) return contact.email
  const match = rawText.match(/[\w.-]+@[\w.-]+\.\w+/)
  return match ? match[0] : ''
}

export function formatStructuredResume(resume: StructuredResume): string {
  const lines: string[] = []

  if (resume.name) {
    lines.push(resume.name.toUpperCase())
  }

  const contactParts: string[] = []
  if (resume.contact.email) contactParts.push(resume.contact.email)
  if (resume.contact.phone) contactParts.push(resume.contact.phone)
  if (resume.contact.location) contactParts.push(resume.contact.location)
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin)
  if (resume.contact.website) contactParts.push(resume.contact.website)
  if (contactParts.length > 0) {
    lines.push(contactParts.join('  |  '))
  }
  lines.push('')

  if (resume.summary) {
    lines.push('PROFESSIONAL SUMMARY')
    lines.push(resume.summary)
    lines.push('')
  }

  if (resume.skills.length > 0) {
    lines.push('TECHNICAL SKILLS')
    lines.push(resume.skills.join(', '))
    lines.push('')
  }

  if (resume.experience.length > 0) {
    lines.push('EXPERIENCE')
    for (const exp of resume.experience) {
      const header = [exp.title, exp.company].filter(Boolean).join('  —  ')
      lines.push(exp.dates ? `${header}  |  ${exp.dates}` : header)
      if (exp.location) lines.push(exp.location)
      if (exp.bullets.length > 0) {
        for (const b of exp.bullets) {
          const cleaned = b.replace(/^[-•*]\s*/, '')
          if (cleaned) lines.push(`  •  ${cleaned}`)
        }
      }
      lines.push('')
    }
  }

  if (resume.projects.length > 0) {
    lines.push('PROJECTS')
    for (const proj of resume.projects) {
      lines.push(proj.name)
      if (proj.description) {
        const descLines = proj.description.split(/[.!?]+/).filter(Boolean)
        for (const dl of descLines) {
          if (dl.trim()) lines.push(`  •  ${dl.trim()}.`)
        }
      }
      if (proj.tech && proj.tech.length > 0) {
        lines.push(`  Technologies: ${proj.tech.join(', ')}`)
      }
    }
    lines.push('')
  }

  if (resume.education.length > 0) {
    lines.push('EDUCATION')
    for (const edu of resume.education) {
      const parts = [edu.degree, edu.school].filter(Boolean)
      if (edu.year) parts.push(`(${edu.year})`)
      lines.push(parts.join('  —  '))
      if (edu.gpa) lines.push(`  GPA: ${edu.gpa}`)
      if (edu.details && edu.details.length > 0) {
        for (const d of edu.details) lines.push(`  •  ${d}`)
      }
    }
    lines.push('')
  }

  if (resume.achievements.length > 0) {
    lines.push('ACHIEVEMENTS')
    for (const ach of resume.achievements) lines.push(`  •  ${ach}`)
    lines.push('')
  }

  if (resume.certifications.length > 0) {
    lines.push('CERTIFICATIONS')
    for (const cert of resume.certifications) lines.push(`  •  ${cert}`)
    lines.push('')
  }

  if (resume.languages && resume.languages.length > 0) {
    lines.push('LANGUAGES')
    lines.push(resume.languages.join(', '))
    lines.push('')
  }

  if (resume.publications && resume.publications.length > 0) {
    lines.push('PUBLICATIONS')
    for (const pub of resume.publications) lines.push(`  •  ${pub}`)
    lines.push('')
  }

  if (resume.volunteer && resume.volunteer.length > 0) {
    lines.push('VOLUNTEERING')
    for (const v of resume.volunteer) {
      const header = [v.role, v.organization].filter(Boolean).join('  —  ')
      lines.push(v.dates ? `${header}  |  ${v.dates}` : header)
      if (v.description) lines.push(`  •  ${v.description}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

export function optimizeResume(
  resume: StructuredResume,
  jdKeywords: string[],
  jdText: string
): { formatted: string; changes: { original: string; improved: string; reason: string }[]; optimizedResume: StructuredResume } {
  const changes: { original: string; improved: string; reason: string }[] = []

  // === 1. FIX CONTACT INFO ===
  const contact = { ...resume.contact }
  const fixedEmail = ensureEmail(contact, resume.rawText)
  if (fixedEmail && fixedEmail !== contact.email) {
    changes.push({ original: contact.email || '', improved: fixedEmail, reason: 'Ensured email address is present' })
    contact.email = fixedEmail
  }

  // === 2. SUMMARY remains as-is (no fabrication) ===
  const summary = resume.summary

  // === 3. ENHANCE SKILLS (only add skills that appear in resume text but not in skills list) ===
  const existingSkillLower = new Set(resume.skills.map(s => s.toLowerCase()))
  const addedSkills = jdKeywords.filter(kw =>
    kw.length < 30 && !existingSkillLower.has(kw.toLowerCase()) &&
    REAL_SKILLS.has(kw.toLowerCase()) &&
    resume.rawText.toLowerCase().includes(kw.toLowerCase())
  )
  const skills = [...resume.skills, ...addedSkills]

  // === 4. IMPROVE EXPERIENCE ===
  const experience = resume.experience.map(exp => ({
    title: improveJobTitle(exp.title, jdText),
    company: exp.company,
    location: exp.location,
    dates: fixDates(exp.dates),
    bullets: exp.bullets.map(b => {
      const original = b
      const text = b.trim()
      if (!text) return b
      if (ACTION_VERBS.some(v => text.startsWith(v))) return text
      let improved = text
      if (/^(I|We|My|Our)\s+/.test(text)) {
        const rest = text.replace(/^(I|We|My|Our)\s+/, '')
        improved = `${pickActionVerb(text)} ${rest.charAt(0).toLowerCase()}${rest.slice(1)}`
      } else if (/^[a-z]/.test(text)) {
        const rest = text.replace(/^[a-z]+/, '').trim()
        improved = `${pickActionVerb(text)} ${rest.charAt(0).toLowerCase()}${rest.slice(1)}`
      }
      if (improved !== original) {
        changes.push({ original, improved, reason: 'Enhanced with action verb' })
      }
      return improved
    }),
  }))

  for (let i = 0; i < experience.length; i++) {
    const orig = resume.experience[i]
    if (experience[i].title !== orig.title) {
      changes.push({ original: orig.title, improved: experience[i].title, reason: 'Aligned job title with job description' })
    }
    if (experience[i].dates !== orig.dates) {
      changes.push({ original: orig.dates, improved: experience[i].dates, reason: 'Standardized date format' })
    }
  }

  // === 5. IMPROVE PROJECTS ===
  const projects = resume.projects.map(p => ({
    name: p.name,
    description: improveProjectDescription(p.description, jdKeywords),
    tech: p.tech && p.tech.length > 0
      ? [...new Set([...p.tech, ...addedSkills.filter(s => s.length < 25)])]
      : addedSkills.filter(s => s.length < 25),
    link: p.link,
  }))
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].description !== resume.projects[i]?.description) {
      changes.push({ original: resume.projects[i]?.description || '', improved: projects[i].description.substring(0, 80) + '...', reason: 'Enhanced project description with JD keywords' })
    }
    if (projects[i].tech && projects[i].tech!.length > (resume.projects[i]?.tech?.length || 0)) {
      changes.push({ original: resume.projects[i]?.tech?.join(', ') || '', improved: projects[i].tech!.join(', '), reason: 'Added tech stack keywords to project' })
    }
  }

  // === 6. CERTIFICATIONS — Keep only what the candidate actually has (no fabrication) ===
  const certifications = [...resume.certifications]

  // === 7. ACHIEVEMENTS — Keep only what the candidate actually has (no fabrication) ===
  const achievements = [...resume.achievements]

  // === 8. BUILD OPTIMIZED RESUME ===
  const optimized: StructuredResume = {
    name: resume.name,
    contact,
    summary,
    skills,
    experience,
    education: resume.education.map(e => ({ ...e })),
    projects,
    certifications,
    achievements,
    languages: resume.languages ? [...resume.languages] : undefined,
    publications: resume.publications ? [...resume.publications] : undefined,
    volunteer: resume.volunteer ? resume.volunteer.map(v => ({ ...v })) : undefined,
    rawText: resume.rawText,
  }

  // === 9. REGENERATE rawText FROM OPTIMIZED DATA ===
  const formatted = formatStructuredResume(optimized)
  optimized.rawText = formatted

  return { formatted, changes, optimizedResume: optimized }
}
