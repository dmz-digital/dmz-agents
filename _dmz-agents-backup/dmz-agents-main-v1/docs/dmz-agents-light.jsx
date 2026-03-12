import { useState } from "react";
import {
  Music2, Users, ClipboardList, Target, CheckSquare, Zap,
  Code2, Rocket, Building2, ShieldAlert, Scale, Search,
  Sparkles, Paintbrush, PenLine, BookOpen, Brain, FlaskConical,
  FolderOpen, Database, Wrench, Plus, X, ExternalLink,
  Activity, Settings, BarChart2, Plug, Unplug,
  GitBranch, FileText, ListChecks, BookMarked, BarChart,
  Cloud, Pin, CreditCard, Server, Layers2,
  Bot, Layers, Cpu, Bolt, Layout, Palette, Component,
  Monitor, Smartphone, Globe, Package, Blocks,
} from "lucide-react";

const AGENT_ICONS = {
  orchestrator: Music2, squad_manager: Users, pm: ClipboardList,
  po: Target, qa: CheckSquare, sm: Zap, developer: Code2,
  devops: Rocket, architect: Building2, cyber_chief: ShieldAlert,
  legal_chief: Scale, analyst: Search, design_chief: Sparkles,
  ux: Paintbrush, copy_chief: PenLine, sop_extractor: BookOpen,
  db_sage: Brain, tools_orchestrator: FlaskConical,
};
const TOOL_ICONS = {
  "supabase-mcp": Database, "railway-token": Rocket, "github-mcp": GitBranch,
  "notion-mcp": FileText, "trello-mcp": Pin, "figma-mcp": Paintbrush,
  "stripe-mcp": CreditCard, "aws-mcp": Cloud,
};
const DOC_ICONS = { "01": Target, "02": ListChecks, "03": BookMarked, "04": BarChart };
const NAV_ICONS = { agents: Bot, projects: FolderOpen, memory: Brain, tools: Wrench };

// ─── SKILLS REGISTRY ──────────────────────────────────────────────────────────
// type: "skill" = agent knowledge/capability
//       "ui-stack" = frontend framework/library used in project output
//       "standard" = project standard applied by default on every new project
const SKILLS_REGISTRY = {
  // ── Shared UI Stack (applied to ALL new projects by default) ──────────────
  "shadcn-ui":     { name: "shadcn/ui",      type: "ui-stack",  standard: true,  level: "expert", icon: Blocks,    color: "#111827", desc: "Accessible, composable React components built on Radix UI. Project default.", url: "https://ui.shadcn.com" },
  "tailwind":      { name: "Tailwind CSS",   type: "ui-stack",  standard: true,  level: "expert", icon: Palette,   color: "#06B6D4", desc: "Utility-first CSS framework. Used alongside shadcn/ui.", url: "https://tailwindcss.com" },
  "radix-ui":      { name: "Radix UI",       type: "ui-stack",  standard: true,  level: "expert", icon: Component, color: "#6B7280", desc: "Headless UI primitives — the foundation shadcn/ui builds on.", url: "https://www.radix-ui.com" },
  "lucide-react":  { name: "Lucide React",   type: "ui-stack",  standard: true,  level: "expert", icon: Sparkles,  color: "#F59E0B", desc: "Icon library — standard icon system across all DMZ projects.", url: "https://lucide.dev" },
  "next-js":       { name: "Next.js",        type: "ui-stack",  standard: true,  level: "expert", icon: Globe,     color: "#111827", desc: "React framework for production. Default app framework.", url: "https://nextjs.org" },
  "typescript":    { name: "TypeScript",     type: "ui-stack",  standard: true,  level: "expert", icon: Code2,     color: "#3178C6", desc: "Typed superset of JavaScript. Required in all frontend projects.", url: "https://www.typescriptlang.org" },

  // ── Aurora (Design Chief) skills ──────────────────────────────────────────
  "brand-strategy":    { name: "Brand Strategy",    type: "skill", level: "expert", icon: Sparkles,  color: "#DB2777", desc: "Visual identity, tone and brand positioning." },
  "design-systems":    { name: "Design Systems",    type: "skill", level: "expert", icon: Layers2,   color: "#DB2777", desc: "Builds and governs component libraries and design tokens." },
  "visual-direction":  { name: "Visual Direction",  type: "skill", level: "expert", icon: Monitor,   color: "#DB2777", desc: "Art direction, typography hierarchy, color theory." },
  "figma-tokens":      { name: "Figma Tokens",      type: "skill", level: "senior", icon: Palette,   color: "#DB2777", desc: "Token-based design → code handoff workflow." },
  "responsive-design": { name: "Responsive Design", type: "skill", level: "expert", icon: Smartphone,color: "#DB2777", desc: "Mobile-first layouts across all breakpoints." },

  // ── Victoria (UX Designer) skills ─────────────────────────────────────────
  "user-research":   { name: "User Research",   type: "skill", level: "expert", icon: Search,   color: "#DB2777", desc: "Interviews, surveys, usability testing." },
  "wireframing":     { name: "Wireframing",     type: "skill", level: "expert", icon: Layout,   color: "#DB2777", desc: "Low-fi to hi-fi wireframes and clickable prototypes." },
  "prototyping":     { name: "Prototyping",     type: "skill", level: "expert", icon: Monitor,  color: "#DB2777", desc: "Interactive Figma prototypes for user testing." },
  "accessibility":   { name: "Accessibility",  type: "skill", level: "expert", icon: CheckSquare, color: "#DB2777", desc: "WCAG 2.1 compliance — aria labels, contrast, keyboard nav." },
  "ux-writing":      { name: "UX Writing",     type: "skill", level: "senior", icon: PenLine,  color: "#DB2777", desc: "Microcopy, error messages, empty states, tooltips." },

  // ── Ryan (Developer) skills ───────────────────────────────────────────────
  "fullstack-dev":   { name: "Full-stack Dev",  type: "skill", level: "expert", icon: Code2,    color: "#0891B2", desc: "React, Node.js, REST and tRPC APIs." },
  "code-review":     { name: "Code Review",     type: "skill", level: "expert", icon: GitBranch,color: "#0891B2", desc: "PR reviews, linting, code quality standards." },
  "architecture":    { name: "Architecture",    type: "skill", level: "senior", icon: Building2,color: "#0891B2", desc: "System design, API contracts, data modeling." },
  "shadcn-impl":     { name: "shadcn/ui Impl.", type: "skill", level: "expert", icon: Blocks,   color: "#0891B2", desc: "Implements shadcn/ui components, customizes themes via CSS vars." },
  "react-patterns":  { name: "React Patterns",  type: "skill", level: "expert", icon: Component,color: "#0891B2", desc: "Compound components, context, hooks, suspense." },

  // ── Alex (Architect) skills ───────────────────────────────────────────────
  "system-design":   { name: "System Design",  type: "skill", level: "expert", icon: Building2,color: "#0891B2", desc: "Scalability, microservices, event-driven architecture." },
  "tech-stack":      { name: "Tech Stack",     type: "skill", level: "expert", icon: Layers,   color: "#0891B2", desc: "Selects and governs technology choices per project." },
  "scalability":     { name: "Scalability",    type: "skill", level: "expert", icon: Rocket,   color: "#0891B2", desc: "Performance, load testing, horizontal scaling." },
};

