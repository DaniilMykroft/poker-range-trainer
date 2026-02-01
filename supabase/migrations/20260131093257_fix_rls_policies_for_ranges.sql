/*
  # Fix RLS Policies for Anonymous Access

  1. Update RLS policies
    - Allow anonymous users to read all ranges
    - Allow anonymous users to insert ranges
    - Allow anonymous users to update ranges
    - Allow anonymous users to delete ranges
    - Same for folders table

  2. This is for development/demo purposes with public access
*/

DROP POLICY IF EXISTS "Allow public read access to ranges" ON ranges;
DROP POLICY IF EXISTS "Allow public insert to ranges" ON ranges;
DROP POLICY IF EXISTS "Allow public update to ranges" ON ranges;
DROP POLICY IF EXISTS "Allow public delete from ranges" ON ranges;

DROP POLICY IF EXISTS "Allow public read access to folders" ON folders;
DROP POLICY IF EXISTS "Allow public insert to folders" ON folders;
DROP POLICY IF EXISTS "Allow public update to folders" ON folders;
DROP POLICY IF EXISTS "Allow public delete from folders" ON folders;

CREATE POLICY "Enable read for all users"
  ON ranges
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON ranges
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON ranges
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
  ON ranges
  FOR DELETE
  USING (true);

CREATE POLICY "Enable read for all users"
  ON folders
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON folders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON folders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
  ON folders
  FOR DELETE
  USING (true);
