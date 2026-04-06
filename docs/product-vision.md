# Family Memoir App — Product Vision
*April 2026 · Owner: Freek*

---

## 1. Vision

The Family Memoir App is a collaborative memory platform that lets family members capture, preserve, and explore their shared memories — photos, observations, funny quotes, milestones, and moments — with as little friction as possible.

The guiding principle is: **capture now, organise later.** Most memory apps fail because they require too much effort at the moment of capture. This app flips that — input is instant and natural (via WhatsApp), and organisation happens asynchronously on the website.

### Long-term vision

Extend beyond families to friendships, clubs, associations, and any group. Become a general-purpose collaborative memoir platform. Support rich export formats (printed books, digital timelines, shareable pages).

---

## 2. Users

### Prototype users (Phase 1)

Freek (owner, primary tester) and his wife Eva (second contributor). Both send memories about their two children via WhatsApp.

### User behaviour patterns

- **Capture in the moment** — a child says something funny, a photo is taken, a milestone happens
- **Review and enrich later** — sit down on the website and add context, tags, and corrections
- **Browse and reminisce** — scroll through memories, explore by theme or date

### Long-term users

Extended family, friends, clubs, associations — any group that wants to collaboratively document shared experiences.

---

## 3. Input Channels

Input channels are built in priority order. WhatsApp DM first because it is the most frictionless capture method — no app to open, no form to fill in. The website comes later, once the data pipeline is proven.

| Priority | Channel | Description |
|---|---|---|
| 1 — Built | WhatsApp DM | Direct message to the memoir WhatsApp number. Supports text, photos, and hashtags. |
| 2 — Later | WhatsApp Group Chat | Shared group chat between partners. Everything shared in the group is also captured. |
| 3 — Later | Website (direct input) | Direct editing and adding via the website once the WhatsApp pipeline is proven. |

---

## 4. Organisation Philosophy

Memories can be organised and browsed through multiple lenses simultaneously. Organisation is not a fixed hierarchy — it is a flexible set of labels that can be added, changed, or combined.

| Layer | Example | How it works |
|---|---|---|
| Chapters | Early Years, School Days | Broad narrative groupings. Auto-suggested based on date ranges and content patterns. |
| Events | Christmas 2025, Trip to Portugal | Specific occasions. Auto-suggested when memories cluster around the same date/place. |
| Dates | By day / month / year | Chronological browsing. Always available, requires no labels. |
| Hashtags | #Daniel, #funny, #Amsterdam | Any #tag becomes a browsable axis. Filter all memories by any tag instantly. |

Organisation structures are suggested automatically by the app based on patterns in the data. Users can review, rename, merge, or delete suggestions on the website. Users can also manually assign organisation labels to any memory.

---

## 5. How Meaning Works in a Memoir

A memoir is not a database of coordinates and timestamps. It is a record of *meaning*. Two insights from play theory and game theory shape how the app understands meaning.

### Places become arenas

A physical location carries different meaning depending on what happens there. Vondelpark is a park — but Vondelpark during the festival is a different thing entirely. A dining room is a room — but a dining room during Christmas dinner is something else. Drawing from Huizinga's concept of play, the app recognises that human activity transforms space: a place becomes an arena with its own character, rules, and identity. The same coordinates can host many different arenas over time — and the memories belong to the arena, not just the pin on the map.

### Some things are infinite, others are finite

Drawing from Carse's *Finite and Infinite Games*, the most emotionally meaningful things in a life tend to be open-ended: "home", "family", "friendship with Rob", "being a parent." These don't have an end date — they persist and evolve. But they manifest through specific, bounded instances: home was Kerkstraat 4 from 1982 to 2001, then the next address. Family Christmas was at grandma's house until it wasn't.

The app distinguishes between **threads** (infinite, narrative continuity across time) and **tags** (experiential, coloring individual moments). The test is simple: can you tell its story across time? "Home" has a story — it's a thread. "Funny" doesn't — it's a tag.