// ─── AGENTS ───────────────────────────────────────────────────────────────────
const AGENTS = [
  { id: "orchestrator",  handle: "orch",  name: "ORCH", fullName: "Orchestrator Master", category: "Orchestration", color: "#E85D2F", active: true,
    skills: ["Task Decomposition","Agent Selection","Cross-validation","Report Consolidation"],
    skillIds: [],
    tools: ["Supabase MCP","Notion MCP"] },

  { id: "squad_manager", handle: "syd",   name: "Syd",  fullName: "Squad Manager",       category: "Orchestration", color: "#7C3AED", active: true,
    skills: ["Team Design","Gap Analysis","Scalability","Optimization"],
    skillIds: [],
    tools: ["Trello MCP","Slack MCP"] },

  { id: "pm",    handle: "jose",    name: "Jose",    fullName: "Project Manager",  category: "Product",     color: "#2563EB", active: true,
    skills: ["Roadmap Planning","Sprint Management","Risk Assessment"],
    skillIds: [],
    tools: ["Jira MCP","Notion MCP"] },

  { id: "po",    handle: "lucas",   name: "Lucas",   fullName: "Product Owner",    category: "Product",     color: "#2563EB", active: true,
    skills: ["Backlog Grooming","User Stories","Acceptance Criteria"],
    skillIds: [],
    tools: ["Jira MCP","Figma MCP"] },

  { id: "qa",    handle: "emma",    name: "Emma",    fullName: "QA Engineer",      category: "Product",     color: "#059669", active: true,
    skills: ["Test Planning","Stress Testing","Bug Reporting"],
    skillIds: [],
    tools: ["GitHub MCP"] },

  { id: "sm",    handle: "david",   name: "David",   fullName: "Scrum Master",     category: "Product",     color: "#2563EB", active: false,
    skills: ["Sprint Facilitation","Impediment Removal"],
    skillIds: [],
    tools: ["Trello MCP"] },

  { id: "developer", handle: "ryan",  name: "Ryan",   fullName: "Developer",       category: "Development", color: "#0891B2", active: true,
    skills: ["Full-stack Dev","Code Review","Architecture","shadcn/ui Impl.","React Patterns"],
    skillIds: ["fullstack-dev","code-review","architecture","shadcn-impl","react-patterns","shadcn-ui","tailwind","typescript","next-js","lucide-react"],
    tools: ["GitHub MCP","Railway Token"] },

  { id: "devops",  handle: "oliver", name: "Oliver", fullName: "DevOps Engineer",  category: "Development", color: "#0891B2", active: true,
    skills: ["CI/CD","Infrastructure","Monitoring"],
    skillIds: [],
    tools: ["Railway Token","AWS MCP"] },

  { id: "architect", handle: "alex", name: "Alex",   fullName: "Tech Architect",   category: "Development", color: "#0891B2", active: false,
    skills: ["System Design","Tech Stack","Scalability"],
    skillIds: ["system-design","tech-stack","scalability","shadcn-ui","tailwind","next-js","typescript"],
    tools: ["GitHub MCP"] },

  { id: "cyber_chief",  handle: "constantine", name: "Constantine", fullName: "Cyber Chief",  category: "Security", color: "#DC2626", active: true,
    skills: ["Security Audit","IAM Policies","Pen Testing"],
    skillIds: [],
    tools: ["AWS MCP"] },

  { id: "legal_chief",  handle: "theron",  name: "Theron",  fullName: "Legal Chief",  category: "Security",  color: "#DC2626", active: false,
    skills: ["Terms of Service","Privacy Policy","LGPD Compliance"],
    skillIds: [],
    tools: [] },

  { id: "analyst",  handle: "kanya",    name: "Kanya",    fullName: "Strategy Analyst", category: "Strategy", color: "#D97706", active: true,
    skills: ["Market Research","Data Analysis","Reporting"],
    skillIds: [],
    tools: ["Supabase MCP"] },

  { id: "design_chief", handle: "aurora",  name: "Aurora",  fullName: "Design Chief",  category: "Design",   color: "#DB2777", active: true,
    skills: ["Brand Strategy","Design Systems","Visual Direction","Figma Tokens","Responsive Design"],
    skillIds: ["brand-strategy","design-systems","visual-direction","figma-tokens","responsive-design","shadcn-ui","tailwind","radix-ui","lucide-react","figma-tokens"],
    tools: ["Figma MCP"] },

  { id: "ux",  handle: "victoria", name: "Victoria", fullName: "UX Designer",    category: "Design",   color: "#DB2777", active: true,
    skills: ["User Research","Wireframing","Prototyping","Accessibility","UX Writing"],
    skillIds: ["user-research","wireframing","prototyping","accessibility","ux-writing","shadcn-ui","radix-ui","tailwind"],
    tools: ["Figma MCP"] },

  { id: "copy_chief",   handle: "cassandra", name: "Cassandra", fullName: "Copy Chief",   category: "Copy",      color: "#7C3AED", active: false,
    skills: ["Content Strategy","Copywriting","Brand Voice"],
    skillIds: [],
    tools: ["Notion MCP"] },

  { id: "sop_extractor", handle: "martin", name: "Martin", fullName: "SOP Extractor",   category: "Frameworks", color: "#475569", active: true,
    skills: ["Documentation","Process Mapping","SOPs"],
    skillIds: [],
    tools: ["Notion MCP"] },

  { id: "db_sage", handle: "sofia",   name: "Sofia",   fullName: "DB Sage",           category: "Data",       color: "#0369A1", active: false,
    skills: ["Database Design","Query Optimization","Migrations"],
    skillIds: [],
    tools: ["Supabase MCP"] },

  { id: "tools_orchestrator", handle: "quantum", name: "Quantum", fullName: "Tools Orchestrator", category: "Frameworks", color: "#475569", active: false,
    skills: ["Tool Integration","API Management","Automation"],
    skillIds: [],
    tools: [] },
];

