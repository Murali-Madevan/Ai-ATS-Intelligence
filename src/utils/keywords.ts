export const TECH_KEYWORDS = [
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
]

export const SOFT_SKILLS = [
  'Communication', 'Teamwork', 'Collaboration', 'Problem-solving',
  'Leadership', 'Time Management', 'Adaptability', 'Critical Thinking',
  'Creativity', 'Mentoring', 'Presentation', 'Negotiation',
  'Conflict Resolution', 'Decision Making', 'Project Management',
  'Cross-functional', 'Stakeholder Management',
]

export const ACTION_VERBS = [
  'Developed', 'Built', 'Created', 'Designed', 'Implemented', 'Led', 'Managed',
  'Optimized', 'Improved', 'Architected', 'Engineered', 'Delivered', 'Launched',
  'Reduced', 'Increased', 'Achieved', 'Generated', 'Established', 'Initiated',
  'Introduced', 'Integrated', 'Migrated', 'Rebuilt', 'Redesigned',
  'Resolved', 'Restructured', 'Revamped', 'Streamlined', 'Strengthened',
  'Transformed', 'Upgraded', 'Authored', 'Championed', 'Consolidated',
  'Deployed', 'Drove', 'Enabled', 'Executed', 'Expanded', 'Monitored',
  'Overhauled', 'Proposed', 'Spearheaded', 'Standardized', 'Won',
  'Automated', 'Configured',
]

export const KEYWORD_SYNONYMS: [string, string[]][] = [
  ['REST API', ['REST APIs', 'RESTful API', 'RESTful APIs', 'REST API', 'Rest API']],
  ['REST', ['RESTful', 'Rest API']],
  ['LLM', ['Large Language Model', 'Large language model', 'large language model']],
  ['GenAI', ['Generative AI', 'Generative artificial intelligence', 'Gen AI']],
  ['ML', ['Machine Learning', 'machine learning']],
  ['AI', ['Artificial Intelligence', 'artificial intelligence']],
  ['NLP', ['Natural Language Processing', 'natural language processing']],
  ['CV', ['Computer Vision', 'computer vision']],
  ['React', ['React.js', 'ReactJS']],
  ['Node.js', ['NodeJS', 'Node', 'node.js']],
  ['JS', ['JavaScript', 'javascript']],
  ['TS', ['TypeScript', 'typescript']],
  ['Python', ['python3', 'python']],
  ['Docker', ['Docker', 'docker', 'Dockerized', 'containerization']],
  ['K8s', ['Kubernetes', 'kubernetes', 'k8s']],
  ['CI/CD', ['CICD', 'ci/cd', 'CI CD', 'Continuous Integration', 'Continuous Deployment']],
  ['AWS', ['Amazon Web Services', 'amazon web services']],
  ['GCP', ['Google Cloud', 'Google Cloud Platform']],
  ['Azure', ['Microsoft Azure', 'MS Azure']],
  ['SQL', ['MySQL', 'PostgreSQL', 'SQLite', 'T-SQL', 'PL/SQL']],
  ['NoSQL', ['MongoDB', 'Cassandra', 'DynamoDB', 'CouchDB', 'Firestore']],
  ['ORM', ['SQLAlchemy', 'TypeORM', 'Prisma', 'Sequelize', 'Django ORM', 'Entity Framework']],
  ['Frontend', ['front-end', 'front end', 'UI', 'client-side']],
  ['Backend', ['back-end', 'back end', 'server-side', 'server side']],
  ['Full Stack', ['full-stack', 'full stack developer', 'fullstack']],
]

export const REQUIRED_SECTIONS = ['Summary', 'Experience', 'Education', 'Skills']

export const ALL_SECTIONS = [
  'Summary', 'Experience', 'Education', 'Skills', 'Projects',
  'Certifications', 'Achievements', 'Publications', 'Languages',
  'Volunteer', 'Contact', 'Internship', 'Leadership',
]

export const CERTIFICATION_PREFIXES = [
  'AWS Certified', 'Azure', 'Google Cloud', 'CompTIA', 'CISSP', 'PMP',
  'Certified', 'Professional', 'Associate', 'Specialist',
  'CISM', 'CISA', 'CRISC', 'ITIL', 'TOGAF',
  'Scrum', 'SAFe', 'OCP', 'OCA', 'MCP', 'MCSE', 'MCSA',
  'Oracle', 'SAP', 'Cisco', 'CCNA', 'CCNP', 'CCIE',
  'Red Hat', 'LFCS', 'CKAD', 'CKA', 'Security+', 'Network+',
]

export const MULTI_WORD_TERMS = [
  'machine learning', 'deep learning', 'natural language processing',
  'computer vision', 'ci/cd', 'rest api', 'agile methodologies',
  'full stack', 'frontend', 'backend', 'cloud computing',
  'problem solving', 'cross functional', 'data engineering',
  'data science', 'artificial intelligence', 'software development',
  'system design', 'team collaboration', 'attention to detail',
  'code review', 'unit testing', 'integration testing',
  'continuous integration', 'continuous deployment',
  'data analysis', 'data pipeline', 'data warehouse',
  'business intelligence', 'infrastructure as code',
]

export function normalizeKeyword(kw: string): string {
  return kw.toLowerCase().replace(/[^a-z0-9+#.\/_ -]/g, '').trim()
}

export function expandSynonyms(kw: string): Set<string> {
  const expanded = new Set<string>([normalizeKeyword(kw)])
  const lower = kw.toLowerCase()
  for (const [canonical, syns] of KEYWORD_SYNONYMS) {
    if (lower === canonical.toLowerCase() || syns.some(s => lower === s.toLowerCase())) {
      expanded.add(normalizeKeyword(canonical))
      for (const s of syns) expanded.add(normalizeKeyword(s))
    }
  }
  for (const [canonical, syns] of KEYWORD_SYNONYMS) {
    for (const s of syns) {
      if (lower.includes(s.toLowerCase())) {
        expanded.add(normalizeKeyword(canonical))
        break
      }
    }
  }
  return expanded
}
