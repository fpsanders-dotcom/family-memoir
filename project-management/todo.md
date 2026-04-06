# Family Memoir — Active Tasks

## In Progress
_(nothing active)_

## Up Next
- [ ] Get Freek's wife connected to the WhatsApp sandbox (and decide whether to upgrade off sandbox — 72h membership expiry)
- [ ] Plan and execute migration from flat arrays to relational domain model (per domain-model-brief.md)

## Done (this session)
- [x] Deploy webhook to Railway from GitHub (auto-deploy on push to main)
- [x] Set Supabase + Twilio env vars in Railway
- [x] Add custom domain `webhook.unusual.company` (CNAME + railway-verify TXT at hostnet.nl, Let's Encrypt SSL)
- [x] Update Twilio WhatsApp sandbox webhook URL to `https://webhook.unusual.company/webhook`
- [x] Fix `ReferenceError: crypto is not defined` (Node ESM — explicit `import crypto from 'node:crypto'`)
- [x] End-to-end test: WhatsApp message → Railway → Supabase → bot reply

## Done (previous session)
- [x] Run migration 003 in Supabase SQL Editor (pending_questions table)
- [x] Test conversational follow-up flow live (location → people questions)

## Framer Components (paused)
- [ ] PhotoUpload.tsx — dedicated upload component
- [ ] PhotoDetail.tsx — tagged people, "Ask for input" buttons

## Product Vision
- [ ] Refine `docs/product-vision.md` Section 1: split into two distinct visions — (1) audience vision: who we serve and how we grow (families → friends → clubs → associations), and (2) purpose vision: reconnect people by collaboratively sharing stories, rediscovering shared connections, and creating unrealised synergetic value

## Phase 2 — Design Direction
- [ ] Migrate flat arrays to relational domain model (per `docs/domain-model-brief.md`)
- [ ] Implement arena-based canonical layer (per `docs/canonical-layer-huizinga-brief.md`)
- [ ] Implement threads and deepened tags (per `docs/provisional-domain-model-phase2.md` Sections 4-5)
- [ ] Implement cross-family discovery (per `docs/provisional-domain-model-phase2.md` Section 6)
