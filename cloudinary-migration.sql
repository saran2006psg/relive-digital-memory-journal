-- Migration: Add Cloudinary support to media table
-- This adds columns to track Cloudinary-specific data

-- Add Cloudinary columns to existing media table
ALTER TABLE media 
ADD COLUMN IF NOT EXISTS cloudinary_id TEXT,
ADD COLUMN IF NOT EXISTS cloudinary_url TEXT,
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS format TEXT,
ADD COLUMN IF NOT EXISTS size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP DEFAULT NOW();

-- Create index on cloudinary_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_media_cloudinary_id ON media(cloudinary_id);

-- Update existing url column to be cloudinary_url (if needed)
-- The 'url' column will now store the Cloudinary secure_url

COMMENT ON COLUMN media.cloudinary_id IS 'Cloudinary public_id for transformations';
COMMENT ON COLUMN media.cloudinary_url IS 'Full Cloudinary URL with transformations';
COMMENT ON COLUMN media.width IS 'Original image width in pixels';
COMMENT ON COLUMN media.height IS 'Original image height in pixels';
COMMENT ON COLUMN media.format IS 'Image format (jpg, png, webp, etc)';
COMMENT ON COLUMN media.size_bytes IS 'File size in bytes';

-- Create a function to get optimized image URLs
CREATE OR REPLACE FUNCTION get_optimized_url(
  cloudinary_id_param TEXT,
  width_param INTEGER DEFAULT NULL,
  height_param INTEGER DEFAULT NULL,
  quality_param TEXT DEFAULT 'auto'
)
RETURNS TEXT AS $$
DECLARE
  base_url TEXT := 'https://res.cloudinary.com/' || current_setting('app.cloudinary_cloud_name', true) || '/image/upload/';
  transformations TEXT := '';
BEGIN
  IF width_param IS NOT NULL THEN
    transformations := transformations || 'w_' || width_param || ',';
  END IF;
  
  IF height_param IS NOT NULL THEN
    transformations := transformations || 'h_' || height_param || ',';
  END IF;
  
  transformations := transformations || 'q_' || quality_param || ',f_auto/';
  
  RETURN base_url || transformations || cloudinary_id_param;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON TABLE media IS 'Stores media files (images/videos) associated with memories, now using Cloudinary';
