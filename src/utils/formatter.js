// ─── Report Formatter ─────────────────────────────────────────────
// Generates beautiful HTML for email and Slack-formatted messages.

/**
 * Formats the date for the report header.
 */
function getReportDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Generates a styled HTML email body.
 */
function formatEmailHTML(internships) {
  const date = getReportDate();
  const highMatchCount = internships.filter(i => i.highMatch).length;

  if (internships.length === 0) {
    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background: #0f0f0f; color: #e0e0e0; border-radius: 16px;">
        <h1 style="color: #fff; font-size: 22px; margin: 0 0 8px 0;">🎯 Daily Internship Report</h1>
        <p style="color: #888; font-size: 14px; margin: 0 0 24px 0;">${date}</p>
        <div style="background: #1a1a2e; padding: 24px; border-radius: 12px; text-align: center;">
          <p style="font-size: 18px; color: #ffd700; margin: 0;">No high-quality internships found today</p>
          <p style="color: #888; margin: 8px 0 0 0;">We'll keep looking! Check back tomorrow. 🔄</p>
        </div>
      </div>
    `;
  }

  const internshipCards = internships.map((internship, index) => {
    const badge = internship.highMatch
      ? '<span style="background: linear-gradient(135deg, #ff6b35, #f7c948); color: #000; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">🔥 HIGH MATCH</span>'
      : '';

    const stipendColor = internship.stipend !== 'Not disclosed' && internship.stipend !== 'Unpaid'
      ? '#4ade80' : '#888';

    return `
      <div style="background: ${internship.highMatch ? '#1a1a3e' : '#1a1a1a'}; border: 1px solid ${internship.highMatch ? '#3b3b8d' : '#2a2a2a'}; border-radius: 12px; padding: 20px; margin-bottom: 12px; ${internship.highMatch ? 'box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);' : ''}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <h3 style="color: #fff; margin: 0; font-size: 16px; line-height: 1.3;">${index + 1}. ${internship.title}</h3>
          ${badge}
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #888; padding: 3px 0; font-size: 13px; width: 90px;">Company</td>
            <td style="color: #d0d0d0; padding: 3px 0; font-size: 13px; font-weight: 600;">${internship.company}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 3px 0; font-size: 13px;">Location</td>
            <td style="color: #d0d0d0; padding: 3px 0; font-size: 13px;">${internship.location}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 3px 0; font-size: 13px;">Stipend</td>
            <td style="color: ${stipendColor}; padding: 3px 0; font-size: 13px; font-weight: 600;">${internship.stipend}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 3px 0; font-size: 13px;">Duration</td>
            <td style="color: #d0d0d0; padding: 3px 0; font-size: 13px;">${internship.duration}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 3px 0; font-size: 13px;">Source</td>
            <td style="color: #818cf8; padding: 3px 0; font-size: 13px;">${internship.source}</td>
          </tr>
        </table>
        <a href="${internship.link}" target="_blank" style="display: inline-block; margin-top: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;">Apply Now →</a>
      </div>
    `;
  }).join('');

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background: #0f0f0f; color: #e0e0e0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #fff; font-size: 24px; margin: 0 0 6px 0;">🎯 Daily Internship Report</h1>
        <p style="color: #888; font-size: 14px; margin: 0 0 4px 0;">${date}</p>
        <p style="color: #818cf8; font-size: 14px; margin: 0;">
          <strong>${internships.length}</strong> opportunities found
          ${highMatchCount > 0 ? ` · <span style="color: #f7c948;">${highMatchCount} 🔥 High Match</span>` : ''}
        </p>
      </div>
      <div style="border-top: 1px solid #2a2a2a; padding-top: 16px;">
        ${internshipCards}
      </div>
      <div style="text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #2a2a2a;">
        <p style="color: #555; font-size: 11px; margin: 0;">Powered by Internship Agent 🤖 · Bengaluru Tech Internships</p>
      </div>
    </div>
  `;
}

/**
 * Generates the email subject line.
 */
function formatEmailSubject(internships) {
  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
  });
  const highCount = internships.filter(i => i.highMatch).length;

  if (internships.length === 0) {
    return `🎯 Internship Report — ${date} — No results today`;
  }
  return `🎯 Internship Report — ${date} — ${internships.length} opportunities${highCount > 0 ? ` (${highCount} 🔥)` : ''}`;
}

/**
 * Generates a Slack-formatted message.
 */
function formatSlackMessage(internships) {
  const date = getReportDate();

  if (internships.length === 0) {
    return {
      text: `🎯 *Daily Internship Report* — ${date}\n\nNo high-quality internships found today. We'll keep looking! 🔄`,
    };
  }

  const highMatchCount = internships.filter(i => i.highMatch).length;

  let header = `🎯 *Daily Internship Report* — ${date}\n`;
  header += `📊 *${internships.length}* opportunities found`;
  if (highMatchCount > 0) {
    header += ` · *${highMatchCount}* 🔥 High Match`;
  }
  header += '\n─────────────────────────────\n\n';

  const listings = internships.map((i, idx) => {
    const badge = i.highMatch ? ' 🔥 *HIGH MATCH*' : '';
    const lines = [
      `*${idx + 1}. ${i.title}*${badge}`,
      `   🏢 *Company:* ${i.company}`,
      `   📍 *Location:* ${i.location}`,
      `   💰 *Stipend:* ${i.stipend}`,
      `   ⏱️ *Duration:* ${i.duration}`,
      `   🔗 <${i.link}|Apply Now>`,
      `   📌 *Source:* ${i.source}`,
    ];
    return lines.join('\n');
  }).join('\n\n');

  return {
    text: header + listings + '\n\n─────────────────────────────\n_Powered by Internship Agent 🤖_',
  };
}

/**
 * Generates a plain-text version for console logging.
 */
function formatConsoleReport(internships) {
  if (internships.length === 0) {
    return '📋 No high-quality internships found today.';
  }

  const lines = internships.map((i, idx) => {
    const badge = i.highMatch ? ' 🔥 HIGH MATCH' : '';
    return [
      `${idx + 1}. Role: ${i.title}${badge}`,
      `   Company: ${i.company}`,
      `   Location: ${i.location}`,
      `   Stipend: ${i.stipend}`,
      `   Duration: ${i.duration}`,
      `   Apply: ${i.link}`,
      `   Source: ${i.source}`,
    ].join('\n');
  });

  return lines.join('\n\n');
}

module.exports = { formatEmailHTML, formatEmailSubject, formatSlackMessage, formatConsoleReport };
