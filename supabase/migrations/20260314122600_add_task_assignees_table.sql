CREATE TABLE IF NOT EXISTS dmz_agents_task_assignees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES dmz_agents_tasks(id) ON DELETE CASCADE,
    agent_id VARCHAR NOT NULL REFERENCES dmz_agents_definitions(id) ON DELETE CASCADE,
    role VARCHAR DEFAULT 'executor', 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, agent_id)
);

INSERT INTO dmz_agents_task_assignees (task_id, agent_id, role)
SELECT id, agent_id, 'executor'
FROM dmz_agents_tasks
WHERE agent_id IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE dmz_agents_task_assignees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON dmz_agents_task_assignees
FOR ALL TO authenticated USING (true);
