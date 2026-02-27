-- INSERT ALL AGENTS FROM DOCUMENTATION
INSERT INTO dmz_agents_definitions (id, handle, name, full_name, category, color, icon, active)
VALUES
  ('pm', 'jose', 'Jose', 'Project Manager', 'Product', '#2563EB', 'ClipboardList', true),
  ('po', 'lucas', 'Lucas', 'Product Owner', 'Product', '#2563EB', 'Target', true),
  ('qa', 'emma', 'Emma', 'QA Engineer', 'Product', '#059669', 'CheckSquare', true),
  ('sm', 'david', 'David', 'Scrum Master', 'Product', '#2563EB', 'Zap', false),
  ('devops', 'oliver', 'Oliver', 'DevOps Engineer', 'Development', '#0891B2', 'Rocket', true),
  ('architect', 'alex', 'Alex', 'Tech Architect', 'Development', '#0891B2', 'Building2', false),
  ('cyber_chief', 'constantine', 'Constantine', 'Cyber Chief', 'Security', '#DC2626', 'ShieldAlert', true),
  ('legal_chief', 'theron', 'Theron', 'Legal Chief', 'Security', '#DC2626', 'Scale', false),
  ('analyst', 'kanya', 'Kanya', 'Strategy Analyst', 'Strategy', '#D97706', 'Search', true),
  ('design_chief', 'aurora', 'Aurora', 'Design Chief', 'Design', '#DB2777', 'Sparkles', true),
  ('ux', 'victoria', 'Victoria', 'UX Designer', 'Design', '#DB2777', 'Paintbrush', true),
  ('copy_chief', 'cassandra', 'Cassandra', 'Copy Chief', 'Copy', '#7C3AED', 'PenLine', false),
  ('sop_extractor', 'martin', 'Martin', 'SOP Extractor', 'Frameworks', '#475569', 'BookOpen', true),
  ('db_sage', 'sofia', 'Sofia', 'DB Sage', 'Data', '#0369A1', 'Brain', false),
  ('tools_orchestrator', 'quantum', 'Quantum', 'Tools Orchestrator', 'Frameworks', '#475569', 'FlaskConical', false)
ON CONFLICT (id) DO UPDATE SET
  handle = EXCLUDED.handle,
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  category = EXCLUDED.category,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  active = EXCLUDED.active;

-- INSERT SKILLS FOR KEY AGENTS
INSERT INTO dmz_agents_skills (agent_id, name, category, level)
VALUES
  ('orchestrator', 'Task Decomposition', 'skill', 'expert'),
  ('orchestrator', 'Agent Selection', 'skill', 'expert'),
  ('developer', 'Full-stack Dev', 'skill', 'expert'),
  ('developer', 'React Patterns', 'skill', 'expert'),
  ('developer', 'shadcn/ui', 'ui-stack', 'expert'),
  ('design_chief', 'Design Systems', 'skill', 'expert'),
  ('design_chief', 'Figma Tokens', 'skill', 'senior'),
  ('ux', 'User Research', 'skill', 'expert'),
  ('ux', 'Wireframing', 'skill', 'expert')
ON CONFLICT DO NOTHING;
