# Family Memoir — Provisional Domain Model: Phase 2
*Table schemas for threads, arenas, deepened tags, and cross-family discovery*
*April 2026 · Owner: Freek*
*Companion to: `canonical-layer-huizinga-brief.md` (concepts) and `domain-model-brief.md` (Phase 1 schema)*

---

## How to use this document

This document translates the conceptual frameworks in `canonical-layer-huizinga-brief.md` into concrete table schemas. It is **provisional** — a design reference, not an implementation spec. The schemas will be refined as Phase 1 stabilizes and Phase 2 work begins.

**Do not implement any of this until the Phase 1 flat data model has been migrated to the relational schema in `domain-model-brief.md`.**

The migration path is:
1. Phase 1 flat arrays (current) → Phase 2a relational entities (`domain-model-brief.md` Section 2)
2. Phase 2a relational entities → Phase 2b canonical layer + arenas (this document, Sections 1-3)
3. Phase 2b canonical layer → Phase 2c threads and deepened tags (this document, Sections 4-5)
4. Phase 2c → Phase 3 cross-family discovery (this document, Section 6)

Each step is additive. No existing tables are modified — only new tables and nullable FK columns are added.

---

## 1. Canonical Place (Substrate + Place layers)

The foundation of the spatial hierarchy. A canonical place is a geographic fact that exists independently of any user's memory.

```sql
CREATE TABLE canonical_place (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,               -- "Vondelpark", "Kerkstraat 4, Naarden"
    address         TEXT,
    lat             DOUBLE PRECISION,
    lng             DOUBLE PRECISION,
    place_type      TEXT,                        -- park, house, street, city, venue, ...
    parent_place_id UUID REFERENCES canonical_place(id),  -- spatial nesting
    valid_from      DATE,                        -- when it came into existence
    valid_until     DATE,                        -- when it ceased to exist (null = still exists)
    created_at      TIMESTAMPTZ DEFAULT now(),
    created_by      UUID                         -- admin who created it
);
```

**Notes:**
- Replaces the simpler `canonical_location` from `domain-model-brief.md` Section 3.
- `parent_place_id` enables spatial nesting: a house is inside a street, a street inside a city.
- `place_type` is a soft enum — no constraint, just a convention. Keeps it flexible.
- `valid_from` / `valid_until` handle temporal existence: "Brandon" closed, "The Phoenix" opened at the same address.

**Mapping to user data (added to existing `location` table):**

```sql
ALTER TABLE location
    ADD COLUMN canonical_place_id UUID REFERENCES canonical_place(id);
```

---

## 2. Canonical Arena (Huizinga's magic circle)

An arena is a bounded space where different rules apply — Huizinga's magic circle. It transforms a place into something with meaning, rules, and identity. A festival transforms a park. A match transforms a field. A family dinner transforms a dining room.

```sql
CREATE TABLE canonical_arena (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,               -- "Vondelpark Open Air Theatre", "Saturday Football"
    canonical_place_id UUID REFERENCES canonical_place(id),  -- where this arena exists
    character       TEXT,                        -- what kind of arena: festival, match, tradition, ...
    recurrence      TEXT,                        -- null (one-off), "weekly", "annual", "irregular"
    parent_arena_id UUID REFERENCES canonical_arena(id),  -- ontological nesting
    valid_from      DATE,                        -- when this arena first existed
    valid_until     DATE,                        -- when it stopped (null = still active)
    created_at      TIMESTAMPTZ DEFAULT now(),
    created_by      UUID
);
```

**Notes:**
- `parent_arena_id` captures ontological nesting, not just spatial nesting. A festival is an arena; a stage within the festival is a sub-arena. The stage is a different *kind of thing* than the park, even though it's spatially inside it.
- `recurrence` distinguishes one-off arenas (a specific wedding venue setup) from recurring ones (Saturday football, annual Christmas dinner location). Recurring arenas generate multiple events over time.
- `character` is a soft label for the type of transformation the arena represents.

---

## 3. Canonical Event (Specific occurrences)

An event is a specific, unrepeatable occurrence within an arena. The championship match. King's Day 2025. Christmas dinner 2025.

```sql
CREATE TABLE canonical_event (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,           -- "King's Day 2025", "Christmas Dinner 2025"
    canonical_arena_id  UUID REFERENCES canonical_arena(id),  -- which arena hosted it
    canonical_place_id  UUID REFERENCES canonical_place(id),  -- direct place link (if no arena)
    date_start          DATE,
    date_end            DATE,
    created_at          TIMESTAMPTZ DEFAULT now(),
    created_by          UUID
);
```

**Notes:**
- An event belongs to an arena when possible (`canonical_arena_id`), but can also link directly to a place (`canonical_place_id`) for events that don't have a meaningful arena layer.
- This replaces the simpler `canonical_event` from `domain-model-brief.md` Section 3.

**Mapping to user data (added to existing `event` table):**

```sql
ALTER TABLE event
    ADD COLUMN canonical_event_id UUID REFERENCES canonical_event(id);
```

---

## 4. Threads (Carse's infinite games)