const PROJECTS = [
  { id: "wis-engine", name: "Wis Engine",            status: "active", phase: "Phase 3 — Hardening",   progress: 68, squad: ["orchestrator","squad_manager","pm","developer","devops","qa","cyber_chief","analyst","sop_extractor"], startDate: "Jan 15, 2026" },
  { id: "wis-app",    name: "Wis App Reengineering", status: "active", phase: "Phase 2 — Integration", progress: 45, squad: ["orchestrator","squad_manager","pm","po","developer","devops","qa","design_chief","ux"],               startDate: "Feb 01, 2026" },
  { id: "wis-legal",  name: "Wis Legal",             status: "paused", phase: "Phase 1 — Setup",       progress: 20, squad: ["orchestrator","legal_chief","analyst"],                                                                startDate: "Feb 20, 2026" },
];

const MEMORY = [
  { id: "1", agentId: "orchestrator",  type: "context",  key: "squad_status",   content: "Squad updated: Emma (QA), Constantine (Cyber), Martin (SOP) added. Mission aligned with Gemini/Railway infra.", project: "wis-engine", timestamp: "2026-02-25T14:04:50Z" },
  { id: "2", agentId: "pm",            type: "artifact", key: "mission_plan",   content: "Mission Plan v3 updated — Phase 3 Hardening focus. Railway provisioning in progress by Oliver.",                project: "wis-app",    timestamp: "2026-02-27T05:15:40Z" },
  { id: "3", agentId: "design_chief",  type: "decision", key: "ui_standard",    content: "shadcn/ui + Tailwind CSS + Lucide React defined as default UI stack for all DMZ projects. @aurora will enforce component patterns on every new project.", project: "wis-app", timestamp: "2026-02-27T10:00:00Z" },
  { id: "4", agentId: "analyst",       type: "report",   key: "team_status",    content: "All 8 squad members active. Oliver finalizing Railway deploy. Jose on Python compressor 1GB.",                   project: "wis-engine", timestamp: "2026-02-25T14:30:00Z" },
];

const TOOLS = [
  { id: "supabase-mcp",  name: "Supabase MCP",  type: "MCP",   status: "connected",     agents: ["orchestrator","analyst","db_sage"] },
  { id: "railway-token", name: "Railway Token", type: "Token", status: "connected",     agents: ["developer","devops"] },
  { id: "github-mcp",    name: "GitHub MCP",    type: "MCP",   status: "connected",     agents: ["developer","devops","qa","architect"] },
  { id: "notion-mcp",    name: "Notion MCP",    type: "MCP",   status: "connected",     agents: ["orchestrator","pm","copy_chief","sop_extractor"] },
  { id: "trello-mcp",    name: "Trello MCP",    type: "MCP",   status: "disconnected",  agents: ["squad_manager","sm"] },
  { id: "figma-mcp",     name: "Figma MCP",     type: "MCP",   status: "connected",     agents: ["po","design_chief","ux"] },
  { id: "stripe-mcp",    name: "Stripe MCP",    type: "MCP",   status: "not_configured",agents: [] },
  { id: "aws-mcp",       name: "AWS MCP",       type: "MCP",   status: "connected",     agents: ["devops","cyber_chief"] },
];

const DOC_TEMPLATES = [
  { id: "01", name: "01-mission-plan.md",    desc: "Strategic plan for the project", status: "ready" },
  { id: "02", name: "02-tasks-checklist.md", desc: "Macro task list",                status: "ready" },
  { id: "03", name: "03-backlog.md",         desc: "User stories per task",          status: "ready" },
  { id: "04", name: "04-progress.md",        desc: "Live progress tracking",         status: "pending" },
];

