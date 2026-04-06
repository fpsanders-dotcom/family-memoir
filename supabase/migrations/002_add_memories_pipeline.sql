-- Family Memoir App — Additive Migration: WhatsApp Memories Pipeline
--
-- SAFE TO RUN on the existing Supabase project.
-- This migration ONLY adds new tables. It does NOT modify or drop
-- any existing tables (chapters, photos, reflections, members, families).
--
-- Run this in your Supabase SQL Editor.

-- =============================================================================
-- 1. MEMORIES TABLE (Section 4 of the v2 brief)
-- =============================================================================
-- The flat "capture now, organise later" table for WhatsApp-ingested memories.
-- Exists alongside the chapter-based tables; memories can be linked to chapters
-- later via the organisation[] field.

CREATE TABLE IF NOT EXISTS memories (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  memory_date   DATE,
  text          TEXT,
  people        TEXT[] DEFAULT '{}',
  places        TEXT[] DEFAULT '{}',
  tags          TEXT[] DEFAULT '{}',
  photos        TEXT[] DEFAULT '{}',
  source        TEXT CHECK (source IN ('whatsapp_dm', 'whatsapp_group', 'website')) NOT NULL DEFAULT 'whatsapp_dm',
  author        TEXT,
  organisation  TEXT[] DEFAULT '{}'
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_memories_memory_date ON memories (memory_date DESC);
CREATE INDEX IF NOT EXISTS idx_memories_author      ON memories (author);
CREATE INDEX IF NOT EXISTS idx_memories_source      ON memories (source);

-- GIN indexes for array column filtering
CREATE INDEX IF NOT EXISTS idx_memories_people ON memories USING GIN (people);
CREATE INDEX IF NOT EXISTS idx_memories_tags   ON memories USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_memories_places ON memories USING GIN (places);

-- =============================================================================
-- 2. PHONE-TO-USER MAPPING
-- =============================================================================
-- Maps WhatsApp sender phone numbers to app user identities.
-- Fill in after setting up Twilio.

CREATE TABLE IF NOT EXISTS phone_users (
  phone_number  TEXT PRIMARY KEY,          -- e.g. '+31612345678'
  user_id       UUID REFERENCES auth.users(id),
  display_name  TEXT NOT NULL              -- e.g. 'Freek', 'Partner'
);

-- =============================================================================
-- 3. KNOWN PEOPLE LIST (for hashtag classification)
-- =============================================================================
-- The webhook checks each #hashtag against this list to decide if it's
-- a person tag or a general tag.

CREATE TABLE IF NOT EXISTS known_people (
  name TEXT PRIMARY KEY
);

-- Seed with family members (won't duplicate if run multiple times)
INSERT INTO known_people (name) VALUES
  ('Daniel'),
  ('Emma'),
  ('Freek')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 4. ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read memories"
  ON memories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert memories"
  ON memories FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update memories"
  ON memories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE phone_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read known_people"
  ON known_people FOR SELECT TO authenticated USING (true);

-- =============================================================================
-- 5. NOTE ON STORAGE
-- =============================================================================
-- Your existing 'photos' bucket is already set up and contains chapter photos.
-- The webhook will upload WhatsApp photos into the SAME bucket, organized by
-- memory ID: photos/{memory-uuid}/photo_0.jpg
-- This keeps everything in one place. No new bucket needed.
