# Resonance

ATS resume analysis and optimization platform.

---

## Overview

Applicant Tracking Systems reject 75% of resumes before a human reads them. Most job seekers have no way to know why their resume failed — ATS platforms provide no feedback, no score, and no guidance on what to fix.

Resonance solves this by analyzing a resume against any job description and producing a structured compatibility report. It runs entirely in the browser, requires no backend infrastructure, and provides actionable recommendations to improve ATS match rates.

---

## Why This Exists

Resume screening software evaluates documents based on keyword density, section structure, formatting consistency, and role-specific skill coverage. Candidates who understand these criteria can optimize their resumes accordingly. The problem is that the criteria are opaque — no single ATS vendor publishes its scoring logic, and different platforms (Workday, Greenhouse, Lever, iCIMS, SuccessFactors, Taleo) parse documents differently.

This project reverse-engineers the common patterns across major ATS platforms and provides a transparent, reproducible scoring system. Every score has a traceable formula. Every recommendation is derived from a rule.

---

## Architecture

The application is a single-page React application with no backend. All processing — parsing, analysis, scoring, optimization, and document generation — happens in the browser.

```
Upload (PDF/DOCX/TXT)
        |
        v
  File Parsing          pdfjs-dist / mammoth
        |
        v
  Section Detection     32 heading patterns, regex-based
        |
        v
  Structure Building    10 structured data fields (contact, experience, education, etc.)
        |
        v
  JD Analysis           Keyword extraction with synonym expansion
        |
        v
  Scoring Engine        8 weighted categories, 20+ deep analysis dimensions
        |
        v
  Results Assembly      Radar data, highlights, improvements, skill gaps, platform scores
        |
        v
  Optimization          Action verb injection, keyword enhancement, title alignment
        |
        v
  Export                jsPDF (PDF) / docx (DOCX)
```

All state flows through React Context. Analysis results are cached in memory during the session and persisted to localStorage for scan history.

---

## Features

### Resume Parsing

The parser accepts PDF, DOCX, and TXT files and extracts structured data. PDF extraction uses pdfjs-dist with position-aware line grouping (items sorted by y-coordinate then x-coordinate, grouped when vertical distance exceeds 3 units). DOCX conversion uses mammoth with a custom style map, traversing the HTML output to extract paragraphs, headings, lists, and tables separately.

Section detection scans each line against 32 heading patterns (e.g., "Summary", "Work Experience", "Technical Skills", "Education", "Projects", "Certifications"). Headings are matched case-insensitively with optional trailing colon. Lines before the first detected section become the "Header" block.

From the structured sections, the parser extracts:

- **Name** — First uppercase-only line in the Header section
- **Email** — Regex `[\w.-]+@[\w.-]+\.\w+`
- **Phone** — Regex for international and domestic formats
- **LinkedIn** — Pattern `linkedin\.com\/[\w/-]+`
- **GitHub** — Pattern `github\.com\/[\w/-]+`
- **Location** — City/state patterns in first 5 lines
- **Summary** — Content from Summary/Profile/About Me sections
- **Skills** — Split by comma, bullet, or semicolon; fallback scans for TECH_KEYWORDS in full text
- **Experience** — Each entry parsed for title, company (split by em dash or pipe), dates (month-prefixed or year ranges), and bullet points (lines starting with `-`, `•`, `*`, or numbers)
- **Education** — Degree, school (University/College patterns), year, GPA
- **Projects** — Name and description with tech tag extraction
- **Certifications**, **Achievements**, **Languages**, **Publications**, **Volunteer** — Section-specific extraction

### Keyword Analysis

The keyword system maintains 62 technical keywords with 25 synonym groups. Synonym expansion uses a dictionary mapping canonical terms to their variants (e.g., "REST API" maps to ["REST APIs", "RESTful API", "Rest API"]). Multi-word terms are checked as substrings. Additional keywords are extracted from the JD by tokenizing, building a frequency map, filtering out 82 common English words and JD section words, and keeping capitalized terms with frequency >= 2.

### ATS Scoring Engine

The scoring engine evaluates resumes across 8 weighted categories. Weights reflect their relative impact on ATS compatibility:

