# Lessons — Frederic (Product)

Product ideas, design decisions, things that didn't pan out or weren't worth the complexity.

---

### Capture friction is the #1 enemy
The entire product lives or dies on how easy it is to send a memory. Every extra step at capture time reduces adoption. WhatsApp DM is the right first channel because it's zero friction — no app to open, no form to fill in.

### Flat data model works for prototyping, not for production
The flat `memories` table with TEXT[] arrays (people, places, tags) was fast to build and proved the core loop. But it creates problems: no deduplication ("home" vs "Home" vs "thuis"), no entity relationships, no aggregation across memories. The relational domain model (domain-model-brief.md) is the right target.

### WhatsApp is a lossy channel for metadata
We assumed photos sent via WhatsApp would carry EXIF data (date, GPS). They don't — WhatsApp strips it for privacy. This means automatic date and location tagging requires a different approach: follow-up questions, manual entry, or direct photo upload via the website.

### Start-of-session prompt
At the beginning of each working session, Claude should suggest 1-2 product lessons based on the previous session's work and ask Frederic to confirm or add to them.

### A product vision needs both an audience story and a purpose story
"Who do we serve and how do we grow" (families → clubs → platform) is a different question than "why does this exist" (reconnecting people, creating synergetic value from shared memories). Conflating them weakens both.

### Conceptual frameworks are product differentiators, not just architecture
The distinction between arenas and places, threads and tags — these shape the user experience (surfacing transition moments, suggesting thread promotion). They belong in the product vision, not just in technical briefs.
