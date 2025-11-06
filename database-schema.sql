-- ReLive Database Schema for Supabase PostgreSQL
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media table (photos/videos)
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('image', 'video')) NOT NULL,
  thumbnail_url TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL
);

-- Memory tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS memory_tags (
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_date ON memories(date DESC);
CREATE INDEX IF NOT EXISTS idx_media_memory_id ON media(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_tags_memory_id ON memory_tags(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_tags_tag_id ON memory_tags(tag_id);

-- Enable Row Level Security (RLS)
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for memories table
CREATE POLICY "Users can view own memories" 
  ON memories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" 
  ON memories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" 
  ON memories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" 
  ON memories FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for media table
CREATE POLICY "Users can view media of own memories" 
  ON media FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = media.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert media to own memories" 
  ON media FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = media.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete media of own memories" 
  ON media FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = media.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

-- RLS Policies for tags (public read, authenticated write)
CREATE POLICY "Anyone can view tags" 
  ON tags FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create tags" 
  ON tags FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for memory_tags
CREATE POLICY "Users can view tags of own memories" 
  ON memory_tags FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = memory_tags.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add tags to own memories" 
  ON memory_tags FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = memory_tags.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tags from own memories" 
  ON memory_tags FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = memory_tags.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_memories_updated_at 
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample moods for reference
-- These can be used in your frontend
COMMENT ON COLUMN memories.mood IS 'Suggested values: Happy 😊, Sad 😢, Excited 🎉, Calm 😌, Grateful 🙏, Love ❤️, Nostalgic 🌅, Thoughtful 🤔';
