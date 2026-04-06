# Canonical Layer — Concept Brief
*Design brief · April 2026 · Owner: Freek*
*Derived from conversations about Johan Huizinga's Homo Ludens and James Carse's Finite and Infinite Games*

---

## How to use this document

This document captures the conceptual design of the canonical layer — the shared, universal data layer that sits beneath individual families' private memories. It draws on two intellectual frameworks:

1. **Huizinga's concept of play** — how human activity transforms space into meaningful arenas
2. **Carse's finite and infinite games** — how some things in a memoir are bounded (a house, a match, a dinner) and others are unbounded (home, family, friendship)

It also introduces **cross-family discovery** — the platform capability that emerges when canonical entities are shared across user groups.

**This document is a design direction for Phase 2.** Do not implement until the Phase 1 flat data model has been migrated to the relational schema described in `domain-model-brief.md`.

---

## 1. The Problem the Canonical Layer Solves

### 1.1 Deduplication (the original problem)

As the app grows beyond one family, different users create Location and Event records that refer to the same real-world thing but with different names: "Vondelpark" vs. "Vondo Park" vs. "The Vondelpark Amsterdam." Without a canonical layer, there is no way to aggregate memories across users around the same place or event.

### 1.2 Meaning (the deeper problem)

Deduplication solves a data quality problem, but it misses something fundamental. A memoir is not a database of coordinates and timestamps. It's a record of *meaning*. The same physical space can carry entirely different meanings depending on what happens there. A patch of grass is just geography until someone draws chalk lines on it — then it becomes a football field, which is a fundamentally different thing.

The canonical layer must model not just *where* and *when*, but *what kind of thing* a place or event was in the context of someone's life.

### 1.3 Discovery (the platform opportunity)

When canonical entities are shared across all users on the platform, the system can detect connections that no individual user would ever discover: two families who were at the same event, lived in the same house decades apart, or share a recurring tradition at the same place. This turns a private memoir app into a social discovery platform — while keeping privacy as the absolute default.

---

## 2. Huizinga — How Meaning Gets Layered onto Space

Johan Huizinga's *Homo Ludens* (1938) argues that play creates a **magic circle** — a bounded space where different rules apply. This transformation is not physical but ontological: the space acquires rules, boundaries, meaning, and identity through shared human activity.

A single physical space carries multiple layers of meaning simultaneously:

### Substrate
The geographic fact. Coordinates, soil, elevation. Exists whether anyone knows about it or not. This is what a GPS coordinate captures.

### Place
The named substrate. "The field at the edge of town." Someone has recognized it, given it identity. It's part of shared understanding, but still passive — it doesn't *do* anything.

### Arena
**Huizinga's magic circle.** The chalk lines and goalposts transform the place into a bounded space where different rules apply. Inside the lines, the ball is in play; outside, it isn't. The arena exists only because people agree it does.

Properties of arenas:

- **Temporal** — after the game, the chalk fades, the arena dissolves back into a field. But arenas can be recurring: every Saturday, the field becomes an arena again.
- **Transformative** — the arena changes the character of the place. Vondelpark is a park; Vondelpark during the festival is a different thing entirely.
- **Nested** — a festival is an arena; within it, individual performances are sub-arenas; within a performance, the stage is a sub-sub-arena. This is ontological nesting, not just spatial nesting. The main stage is a different *kind of thing* than the park.
- **Identity-conferring** — people have memories of arenas ("the festival"), not substrates ("52.3579° N, 4.8686° E").

### Institution
The arena acquires persistence, governance, and identity beyond any single occurrence. A football club. A family tradition. An annual festival. The institution outlives any particular set of participants and generates recurring arenas.

### Event
A specific, unrepeatable occurrence within an arena. The championship game. King's Day 2025. Christmas dinner 2025. Events have a definite start and end, specific participants, and a narrative arc. Events are what generate the densest clusters of memories.

---

## 3. Carse — Finite and Infinite Games

James Carse's *Finite and Infinite Games* (1986) draws a distinction between two kinds of games:

- **Finite games** are played to win. They have fixed rules, defined boundaries, clear beginnings and endings. The championship match. Christmas dinner 2025. The years at Kerkstraat 4.
- **Infinite games** are played to continue playing. Rules evolve, boundaries shift, players come and go. There is no final moment. Home. Family. Friendship. Being a parent.

### 3.1 Why this matters for memoir

The most emotionally meaningful things in a life are infinite games. "Home" is more significant than any single address. "Family" is more significant than any single gathering. "Friendship with Rob" is more significant than any single evening.

But the current data model can only represent finite things: a place with coordinates, an event with dates. It has no way to express "home as a concept that spans 40 years and six addresses."

### 3.2 The relationship between finite and infinite

