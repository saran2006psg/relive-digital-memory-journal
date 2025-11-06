-- Better Auth Tables Schema
-- Run this AFTER running the main database-schema.sql

-- Better Auth User table
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Better Auth Session table
CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

-- Better Auth Account table (for OAuth providers)
CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY NOT NULL,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at TIMESTAMP,
  refresh_token_expires_at TIMESTAMP,
  scope TEXT,
  password TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Better Auth Verification table (for email verification)
CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY NOT NULL,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for Better Auth tables
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"(user_id);
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account"(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier);

-- Update the memories table to reference Better Auth user table
-- First, drop the existing foreign key constraint
ALTER TABLE memories DROP CONSTRAINT IF EXISTS memories_user_id_fkey;

-- Change user_id type to TEXT to match Better Auth
ALTER TABLE memories ALTER COLUMN user_id TYPE TEXT;

-- Add new foreign key constraint to Better Auth user table
ALTER TABLE memories 
  ADD CONSTRAINT memories_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES "user"(id) 
  ON DELETE CASCADE;

-- Update RLS policies for memories table
DROP POLICY IF EXISTS memories_select_policy ON memories;
DROP POLICY IF EXISTS memories_insert_policy ON memories;
DROP POLICY IF EXISTS memories_update_policy ON memories;
DROP POLICY IF EXISTS memories_delete_policy ON memories;

-- Note: RLS with Better Auth requires custom implementation
-- For now, we'll handle authorization in the API layer
ALTER TABLE memories DISABLE ROW LEVEL SECURITY;
ALTER TABLE media DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE memory_tags DISABLE ROW LEVEL SECURITY;

-- Add trigger to update updated_at on user table
CREATE OR REPLACE FUNCTION update_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_timestamp
  BEFORE UPDATE ON "user"
  FOR EACH ROW
  EXECUTE FUNCTION update_user_updated_at();
