// ─── Email Delivery ───────────────────────────────────────────────
// Sends the daily internship report via Gmail using Nodemailer.

const nodemailer = require('nodemailer');

/**
 * Creates and returns a Nodemailer transporter configured for Gmail.
 */
function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Sends the internship report email.
 * @param {string} subject - Email subject line
 * @param {string} htmlBody - Styled HTML body
 */
async function sendEmail(subject, htmlBody) {
  const emailTo = process.env.EMAIL_TO || process.env.EMAIL_USER;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER or EMAIL_PASS not set, skipping email delivery.');
    return false;
  }

  try {
    const transporter = createTransport();

    const info = await transporter.sendMail({
      from: `"🎯 Internship Agent" <${process.env.EMAIL_USER}>`,
      to: emailTo,
      subject: subject,
      html: htmlBody,
    });

    console.log(`📧 Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Email delivery failed: ${error.message}`);
    return false;
  }
}

module.exports = { sendEmail };
