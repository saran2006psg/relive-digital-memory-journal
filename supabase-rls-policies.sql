-- 🔐 ROW LEVEL SECURITY (RLS) POLICIES FOR RELIVE
-- This ensures each user can ONLY access their own data

-- ============================================================================
-- STEP 1: ADD USER_ID COLUMNS (if not exists)
-- ============================================================================

-- Add user_id to memories table
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to tags table  
ALTER TABLE tags
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);

-- ============================================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

-- Enable RLS on memories table
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on media table
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tags table
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Enable RLS on memory_tags table
ALTER TABLE memory_tags ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MEMORIES TABLE POLICIES
-- ============================================================================

-- Policy: Users can view ONLY their own memories
CREATE POLICY "Users can view their own memories"
ON memories
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert ONLY their own memories
CREATE POLICY "Users can insert their own memories"
ON memories
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update ONLY their own memories
CREATE POLICY "Users can update their own memories"
ON memories
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete ONLY their own memories
CREATE POLICY "Users can delete their own memories"
ON memories
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- MEDIA TABLE POLICIES
-- ============================================================================

-- Policy: Users can view ONLY media from their own memories
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

-- Policy: Users can insert ONLY media to their own memories
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

-- Policy: Users can update ONLY their own media
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

-- Policy: Users can delete ONLY their own media
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
-- TAGS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view ONLY their own tags
CREATE POLICY "Users can view their own tags"
ON tags
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert ONLY their own tags
CREATE POLICY "Users can insert their own tags"
ON tags
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update ONLY their own tags
CREATE POLICY "Users can update their own tags"
ON tags
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete ONLY their own tags
CREATE POLICY "Users can delete their own tags"
ON tags
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- MEMORY_TAGS TABLE POLICIES (Junction table)
-- ============================================================================

-- Policy: Users can view ONLY their own memory-tag associations
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

-- Policy: Users can insert ONLY to their own memories
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

-- Policy: Users can delete ONLY from their own memories
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
-- VERIFY POLICIES
-- ============================================================================

-- Check all policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('memories', 'media', 'tags', 'memory_tags')
ORDER BY tablename, policyname;