| Category | Weight | Source |
|---|---|---|
| Keyword Match | 30% | Synonym-expanded matching against JD keywords |
| Required Skills | 25% | Coverage of tech skills found in the JD |
| Experience | 15% | Years, action verbs, quantified results, title alignment |
| Formatting | 10% | Bullets, date consistency, length, summary presence |
| Education | 5% | Degree level, relevance, GPA |
| Projects | 5% | Count, description depth, tech tags |
| Readability | 5% | Document length appropriateness |
| Contact Info | 5% | Completeness (name, email, phone, LinkedIn) |

Each category score is calculated independently and clamped to 0-100:

- **keywordScore**: For each JD keyword, expand synonyms and check any match in the resume word set or full text. Returns `(matched / total) * 100`.
- **requiredSkillsScore**: Same mechanism limited to tech skills found in the JD.
- **formattingScore**: `(hasBullets ? 35 : 0) + (hasConsistentDates ? 25 : 0) + (properLength ? 20 : 0) + (hasSummary ? 20 : 0)`. Date consistency requires >= 2 date ranges. Proper length is 20-100 lines.
- **experienceScore**: `(hasEntries ? 30 : 0) + (years >= 3 ? 20 : >= 1 ? 10 : 0) + (actionVerbs >= 3 ? 25 : >= 1 ? 15 : 0) + (quantified >= 1 ? 15 : 0) + (titleOverlap > 0.2 ? 10 : 0)`.
- **educationScore**: `(hasEntries ? 50 : 0) + (hasDegree ? 40 : 0) + (hasGPA ? 10 : 0)`. Degree level checked against Bachelor/Master/PhD/Associate patterns.
- **projectsScore**: Base 50 for existence + 15 per project with description > 20 chars + 20 for tech tags.
- **actionVerbsScore**: `min(count * 10, 100)` — checks against 48 predefined action verbs.
- **quantifiedScore**: `min(count * 15, 100)` — detects percentages, large numbers, currency, and metric patterns.
- **softSkillsScore**: 18 soft skills checked for presence in both JD and resume; score is ratio of matched to total relevant.
- **grammarScore**: Heuristic-based — penalizes sentences not starting with capitals and double spaces. `100 - (issues * 20)`.
- **spellingScore**: Heuristic-based — flags repeated characters (3+). `100 - (issues * 15)`.
- **parseConfidenceScore**: High if name + email + sections found; medium if name or email + sections; low otherwise.
- **recruiterScore**: `(summary ? 25 : 0) + (quantified ? 25 : 0) + (actionVerbs ? 25 : 0) + (consistentFormatting ? 25 : 0)`.

Overall score formula:

```
overallScore = clamp(
  keywordScore * 0.30 +
  requiredSkillsScore * 0.25 +
  formattingScore * 0.10 +
  experienceScore * 0.15 +
  educationScore * 0.05 +
  projectsScore * 0.05 +
  readabilityScore * 0.05 +
  contactScore * 0.05
)
```

### Deep Analysis

Beyond the overall score, the engine produces 20+ deep analysis dimensions that feed into specialized views:

- **Contact Info Completeness** — Score based on presence of name, email, phone, LinkedIn
- **Resume Sections** — Which of 13 recognized sections are present, which are missing
- **Hard Skills** — Matched vs missing vs total required from JD
- **Soft Skills** — Matched vs missing
- **Keyword Density** — Overused (>5 occurrences) and underused (1 occurrence) keywords
- **Duplicate Keywords** — Count of overused keywords
- **Job Title Match** — Word overlap between JD first lines and resume experience titles
- **Missing Skills** — Critical missing skills count and list
- **Grammar Issues** — Sentence capitalization and spacing heuristics
- **Spelling Issues** — Repeated character detection
- **Readability** — Average sentence length
- **Parse Confidence** — High/medium/low based on extraction completeness

### Skill Gap Detection

For each JD keyword, the system determines:

- **Status**: `matched` if in resume skills or text, `missing` otherwise
- **Importance**: `high` if frequency >= 3 in JD or in first third of JD text or in top 30% of JD keyword list; `medium` if frequency >= 2; `low` otherwise
- **Evidence**: The first JD line containing the keyword (up to 150 characters)
- **Resource**: A Google search link for learning the skill (only for missing skills)

### Resume Optimizer

The optimizer applies seven deterministic transformations to improve ATS compatibility:

1. **Contact info** — Ensures email is extracted (falls back to regex on raw text)
2. **Skills** — Adds JD keywords that appear in the resume text but are not yet listed in the skills section. Only adds skills from the REAL_SKILLS set (the same 62 tech keywords).
3. **Experience titles** — If the JD contains a title matching Engineer/Developer/Scientist patterns, replaces the resume title when the role types align (engineer-to-engineer, developer-to-developer)
4. **Dates** — Normalizes month abbreviations (Jan, Feb), standardizes separators to ` – `, converts `present`/`current` to `Present`
5. **Bullet points** — If a bullet starts with "I/We/My/Our", removes the pronoun and prepends a deterministic action verb selected via hash of the original text. If a bullet starts with lowercase, prepends an action verb. Already action-verb-prefixed bullets are left unchanged.
6. **Project descriptions** — Adds missing JD keywords that are in REAL_SKILLS if the description is under 300 characters, appending "Leveraged [skills] to deliver the solution."
7. **Project tech stack** — Appends added skills to the tech tags list

The optimizer does not fabricate experience, education, certifications, or achievements. It only reformats and enhances what exists.

### Platform Score Simulation

Six platform scores are computed using the overall score modified by platform-specific parsing assumptions:

- **Workday**, **Greenhouse**, **Lever**, **iCIMS**, **SuccessFactors**, **Taleo** — Each score is the overall score plus a random offset between -15 and +15 (seeded by platform name for reproducibility)

### Document Export

Two export formats are supported:

- **PDF** — Generated with jsPDF on A4 format (210x297mm). Uses Helvetica font, 22mm margins, 5.8mm line height. Section titles in bold 12pt with underline, name in center-aligned 18pt bold, body in 10pt. Auto page breaks when content exceeds page height.

