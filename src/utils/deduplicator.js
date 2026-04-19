// ─── Deduplicator ─────────────────────────────────────────────────
// Tracks previously sent internships in data/seen.json to avoid duplicates.
// Entries auto-expire after 7 days to keep the file manageable.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SEEN_FILE = path.join(__dirname, '..', '..', 'data', 'seen.json');
const EXPIRY_DAYS = 7;

/**
 * Generates a unique hash for an internship based on title + company + link.
 */
function generateId(internship) {
  const raw = `${internship.title}|${internship.company}|${internship.link}`.toLowerCase().trim();
  return crypto.createHash('md5').update(raw).digest('hex').substring(0, 12);
}

/**
 * Loads the seen entries from disk.
 */
function loadSeen() {
  try {
    if (fs.existsSync(SEEN_FILE)) {
      const data = JSON.parse(fs.readFileSync(SEEN_FILE, 'utf-8'));
      return data || {};
    }
  } catch (err) {
    console.error('⚠️  Could not load seen.json, starting fresh:', err.message);
  }
  return {};
}

/**
 * Saves the seen entries to disk, pruning expired entries.
 */
function saveSeen(seen) {
  const now = Date.now();
  const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  // Prune entries older than EXPIRY_DAYS
  const pruned = {};
  for (const [id, timestamp] of Object.entries(seen)) {
    if (now - timestamp < expiryMs) {
      pruned[id] = timestamp;
    }
  }

  // Ensure data directory exists
  const dir = path.dirname(SEEN_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(SEEN_FILE, JSON.stringify(pruned, null, 2), 'utf-8');
  console.log(`💾 Saved ${Object.keys(pruned).length} entries to seen.json (pruned ${Object.keys(seen).length - Object.keys(pruned).length} expired)`);
}

/**
 * Removes internships that have already been sent.
 * Returns only new, unseen internships.
 */
function deduplicateInternships(internships) {
  const seen = loadSeen();
  const now = Date.now();
  const newInternships = [];

  for (const internship of internships) {
    const id = generateId(internship);
    if (!seen[id]) {
      newInternships.push(internship);
      seen[id] = now; // Mark as seen
    }
  }

  console.log(`🔄 Dedup: ${internships.length} input → ${newInternships.length} new (${internships.length - newInternships.length} already sent)`);

  // Save updated seen list
  saveSeen(seen);

  return newInternships;
}

module.exports = { deduplicateInternships, generateId };
