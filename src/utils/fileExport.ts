import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, PageBreak } from 'docx'
import jsPDF from 'jspdf'
import type { StructuredResume } from '@/types/resume'

type DocxAlignment = (typeof AlignmentType)[keyof typeof AlignmentType]

export async function exportToDOCX(resume: StructuredResume, fileName: string) {
  const children: Paragraph[] = []

  const addText = (text: string, options?: { bold?: boolean; size?: number; color?: string; align?: DocxAlignment; spacing?: { before?: number; after?: number }; indent?: number }) => {
    children.push(new Paragraph({
      children: [new TextRun({
        text,
        bold: options?.bold ?? false,
        size: options?.size ?? 20,
        font: 'Calibri',
        color: options?.color ?? '1a1a1a',
      })],
      alignment: options?.align,
      spacing: { before: options?.spacing?.before ?? 0, after: options?.spacing?.after ?? 80 },
      indent: options?.indent ? { left: options.indent } : undefined,
    }))
  }

  const addSectionLine = (text: string, options?: { bold?: boolean; size?: number; color?: string }) => {
    children.push(new Paragraph({
      children: [new TextRun({
        text,
        bold: options?.bold ?? false,
        size: options?.size ?? 20,
        font: 'Calibri',
        color: options?.color ?? '1a1a1a',
      })],
      spacing: { before: 40, after: 40 },
    }))
  }

  if (resume.name) {
    addText(resume.name.toUpperCase(), { bold: true, size: 28, align: AlignmentType.CENTER, spacing: { after: 60 } })
  }

  const contactParts: string[] = []
  if (resume.contact.email) contactParts.push(resume.contact.email)
  if (resume.contact.phone) contactParts.push(resume.contact.phone)
  if (resume.contact.location) contactParts.push(resume.contact.location)
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin)
  if (resume.contact.website) contactParts.push(resume.contact.website)

  if (contactParts.length > 0) {
    addText(contactParts.join('  |  '), { size: 18, color: '555555', align: AlignmentType.CENTER, spacing: { after: 200 } })
  }

  if (resume.summary) {
    addText('PROFESSIONAL SUMMARY', { bold: true, size: 22, color: '1B1B6C', spacing: { before: 200, after: 80 } })
    children.push(new Paragraph({
      children: [new TextRun({ text: resume.summary, size: 20, font: 'Calibri', color: '333333' })],
      spacing: { after: 160 },
    }))
  }

  if (resume.skills.length > 0) {
    addText('TECHNICAL SKILLS', { bold: true, size: 22, color: '1B1B6C', spacing: { before: 200, after: 80 } })
    addSectionLine(resume.skills.join(', '), { size: 20 })
    children.push(new Paragraph({ spacing: { after: 120 } }))
  }

  if (resume.experience.length > 0) {
    addText('EXPERIENCE', { bold: true, size: 22, color: '1B1B6C', spacing: { before: 200, after: 80 } })
    for (const exp of resume.experience) {
      const headerParts = [exp.title, exp.company].filter(Boolean)
      const headerText = headerParts.join(' — ')
      const headerWithDate = exp.dates ? `${headerText}  |  ${exp.dates}` : headerText
      addSectionLine(headerWithDate, { bold: true, size: 20, color: '1a1a1a' })
      if (exp.location) {
        addSectionLine(exp.location, { size: 18, color: '555555' })
      }
      if (exp.bullets.length > 0) {
        for (const b of exp.bullets) {
          const cleaned = b.replace(/^[-•*]\s*/, '')
          if (cleaned) {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: '•  ', bold: true, size: 18, font: 'Calibri', color: '333333' }),
                new TextRun({ text: cleaned, size: 19, font: 'Calibri', color: '333333' }),
              ],
              spacing: { after: 60 },
              indent: { left: 360 },
            }))
          }
        }
      }
      children.push(new Paragraph({ spacing: { after: 100 } }))
    }
  }

  if (resume.projects.length > 0) {
    addText('PROJECTS', { bold: true, size: 22, color: '1B1B6C', spacing: { before: 200, after: 80 } })
    for (const proj of resume.projects) {
      addSectionLine(proj.name, { bold: true, size: 20, color: '1a1a1a' })
      if (proj.description) {
        const descSentences = proj.description.split(/[.!?]+/).filter(Boolean)
        for (const sent of descSentences) {
          const trimmed = sent.trim()
          if (trimmed) {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: '•  ', bold: true, size: 18, font: 'Calibri', color: '333333' }),
                new TextRun({ text: trimmed + '.', size: 19, font: 'Calibri', color: '333333' }),
              ],
              spacing: { after: 40 },
              indent: { left: 360 },
            }))
          }
        }
      }
      if (proj.tech && proj.tech.length > 0) {
        addSectionLine(`Technologies: ${proj.tech.join(', ')}`, { size: 18, color: '555555' })
      }
      children.push(new Paragraph({ spacing: { after: 80 } }))
    }
  }

  if (resume.education.length > 0) {
    addText('EDUCATION', { bold: true, size: 22, color: '1B1B6C', spacing: { before: 200, after: 80 } })
    for (const edu of resume.education) {
      const eduParts = [edu.degree, edu.school].filter(Boolean)
      const yearSuffix = edu.year ? ` (${edu.year})` : ''
      addSectionLine(eduParts.join(' — ') + yearSuffix, { bold: true, size: 20, color: '1a1a1a' })
      if (edu.gpa) addSectionLine(`GPA: ${edu.gpa}`, { size: 18, color: '555555' })
      if (edu.details && edu.details.length > 0) {
        for (const d of edu.details) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: '•  ', bold: true, size: 16, font: 'Calibri', color: '333333' }),
              new TextRun({ text: d, size: 18, font: 'Calibri', color: '333333' }),
            ],
            spacing: { after: 40 },
            indent: { left: 360 },
          }))
        }
      }
      children.push(new Paragraph({ spacing: { after: 80 } }))
    }
  }

  if (resume.achievements.length > 0) {
    addText('ACHIEVEMENTS', { bold: true, size: 22, color: '1B1B6C', spacing: { before: 200, after: 80 } })
    for (const ach of resume.achievements) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: '•  ', bold: true, size: 18, font: 'Calibri', color: '333333' }),
          new TextRun({ text: ach, size: 19, font: 'Calibri', color: '333333' }),
        ],
        spacing: { after: 60 },
        indent: { left: 360 },
      }))
    }
  }

  if (resume.certifications.length > 0) {
    addText('CERTIFICATIONS', { bold: true, size: 22, color: '1B1B6C', spacing: { before: 200, after: 80 } })
    for (const cert of resume.certifications) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: '•  ', bold: true, size: 18, font: 'Calibri', color: '333333' }),
          new TextRun({ text: cert, size: 19, font: 'Calibri', color: '333333' }),
        ],
        spacing: { after: 60 },
        indent: { left: 360 },
      }))
    }
  }

  const doc = new Document({
    title: 'Optimized Resume',
    description: 'ATS-optimized professional resume',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 20, color: '333333' },
          paragraph: { spacing: { after: 80 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children,
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToPDF(resume: StructuredResume, fileName: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 22
  const pageWidth = 210 - margin * 2
  let y = margin
  const lineHeight = 5.8

  const addText = (text: string, opts?: { size?: number; bold?: boolean; color?: number[]; align?: 'left' | 'center'; indent?: number }) => {
    const lines = text.split('\n')
    doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal')
    doc.setFontSize(opts?.size || 10)
    const color = opts?.color || [51, 51, 51]
    doc.setTextColor(color[0], color[1], color[2])

    for (const line of lines) {
      if (y + lineHeight > 297 - margin) {
        doc.addPage()
        y = margin
      }
      if (opts?.align === 'center') {
        doc.text(line, 105, y, { align: 'center' })
      } else {
        doc.text(line, margin + (opts?.indent || 0), y)
      }
      y += lineHeight
    }
  }

  const addBullet = (text: string, indent = 4, size = 9.5) => {
    const wrapped = doc.splitTextToSize(text, pageWidth - indent * 2)
    for (const w of wrapped) {
      if (y + lineHeight > 297 - margin) {
        doc.addPage()
        y = margin
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(size)
      doc.setTextColor(51, 51, 51)
      doc.text(`•  ${w}`, margin + indent, y)
      y += lineHeight
    }
  }

  const addSection = (title: string) => {
    y += 3
    if (y + lineHeight * 2 > 297 - margin) {
      doc.addPage()
      y = margin + 3
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(27, 27, 108)
    doc.text(title, margin, y)
    y += 1
    doc.setDrawColor(27, 27, 108)
    doc.setLineWidth(0.3)
    doc.line(margin, y, margin + pageWidth, y)
    y += lineHeight
  }

  const addSubtext = (text: string, size = 8.5) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(size)
    doc.setTextColor(85, 85, 85)
    const wrapped = doc.splitTextToSize(text, pageWidth)
    for (const w of wrapped) {
      if (y + lineHeight > 297 - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(w, margin, y)
      y += lineHeight * 0.85
    }
  }

  if (resume.name) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(26, 26, 26)
    doc.text(resume.name.toUpperCase(), 105, y, { align: 'center' })
    y += lineHeight * 1.4
  }

  const cp: string[] = []
  if (resume.contact.email) cp.push(resume.contact.email)
  if (resume.contact.phone) cp.push(resume.contact.phone)
  if (resume.contact.location) cp.push(resume.contact.location)
  if (resume.contact.linkedin) cp.push(resume.contact.linkedin)
  if (resume.contact.website) cp.push(resume.contact.website)
  if (cp.length > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(85, 85, 85)
    doc.text(cp.join('  |  '), 105, y, { align: 'center' })
    y += lineHeight * 1.2
  }

  if (resume.summary) {
    addSection('PROFESSIONAL SUMMARY')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(51, 51, 51)
    const wrapped = doc.splitTextToSize(resume.summary, pageWidth)
    for (const w of wrapped) {
      if (y + lineHeight > 297 - margin) { doc.addPage(); y = margin }
      doc.text(w, margin, y)
      y += lineHeight
    }
  }

  if (resume.skills.length > 0) {
    addSection('TECHNICAL SKILLS')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(51, 51, 51)
    const wrapped = doc.splitTextToSize(resume.skills.join(', '), pageWidth)
    for (const w of wrapped) {
      if (y + lineHeight > 297 - margin) { doc.addPage(); y = margin }
      doc.text(w, margin, y)
      y += lineHeight
    }
  }

  if (resume.experience.length > 0) {
    addSection('EXPERIENCE')
    for (const exp of resume.experience) {
      if (y + lineHeight * 2 > 297 - margin) { doc.addPage(); y = margin + 3 }
      const headerParts = [exp.title, exp.company].filter(Boolean).join(' — ')
      const headerWithDate = exp.dates ? `${headerParts}  |  ${exp.dates}` : headerParts
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(26, 26, 26)
      const hdr = doc.splitTextToSize(headerWithDate, pageWidth)
      for (const h of hdr) {
        if (y + lineHeight > 297 - margin) { doc.addPage(); y = margin }
        doc.text(h, margin, y)
        y += lineHeight
      }
      if (exp.location) addSubtext(exp.location)
      if (exp.bullets.length > 0) {
        for (const b of exp.bullets) {
          addBullet(b.replace(/^[-•*]\s*/, ''))
        }
      }
      y += 1
    }
  }

  if (resume.projects.length > 0) {
    addSection('PROJECTS')
    for (const proj of resume.projects) {
      if (y + lineHeight * 2 > 297 - margin) { doc.addPage(); y = margin + 3 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(26, 26, 26)
      doc.text(proj.name, margin, y)
      y += lineHeight
      if (proj.description) {
        const descSentences = proj.description.split(/[.!?]+/).filter(Boolean)
        for (const sent of descSentences) {
          const trimmed = sent.trim()
          if (trimmed) addBullet(trimmed + '.')
        }
      }
      if (proj.tech && proj.tech.length > 0) addSubtext(`Technologies: ${proj.tech.join(', ')}`)
    }
  }

  if (resume.education.length > 0) {
    addSection('EDUCATION')
    for (const edu of resume.education) {
      if (y + lineHeight * 2 > 297 - margin) { doc.addPage(); y = margin + 3 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(26, 26, 26)
      const eduText = [edu.degree, edu.school].filter(Boolean).join(' — ') + (edu.year ? ` (${edu.year})` : '')
      doc.text(eduText, margin, y)
      y += lineHeight
      if (edu.gpa) addSubtext(`GPA: ${edu.gpa}`)
      if (edu.details && edu.details.length > 0) {
        for (const d of edu.details) addBullet(d, 4, 8.5)
      }
    }
  }

  if (resume.achievements.length > 0) {
    addSection('ACHIEVEMENTS')
    for (const ach of resume.achievements) addBullet(ach)
  }

  if (resume.certifications.length > 0) {
    addSection('CERTIFICATIONS')
    for (const cert of resume.certifications) addBullet(cert)
  }

  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