A thread represents an infinite game — something with narrative continuity across time. "Home", "family", "friendship with Rob", "Saturday football", "growing up."

Threads don't have end dates in the traditional sense. They persist as long as there are memories in them, even if no new memories are being added.

```sql
CREATE TABLE thread (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,               -- "Home", "Saturday Football", "Growing Up"
    description     TEXT,                        -- optional narrative description
    thread_type     TEXT NOT NULL,               -- place_thread, people_thread, tradition_thread, life_thread
    family_group_id UUID NOT NULL,               -- which family owns this thread
    created_at      TIMESTAMPTZ DEFAULT now(),
    promoted_from_tag_id UUID                    -- if this thread was promoted from a tag
);
```

**Thread types:**
- `place_thread` — "Home", "Our spot", "School"
- `people_thread` — "Family", "The boys", "Friendship with Rob"
- `tradition_thread` — "Christmas tradition", "Saturday football", "Summer vacation"
- `life_thread` — "Being a parent", "Growing up", "Career"

### 4.1 Thread manifestations

A manifestation is a finite binding of an infinite thread to a concrete entity — a specific address, a specific period, a specific group of people.

```sql
CREATE TABLE thread_manifestation (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id       UUID NOT NULL REFERENCES thread(id),
    entity_type     TEXT NOT NULL,               -- 'location', 'event', 'person', 'arena'
    entity_id       UUID NOT NULL,               -- FK to the relevant entity (polymorphic)
    valid_from      DATE,                        -- when this manifestation started
    valid_until     DATE,                        -- when it ended (null = still active)
    label           TEXT,                        -- optional human label: "Kerkstraat years"
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient lookups
CREATE INDEX idx_manifestation_thread ON thread_manifestation(thread_id);
CREATE INDEX idx_manifestation_entity ON thread_manifestation(entity_type, entity_id);
```

**Notes:**
- `entity_type` + `entity_id` form a polymorphic reference. The entity could be a `location`, `event`, `person`, `canonical_place`, `canonical_arena`, or `canonical_event`. This avoids a separate junction table for every entity type.
- `valid_from` / `valid_until` capture the temporal window of the manifestation. "Home" was Kerkstraat 4 from 1982 to 2001, then the next address from 2001 onward.
- When an infinite game's last manifestation gets a `valid_until`, the thread goes quiet but persists. The archive remains navigable.

### 4.2 Thread-memory link

Memories can be tagged to a thread directly, independent of manifestations. This lets users browse "all home memories" without needing to know which manifestation they belong to.

```sql
CREATE TABLE memory_thread (
    memory_id       UUID NOT NULL REFERENCES memory(id),
    thread_id       UUID NOT NULL REFERENCES thread(id),
    manifestation_id UUID REFERENCES thread_manifestation(id),  -- optional: which specific manifestation
    PRIMARY KEY (memory_id, thread_id)
);
```

---

## 5. Deepened Tags

The current flat tag system (`tag` table with `id`, `label`, `category`) is extended with computed and stored attributes that make tags more powerful without requiring user effort.

```sql
ALTER TABLE tag ADD COLUMN weight          INTEGER DEFAULT 0;      -- count of memories using this tag
ALTER TABLE tag ADD COLUMN first_seen      DATE;                    -- earliest memory_date with this tag
ALTER TABLE tag ADD COLUMN last_seen       DATE;                    -- latest memory_date with this tag
ALTER TABLE tag ADD COLUMN temporal_spread  INTERVAL;               -- last_seen - first_seen
ALTER TABLE tag ADD COLUMN promoted_to_thread_id UUID REFERENCES thread(id);  -- if promoted
```

### 5.1 Tag resonance (co-occurrence)

Which tags appear together? If "funny" and "dinner" always co-occur, that says something about a family's dinners.

```sql
CREATE TABLE tag_resonance (
    tag_a_id        UUID NOT NULL REFERENCES tag(id),
    tag_b_id        UUID NOT NULL REFERENCES tag(id),
    co_occurrence_count INTEGER DEFAULT 0,
    PRIMARY KEY (tag_a_id, tag_b_id),
    CHECK (tag_a_id < tag_b_id)                 -- avoid duplicate pairs
);
```

**Notes:**
- `weight`, `first_seen`, `last_seen`, `temporal_spread` are **computed** — updated by a trigger or batch job whenever a memory is tagged or untagged.
- `tag_resonance` is also computed — updated when memory_tag rows change.
- These attributes enable the tag promotion pathway: raw hashtags → weighted tags → promoted threads.

### 5.2 Tag promotion criteria

A tag becomes a candidate for thread promotion when it meets thresholds. These are not enforced in the schema — they're application logic:

- **High weight**: used in 10+ memories
- **Wide temporal spread**: spans 3+ months
- **Emotional significance**: co-occurs frequently with people or life events

The app suggests promotion; the user decides. If accepted, `promoted_to_thread_id` is set and the tag continues to exist (for backward compatibility) but the thread becomes the primary browsing axis.

---

## 6. Cross-Family Discovery

When canonical entities are shared across family groups, the platform can detect connections. This section defines the data structures for discovery.

### 6.1 Family group