// Project-level UI standards (auto-applied on every new project)
const UI_STANDARDS = [
  { id: "shadcn-ui",    label: "shadcn/ui",      badge: "Components", color: "#111827" },
  { id: "tailwind",     label: "Tailwind CSS",   badge: "Styling",    color: "#06B6D4" },
  { id: "radix-ui",     label: "Radix UI",       badge: "Primitives", color: "#6B7280" },
  { id: "lucide-react", label: "Lucide React",   badge: "Icons",      color: "#F59E0B" },
  { id: "next-js",      label: "Next.js",        badge: "Framework",  color: "#111827" },
  { id: "typescript",   label: "TypeScript",     badge: "Language",   color: "#3178C6" },
];

const CAT_COLORS = {
  Orchestration: "#E85D2F", Product: "#2563EB",  Development: "#0891B2",
  Security:      "#DC2626", Strategy: "#D97706", Design:      "#DB2777",
  Copy:          "#7C3AED", Frameworks: "#475569", Data:       "#0369A1", Marketing: "#059669",
};

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Tag({ children, color }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", background: color + "12", color, border: `1px solid ${color}25`, borderRadius: "5px", padding: "2px 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.04em" }}>
      {children}
    </span>
  );
}

function Dot({ status }) {
  const c = { active: "#10B981", paused: "#F59E0B", inactive: "#D1D5DB", connected: "#10B981", disconnected: "#EF4444", not_configured: "#D1D5DB" };
  const col = c[status] || "#D1D5DB";
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: col, flexShrink: 0, boxShadow: (status !== "inactive" && status !== "not_configured") ? `0 0 0 2px ${col}30` : "none" }} />;
}

function AgentIcon({ agentId, size = 18, color = "#6B7280" }) {
  const Icon = AGENT_ICONS[agentId] || Bot;
  return <Icon size={size} color={color} strokeWidth={1.75} />;
}

