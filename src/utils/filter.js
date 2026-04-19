// ─── Filter & Relevance Scoring ───────────────────────────────────
// Filters internships by domain relevance and tags HIGH MATCH roles.

// Keywords indicating a high-match domain (AI/ML, Backend, Python)
const HIGH_MATCH_KEYWORDS = [
  'backend', 'back end', 'back-end',
  'ai', 'artificial intelligence',
  'ml', 'machine learning', 'deep learning',
  'data science', 'data scientist', 'data engineering',
  'python', 'django', 'flask', 'fastapi',
  'nlp', 'natural language', 'computer vision',
  'generative ai', 'llm',
];

// Keywords indicating relevant tech domains
const TECH_KEYWORDS = [
  ...HIGH_MATCH_KEYWORDS,
  'software', 'developer', 'development',
  'web', 'frontend', 'front end', 'front-end',
  'full stack', 'fullstack', 'full-stack',
  'react', 'angular', 'vue', 'node', 'nodejs',
  'java', 'javascript', 'typescript',
  'mobile', 'android', 'ios', 'flutter', 'react native',
  'devops', 'cloud', 'aws', 'azure', 'gcp',
  'database', 'sql', 'mongodb', 'postgres',
  'api', 'rest', 'graphql', 'microservices',
  'ui', 'ux', 'ui/ux', 'design', 'figma',
  'testing', 'qa', 'quality assurance', 'test automation', 'selenium',
  'cyber', 'security', 'infosec',
  'embedded', 'iot', 'firmware',
  'blockchain', 'web3',
  'programming', 'coding', 'engineer', 'engineering',
  'computer science', 'cs intern',
  'it ', 'information technology',
];

// Keywords to EXCLUDE (non-tech / non-intern roles)
const EXCLUDE_KEYWORDS = [
  'senior', 'lead', 'manager', 'director', 'head of',
  'principal', 'staff engineer', '5+ years', '3+ years',
  'sales', 'marketing', 'hr ', 'human resource', 'recruiter',
  'content writ', 'copywriter', 'social media',
  'accounts', 'finance', 'chartered', 'ca article',
  'graphic design', 'video edit', 'photo',
  'business development', 'bde', 'bda',
  'telecaller', 'customer support', 'customer service',
  'legal', 'law', 'compliance',
  'mechanical', 'civil', 'electrical',
  'teacher', 'trainer', 'tutor',
  'ambassador', 'campus ambassador',
];

/**
 * Checks if a title is relevant to our tech domains.
 */
function isTechRelevant(title) {
  const lower = title.toLowerCase();
  // First check exclusions
  for (const excl of EXCLUDE_KEYWORDS) {
    if (lower.includes(excl)) return false;
  }
  // Then check tech keywords
  for (const kw of TECH_KEYWORDS) {
    if (lower.includes(kw)) return true;
  }
  return false;
}

/**
 * Checks if this role qualifies for the 🔥 HIGH MATCH tag.
 */
function isHighMatch(title) {
  const lower = title.toLowerCase();
  for (const kw of HIGH_MATCH_KEYWORDS) {
    if (lower.includes(kw)) return true;
  }
  return false;
}

/**
 * Checks location relevance (Bangalore/Bengaluru/Remote).
 */
function isLocationRelevant(location) {
  const lower = (location || '').toLowerCase();
  return lower.includes('bangalore') || lower.includes('bengaluru')
    || lower.includes('remote') || lower.includes('work from home');
}

/**
 * Filters and enriches a list of scraped internships.
 * Returns only tech-relevant, Bangalore-based internships with HIGH MATCH tags.
 */
function filterInternships(internships) {
  console.log(`🔎 Filtering ${internships.length} raw listings...`);

  const filtered = internships
    .filter(i => {
      // Must be location-relevant
      if (!isLocationRelevant(i.location)) return false;
      // Must be tech-relevant by title
      if (!isTechRelevant(i.title)) return false;
      return true;
    })
    .map(i => ({
      ...i,
      highMatch: isHighMatch(i.title),
    }))
    // Sort: HIGH MATCH first, then alphabetical
    .sort((a, b) => {
      if (a.highMatch && !b.highMatch) return -1;
      if (!a.highMatch && b.highMatch) return 1;
      return a.title.localeCompare(b.title);
    });

  const highCount = filtered.filter(i => i.highMatch).length;
  console.log(`✅ Filter complete: ${filtered.length} relevant (${highCount} 🔥 HIGH MATCH)`);

  return filtered;
}

module.exports = { filterInternships, isTechRelevant, isHighMatch, isLocationRelevant };
