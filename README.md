# 🎯 Internship Agent

Automated daily scraper that finds **tech internships in Bengaluru** from Internshala and delivers curated reports via **Gmail** and **Slack** at 8:00 AM IST.

## 🧠 What It Does

1. **Scrapes** Internshala for software/backend/AI-ML/web dev internships in Bangalore
2. **Filters** by tech relevance — excludes sales, marketing, HR, and non-tech roles
3. **Deduplicates** against previously sent listings (7-day memory)
4. **Tags** 🔥 HIGH MATCH for AI/ML, Backend, and Python roles
5. **Delivers** a styled report via Email + Slack

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Copy env template and fill in your credentials
cp .env.example .env

# Dry run (scrape + filter, no delivery)
npm test

# Full run (scrape + filter + deliver)
npm start
```

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `EMAIL_USER` | Gmail address for sending |
| `EMAIL_PASS` | Gmail App Password |
| `EMAIL_TO` | Recipient email address |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL |

## 🚀 GitHub Actions Deployment

1. Push this repo to GitHub
2. Go to **Settings → Secrets → Actions**
3. Add the 4 secrets above
4. The workflow runs daily at **8:00 AM IST** (2:30 AM UTC)
5. You can also trigger manually from the **Actions** tab

## 📊 Output Format

```
1. 🔥 HIGH MATCH
   Role: Backend Developer Intern
   Company: XYZ Tech
   Location: Bengaluru
   Stipend: ₹15,000/month
   Duration: 3 months
   Apply: https://internshala.com/...
   Source: Internshala
```

## 📂 Project Structure

```
├── .github/workflows/daily-internship.yml
├── src/
│   ├── scrapers/internshala.js    # Cheerio + Axios scraper
│   ├── utils/
│   │   ├── filter.js              # Tech keyword filtering
│   │   ├── deduplicator.js        # MD5 hash dedup with 7-day expiry
│   │   └── formatter.js           # HTML email + Slack formatting
│   ├── delivery/
│   │   ├── email.js               # Nodemailer Gmail
│   │   └── slack.js               # Slack webhook
│   └── index.js                   # Main orchestrator
├── data/seen.json                 # Dedup tracking
└── package.json
```