This distinction enables something a flat tag system cannot: surfacing the transition moments where life changes. "You have 47 memories tagged 'home.' Here are the five where home changed."

### Tags grow smarter over time

Tags start as raw hashtags typed in WhatsApp. The system gradually learns which tags matter by tracking how often they appear, how they spread across time, and which tags tend to co-occur. A tag that appears in 23 memories over 2 years becomes a candidate for thread promotion — the app suggests it, the user decides. The pathway is natural: raw hashtags become weighted tags become threads, without the user ever thinking about data modeling.

### Complexity stays invisible

The user sends a WhatsApp message: "Amazing day #kingsday #vondelpark #Eva #Lucius" with a photo. Behind the scenes, the system recognises the arena (King's Day festival at Vondelpark), links to a thread (family traditions), deepens the tags, and notes a canonical event that other families may also remember. The user sees none of this. If the system ever asks a user to distinguish between an arena and an event, or between a thread and a tag, the design has failed.

---

## 6. Cross-Family Discovery

When the app grows beyond a single family, the shared understanding of real-world places and events creates a platform opportunity. Two families who were both at the same festival, or who lived in the same house decades apart, share a connection that neither of them knows about.

The app can surface these connections — but only with explicit consent. Memories are private by default. Discovery is suggested, never forced. Sharing is granular (specific memories, not entire archives) and revocable. The vision is an ambient social layer built from private memories that people choose to make visible — like a shared guestbook for a place, constructed from moments people independently lived there.

---

## 7. Website Vision

### Phase 1: Simple table view (built)

A plain, sortable, filterable table of all memories. Intentionally minimal — maximum flexibility to iterate on visualisation later without locking into design decisions early.

### Phase 2: Two view modes (planned)

**Edit mode** — Focused, structured editing of a specific memory or event. Full detail panel with all fields editable, multiple photos uploadable, organisation labels assignable.

**Exploration mode** — Casual browsing and bulk organisation. Browse a grid of photos and drag them into chapters/events. Free-form adding of moments. Good for sorting through a batch of photos from a holiday or event.

---

## 8. Design Decisions

These decisions guide the product direction and remain relevant across phases.

| Decision | Rationale |
|---|---|
| WhatsApp DM before website input | Lowest friction capture. Prove the pipeline before building the UI. |
| Website starts as a plain table | Maximum flexibility. Avoids locking in visualisation decisions before data patterns are understood. |
| Organisation is layered, not hierarchical | Memories belong to multiple contexts simultaneously. A flat tag array handles this better than nested folders. |
| Auto-populate from metadata, always editable | Reduce manual effort at capture time. Accept that metadata is imperfect and let users correct it. |
| Two users only in prototype | Keep auth and permissions trivial. Expand to groups later. |
| Places carry meaning through arenas, not just coordinates | A memoir cares about what happened somewhere, not just where it was. Model the transformation of space. |
| Threads for narrative continuity, tags for experiential qualities | "Can you tell its story across time?" separates threads from tags. Prevents the thread concept from becoming a catch-all. |
| Tags evolve into threads through use, not upfront design | Users type hashtags. The system learns what matters. Promotion is suggested, never forced. |
| Complexity stays invisible to the user | All canonical, arena, and thread machinery operates behind the scenes. Users interact only with WhatsApp messages and a simple website. |
| Privacy by default for cross-family discovery | Memories are private. Connections are suggested, not exposed. Sharing is granular and revocable. |

---

## 9. Future Scope

These features are aspirational and not planned for any current phase.

- General-purpose groups/associations support
- Export to printed book or shareable page
- Mobile app
- AI-generated memory summaries or captions

---

*Family Memoir App — Product Vision · April 2026. This document captures the product direction and design philosophy. For technical architecture, see `domain-model-brief.md`, `canonical-layer-huizinga-brief.md`, and `provisional-domain-model-phase2.md`.*
