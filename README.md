# Resonance — ATS Resume Intelligence

**React · TypeScript · Vite · Tailwind CSS · Recharts · Framer Motion**

An AI-powered ATS resume analysis and optimization platform. Upload your resume and a job description — get a deep compatibility analysis, keyword gap detection, resume optimization, cover letter generation, and career coaching — all in your browser.

---

## Overview

Job seekers lose opportunities when their resumes fail to pass ATS filters. Resonance analyzes your resume against any job description, scoring it across 20+ dimensions — keywords, skills, formatting, experience, education, readability, and more — then provides actionable recommendations to improve your match score.

---

## Features

| Feature | Description |
|---|---|
| 🔍 **Resume Parsing** | Extracts contact info, experience, education, projects, and 30+ sections from PDF, DOCX, and TXT |
| 📊 **ATS Scoring Engine** | Weighted multi-factor scoring across 10 categories with 20+ deep analysis dimensions |
| 🏷️ **Keyword Matching** | Matched vs. missing keyword detection with density analysis and synonym expansion |
| 🧩 **Skill Gap Analysis** | Missing critical skills with learning resource suggestions and importance prioritization |
| 📈 **Platform Scores** | Simulated ATS readability scores for Workday, Greenhouse, Lever, iCIMS, SuccessFactors, Taleo |
| ✨ **Resume Optimizer** | Before/after diff view with score improvement and PDF/DOCX export |
| 💬 **Career Coach** | Interactive chat with advice on optimization, interview prep, and skill gaps |
| 📝 **Cover Letter Generator** | Auto-generated letters with Professional, Friendly, Executive, and Concise tones |
| 🌙 **Dark Mode** | Full light/dark theme with localStorage persistence |

---

## Tech Stack

React 19 · TypeScript ~6.0 · Vite 8 · Tailwind CSS v4 · Framer Motion 12 · Recharts 3 · Radix UI · pdfjs-dist · Mammoth · docx · jsPDF · Lucide React · Vitest

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Production build
npm run test       # Run tests
npm run check      # Type check + tests + build
```

---

## Routes

| Route | Page |
|---|---|
| `/` | Home — upload resume + JD |
| `/dashboard` | Main analysis dashboard |
| `/report` | ATS score detail |
| `/keyword-match` | Keyword analysis |
| `/skill-gap` | Skill gap table |
| `/optimizer` | Resume optimizer |
| `/coach` | Career coach chat |
| `/cover-letter` | Cover letter generator |
| `/history` | Scan history |
| `/settings` | Theme + data management |

---

## Architecture

The entire application runs **client-side** — no backend server. All parsing, scoring, optimization, and export happens in the browser via custom engines in `src/utils/`.

---

## Author

**Murali Madevan** — [LinkedIn](https://www.linkedin.com/in/murali-madevan/) · [GitHub](https://github.com/Murali-Madevan)

---

## License

MIT
