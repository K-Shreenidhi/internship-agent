// ─── Slack Delivery ───────────────────────────────────────────────
// Posts the daily internship report to a Slack channel via incoming webhook.

const axios = require('axios');

/**
 * Sends the internship report to Slack.
 * @param {object} message - Slack message object with `text` field
 */
async function sendSlack(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('⚠️  SLACK_WEBHOOK_URL not set, skipping Slack delivery.');
    return false;
  }

  try {
    const response = await axios.post(webhookUrl, message, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    if (response.status === 200) {
      console.log('💬 Slack message sent successfully');
      return true;
    } else {
      console.error(`❌ Slack responded with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Slack delivery failed: ${error.message}`);
    return false;
  }
}

module.exports = { sendSlack };