Infinite games don't exist in the abstract — they **manifest** through finite instances:

- "Home" manifested as Kerkstraat 4, Naarden from 1982 to 2001, then as the next address after that.
- "Family Christmas" manifested as Christmas 2023 at grandma's house, Christmas 2024 at your place, Christmas 2025 without grandma.
- "Saturday football" manifested as this week's match, last week's match, hundreds of matches stretching back years.

The infinite game persists; the finite manifestations come and go.

### 3.3 The test for infinite vs. finite

**"Can you tell its story across time?"** If yes, it's an infinite game — a thread with narrative continuity. If it's something that *happens to you* in moments — a quality of experience — it's a tag.

Threads (infinite, have narrative continuity):
- Home, School, Work, "Our spot"
- Family, The boys, Friendship with Rob
- Christmas tradition, Saturday football, Summer vacation
- Being a parent, Growing up

Tags (finite/experiential, color individual moments):
- Joy, sadness, funny, proud
- Drunk, sick, dancing, cooking
- Rainy, sunny, late night

### 3.4 Transitions — where the emotional weight lives

The most emotionally charged memories in a memoir are often not *within* a manifestation but **at the boundaries** — where a finite game ends but the infinite game continues in a new form:

- The day you moved into Kerkstraat 4. The day you left.
- The first Christmas without grandma.
- The moment a friendship ended, or transformed.
- Lucius's first day of school (a new manifestation of "growing up").

A data model that knows about threads and manifestations can surface these transition moments: "You have 47 memories tagged 'home.' Here are the five where home changed." This is something no flat tag system can do.

### 3.5 When infinite games end

Carse would say they don't — that's definitional. But in lived experience, some threads go quiet. A friendship fades. A tradition stops. Someone passes away and "grandma's house" stops generating new memories.

The model handles this naturally: the thread persists (you can always browse those memories), but there are no new manifestations after a certain date. The thread doesn't get a `valid_until` — but its last manifestation does. The archive remains navigable; it just stops growing.

---

## 4. Deepened Tag System

### 4.1 Beyond flat labels

The current tag system is a flat array of strings: `["funny", "dinner", "holiday"]`. Tags have no attributes, no relationships, no memory.

A deepened tag system gives tags properties that make the memoir experience more compelling:

### 4.2 Tag attributes

| Attribute | What it captures | Example |
|---|---|---|
| **Weight** | How many memories use this tag. A tag that appears once is trivia; a tag that appears 50 times is a theme. | "funny" → 83 memories |
| **Temporal spread** | Is this tag concentrated in one period, or spread across years? | "pregnancy" clusters in 9 months; "funny" spans everything |
| **Resonance** | Which tags co-occur? If "funny" and "dinner" always appear together, that says something about your family. | "Lucius" + "night sun" co-occur → a Lucius motif |
| **First/last seen** | When did this tag first appear? When was it last used? | "night sun" first appeared April 3, 2026 |
| **Category** | What kind of tag is this? | experience · mood · activity · theme |

### 4.3 Tag promotion

A tag that passes certain thresholds can be offered to the user as a candidate thread:

- High weight (used many times)
- Wide temporal spread (spans months or years)
- Emotional significance (co-occurs with people or life events)

The app could suggest: *"'Saturday football' has appeared in 23 memories over 2 years. Would you like to make it a thread so you can see its full story?"*

This creates a natural pathway: **raw hashtags → weighted tags → promoted threads**. The user doesn't think about data modeling. They just type `#funny` in WhatsApp, and the system gradually learns what matters.

### 4.4 Tags remain tags

Not every tag wants to be a thread. "Funny" will probably always be a tag — it has high weight but no narrative arc. "Drunk" is a tag. "Rainy" is a tag. The system should suggest promotion but never force it.

---

## 5. Cross-Family Discovery

### 5.1 The architectural insight

The canonical layer is, by design, **universal**. It models the real world, not any single family's view of it. Vondelpark exists. The championship match happened. King's Day 2025 took place. These are facts of the world, independent of who remembers them.

When Family A maps their memories to a canonical event and Family B independently maps theirs to the same event, the platform holds a connection that neither family made — and probably doesn't know exists.

### 5.2 Types of discoverable connections

**Same event, different perspective.** Two families were both at the championship match. One remembers the winning goal; the other remembers their kid spilling hot chocolate. The app could suggest: *"Another family also has memories of this match. Would you like to share yours and see theirs?"*

**Same place, different era.** Family A lived at Kerkstraat 4 from 1982 to 2001. Family B moved in in 2003. They don't know each other. But the platform knows they share a canonical place — the same house. A connection across time.

**Same arena, different families.** Multiple families have memories tagged to "Vondelpark Open Air Theatre." None of them know each other, but they share a common arena. The platform could create ambient connections — like a shared guestbook for a place, built from private memories that people choose to make visible.

