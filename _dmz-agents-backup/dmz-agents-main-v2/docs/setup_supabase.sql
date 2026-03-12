-- DMZ Agents Squad - Database Schema
-- Version: 1.0
-- Prefix: dmz_agents_

-- 1. AGENTS DEFINITIONS
CREATE TABLE IF NOT EXISTS dmz_agents_definitions (
    id VARCHAR(64) PRIMARY KEY, -- slug e.g. orchestrator
    handle VARCHAR(64) UNIQUE NOT NULL, -- @handle
    name VARCHAR(128) NOT NULL,
    full_name VARCHAR(256),
    category VARCHAR(64) NOT NULL, -- Orchestration, Product, Development, etc
    color VARCHAR(12) NOT NULL DEFAULT '#E85D2F',
    icon VARCHAR(64) DEFAULT 'Bot',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AGENTS PROMPTS (Versioned)
CREATE TABLE IF NOT EXISTS dmz_agents_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(64) REFERENCES dmz_agents_definitions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version INT DEFAULT 1,
    active BOOLEAN DEFAULT false, -- Only one active per agent_id
    change_notes TEXT,
    created_by UUID, -- Link to auth.users if needed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AGENTS SKILLS
CREATE TABLE IF NOT EXISTS dmz_agents_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(64) REFERENCES dmz_agents_definitions(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    category VARCHAR(64), -- skill or ui-stack
    level VARCHAR(16) DEFAULT 'expert', -- junior, mid, senior, expert
    active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TOOLS REGISTRY
CREATE TABLE IF NOT EXISTS dmz_agents_tools (
    id VARCHAR(64) PRIMARY KEY, -- slug e.g. supabase-mcp
    name VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL, -- MCP, Token, API, Webhook
    icon VARCHAR(64),
    status VARCHAR(32) DEFAULT 'not_configured', -- connected, disconnected, not_configured
    config JSONB DEFAULT '{}',
    secret_ref VARCHAR(256), -- Vault reference
    description TEXT,
    docs_url VARCHAR(512),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TOOL ASSIGNMENTS (Many-to-Many)
CREATE TABLE IF NOT EXISTS dmz_agents_tool_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(64) REFERENCES dmz_agents_definitions(id) ON DELETE CASCADE,
    tool_id VARCHAR(64) REFERENCES dmz_agents_tools(id) ON DELETE CASCADE,
    scope TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, tool_id)
);

-- 6. PROJECTS
CREATE TABLE IF NOT EXISTS dmz_agents_projects (
    id VARCHAR(64) PRIMARY KEY, -- slug e.g. wis-engine
    name VARCHAR(256) NOT NULL,
    client VARCHAR(256),
    description TEXT,
    status VARCHAR(32) DEFAULT 'setup', -- setup, active, paused, completed, archived
    phase VARCHAR(128),
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    owner_id UUID,
    repo_url VARCHAR(512),
    start_date DATE,
    target_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROJECT SQUAD (Many-to-Many)
CREATE TABLE IF NOT EXISTS dmz_agents_squad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(64) REFERENCES dmz_agents_projects(id) ON DELETE CASCADE,
    agent_id VARCHAR(64) REFERENCES dmz_agents_definitions(id) ON DELETE CASCADE,
    role_override VARCHAR(128),
    status VARCHAR(32) DEFAULT 'active', -- active, standby, removed
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, agent_id)
);

-- 8. AGENT MEMORY (The Brain)
CREATE TABLE IF NOT EXISTS dmz_agents_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    agent_id VARCHAR(64) REFERENCES dmz_agents_definitions(id),
    project_id VARCHAR(64) REFERENCES dmz_agents_projects(id),
    memory_type VARCHAR(32) NOT NULL, -- context, artifact, report, task, decision
    key VARCHAR(256) NOT NULL,
    content JSONB NOT NULL,
    document_ref VARCHAR(64), -- e.g. 01-mission-plan
    relevance_score FLOAT DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_memory_agent_project ON dmz_agents_memory(agent_id, project_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_memory_project_doc ON dmz_agents_memory(project_id, document_ref);

-- PARTIAL UNIQUE INDEX for active prompt
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_prompt_per_agent ON dmz_agents_prompts (agent_id) WHERE active = true;

-- SEED DATA: INITIAL AGENTS
INSERT INTO dmz_agents_definitions (id, handle, name, full_name, category, color, icon, active)
VALUES 
    ('orchestrator', 'orch', 'ORCH', 'Orchestrator Master', 'Orchestration', '#E85D2F', 'Music2', true),
    ('squad_manager', 'syd', 'Syd', 'Squad Manager', 'Orchestration', '#7C3AED', 'Users', true),
    ('developer', 'ryan', 'Ryan', 'Developer', 'Development', '#0891B2', 'Code2', true)
ON CONFLICT (id) DO NOTHING;

-- SEED DATA: TOOLS
INSERT INTO dmz_agents_tools (id, name, type, icon, status, description)
VALUES 
    ('supabase-mcp', 'Supabase MCP', 'MCP', 'Database', 'connected', 'Direct access to database management'),
    ('github-mcp', 'GitHub MCP', 'MCP', 'GitBranch', 'connected', 'Git operations and PR management')
ON CONFLICT (id) DO NOTHING;
