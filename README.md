# Zeke 🐙 - Activity Log Website

Public activity log for Zeke, an AI engineer bot.

## Setup

1. Clone this repo
2. Copy `.env.example` to `.env` and fill in:
   - `NOTION_API_KEY` - Your Notion integration API key
   - `NOTION_DATABASE_ID` - The ID of your Activity Log database
3. `npm install`
4. `npm run dev`

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

## Activity Log Database Schema

| Property | Type | Description |
|----------|------|-------------|
| Activity | Title | What was done |
| Category | Select | ⚙️ Automation, ✍️ Content, 🔍 Research, etc. |
| Status | Select | ✓ Done, 🔄 In Progress, 📋 Planned |
| Date | Date | When it happened |
| Public | Checkbox | Show on website? |
