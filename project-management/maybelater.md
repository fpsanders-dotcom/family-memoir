# Maybe Later — Parking Lot

Ideas that are out of scope for the current prototype but worth remembering.

---

### WhatsApp interactive buttons
Replace text-based follow-up replies ("reply 1, 2, 3") with native WhatsApp quick-reply buttons and list messages. Requires moving from the Twilio sandbox to a full WhatsApp Business API setup.

### WhatsApp group chat capture
Allow a shared family group chat to also feed into the memoir. Every message in the group is captured. Requires Twilio group chat integration and sender disambiguation.

### WhatsApp location request
Instead of asking "where was this?" as a text question, send a WhatsApp location request that opens the native location picker on the phone. Needs WhatsApp Business API.

### AI-generated memory summaries
Use an LLM to generate narrative summaries from clusters of memories — e.g., "Christmas 2025: a collection of 12 memories spanning 3 days, featuring Eva, Lucius, and the extended family."

### Printed book export
Generate a formatted PDF or InDesign file from selected memories, chapters, and photos — suitable for printing as a physical memoir book.

### Digital shareable timeline
A public or semi-public URL that displays a curated timeline of memories — shareable with extended family or friends.

### Mobile app
Native iOS/Android app for browsing and adding memories. Lower priority because WhatsApp already covers mobile capture.

### Auto-suggested chapters and events
Automatically detect clusters of memories (same date range, same location, same people) and suggest chapter or event groupings.

### Canonical layer for multi-user deduplication
When multiple users create Location and Event records with different names for the same thing, an admin can map them to canonical references. Designed in domain-model-brief.md Section 3. Build when expanding beyond two users.

### Connect Eva to the WhatsApp pipeline
Join Twilio sandbox, add phone_users mapping, test end-to-end. Deferred until the setup is stable and most kinks are ironed out — Freek wants to tinker first.

### Website direct input
Add memory creation directly on the Framer website — text, photos, tags — bypassing WhatsApp entirely. Good for batch-adding older memories.
