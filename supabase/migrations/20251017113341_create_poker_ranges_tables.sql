/*
  # Create Poker Range Trainer Schema

  1. New Tables
    - `folders`
      - `id` (uuid, primary key)
      - `name` (text, folder name)
      - `parent_id` (uuid, nullable, self-referencing for folder hierarchy)
      - `created_at` (timestamptz, creation timestamp)
    
    - `ranges`
      - `id` (uuid, primary key)
      - `name` (text, range name)
      - `folder_id` (uuid, nullable, references folders)
      - `cells` (jsonb, matrix cell data)
      - `actions` (jsonb, action button configurations)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on both tables
    - Public access for now (can be restricted later with auth)

  3. Indexes
    - Index on folder_id for efficient range lookups
    - Index on parent_id for folder tree queries
*/

CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ranges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  cells jsonb NOT NULL DEFAULT '[]'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ranges_folder_id ON ranges(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranges ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'folders' AND policyname = 'Allow public read access to folders'
  ) THEN
    CREATE POLICY "Allow public read access to folders"
      ON folders FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'folders' AND policyname = 'Allow public insert to folders'
  ) THEN
    CREATE POLICY "Allow public insert to folders"
      ON folders FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'folders' AND policyname = 'Allow public update to folders'
  ) THEN
    CREATE POLICY "Allow public update to folders"
      ON folders FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'folders' AND policyname = 'Allow public delete from folders'
  ) THEN
    CREATE POLICY "Allow public delete from folders"
      ON folders FOR DELETE
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ranges' AND policyname = 'Allow public read access to ranges'
  ) THEN
    CREATE POLICY "Allow public read access to ranges"
      ON ranges FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ranges' AND policyname = 'Allow public insert to ranges'
  ) THEN
    CREATE POLICY "Allow public insert to ranges"
      ON ranges FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ranges' AND policyname = 'Allow public update to ranges'
  ) THEN
    CREATE POLICY "Allow public update to ranges"
      ON ranges FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ranges' AND policyname = 'Allow public delete from ranges'
  ) THEN
    CREATE POLICY "Allow public delete from ranges"
      ON ranges FOR DELETE
      USING (true);
  END IF;
END $$;
