-- Migration: Add media_type column to support audio files
-- This allows us to distinguish between images, videos, and audio

-- Add media_type column
ALTER TABLE media 
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'audio'));

-- Update existing records to have proper media_type based on format
UPDATE media 
SET media_type = CASE 
  WHEN format IN ('mp4', 'mov', 'avi', 'webm') THEN 'video'
  WHEN format IN ('mp3', 'wav', 'ogg', 'webm', 'mpeg') THEN 'audio'
  ELSE 'image'
END
WHERE media_type IS NULL OR media_type = 'image';

-- Create index for faster filtering by media type
CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type);

COMMENT ON COLUMN media.media_type IS 'Type of media: image, video, or audio';