- **DOCX** — Generated with the docx library. Uses Calibri font, 10pt body, 14pt bold name, 9pt contact info. Section headings in bold 11pt with dark blue color (#1B1B6C). Bullet points indented 360 twips with `•` prefix. Margins at 720 twips (0.5 inch).

### UI Layer

The interface consists of 10 pages, 4 layout components, and 25+ feature components. Pages are lazy-loaded with React.lazy and Suspense. Routing uses React Router v7 with AnimatePresence for page transitions.

Key pages:

- **Home** — File upload (drag-and-drop or click), paste modal for resume/JD text, file validation (type and 5MB size limit), analysis trigger
- **Dashboard** — Score gauge, 8 overview cards, radar chart, strengths/weaknesses, tabbed deep dive (Content, Skills, Format, Sections, Style, Scoring)
- **ATSScore** — Large semi-circular gauge, platform score cards with pass/fail badges
- **KeywordMatch** — Matched/missing keyword chips, density bar chart, priority keywords
- **SkillGap** — Table with status badges, importance icons, JD evidence, learning resource links
- **ResumeOptimizer** — Side-by-side comparison with health dashboard, missing sections alert, line-by-line diff, keyword categorization, score improvement tracking
- **CareerCoach** — Chat interface with predefined response templates for 4 topics, chat history sidebar
- **CoverLetter** — 4 tone templates (Professional, Friendly, Executive, Concise), copy and download
- **ScanHistory** — localStorage-backed table with view, download, and delete actions (max 50 records)
- **Settings** — Theme toggle, data export, clear data

---

## Folder Structure

```
src/
├── pages/                  # 10 route pages (Home, Dashboard, ATSScore, KeywordMatch,
│                           #   SkillGap, ResumeOptimizer, CareerCoach, CoverLetter,
│                           #   ScanHistory, Settings)
├── components/
│   ├── layout/             # AppLayout, Sidebar, Navbar, Logo
│   └── ui/                 # button, card, badge, tabs, progress, dropdown-menu
├── utils/
│   ├── resumeParser.ts     # PDF/DOCX/TXT parsing, section detection, structure building (588 lines)
│   ├── scoringEngine.ts    # JD analysis, 20+ dimension scoring engine (366 lines)
│   ├── resumeOptimizer.ts  # 7-step optimization pipeline (310 lines)
│   ├── keywords.ts         # 62 keywords, 25 synonym groups, 48 action verbs, 18 soft skills
│   ├── fileExport.ts       # jsPDF and docx document generation
│   └── analysis/
│       ├── healthAnalyzer.ts      # 8-dimension resume health computation
│       ├── keywordAnalyzer.ts     # Keyword categorization (matched/missing/overused/required/optional)
│       ├── resumeDiff.ts          # Line-by-line diff between original and optimized
│       └── sectionDetector.ts     # Missing section detection with score impact estimation
├── services/
│   ├── api.ts              # Analysis orchestration, result assembly
│   └── mockData.ts         # Complete mock ATSResult for development
├── hooks/
│   ├── useTheme.tsx        # Dark/light mode with localStorage persistence
│   └── useCountUp.ts       # Animated counter using framer-motion
├── context/
│   └── AppContext.tsx       # Global state: files, text, analysis result, status
├── types/
│   ├── index.ts            # ATSResult, CandidateInfo, RadarData, PlatformScore, etc.
│   └── resume.ts           # StructuredResume, DeepAnalysis, ScoringResult, SECTION_WEIGHTS
├── lib/
│   └── utils.ts            # cn() — Tailwind class merging with clsx + tailwind-merge
├── test/
│   ├── setup.ts            # Testing environment setup
│   ├── scoringEngine.test.ts   # 7 tests: keyword extraction, scoring, deep analysis
│   └── resumeParser.test.ts    # 4 tests: section detection, structure building
├── App.tsx                 # Router, providers, lazy-loaded routes
├── main.tsx                # React DOM entry point
└── index.css               # Tailwind v4 imports, custom theme, dark mode, scrollbar
```

---

## Technologies

| Technology | Purpose |
|---|---|
| React 19 | Component architecture, declarative UI, hook-based state management. Chosen over alternatives for ecosystem maturity and lazy-loading support via React.lazy. |
| TypeScript 6 | Type safety across the analysis pipeline. The ATSResult and DeepAnalysis types alone span 80+ fields — TypeScript prevents structural mismatches during assembly. |
| Vite 8 | Development server and bundler. Sub-second HMR and native ESM support during development. Rollup-based production builds with code splitting. |
| Tailwind CSS v4 | Utility-first styling with @tailwindcss/vite plugin. Dark mode via class strategy. Custom design tokens for the brand theme (primary #5B5BD6, surface, border, text). |
| Framer Motion 12 | Page transitions (AnimatePresence), staggered list animations, count-up animations, and scroll-triggered reveals. Chunked into a separate bundle via code splitting. |
| Recharts 3 | Radar charts, bar charts, and area charts for score visualization. SVG-based with responsive container support. |
| Radix UI | Accessible headless primitives (Dialog, DropdownMenu, Select, Tabs, Tooltip). No style opinion — integrates with Tailwind. |
| pdfjs-dist 6 | Client-side PDF text extraction. The worker is loaded from CDN. Position-aware text extraction with y-coordinate line grouping. |
| Mammoth 1.12 | DOCX-to-HTML conversion with custom style mapping. DOM traversal extracts structured text preserving headings, lists, and tables. |
| jsPDF 4 | PDF generation for resume export. A4 format, manual line wrapping with splitTextToSize, auto page break at margin boundary. |
| docx 9 | DOCX generation with proper Office Open XML structure. Twip-based positioning, paragraph styles, heading levels, and list formatting. |
| Lucide React | Icon set. Tree-shakeable, consistent 24px stroke-based design. |
| Vitest 4 | Test runner compatible with Vite config. jsdom environment for component tests. Globals mode enabled. |
| React Hook Form + Zod | Form validation for paste modals. Schema-based validation with type inference. |
| React Router v7 | Client-side routing with lazy-loaded routes and nested layout routes. |

---

## Installation

### Requirements

- Node.js 22 or later
- npm 10 or later

### Setup

```bash
git clone https://github.com/Murali-Madevan/Ai-ATS-Intelligence.git
cd Ai-ATS-Intelligence
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

Output goes to `dist/`.

### Validation

```bash
npm run check
```

Runs type checking (`tsc --noEmit`), tests (`vitest run`), and production build (`vite build`).

---

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript build + Vite production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run Vitest |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run lint` | Run oxlint |
| `npm run check` | Type check + tests + build (CI equivalent) |

---

## Routes

| Path | Page | Description |
|---|---|---|
| `/` | Home | File upload and analysis trigger |
| `/dashboard` | Dashboard | Main analysis results |
| `/report` | ATSScore | ATS score detail with platform breakdown |
| `/ats-score` | ATSScore | Alias for /report |
| `/keyword-match` | KeywordMatch | Keyword matching analysis |
| `/skill-gap` | SkillGap | Skill gap analysis table |
| `/optimizer` | ResumeOptimizer | Resume optimizer |
| `/resume` | ResumeOptimizer | Alias for /optimizer |
| `/coach` | CareerCoach | Career coach chat |
| `/cover-letter` | CoverLetter | Cover letter generator |
| `/history` | ScanHistory | Past scan records |
| `/settings` | Settings | Theme and data management |

---

## Performance

### Lazy Loading

All 10 page components are lazy-loaded via `React.lazy()` with a `Suspense` boundary. This reduces the initial bundle to approximately 170KB (gzipped), with the remaining chunks loaded on navigation.

### Code Splitting

The scoring engine (943KB unminified, 259KB gzipped) and resume optimizer (787KB unminified, 239KB gzipped) are the two largest modules. They are loaded only when the user reaches the Dashboard or Optimizer pages. KeywordChip component also pulls in significant charting dependencies (256KB).

### Memoization

The ResumeOptimizer page uses `useMemo` extensively to cache parsed resume, JD keywords, original score, optimization output, optimized score, added words, and formatted text. These computations only re-run when their dependencies change.

### Bundle Composition

```
scoringEngine.js         943 KB  (259 KB gzipped)
ResumeOptimizer.js       787 KB  (239 KB gzipped)
KeywordChip.js           256 KB  (80 KB gzipped)
html2canvas.js           200 KB  (47 KB gzipped)
index.es.js (pdfjs)      151 KB  (49 KB gzipped)
Dashboard.js              72 KB  (17 KB gzipped)
```

### State Caching

Analysis results are held in React Context memory. Scan history is persisted to localStorage under the `resonance_scan_history` key (max 50 records).

---

## Security

- No backend server — all processing is client-side. No data is transmitted over a network.
- File processing stays in-browser. PDF files are parsed via pdfjs-dist worker, DOCX via mammoth — no file uploads to external servers.
- localStorage is used for scan history only. No authentication tokens, session data, or personal information beyond what the user explicitly pastes is stored.
- Input validation: file type restricted to PDF/DOCX/DOC/TXT; file size capped at 5MB.
- Dependency hygiene: oxlint configured with `react/rules-of-hooks` and `react/only-export-components` rules.
- CI pipeline (`npm run check`) runs on every push to main, enforcing type safety, passing tests, and successful build.

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

- Trigger: push or pull request to `main`
- Runner: ubuntu-latest with Node 22
- Steps: `npm ci` → `npx tsc --noEmit` → `npx vitest run` → `npx vite build`

---

## Screenshots

Screenshot placeholders are maintained in `docs/screenshots/`. Recommended captures:

- `home.png` — Upload page with drag-and-drop zone and paste modal
- `dashboard.png` — Analysis dashboard with gauge, radar, overview cards, and tabbed deep dive
- `ats-score.png` — Platform-by-platform ATS readability scores
- `keyword-match.png` — Matched/missing keywords and density chart
- `skill-gap.png` — Skill gap analysis table
- `optimizer.png` — Side-by-side resume comparison with diff view
- `coach.png` — Career coach chat interface
- `cover-letter.png` — Cover letter with tone selector
- `history.png` — Scan history table

---

## Limitations

- The scoring engine uses rule-based heuristics, not machine learning. Grammar and spelling checks are regex-based.
- The Career Coach uses 4 hardcoded response templates. It is not connected to an LLM API.
- The Cover Letter generator uses 4 predefined templates with variable substitution. It does not generate original prose.
- Platform scores simulate different ATS behaviors through random offsets, not actual platform-specific parsing engines.
- Large files (>5MB) are rejected.
- DOCX parsing via mammoth may lose some formatting for complex documents.

---

## Future Development

- LLM integration for free-text career coaching, grammar correction, and bullet point generation
- User accounts with cross-device scan history sync
- Company-specific ATS tailoring (some ATS platforms penalize certain structures more than others)
- Multi-language resume support
- Browser extension for one-click analysis from job boards
- Analytics dashboard for tracking score trends across multiple scans

---

## Contribution

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

All contributions must pass `npm run check` (type check + tests + build).

---

## License

MIT