// ─── UI STACK BANNER (project-level) ─────────────────────────────────────────
function UIStackBanner() {
  return (
    <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)", marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 28, height: 28, background: "#11182710", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Blocks size={14} color="#111827" />
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#111827" }}>Project UI Standard</span>
            <span style={{ fontSize: "11px", color: "#9CA3AF", marginLeft: "8px" }}>applied to every new project by @aurora + @victoria</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 0 2px #10B98130" }} />
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#10B981" }}>active standard</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {UI_STANDARDS.map(s => {
          const skillDef = SKILLS_REGISTRY[s.id];
          const Icon = skillDef?.icon || Package;
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "6px", background: s.color + "08", border: `1px solid ${s.color}20`, borderRadius: "8px", padding: "6px 10px" }}>
              <Icon size={13} color={s.color} strokeWidth={1.75} />
              <span style={{ fontSize: "12px", fontWeight: "700", color: s.color }}>{s.label}</span>
              <span style={{ fontSize: "10px", color: "#9CA3AF", background: "#F3F4F6", borderRadius: "4px", padding: "1px 5px" }}>{s.badge}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #F0F0F0", display: "flex", gap: "6px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>Governed by:</span>
        {["design_chief","ux","developer","architect"].map(id => {
          const a = AGENTS.find(ag => ag.id === id);
          const cc = CAT_COLORS[a.category];
          return (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: "4px", background: cc + "10", border: `1px solid ${cc}20`, borderRadius: "6px", padding: "2px 7px" }}>
              <AgentIcon agentId={id} size={11} color={cc} />
              <span style={{ fontSize: "10.5px", fontWeight: "700", color: cc, fontFamily: "monospace" }}>@{a.handle}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AGENT CARD ───────────────────────────────────────────────────────────────
function AgentCard({ agent, onClick, selected }) {
  const cc = CAT_COLORS[agent.category] || "#475569";
  const uiStackCount = agent.skillIds.filter(id => SKILLS_REGISTRY[id]?.type === "ui-stack").length;
  return (
    <div onClick={() => onClick(agent)} style={{ background: "#FFFFFF", border: selected ? `1.5px solid ${cc}` : "1.5px solid #F0F0F0", borderRadius: "14px", padding: "18px", cursor: "pointer", transition: "all 0.18s ease", boxShadow: selected ? `0 4px 20px ${cc}18` : "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div style={{ width: 42, height: 42, borderRadius: "12px", background: cc + "10", border: `1px solid ${cc}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AgentIcon agentId={agent.id} size={20} color={cc} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <Dot status={agent.active ? "active" : "inactive"} />
          {uiStackCount > 0 && (
            <div title={`${uiStackCount} UI stack skills`} style={{ display: "flex", alignItems: "center", gap: "3px", background: "#11182708", border: "1px solid #11182718", borderRadius: "5px", padding: "1px 5px" }}>
              <Blocks size={9} color="#111827" />
              <span style={{ fontSize: "9px", fontWeight: "700", color: "#111827" }}>{uiStackCount}</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", letterSpacing: "-0.02em", marginBottom: "5px" }}>{agent.name}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "1px", background: cc + "10", border: `1px solid ${cc}22`, borderRadius: "6px", padding: "2px 8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "11px", color: cc, fontWeight: "900", lineHeight: 1, marginRight: 1 }}>@</span>
          <span style={{ fontSize: "11.5px", fontWeight: "700", color: cc, fontFamily: "monospace", letterSpacing: "0.02em" }}>{agent.handle}</span>
        </div>
        <div style={{ fontSize: "10.5px", color: "#9CA3AF" }}>{agent.fullName}</div>
      </div>
      <Tag color={cc}>{agent.category}</Tag>
      <div style={{ marginTop: "10px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {agent.skills.slice(0, 2).map(s => (
          <span key={s} style={{ background: "#F3F4F6", color: "#6B7280", borderRadius: "5px", padding: "2px 7px", fontSize: "10px", fontWeight: "500" }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ─── AGENT PANEL ─────────────────────────────────────────────────────────────
function AgentPanel({ agent, onClose }) {
  const [tab, setTab] = useState("skills");
  const cc = CAT_COLORS[agent.category] || "#475569";
  const agentTools = TOOLS.filter(t => t.agents.includes(agent.id));
  const agentMem = MEMORY.filter(m => m.agentId === agent.id);
  const uiStackSkills = agent.skillIds.map(id => ({ id, ...SKILLS_REGISTRY[id] })).filter(s => s.type === "ui-stack");
  const coreSkills = agent.skillIds.map(id => ({ id, ...SKILLS_REGISTRY[id] })).filter(s => s.type === "skill");
  const hasUIStack = uiStackSkills.length > 0;

  return (
    <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "16px", padding: "24px", boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ width: 52, height: 52, background: cc + "10", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AgentIcon agentId={agent.id} size={24} color={cc} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "17px", fontWeight: "800", color: "#111827", letterSpacing: "-0.03em" }}>{agent.fullName}</span>
            <Dot status={agent.active ? "active" : "inactive"} />
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "1px", background: cc + "10", border: `1px solid ${cc}22`, borderRadius: "6px", padding: "2px 8px" }}>
              <span style={{ fontSize: "11px", color: cc, fontWeight: "900" }}>@</span>
              <span style={{ fontSize: "12px", fontWeight: "700", color: cc, fontFamily: "monospace" }}>{agent.handle}</span>
            </div>
            <Tag color={cc}>{agent.category}</Tag>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", width: 30, height: 30, borderRadius: "8px", cursor: "pointer", color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "2px", background: "#F3F4F6", borderRadius: "10px", padding: "3px", marginBottom: "18px" }}>
        {["skills","tools","memory","prompt"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: tab === t ? "#FFFFFF" : "none", border: "none", borderRadius: "8px", padding: "7px 0", cursor: "pointer", fontSize: "11px", fontWeight: tab === t ? "700" : "500", color: tab === t ? "#111827" : "#9CA3AF", boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s", textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {/* Skills tab */}
      {tab === "skills" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* UI Stack section */}
          {hasUIStack && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <Blocks size={12} color="#111827" />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#111827", textTransform: "uppercase", letterSpacing: "0.06em" }}>UI Stack</span>
                <span style={{ fontSize: "10px", color: "#9CA3AF", background: "#F3F4F6", borderRadius: "4px", padding: "1px 6px" }}>project standard</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {uiStackSkills.map(sk => {
                  const SIcon = sk.icon || Package;
                  const isStandard = SKILLS_REGISTRY[sk.id]?.standard;
                  return (
                    <div key={sk.id} style={{ background: sk.color + "06", border: `1px solid ${sk.color}18`, borderRadius: "10px", padding: "10px 12px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: 28, height: 28, background: sk.color + "12", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <SIcon size={14} color={sk.color} strokeWidth={1.75} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#111827" }}>{sk.name}</span>
                          {isStandard && <span style={{ fontSize: "9px", fontWeight: "700", color: "#10B981", background: "#10B98112", border: "1px solid #10B98125", borderRadius: "4px", padding: "1px 5px" }}>DEFAULT</span>}
                        </div>
                        <div style={{ fontSize: "10.5px", color: "#9CA3AF", marginTop: "1px" }}>{sk.desc}</div>
                      </div>
                      {sk.url && (
                        <a href={sk.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: "#D1D5DB", display: "flex" }}>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Core skills */}
          <div>
            {hasUIStack && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <Activity size={12} color="#6B7280" />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#111827", textTransform: "uppercase", letterSpacing: "0.06em" }}>Core Skills</span>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {(coreSkills.length > 0 ? coreSkills : agent.skills.map(s => ({ name: s, type: "skill", icon: Activity, color: cc }))).map((sk, i) => {
                const SIcon = sk.icon || Activity;
                return (
                  <div key={sk.id || i} style={{ background: "#F9FAFB", border: "1px solid #F0F0F0", borderRadius: "10px", padding: "10px 12px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <SIcon size={12} color={sk.color || cc} strokeWidth={1.75} />
                    <span style={{ fontSize: "12px", color: "#374151", fontWeight: "500" }}>{sk.name}</span>
                  </div>
                );
              })}
              <div style={{ background: "#F9FAFB", border: "1.5px dashed #E5E7EB", borderRadius: "10px", padding: "10px 12px", display: "flex", gap: "8px", alignItems: "center", cursor: "pointer" }}>
                <Plus size={12} color="#D1D5DB" />
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Add Skill</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tools tab */}
      {tab === "tools" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {agentTools.length === 0 && <p style={{ color: "#9CA3AF", fontSize: "13px" }}>No tools configured.</p>}
          {agentTools.map(tool => {
            const TIcon = TOOL_ICONS[tool.id] || Plug;
            return (
              <div key={tool.id} style={{ background: "#F9FAFB", border: "1px solid #F0F0F0", borderRadius: "10px", padding: "12px 14px", display: "flex", gap: "10px", alignItems: "center" }}>
                <div style={{ width: 32, height: 32, background: "#F0F0F0", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TIcon size={15} color="#6B7280" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{tool.name}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{tool.type}</div>
                </div>
                <Dot status={tool.status} />
                <span style={{ fontSize: "11px", color: tool.status === "connected" ? "#10B981" : "#EF4444", fontWeight: "600" }}>{tool.status}</span>
              </div>
            );
          })}
          <div style={{ background: "#F9FAFB", border: "1.5px dashed #E5E7EB", borderRadius: "10px", padding: "12px 14px", cursor: "pointer", color: "#9CA3AF", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Plus size={12} /> Connect Tool
          </div>
        </div>
      )}

      {/* Memory tab */}
      {tab === "memory" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {agentMem.length === 0 && <p style={{ color: "#9CA3AF", fontSize: "13px" }}>No memory entries.</p>}
          {agentMem.map(m => {
            const tc = m.type === "artifact" ? "#E85D2F" : m.type === "context" ? "#2563EB" : m.type === "decision" ? "#7C3AED" : "#059669";
            return (
              <div key={m.id} style={{ background: "#F9FAFB", border: "1px solid #F0F0F0", borderRadius: "10px", padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                  <Tag color={tc}>{m.type}</Tag>
                  <span style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "monospace" }}>{m.key}</span>
                  <span style={{ marginLeft: "auto", fontSize: "10px", color: "#D1D5DB" }}>{new Date(m.timestamp).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.6", margin: 0 }}>{m.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Prompt tab */}
      {tab === "prompt" && (
        <div style={{ background: "#F9FAFB", borderRadius: "10px", padding: "14px", fontFamily: "monospace", fontSize: "11.5px", color: "#6B7280", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
{`# ${agent.name} — ${agent.fullName}
CATEGORY: ${agent.category}

You are ${agent.name}, a ${agent.fullName}
in the DMZ Agents Squad.

SKILLS:
${agent.skills.map(s => `- ${s}`).join("\n")}
${agent.skillIds.filter(id => SKILLS_REGISTRY[id]?.type === "ui-stack").length > 0 ? `
UI STACK (project standard):
${agent.skillIds.filter(id => SKILLS_REGISTRY[id]?.type === "ui-stack").map(id => `- ${SKILLS_REGISTRY[id].name}`).join("\n")}` : ""}

RULES:
- Save all interactions to agent_memory
- Report to @orch after each task
- Use structured output format
- All frontend work MUST use shadcn/ui + Tailwind`}
        </div>
      )}
    </div>
  );
}

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onClick, selected }) {
  const squad = project.squad.map(id => AGENTS.find(a => a.id === id)).filter(Boolean);
  return (
    <div onClick={() => onClick(project)} style={{ background: "#FFFFFF", border: selected ? "1.5px solid #E85D2F" : "1.5px solid #F0F0F0", borderRadius: "14px", padding: "20px", cursor: "pointer", boxShadow: selected ? "0 4px 20px #E85D2F18" : "0 1px 4px rgba(0,0,0,0.04)", transition: "all 0.18s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827", letterSpacing: "-0.02em" }}>{project.name}</span>
        <Dot status={project.status} />
      </div>
      <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "14px" }}>{project.phase}</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>Progress</span>
        <span style={{ fontSize: "12px", fontWeight: "700", color: "#111827" }}>{project.progress}%</span>
      </div>
      <div style={{ background: "#F3F4F6", borderRadius: "99px", height: "5px", marginBottom: "14px" }}>
        <div style={{ background: "linear-gradient(90deg, #E85D2F, #7C3AED)", borderRadius: "99px", height: "100%", width: `${project.progress}%` }} />
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {squad.slice(0, 6).map(a => {
          const cc = CAT_COLORS[a.category];
          return (
            <div key={a.id} title={`@${a.handle}`} style={{ width: 26, height: 26, background: cc + "10", border: `1px solid ${cc}22`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AgentIcon agentId={a.id} size={13} color={cc} />
            </div>
          );
        })}
        {squad.length > 6 && <span style={{ width: 26, height: 26, background: "#F3F4F6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#9CA3AF", fontWeight: "600" }}>+{squad.length - 6}</span>}
      </div>
    </div>
  );
}

// ─── VIEWS ────────────────────────────────────────────────────────────────────

function AgentsView() {
  const [selected, setSelected] = useState(null);
  const [catFilter, setCatFilter] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const cats = ["All", ...Array.from(new Set(AGENTS.map(a => a.category)))];
  const filtered = AGENTS.filter(a => {
    const mc = catFilter === "All" || a.category === catFilter;
    const ma = activeFilter === "All" || (activeFilter === "Active" ? a.active : !a.active);
    const ms = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.handle.toLowerCase().includes(search.toLowerCase());
    return mc && ma && ms;
  });

  return (
    <div>
      <UIStackBanner />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "28px" }}>
        {[
          { label: "Total Agents", value: AGENTS.length,                                           sub: "registered",      Icon: Bot,      color: "#111827" },
          { label: "Active",       value: AGENTS.filter(a => a.active).length,                     sub: "online now",      Icon: Activity, color: "#059669" },
          { label: "Categories",   value: Array.from(new Set(AGENTS.map(a => a.category))).length, sub: "specializations", Icon: Layers,   color: "#7C3AED" },
          { label: "UI Stack",     value: UI_STANDARDS.length,                                     sub: "project standard",Icon: Blocks,   color: "#111827" },
        ].map(s => (
          <div key={s.label} style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: s.color, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ width: 32, height: 32, background: s.color + "10", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.Icon size={15} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#111827" }}>{s.label}</div>
            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 400px" : "1fr", gap: "20px" }}>
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={13} color="#9CA3AF" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..." style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "9px", padding: "8px 12px 8px 30px", fontSize: "12px", color: "#111827", width: "170px" }} />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "9px", padding: "8px 12px", fontSize: "12px", color: "#374151", cursor: "pointer" }}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
            <div style={{ display: "flex", background: "#F3F4F6", borderRadius: "9px", padding: "3px", gap: "2px" }}>
              {["All","Active","Inactive"].map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{ background: activeFilter === f ? "#FFFFFF" : "none", border: "none", borderRadius: "7px", padding: "5px 12px", cursor: "pointer", fontSize: "11px", fontWeight: activeFilter === f ? "700" : "500", color: activeFilter === f ? "#111827" : "#9CA3AF", boxShadow: activeFilter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: selected ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: "10px" }}>
            {filtered.map(a => (
              <AgentCard key={a.id} agent={a} onClick={ag => setSelected(selected?.id === ag.id ? null : ag)} selected={selected?.id === a.id} />
            ))}
          </div>
        </div>
        {selected && <AgentPanel agent={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}

function ProjectsView() {
  const [selected, setSelected] = useState(PROJECTS[0]);
  const sq = selected ? selected.squad.map(id => AGENTS.find(a => a.id === id)).filter(Boolean) : [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px" }}>
      <div>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>All Projects</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
          {PROJECTS.map(p => <ProjectCard key={p.id} project={p} onClick={setSelected} selected={selected?.id === p.id} />)}
        </div>
        <button style={{ width: "100%", background: "#FFFFFF", border: "1.5px dashed #E5E7EB", borderRadius: "14px", padding: "14px", cursor: "pointer", color: "#9CA3AF", fontSize: "12px", fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <Plus size={14} /> New Project
        </button>
      </div>

      {selected && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "16px", padding: "22px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#111827", letterSpacing: "-0.04em", margin: "0 0 4px" }}>{selected.name}</h2>
                <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{selected.phase} · Started {selected.startDate}</div>
              </div>
              <button style={{ background: "#E85D2F0D", border: "1px solid #E85D2F30", color: "#E85D2F", borderRadius: "9px", padding: "8px 16px", cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <Music2 size={12} /> @orch install
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Progress</span>
              <span style={{ fontSize: "14px", fontWeight: "800", color: "#111827" }}>{selected.progress}%</span>
            </div>
            <div style={{ background: "#F3F4F6", borderRadius: "99px", height: "7px" }}>
              <div style={{ background: "linear-gradient(90deg, #E85D2F, #7C3AED)", borderRadius: "99px", height: "100%", width: `${selected.progress}%` }} />
            </div>
          </div>

          {/* UI Stack for project */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#111827", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Blocks size={13} color="#9CA3AF" /> UI Stack Standard
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {UI_STANDARDS.map(s => {
                const sk = SKILLS_REGISTRY[s.id];
                const Icon = sk?.icon || Package;
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "5px", background: s.color + "08", border: `1px solid ${s.color}18`, borderRadius: "7px", padding: "5px 9px" }}>
                    <Icon size={12} color={s.color} strokeWidth={1.75} />
                    <span style={{ fontSize: "11px", fontWeight: "700", color: s.color }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#111827", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <FolderOpen size={13} color="#9CA3AF" /> Project Documents
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {DOC_TEMPLATES.map(doc => {
                const DIcon = DOC_ICONS[doc.id] || FileText;
                return (
                  <div key={doc.id} style={{ background: "#F9FAFB", border: "1px solid #F0F0F0", borderRadius: "10px", padding: "12px 14px", display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ width: 30, height: 30, background: "#EFEFEF", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <DIcon size={14} color="#6B7280" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "11px", fontWeight: "600", color: "#374151", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                      <div style={{ fontSize: "10px", color: "#9CA3AF" }}>{doc.desc}</div>
                    </div>
                    <Tag color={doc.status === "ready" ? "#059669" : "#D97706"}>{doc.status}</Tag>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#111827", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Users size={13} color="#9CA3AF" /> Active Squad ({sq.length})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
              {sq.map(a => {
                const cc = CAT_COLORS[a.category];
                return (
                  <div key={a.id} style={{ background: "#F9FAFB", border: "1px solid #F0F0F0", borderRadius: "10px", padding: "10px 12px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={{ width: 28, height: 28, background: cc + "10", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <AgentIcon agentId={a.id} size={14} color={cc} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#111827" }}>{a.name}</div>
                      <div style={{ fontSize: "10px", color: "#E85D2F", fontFamily: "monospace", fontWeight: "600" }}>@{a.handle}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{ background: "#F9FAFB", border: "1.5px dashed #E5E7EB", borderRadius: "10px", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9CA3AF", fontSize: "11px", gap: "5px" }}>
                <Plus size={12} /> Add Agent
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MemoryView() {
  const typeColors = { context: "#2563EB", artifact: "#E85D2F", report: "#059669", decision: "#7C3AED" };
  const typeIcons  = { context: Cpu, artifact: FileText, report: BarChart2, decision: Layers };
  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {Object.entries(typeColors).map(([type, color]) => {
          const TIcon = typeIcons[type];
          return (
            <div key={type} style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "10px", padding: "10px 16px", display: "flex", gap: "10px", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
              <TIcon size={14} color={color} />
              <Tag color={color}>{type}</Tag>
              <span style={{ fontSize: "15px", fontWeight: "800", color: "#111827", letterSpacing: "-0.03em" }}>{MEMORY.filter(m => m.type === type).length}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {MEMORY.map(m => {
          const agent = AGENTS.find(a => a.id === m.agentId);
          const tc = typeColors[m.type] || "#6B7280";
          const cc = agent ? CAT_COLORS[agent.category] : "#6B7280";
          return (
            <div key={m.id} style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ width: 28, height: 28, background: cc + "10", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {agent && <AgentIcon agentId={agent.id} size={13} color={cc} />}
                </div>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>@{m.agentId}</span>
                <Tag color={tc}>{m.type}</Tag>
                <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#9CA3AF", background: "#F3F4F6", borderRadius: "5px", padding: "2px 6px" }}>{m.key}</span>
                <span style={{ marginLeft: "auto", fontSize: "11px", color: "#D1D5DB" }}>{new Date(m.timestamp).toLocaleString()}</span>
              </div>
              <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.6", margin: "0 0 8px" }}>{m.content}</p>
              <Tag color="#D97706">{m.project}</Tag>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToolsView() {
  const connected = TOOLS.filter(t => t.status === "connected").length;
  return (
    <div>
      <div style={{ background: "#F9FAFB", border: "1px solid #F0F0F0", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <Blocks size={16} color="#6B7280" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#374151" }}>Tools vs Skills — the difference</span>
          <p style={{ fontSize: "11.5px", color: "#9CA3AF", margin: "3px 0 0", lineHeight: "1.6" }}>
            <strong style={{ color: "#374151" }}>Tools</strong> = external integrations requiring credentials/MCP (Supabase, Railway, GitHub…). Configured here. &nbsp;
            <strong style={{ color: "#374151" }}>Skills</strong> = agent knowledge/frameworks (shadcn/ui, Tailwind, React…). Configured per agent in the Agents view.
          </p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Connected",      value: connected,                                                 color: "#059669", Icon: Plug },
          { label: "Disconnected",   value: TOOLS.filter(t => t.status === "disconnected").length,     color: "#EF4444", Icon: Unplug },
          { label: "Not Configured", value: TOOLS.filter(t => t.status === "not_configured").length,   color: "#9CA3AF", Icon: Settings },
          { label: "Total",          value: TOOLS.length,                                              color: "#111827", Icon: Wrench },
        ].map(s => (
          <div key={s.label} style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ fontSize: "26px", fontWeight: "800", color: s.color, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ width: 30, height: 30, background: s.color + "10", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.Icon size={14} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {TOOLS.map(tool => {
          const TIcon = TOOL_ICONS[tool.id] || Server;
          const agentList = tool.agents.map(id => AGENTS.find(a => a.id === id)).filter(Boolean);
          return (
            <div key={tool.id} style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", padding: "16px 18px", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
              <div style={{ width: 40, height: 40, background: "#F3F4F6", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <TIcon size={18} color="#6B7280" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "5px" }}>{tool.name}</div>
                <div style={{ display: "flex", gap: "3px" }}>
                  {agentList.slice(0, 5).map(a => {
                    const cc = CAT_COLORS[a.category];
                    return (
                      <div key={a.id} title={`@${a.handle}`} style={{ width: 20, height: 20, background: cc + "10", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <AgentIcon agentId={a.id} size={11} color={cc} />
                      </div>
                    );
                  })}
                  {agentList.length === 0 && <span style={{ fontSize: "10px", color: "#D1D5DB" }}>No agents</span>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", gap: "5px", alignItems: "center", justifyContent: "flex-end", marginBottom: "4px" }}>
                  <Dot status={tool.status} />
                  <span style={{ fontSize: "11px", fontWeight: "600", color: tool.status === "connected" ? "#059669" : tool.status === "disconnected" ? "#EF4444" : "#9CA3AF" }}>{tool.status.replace("_", " ")}</span>
                </div>
                <Tag color="#475569">{tool.type}</Tag>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("agents");
  const titles = {
    agents:   { h: "Agents",         sub: "Manage your squad specialists" },
    projects: { h: "Projects",       sub: "Active deployments" },
    memory:   { h: "Memory",         sub: "Persistent context across projects" },
    tools:    { h: "Tools Registry", sub: "MCPs, tokens and integrations" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5", fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 99px; }
        input, select { outline: none; font-family: inherit; }
        button { font-family: inherit; }
        a { text-decoration: none; }
      `}</style>

      {/* Floating Side Nav */}
      <div style={{ position: "fixed", left: 20, top: "50%", transform: "translateY(-50%)", background: "#FFFFFF", borderRadius: "22px", boxShadow: "0 8px 40px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)", padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", zIndex: 1000, border: "1px solid #F0F0F0" }}>
        <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #E85D2F, #7C3AED)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
          <Bolt size={17} color="#FFFFFF" strokeWidth={2.5} />
        </div>
        <div style={{ width: 24, height: 1, background: "#F0F0F0", margin: "2px 0 6px" }} />
        {Object.entries(NAV_ICONS).map(([id, Icon]) => (
          <button key={id} title={id.charAt(0).toUpperCase() + id.slice(1)} onClick={() => setView(id)} style={{ width: 42, height: 42, background: view === id ? "#111827" : "none", border: "none", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
            <Icon size={18} color={view === id ? "#FFFFFF" : "#9CA3AF"} strokeWidth={1.75} />
          </button>
        ))}
        <div style={{ width: 24, height: 1, background: "#F0F0F0", margin: "6px 0 4px" }} />
        <Dot status="active" />
      </div>

      {/* Main */}
      <div style={{ marginLeft: 90, padding: "36px 40px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#111827", letterSpacing: "-0.04em", lineHeight: 1.1 }}>{titles[view].h}</h1>
            <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "3px" }}>{titles[view].sub}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "10px", padding: "8px 14px", display: "flex", gap: "6px", alignItems: "center", fontSize: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <Dot status="active" />
              <span style={{ fontWeight: "600", color: "#111827" }}>@orch</span>
              <span style={{ color: "#9CA3AF" }}>online</span>
            </div>
            <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "10px", padding: "8px 14px", display: "flex", gap: "6px", alignItems: "center", fontSize: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <Cpu size={13} color="#9CA3AF" />
              <span style={{ fontWeight: "700", color: "#111827" }}>DMZ</span>
              <span style={{ color: "#9CA3AF" }}>Squad</span>
            </div>
          </div>
        </div>
        {view === "agents"   && <AgentsView />}
        {view === "projects" && <ProjectsView />}
        {view === "memory"   && <MemoryView />}
        {view === "tools"    && <ToolsView />}
      </div>
    </div>
  );
}
