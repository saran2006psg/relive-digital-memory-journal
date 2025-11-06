-- 🔐 COMPLETE SECURITY SETUP FOR RELIVE
-- Run this entire file in Supabase SQL Editor to set up all security

-- ============================================================================
-- STEP 1: ADD USER_ID COLUMNS TO TABLES
-- ============================================================================

-- Add user_id to memories table (links memory to the user who created it)
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to tags table (links tag to the user who created it)
ALTER TABLE tags
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);

-- ============================================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_tags ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: MEMORIES TABLE POLICIES
-- ============================================================================

-- Users can view ONLY their own memories
CREATE POLICY "Users can view their own memories"
ON memories
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert ONLY their own memories
CREATE POLICY "Users can insert their own memories"
ON memories
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update ONLY their own memories
CREATE POLICY "Users can update their own memories"
ON memories
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete ONLY their own memories
CREATE POLICY "Users can delete their own memories"
ON memories
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: MEDIA TABLE POLICIES
-- ============================================================================

-- Users can view ONLY media from their own memories
CREATE POLICY "Users can view their own media"
ON media
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = media.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- Users can insert ONLY media to their own memories
CREATE POLICY "Users can insert their own media"
ON media
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = media.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- Users can update ONLY their own media
CREATE POLICY "Users can update their own media"
ON media
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = media.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- Users can delete ONLY their own media
CREATE POLICY "Users can delete their own media"
ON media
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = media.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- ============================================================================
-- STEP 5: TAGS TABLE POLICIES
-- ============================================================================

-- Users can view ONLY their own tags
CREATE POLICY "Users can view their own tags"
ON tags
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert ONLY their own tags
CREATE POLICY "Users can insert their own tags"
ON tags
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update ONLY their own tags
CREATE POLICY "Users can update their own tags"
ON tags
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete ONLY their own tags
CREATE POLICY "Users can delete their own tags"
ON tags
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 6: MEMORY_TAGS TABLE POLICIES (Junction table)
-- ============================================================================

-- Users can view ONLY their own memory-tag associations
CREATE POLICY "Users can view their own memory tags"
ON memory_tags
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = memory_tags.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- Users can insert ONLY to their own memories
CREATE POLICY "Users can insert their own memory tags"
ON memory_tags
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = memory_tags.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- Users can delete ONLY from their own memories
CREATE POLICY "Users can delete their own memory tags"
ON memory_tags
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = memory_tags.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- ============================================================================
-- VERIFICATION: Check all policies are created
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('memories', 'media', 'tags', 'memory_tags')
ORDER BY tablename, policyname;
