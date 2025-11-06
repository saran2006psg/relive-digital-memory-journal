-- 🔐 STORAGE BUCKET POLICIES FOR RELIVE
-- This ensures users can ONLY access their own uploaded media files

-- ============================================================================
-- STORAGE BUCKET: memory-media
-- File structure: {user_id}/{memory_id}/{filename}
-- ============================================================================

-- Policy 1: Users can upload files ONLY to their own folder
CREATE POLICY "Users can upload their own media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'memory-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can view/download files ONLY from their own folder
CREATE POLICY "Users can view their own media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'memory-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update files ONLY in their own folder
CREATE POLICY "Users can update their own media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'memory-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'memory-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete files ONLY from their own folder
CREATE POLICY "Users can delete their own media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'memory-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- VERIFY STORAGE POLICIES
-- ============================================================================

SELECT 
  id,
  name,
  bucket_id,
  definition
FROM storage.policies
WHERE bucket_id = 'memory-media'
ORDER BY name;