**Same thread, different manifestations.** Two families both have a "home" thread. They've never met. The platform could surface anonymized patterns: *"Families with young kids tend to create the most 'home' memories during ages 2-6."* Not sharing content — sharing patterns.

### 5.3 Privacy architecture

**Private by default.** Memories are private. No one sees them unless the owner explicitly chooses to share.

**Canonical mapping is invisible.** The admin maps user entities to canonical entities behind the scenes. Users never interact with the canonical layer directly.

**Discovery is suggested, never forced.** The platform says "We noticed a connection." The user decides whether to act on it. Declining is silent and permanent (for that suggestion).

**Sharing is granular.** Users share specific memories around a specific canonical entity — not their whole archive. Sharing can be revoked at any time.

**Patterns are anonymized.** Cross-family pattern insights use aggregated, anonymized data. No individual memories or identities are exposed without explicit consent.

---

## 6. Complexity Warning — Where to Be Careful

### 6.1 The thread trap

The concept of threads is powerful but risks becoming a catch-all category. If everything can be a thread, the concept loses meaning. Guard against this with the narrative continuity test: **can you tell its story across time?** If yes, it's a thread. If not, it's a tag.

Resist the temptation to model experiential states (joy, sadness, energy) as threads. They are qualities of moments, not narratives. Deepened tags (with weight, spread, and resonance) handle them better.

### 6.2 The ontological zoo

Between substrates, places, arenas, institutions, events, threads, manifestations, tags, and canonical entities, there are a lot of concepts. The user should never see this complexity. They send a WhatsApp message with `#funny #vondelpark`. Everything else — the canonicalization, the arena recognition, the thread promotion, the cross-family matching — happens invisibly in the background.

If the system ever asks the user to distinguish between an arena and an event, or between a thread and a tag, the design has failed.

### 6.3 The premature structure trap

Don't build canonical entities for things that don't need them yet. A family with 50 memories doesn't need arenas. A single-family instance doesn't need cross-family discovery. Let the structure emerge from the data:

- Start with flat tags and places (Phase 1 — done)
- Add relational entities when tag/place proliferation demands it (Phase 2a)
- Add canonical deduplication when multi-family demands it (Phase 2b)
- Add threads when temporal patterns emerge in the data (Phase 2c)
- Add cross-family discovery when there are multiple families on the platform (Phase 3)

Each layer justifies itself through user need, not architectural elegance.

### 6.4 The false connection trap

Cross-family discovery can generate false positives. Two families both have memories at "Vondelpark" — but one was at the open-air theatre and the other was at the playground. Same canonical place, totally different experience. The matching must be arena-aware, not just place-aware, to avoid suggesting connections that feel arbitrary.

### 6.5 The cold start problem

Canonical entities need to exist before user entities can be mapped to them. Who creates them? Options:

- **Admin-curated** — the platform admin creates canonical entities for known places, events, arenas. Labor-intensive but high quality.
- **User-promoted** — when a user creates a location or event, the system suggests creating or mapping to a canonical entity. Lower effort but noisier.
- **AI-assisted** — the system uses name similarity, GPS proximity, and date overlap to suggest canonical matches. Requires confidence thresholds to avoid false matches.

The right answer is probably all three in sequence: admin-curated seed data, user promotion for growth, AI assistance for scale.

---

## 7. How the Frameworks Relate

| Framework | What it explains | Layer in the model |
|---|---|---|
| **Huizinga (play)** | How meaning gets stacked onto physical space | Substrate → Place → Arena → Institution → Event |
| **Carse (finite/infinite)** | The temporal character of meaning — bounded or unbounded | Finite entities (places, events) vs. infinite threads (home, family) |
| **Tags** | Experiential qualities of individual moments | Flat labels with weight, spread, resonance, and promotion potential |
| **Canonical layer** | The shared, universal model of the real world | Deduplication + discovery across user groups |
| **Cross-family discovery** | The platform capability that emerges from shared canonical entities | Suggested connections, opt-in sharing, anonymized patterns |

These are orthogonal dimensions. A single memory can be:
- At a **place** (Vondelpark) within an **arena** (King's Day festival) during an **event** (King's Day 2025)
- Part of an infinite **thread** ("family traditions")
- Tagged with experiential **tags** ("joy", "crowded", "sunny")
- Mapped to a **canonical event** that another family also attended

The user sees none of this machinery. They sent a WhatsApp message that said "Amazing day #kingsday #vondelpark #Eva #Lucius" and attached a photo. Everything else is the system's job.

---

*This document is a living design reference. Update it as decisions are made and the product evolves. It does not prescribe an implementation timeline — build toward it incrementally, justified by user need.*
