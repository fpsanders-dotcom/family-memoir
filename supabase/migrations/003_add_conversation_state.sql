-- Family Memoir App — Migration 003: Conversation State Tracking
--
-- Tracks follow-up questions sent to users after a memory is saved.
-- This lets the webhook know if an incoming message is a reply
-- to a question (update existing memory) or a new memory (create new).
--
-- SAFE TO RUN on the existing Supabase project. Additive only.

CREATE TABLE IF NOT EXISTS pending_questions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  phone_number  TEXT NOT NULL,              -- which user we're asking
  memory_id     UUID REFERENCES memories(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL,              -- 'location' or 'people'
  expires_at    TIMESTAMPTZ NOT NULL        -- auto-expire after 1 hour
);

-- Index for quick lookup by phone number
CREATE INDEX IF NOT EXISTS idx_pending_questions_phone ON pending_questions (phone_number);

-- RLS
ALTER TABLE pending_questions ENABLE ROW LEVEL SECURITY;

-- Only service role (backend) accesses this table, so no user-facing policies needed.
