// ─── Internshala Scraper ───────────────────────────────────────────
// Scrapes tech internships in Bengaluru from Internshala using Cheerio + Axios.
// Uses multiple filtered URL paths to cover all relevant domains.

const axios = require('axios');
const cheerio = require('cheerio');

// Pre-filtered Internshala URLs for tech internships in Bangalore
const SCRAPE_URLS = [
  // Software + Web + ML + Python/Django combined
  'https://internshala.com/internships/python-django-development,web-development,machine-learning,software-development-internship-in-bangalore/',
  // Computer Science umbrella
  'https://internshala.com/internships/computer-science-internship-in-bangalore/',
  // Mobile / App Development
  'https://internshala.com/internships/mobile-app-development-internship-in-bangalore/',
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Cache-Control': 'max-age=0',
};

/**
 * Parses a single Internshala listing page and extracts internship cards.
 */
function parseListingPage(html, sourceUrl) {
  const $ = cheerio.load(html);
  const internships = [];

  // Internshala uses .individual_internship or .internship_meta containers
  // The main selectors for internship cards
  const cardSelectors = [
    '.individual_internship',
    '.internship_meta',
    '.individual_internship_header',
  ];

  // Try parsing the structured internship container divs
  $('.individual_internship, .internship-card').each((_, el) => {
    try {
      const $el = $(el);

      // Extract role title
      const title = $el.find('.company h3 a, .internship_meta .profile a, h3 a, .heading_4_5 a, .job-internship-name a, a.view_detail_button').first().text().trim()
        || $el.find('h3, h4, .heading_4_5').first().text().trim();

      // Extract company name
      const company = $el.find('.company_name a, .company_name, .link_display_like_text, p.company-name').first().text().trim()
        || $el.find('.company .company_and_premium h4 a').first().text().trim();

      // Extract location
      const location = $el.find('.individual_internship_details .item_body:first, #location_names a, .locations a, span[data-city], .location_link').first().text().trim()
        || 'Bangalore';

      // Extract stipend
      const stipend = $el.find('.stipend, .desktop-text .item_body, span.stipend').first().text().trim() || 'Not disclosed';

      // Extract duration
      const duration = $el.find('.other_detail_item .item_body, .internship_other_details_container .item_body').eq(0).text().trim() || '';

      // Extract link
      let link = $el.find('a.view_detail_button, .company h3 a, .internship_meta .profile a, h3 a, .heading_4_5 a, .job-internship-name a').first().attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = `https://internshala.com${link}`;
      }

      // Extract posted date
      const postedText = $el.find('.status-container .status, .new_or_actively_hiring, .actively_hiring_engagement').text().trim().toLowerCase();

      if (title && link) {
        internships.push({
          title: title.replace(/\s+/g, ' ').trim(),
          company: cleanCompany(company) || 'Unknown Company',
          location: location.replace(/\s+/g, ' ').trim(),
          stipend: cleanStipend(stipend),
          duration: duration.replace(/\s+/g, ' ').trim() || 'Not specified',
          link: link.split('?')[0], // Remove tracking params
          source: 'Internshala',
          postedText,
        });
      }
    } catch (err) {
      // Skip malformed cards
    }
  });

  // Fallback: parse from link structure if card parsing found nothing
  if (internships.length === 0) {
    $('a[href*="/internship/detail/"]').each((_, el) => {
      try {
        const $a = $(el);
        const title = $a.text().trim();
        let link = $a.attr('href') || '';
        if (link && !link.startsWith('http')) {
          link = `https://internshala.com${link}`;
        }

        // Extract company from parent container
        const $parent = $a.closest('.individual_internship, .internship_meta, div[class*="internship"]');
        const company = $parent.find('.company_name, .link_display_like_text, h4').first().text().trim() || '';

        if (title && link && title.length > 3 && !title.includes('View') && !title.includes('Login')) {
          // Avoid duplicate links
          const exists = internships.some(i => i.link === link.split('?')[0]);
          if (!exists) {
            internships.push({
              title: title.replace(/\s+/g, ' ').trim(),
              company: company.replace(/\s+/g, ' ').trim() || extractCompanyFromUrl(link),
              location: 'Bangalore',
              stipend: 'Not disclosed',
              duration: 'Not specified',
              link: link.split('?')[0],
              source: 'Internshala',
              postedText: '',
            });
          }
        }
      } catch (err) {
        // Skip
      }
    });
  }

  return internships;
}

/**
 * Extracts company name from Internshala detail URL slug.
 * e.g., "...-at-xyz-tech1234" → "Xyz Tech"
 */
function extractCompanyFromUrl(url) {
  try {
    const match = url.match(/-at-([a-z0-9-]+?)(\d+)\/?$/);
    if (match) {
      return match[1]
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  } catch (e) {}
  return 'Unknown Company';
}

/**
 * Cleans company name by removing badge text like "Actively hiring", etc.
 */
function cleanCompany(raw) {
  if (!raw) return '';
  return raw
    .replace(/\s+/g, ' ')
    .replace(/Actively hiring/gi, '')
    .replace(/Actively Hiring/gi, '')
    .replace(/Hiring/gi, '')
    .replace(/\bNew\b/g, '')
    .replace(/Featured/gi, '')
    .replace(/Internshala/gi, '')
    .trim();
}

/**
 * Cleans up stipend text.
 */
function cleanStipend(raw) {
  if (!raw || raw === '0' || raw.toLowerCase() === 'unpaid') return 'Unpaid';
  // Remove extra whitespace, keep the number
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (cleaned.includes('₹') || cleaned.includes('Rs') || /\d/.test(cleaned)) {
    return cleaned;
  }
  return 'Not disclosed';
}

/**
 * Adds a random delay between requests.
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 1000));
}

/**
 * Main scrape function — fetches all filtered URLs and merges results.
 */
async function scrapeInternshala() {
  console.log('🔍 Starting Internshala scrape...');
  const allInternships = [];
  const seenLinks = new Set();

  for (const url of SCRAPE_URLS) {
    try {
      console.log(`   Fetching: ${url}`);
      const response = await axios.get(url, {
        headers: HEADERS,
        timeout: 30000,
        maxRedirects: 5,
      });

      const internships = parseListingPage(response.data, url);
      console.log(`   Found ${internships.length} listings`);

      for (const internship of internships) {
        if (!seenLinks.has(internship.link)) {
          seenLinks.add(internship.link);
          allInternships.push(internship);
        }
      }

      // Respectful delay between requests
      await delay(2000);
    } catch (error) {
      console.error(`   ⚠️  Failed to fetch ${url}: ${error.message}`);
    }
  }

  console.log(`✅ Internshala scrape complete: ${allInternships.length} unique listings`);
  return allInternships;
}

module.exports = { scrapeInternshala };
