# Family Memoir — Domain Model Brief
*Derived from design conversation · April 2026 · Owner: Freek*

---

## How to use this document

This document captures the domain model decisions made during a design conversation in Claude.ai. It is intended as input for Claude Cowork to:

1. Understand the data model decisions and their rationale
2. Use the Phase 1 schema as the basis for Supabase table creation
3. Be aware of the canonical layer design (Section 3) so the Phase 1 schema is built to accommodate it without implementing it yet

**Do not implement the canonical layer in Phase 1. Build only what is described in Section 2.**

---

## 1. Core Design Principles

### Capture now, organise later
The guiding principle of the app. The data model must support frictionless input (a single WhatsApp message) while enabling rich organisation and browsing later on the website.

### Everything is optional at capture time
A memory can arrive with just a text body. People, places, events, tags, and media can be added immediately or enriched later. No field should block capture.

### Entities exist independently
Location, Event, and Person are first-class entities. They can be created, named, and linked to each other before any memories reference them. This allows users to set up their taxonomy — family members, recurring locations, upcoming events — before memories are added.

### The model is additive
Phase 1 is intentionally simple. The schema is designed so that Phase 2 features (canonical layer, multi-user aggregation) can be bolted on without modifying existing tables.

---

## 2. Phase 1 Domain Model

### 2.1 Entity overview

| Entity | Role | Independent? |
|---|---|---|
| Memory | Core unit — the anchor everything connects to | Yes |
| Content | A thought, quote, or observation within a memory | No — belongs to a Memory |
| Media | An image, video, or audio file | Yes — can exist before linking to a Memory |
| Person | A named individual (family member, friend) | Yes |
| Event | A named occasion with a date range | Yes |
| Location | A named physical place | Yes |
| Tag | A hashtag label for themes, moods, etc. | Yes |

### 2.2 Entity definitions

#### Memory
The core record. All other entities connect to it, but Memory itself only requires a date and a source to exist.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key, auto-generated |
| memory_date | Date | When the memory occurred. From EXIF, WhatsApp timestamp, or manual entry |
| title | Text | Optional short label |
| event_id | UUID (FK, nullable) | → Event |
| location_id | UUID (FK, nullable) | → Location |
| source | Enum | whatsapp_dm · whatsapp_group · website |
| author_id | UUID (FK) | → Person |
| created_at | Timestamp | Auto |

#### Content
Individual pieces of text within a memory — thoughts, quotes, observations. Multiple content items per memory, addable over time.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| memory_id | UUID (FK) | → Memory |
| type | Enum | thought · quote · observation · note |
| body | Text | The content itself |
| author_id | UUID (FK, nullable) | → Person |
| created_at | Timestamp | Auto |

#### Media
A single media file. Exists independently — a photo can be uploaded and tagged before being linked to any memory.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| memory_id | UUID (FK, nullable) | → Memory. Nullable — media can exist unlinked |
| type | Enum | image · video · audio |
| url | Text | Supabase Storage URL |
| taken_at | Timestamp | From EXIF if available, else upload time |
| location_id | UUID (FK, nullable) | → Location. Auto-populated from GPS EXIF |
| duration_s | Integer (nullable) | For video and audio only |
| created_at | Timestamp | Auto |

#### Person
A named individual. Created once, referenced across many memories and events.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | Text | Display name |
| hashtag | Text | e.g. #Daniel — used for WhatsApp parsing |
| phone | Text (nullable) | Twilio sender phone number — maps WhatsApp sender to Person |

#### Event
A named occasion with a date range. Exists independently of memories — can be created in advance.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | Text | e.g. Christmas 2025, Trip to Portugal |
| date_start | Date (nullable) | Start of the event |
| date_end | Date (nullable) | End of the event |
| location_id | UUID (FK, nullable) | → Location |

