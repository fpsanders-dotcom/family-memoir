# Family Memoir — Tech Stack & Accounts

---

## Supabase — Backend, database, auth, storage
- **Project name:** Family Memoir app
- **Project URL:** https://ohzikpdbuhdaqrzscoxu.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/ohzikpdbuhdaqrzscoxu
- **Auth user:** fpsanders@gmail.com
- **Tables:** memories, phone_users, known_people, pending_questions, chapters, photos, reflections, members

## Twilio — WhatsApp Business API
- **Account SID:** stored in `.env` as `TWILIO_ACCOUNT_SID` (not committed)
- **Auth Token:** stored in `.env` as `TWILIO_AUTH_TOKEN` (not committed)
- **WhatsApp sandbox number:** +14155238886
- **Console:** https://console.twilio.com
- **Webhook URL:** changes with each ngrok session (update in Messaging > WhatsApp sandbox settings)

> **Note:** All credentials live in `.env` (gitignored). Never commit Account SIDs, auth tokens, API keys, or service role keys to the repo.

## Framer — Frontend website
- **Project name:** Family Memoir app
- **Project URL:** https://framer.com/projects/Family-Memoir-app--nc5g1gDQXqbalun8jBpU-e9GFP?node=augiA20Il
- **Code components:** framer/ folder (ChapterList, ChapterDetail, MemoirLayout, Timeline)
- **Connected to:** same Supabase project

## ngrok — Webhook tunneling (development only)
- **Account:** fpsanders@gmail.com
- **Region:** Europe (eu)
- **Usage:** `ngrok http 3000` then update Twilio webhook URL

## Node.js / Express — Webhook server
- **Entry point:** backend/server.js
- **Port:** 3000
- **Start:** `npm run webhook`
- **Test:** `npm test`

## npm packages
- `@supabase/supabase-js` — database + auth + storage client
- `express` — HTTP server
- `twilio` — WhatsApp messaging
- `exifr` — photo EXIF extraction
- `dotenv` — environment variable loading

## OpenStreetMap Nominatim — Reverse geocoding
- Free, no account needed
- Rate limit: 1 request/second

## Development environment
- **Machine:** macOS (Warrior)
- **Node.js:** v22
- **Package manager:** Homebrew + npm
- **Project folder:** ~/Documents/family-memoir
