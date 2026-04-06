# Family Memoir — Project Log

---

## 2026-04-03 (Session 1 — Foundation)

### What we did
- Read and analyzed the v2 product brief
- Discovered existing codebase in `~/Documents/family-memoir` with working Framer components (ChapterList, ChapterDetail, Timeline, MemoirLayout) and a live Supabase project with chapters, photos, reflections, and members tables
- Built the WhatsApp capture pipeline from scratch: Express webhook server, Twilio integration, hashtag parsing, EXIF extraction, reverse geocoding, Supabase Storage upload, WhatsApp confirmation replies
- Merged the new pipeline into the existing project (additive — no existing files deleted)
- Created migration 002 (memories + phone_users + known_people tables) and ran it against the live Supabase
- Set up Twilio WhatsApp sandbox, ngrok tunnel, and end-to-end tested the full loop
- Sent real WhatsApp messages and confirmed memories land in Supabase and appear in the table view
- Updated known_people list: removed Daniel/Emma, added Eva, Lucius, Barbara, Rob, Renee, Fred
- Created Supabase Auth user account for Freek
- Built conversational follow-up flow (location → people questions after memory capture) with migration 003 (pending_questions table) — not yet tested live
- Discovered that WhatsApp strips EXIF metadata from photos (date + GPS), so photo metadata extraction won't work via WhatsApp. Hashtags and follow-up questions are the workaround.
- Read domain-model-brief.md — identified it as the target architecture (proper relational entities) vs. current flat array approach. Decision: migrate to relational model after prototype is proven.
- Reorganized project management structure (this file)

### Key decisions
- Twilio over Make.com for WhatsApp (more control over parsing and replies)
- Flat memories table now, relational entities later
- ngrok for dev, permanent cloud host later
- Conversational follow-ups via text replies (upgrade to WhatsApp interactive buttons later)

### What's next
- Test the conversational follow-up flow (migration 003 needs to be run)
- Deploy webhook permanently (Railway / Fly.io / Render)
- Get Freek's wife connected to the sandbox
- Plan migration from flat arrays to relational domain model

---

## 2026-04-06 (Session 2 — Conceptual Design)

### What we did
- Continued from session 1 (context window rolled over from a long session on 2026-04-03)
- Completed the provisional domain model for Phase 2: `docs/provisional-domain-model-phase2.md`
  - Concrete table schemas for canonical_place, canonical_arena, canonical_event
  - Thread and thread_manifestation tables (Carse's infinite/finite games)
  - Deepened tag attributes (weight, temporal_spread, resonance, first_seen, last_seen, promotion)
  - Tag resonance co-occurrence table
  - Cross-family discovery tables (family_group, discovery, shared_memory)
  - Entity relationship summary and complexity budget
- Updated project management files to reference the two new Phase 2 design docs

### Key decisions
- Provisional domain model is a design reference, not an implementation spec — refine as Phase 1 stabilizes
- Migration path is strictly sequential: flat arrays → relational entities → canonical layer + arenas → threads + tags → discovery
- Each step is additive — no existing tables are modified
- Institution layer (Huizinga) deferred until arena/event model is proven

### What's next
- Run migration 003 in Supabase SQL Editor (pending_questions table)
- Test conversational follow-up flow live
- Deploy webhook permanently
- Begin migration from flat arrays to relational domain model
