ALTER TABLE dmz_agents_chat ADD COLUMN IF NOT EXISTS feedback TEXT DEFAULT NULL;
-- Possible values: 'like', NULL