#### Location
A named physical place. Exists independently. Supports spatial hierarchy (a location inside another location) and temporal validity (a place that existed for a defined period).

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | Text | e.g. Vondelpark, Brandon, Home |
| address | Text (nullable) | Street address |
| lat | Float (nullable) | Latitude |
| lng | Float (nullable) | Longitude |
| type | Text (nullable) | home · park · venue · bar · beach… |
| parent_location_id | UUID (FK, nullable) | → Location. For spatial nesting (main stage inside Vondelpark) |
| date_opened | Date (nullable) | When this location came into existence |
| date_closed | Date (nullable) | When this location ceased to exist (e.g. bar closed down) |

**Why parent_location_id?**
During an event like a festival, sub-locations (entrance, main stage) exist within a parent location (the park). Once the event ends, those sub-locations have no independent meaning. They are created as children of the park, scoped to the event.

**Why date_opened / date_closed?**
A bar called "Brandon" closes and reopens as "The Phoenix" at the same address. Both are separate Location records with distinct names and date ranges. Memories from when it was Brandon remain linked to the Brandon record, preserving historical context.

#### Tag
A general-purpose label. Created automatically from hashtags in WhatsApp messages.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| label | Text | e.g. funny, dinner, holiday |
| category | Text (nullable) | theme · mood · place · other |

### 2.3 Junction tables (many-to-many relationships)

| Table | Resolves |
|---|---|
| memory_person | A memory can tag multiple people; a person appears in many memories |
| memory_tag | A memory can have multiple tags; a tag appears across many memories |
| event_person | A person can be associated with an event independently of any memory |
| location_person | A person can be associated with a location independently of any memory |

### 2.4 Domain model diagram

See the accompanying file: `domain-model.html`

Open in any browser for the full interactive diagram.

---

## 3. Phase 2 — Canonical Layer (Do not build in Phase 1)

### 3.1 The problem

As the app grows beyond two users, different users will create Location and Event records that refer to the same real-world place or occasion but with slightly different names:

- User A creates "Vondelpark", User B creates "Vondo Park", User C creates "The Vondelpark Amsterdam"
- User A creates "Summer Festival 2025", User B creates "Festival at the park, June 2025"

Without a canonical layer, there is no way to aggregate memories across users around the same place or event.

### 3.2 The solution

Add a canonicalization layer — a set of canonical reference records that user-created records can be mapped to by an admin.

#### canonical_location

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | Text | The definitive name |
| address | Text (nullable) | Canonical address |
| lat / lng | Float (nullable) | Canonical coordinates |
| valid_from | Date (nullable) | When this canonical place came into existence |
| valid_until | Date (nullable) | When it ceased to exist |

#### canonical_event

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | Text | The definitive name |
| date_start | Date (nullable) | |
| date_end | Date (nullable) | |
| canonical_location_id | UUID (FK, nullable) | → canonical_location |

#### Mapping fields (added to existing tables in Phase 2)

When Phase 2 is ready, add the following nullable columns to existing tables. This is purely additive — no existing data or queries are affected:

| Table | New field | Type | Notes |
|---|---|---|---|
| location | canonical_location_id | UUID (FK, nullable) | → canonical_location |
| event | canonical_event_id | UUID (FK, nullable) | → canonical_event |

### 3.3 How it works

- Users continue creating their own Location and Event records exactly as in Phase 1
- An admin reviews unmatched records and assigns canonical_location_id or canonical_event_id
- Queries can now aggregate across users: "show all memories at canonical Vondelpark" regardless of how individual users named it
- User-facing experience is unchanged — users still see their own location and event names

### 3.4 Why this is safe to defer

The Phase 1 schema needs no structural changes to support this later. The canonical tables are new, and the mapping fields are nullable additions to existing tables. Zero breaking changes.

---

## 4. Open questions for Phase 2

- Should sub-locations created within an event context be automatically archived when the event ends, or left as-is?
- Should canonical matching be purely manual (admin assigns) or AI-assisted (suggest matches based on name similarity and GPS proximity)?
- Should users be able to see or suggest canonical links, or is this strictly an admin function?

---

*Family Memoir — Domain Model Brief · April 2026 · Derived from Claude.ai design conversation. This document is a living reference; update it as decisions are made.*
