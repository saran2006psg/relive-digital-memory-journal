-- 🔧 ADD USER_ID COLUMN TO TABLES
-- This links each memory/tag to the user who created it

-- ============================================================================
-- ADD USER_ID COLUMNS
-- ============================================================================

-- Add user_id to memories table
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to tags table  
ALTER TABLE tags
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index on memories.user_id for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);

-- Index on tags.user_id for fast user-specific queries  
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);

-- ============================================================================
-- UPDATE EXISTING DATA (if any exists)
-- ============================================================================

-- If you have test data without user_id, you can delete it or assign to a user
-- DELETE FROM memories WHERE user_id IS NULL;
-- DELETE FROM tags WHERE user_id IS NULL;

-- ============================================================================
-- VERIFY COLUMNS ADDED
-- ============================================================================

-- Check memories table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'memories' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check tags table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tags' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
