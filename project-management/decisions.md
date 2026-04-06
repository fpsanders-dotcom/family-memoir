# Family Memoir — Decision Log

Significant architectural and product decisions, with context and rationale.

---

### 2026-04-03: Twilio over Make.com for WhatsApp integration
**Decision:** Use Twilio WhatsApp Business API directly with a custom Express webhook, instead of Make.com (Integromat) automation.
**Alternatives:** Make.com (low-code, faster setup, less control), direct WhatsApp Business API without Twilio (complex setup).
**Rationale:** Twilio gives full control over message parsing, EXIF extraction, follow-up conversations, and reply formatting. Make.com would have required workarounds for hashtag parsing and photo processing.

### 2026-04-03: Flat arrays now, relational entities later
**Decision:** Build the Phase 1 prototype with flat TEXT[] arrays on the memories table (people, places, tags) instead of proper relational entities from the domain-model-brief.
**Alternatives:** Build the full relational model (person, location, event, tag tables + junction tables) from day one.
**Rationale:** The flat model proved the core loop in a single session. The relational model is the right target architecture, but building it first would have delayed validation of the WhatsApp pipeline by days. Migration is planned once the prototype is stable.

### 2026-04-03: Text-based follow-up questions before interactive buttons
**Decision:** Implement conversational follow-ups as numbered text replies ("Reply 1 for home, 2 for...") instead of WhatsApp interactive buttons.
**Alternatives:** WhatsApp quick-reply buttons (native UI, better UX, requires full Business API).
**Rationale:** The Twilio sandbox doesn't support interactive message types. Text replies work today and can be upgraded to buttons when moving to a production WhatsApp Business API setup.

### 2026-04-03: ngrok for development, permanent host later
**Decision:** Use ngrok during development for webhook tunneling. Deploy to a permanent cloud host once the prototype stabilizes.
**Alternatives:** Deploy immediately to Railway/Fly.io/Render.
**Rationale:** ngrok is instant and free. Deploying to a cloud host requires config, environment setup, and ongoing management — not worth it while the webhook code is changing daily.

### 2026-04-03: Arena-based canonical layer design (Huizinga)
**Decision:** The Phase 2 canonical layer should model not just places and events, but *arenas* — Huizinga's magic circles — as an intermediate entity between place and event. This captures the insight that a location can carry multiple modes of meaning (a park vs. a festival venue vs. a playground), and that memories attach to these modes, not to raw geography.
**Alternatives:** Simple place/event deduplication as originally designed in domain-model-brief.md.
**Rationale:** The memoir app is fundamentally about meaning, not geography. A family's memories of "King's Day at Vondelpark" are about the arena (the festival), not the substrate (the park). Modeling arenas allows richer aggregation ("show me all festival memories") and preserves the ontological richness of how people actually remember places. See `docs/canonical-layer-huizinga-brief.md` for the full design.
**Impact:** None on Phase 1. The arena concept extends the canonical layer planned for Phase 2.

### 2026-04-03: Keep existing Framer components alongside new pipeline
**Decision:** Merge the WhatsApp pipeline code into the existing family-memoir project without modifying any Framer components or existing database tables.
**Alternatives:** Start a fresh repo, or restructure the project around the new architecture.
**Rationale:** The Framer components (ChapterList, ChapterDetail, Timeline, MemoirLayout) are working and connected to the live Supabase. No reason to touch them. The new code is purely additive.

### 2026-04-06: Polymorphic thread manifestations over per-entity junction tables
**Decision:** Use `entity_type` + `entity_id` (polymorphic reference) in `thread_manifestation` instead of separate junction tables for each entity type.
**Alternatives:** Create `thread_location`, `thread_event`, `thread_person`, `thread_arena` junction tables.
**Rationale:** Threads can manifest through many entity types (locations, events, people, arenas). Separate junction tables would multiply the schema without adding type safety that matters at this stage. A single polymorphic table keeps the model simple and extensible.

### 2026-04-06: Defer institution layer (Huizinga) until arenas are proven
**Decision:** The provisional Phase 2 domain model includes arenas but not institutions (persistent governance entities like football clubs or annual festival organizations).
**Alternatives:** Model institutions now as a layer between arena and event.
**Rationale:** Institutions add governance complexity (membership, rules, identity beyond participants) that isn't needed until the arena/event model is proven with real data. Can be added later as a table with FK from arena.