A container for a family's private data. All user-created entities belong to a family group.

```sql
CREATE TABLE family_group (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,               -- "The Sanders Family"
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Add family_group_id to existing tables
ALTER TABLE memory   ADD COLUMN family_group_id UUID REFERENCES family_group(id);
ALTER TABLE person   ADD COLUMN family_group_id UUID REFERENCES family_group(id);
ALTER TABLE location ADD COLUMN family_group_id UUID REFERENCES family_group(id);
ALTER TABLE event    ADD COLUMN family_group_id UUID REFERENCES family_group(id);
```

### 6.2 Discovered connections

When the system detects that two family groups have memories mapped to the same canonical entity, it creates a connection record. The connection is invisible to both families until one or both opt in.

```sql
CREATE TABLE discovery (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_entity_type TEXT NOT NULL,          -- 'place', 'arena', 'event'
    canonical_entity_id UUID NOT NULL,
    family_group_a_id   UUID NOT NULL REFERENCES family_group(id),
    family_group_b_id   UUID NOT NULL REFERENCES family_group(id),
    discovery_type      TEXT NOT NULL,            -- 'same_event', 'same_place_different_era',
                                                  -- 'same_arena', 'same_thread_pattern'
    status              TEXT DEFAULT 'detected',  -- detected → suggested_a → suggested_b →
                                                  -- accepted → declined_a → declined_b
    suggested_at        TIMESTAMPTZ,
    responded_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT now(),
    CHECK (family_group_a_id < family_group_b_id) -- canonical ordering, avoid duplicates
);

CREATE INDEX idx_discovery_entity ON discovery(canonical_entity_type, canonical_entity_id);
CREATE INDEX idx_discovery_family ON discovery(family_group_a_id);
```

**Notes:**
- `discovery_type` captures the nature of the connection (from concept brief Section 5.2).
- `status` tracks the opt-in flow. A discovery starts as `detected`, gets `suggested` to each family independently, and is only `accepted` when both families opt in. Declining is permanent for that specific suggestion.

### 6.3 Shared memories (opt-in)

When both families accept a connection, they can choose specific memories to share around the canonical entity.

```sql
CREATE TABLE shared_memory (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discovery_id    UUID NOT NULL REFERENCES discovery(id),
    memory_id       UUID NOT NULL REFERENCES memory(id),
    shared_by       UUID NOT NULL REFERENCES family_group(id),
    shared_at       TIMESTAMPTZ DEFAULT now(),
    revoked_at      TIMESTAMPTZ                  -- null = still shared, set = revoked
);
```

**Notes:**
- Sharing is granular (specific memories, not entire archives) and revocable.
- Only memories mapped to the relevant canonical entity can be shared through that connection.

---

## 7. Entity Relationship Summary

```
canonical_place
    ├── canonical_arena (many arenas per place)
    │       └── canonical_event (many events per arena)
    └── canonical_event (events can also link directly to place)

location ──→ canonical_place (many user locations map to one canonical place)
event    ──→ canonical_event (many user events map to one canonical event)

thread
    └── thread_manifestation (binds to location, event, person, arena, etc.)

memory
    ├── memory_thread (tagged to threads)
    ├── memory_tag (tagged with deepened tags)
    ├── memory_person, location, event (Phase 1 relations)
    └── shared_memory (opt-in cross-family sharing via discovery)

tag
    ├── tag_resonance (co-occurrence with other tags)
    └── promoted_to_thread_id (when promoted to a thread)

family_group
    └── discovery (connections between family groups via canonical entities)
```

---

## 8. What This Model Does NOT Cover

These are deliberately deferred or out of scope:

- **Institution layer** (Huizinga): Institutions (football clubs, annual festival organizations) sit between arenas and events but add governance complexity. Defer until the arena/event model is proven.
- **Substrate layer** (Huizinga): Raw coordinates without names. The `canonical_place` table already captures this via `lat`/`lng` — a separate substrate entity adds no value.
- **Anonymous pattern sharing**: Aggregated cross-family insights ("families with young kids create the most home memories during ages 2-6") require analytics infrastructure beyond this domain model.
- **AI-assisted canonical matching**: The matching logic (name similarity, GPS proximity, date overlap, confidence thresholds) lives in application code, not the schema.
- **RLS policies**: Row Level Security for all new tables will be designed during implementation, following the pattern established in Phase 1.

---

## 9. Complexity Budget

Per the concept brief's warnings (Section 6), this model introduces many new concepts. The implementation guard rails:

- **Never expose ontological complexity to users.** Users send WhatsApp messages with hashtags. The canonical/arena/thread machinery is invisible.
- **Build only what the data demands.** Don't create arena records for a family with 50 memories. Don't enable cross-family discovery for a single-family instance.
- **The narrative continuity test gates thread creation.** If you can't tell its story across time, it's a tag, not a thread.
- **Arena matching must be arena-aware, not just place-aware.** Two families at "Vondelpark" — one at the theatre, one at the playground — are not a meaningful connection.

---

*Provisional domain model for Phase 2. Refine as Phase 1 stabilizes and migration begins. Build incrementally, justified by user need, not architectural elegance.*
