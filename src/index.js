// ─── Internship Agent — Main Orchestrator ─────────────────────────
// Runs the full pipeline: Scrape → Filter → Deduplicate → Format → Deliver

// Load .env for local development (GitHub Actions uses secrets instead)
try { require('dotenv').config(); } catch (e) {}

const { scrapeInternshala } = require('./scrapers/internshala');
const { filterInternships } = require('./utils/filter');
const { deduplicateInternships } = require('./utils/deduplicator');
const { formatEmailHTML, formatEmailSubject, formatSlackMessage, formatConsoleReport } = require('./utils/formatter');
const { sendEmail } = require('./delivery/email');
const { sendSlack } = require('./delivery/slack');

// Check if running in dry-run mode
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  const startTime = Date.now();
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🎯 INTERNSHIP AGENT — Daily Run');
  console.log(`  📅 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // ── Step 1: Scrape ─────────────────────────────────────────
    console.log('📡 STEP 1: Scraping Internshala...\n');
    const rawInternships = await scrapeInternshala();

    // ── Step 2: Filter ─────────────────────────────────────────
    console.log('\n🔎 STEP 2: Filtering for tech relevance...\n');
    const filteredInternships = filterInternships(rawInternships);

    // ── Step 3: Deduplicate ────────────────────────────────────
    console.log('\n🔄 STEP 3: Removing duplicates...\n');
    const newInternships = DRY_RUN
      ? filteredInternships  // Skip dedup in dry-run
      : deduplicateInternships(filteredInternships);

    // ── Step 4: Cap at 15 best ─────────────────────────────────
    const reportInternships = newInternships.slice(0, 15);

    // ── Step 5: Format ────────────────────────────────────────
    console.log('\n📝 STEP 4: Formatting report...\n');
    const emailSubject = formatEmailSubject(reportInternships);
    const emailHTML = formatEmailHTML(reportInternships);
    const slackMessage = formatSlackMessage(reportInternships);

    // Console preview
    console.log('─── Console Preview ───────────────────────────────');
    console.log(formatConsoleReport(reportInternships));
    console.log('───────────────────────────────────────────────────\n');

    // ── Step 6: Deliver ───────────────────────────────────────
    if (DRY_RUN) {
      console.log('🧪 DRY RUN — Skipping delivery.\n');
    } else {
      console.log('📤 STEP 5: Delivering report...\n');

      const [emailResult, slackResult] = await Promise.allSettled([
        sendEmail(emailSubject, emailHTML),
        sendSlack(slackMessage),
      ]);

      console.log(`\n   Email: ${emailResult.status === 'fulfilled' && emailResult.value ? '✅ Sent' : '❌ Failed'}`);
      console.log(`   Slack: ${slackResult.status === 'fulfilled' && slackResult.value ? '✅ Sent' : '❌ Failed'}`);
    }

    // ── Summary ───────────────────────────────────────────────
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`  ✅ DONE in ${elapsed}s`);
    console.log(`  📊 Raw: ${rawInternships.length} → Filtered: ${filteredInternships.length} → New: ${newInternships.length} → Reported: ${reportInternships.length}`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
