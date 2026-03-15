"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Bot, Search, Activity, Layers, Blocks, Music2, Users,
    Code2, ClipboardList, Target, CheckSquare, Zap, Rocket,
    Building2, ShieldAlert, Scale, Sparkles, Paintbrush,
    PenLine, BookOpen, Brain, FlaskConical, ArrowRight,
    X, Plus, ExternalLink, Database, GitBranch,
    FileText, Pin, CreditCard, Cloud, Server, Plug, Unplug,
    Package, Palette, Component, Globe, Cpu,
    BarChart2, Settings,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";
import { Suspense } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";

// ── Icons maps ────────────────────────────────────────────────────────────────
const AGENT_ICONS: Record<string, any> = {
    Music2, Users, Code2, ClipboardList, Target, CheckSquare,
    Zap, Rocket, Building2, ShieldAlert, Scale, Search,
    Sparkles, Paintbrush, PenLine, BookOpen, Brain, FlaskConical, Bot
};

const TOOL_ICONS: Record<string, any> = {
    "supabase-mcp": Database,
    "railway-token": Rocket,
    "github-mcp": GitBranch,
    "notion-mcp": FileText,
    "trello-mcp": Pin,
    "figma-mcp": Paintbrush,
    "stripe-mcp": CreditCard,
    "aws-mcp": Cloud,
};

const CAT_COLORS: Record<string, string> = {
    Orchestration: "#E85D2F", Product: "#2563EB", Development: "#0891B2",
    Security: "#DC2626", Strategy: "#D97706", Design: "#DB2777",
    Copy: "#7C3AED", Frameworks: "#475569", Data: "#0369A1", Marketing: "#059669",
    Sales: "#10B981"
};

// ── Primitives ────────────────────────────────────────────────────────────────
function Tag({ children, color }: { children: React.ReactNode; color: string }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            background: color + "12", color, border: `1px solid ${color}25`,
            borderRadius: "5px", padding: "2px 8px",
            fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.04em"
        }}>
            {children}
        </span>
    );
}

function Dot({ status }: { status: string }) {
    const c: Record<string, string> = {
        active: "#10B981", inactive: "#D1D5DB",
        connected: "#10B981", disconnected: "#EF4444", not_configured: "#D1D5DB"
    };
    const col = c[status] || "#D1D5DB";
    const pulse = status === "active" || status === "connected";
    return (
        <span style={{
            display: "inline-block", width: 7, height: 7, borderRadius: "50%",
            background: col, flexShrink: 0,
            boxShadow: pulse ? `0 0 0 2px ${col}30` : "none"
        }} />
    );
}

// ── Agent Card ────────────────────────────────────────────────────────────────
function AgentCard({ agent, onClick, selected }: { agent: any; onClick: (a: any) => void; selected: boolean }) {
    const cc = CAT_COLORS[agent.category] || "#475569";
    const IconComponent = AGENT_ICONS[agent.icon] || Bot;

    return (
        <div
            onClick={() => onClick(agent)}
            style={{
                background: "#FFFFFF",
                border: selected ? `1.5px solid ${cc}` : "1.5px solid #F0F0F0",
                borderRadius: "14px",
                padding: "18px",
                cursor: "pointer",
                transition: "all 0.18s ease",
                boxShadow: selected ? `0 4px 20px ${cc}18` : "0 1px 4px rgba(0,0,0,0.04)"
            }}
        >
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{
                    width: 42, height: 42, borderRadius: "12px",
                    background: cc + "10", border: `1px solid ${cc}18`,
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <IconComponent size={20} color={cc} strokeWidth={1.75} />
                </div>
                <Dot status={agent.active ? "active" : "inactive"} />
            </div>

            {/* Name / handle */}
            <div style={{ marginBottom: "10px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: "5px" }}>
                    {agent.full_name || agent.name}
                </div>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: "1px",
                    background: cc + "10", border: `1px solid ${cc}22`,
                    borderRadius: "6px", padding: "2px 8px", marginBottom: "4px"
                }}>
                    <span style={{ fontSize: "11px", color: cc, fontWeight: 900, marginRight: 1 }}>@</span>
                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: cc, fontFamily: "monospace", letterSpacing: "0.02em" }}>
                        {agent.handle}
                    </span>
                </div>
            </div>
            <Tag color={cc}>{agent.category}</Tag>
        </div>
    );
}

// ── Agent Panel ───────────────────────────────────────────────────────────────
function AgentPanel({ agent, onClose }: { agent: any; onClose: () => void }) {
    const router = useRouter();
    const [tab, setTab] = useState<"skills" | "tools" | "memory" | "prompt">("skills");
    const [skills, setSkills] = useState<any[]>([]);
    const [tools, setTools] = useState<any[]>([]);
    const [memory, setMemory] = useState<any[]>([]);
    const [prompt, setPrompt] = useState<string>("");
    const [loading, setLoading] = useState(true);

    const cc = CAT_COLORS[agent.category] || "#475569";
    const IconComponent = AGENT_ICONS[agent.icon] || Bot;

    useEffect(() => {
        async function load() {
            setLoading(true);

            const [{ data: skillsData }, { data: toolsData }, { data: memData }, { data: promptData }] = await Promise.all([
                supabase.from("dmz_agents_skills").select("*").eq("agent_id", agent.id).order("sort_order"),
                supabase.from("dmz_agents_tool_assignments")
                    .select("*, tool:dmz_agents_tools(*)")
                    .eq("agent_id", agent.id),
                supabase.from("dmz_agents_memory").select("*").eq("agent_id", agent.id).order("created_at", { ascending: false }).limit(10),
                supabase.from("dmz_agents_prompts").select("content").eq("agent_id", agent.id).eq("active", true).maybeSingle(),
            ]);

            setSkills(skillsData || []);
            setTools((toolsData || []).map((ta: any) => ta.tool).filter(Boolean));
            setMemory(memData || []);
            setPrompt(promptData?.content || "⚠️ Prompt não configurado.\n\nEste agente ainda não tem um prompt definido no painel admin.\n\nVá em Admin → Prompts do Chat para configurar.");
            setLoading(false);
        }
        load();
    }, [agent.id]);

    const typeColors: Record<string, string> = {
        context: "#2563EB", artifact: "#E85D2F", report: "#059669", decision: "#7C3AED"
    };

    return (
        <div style={{
            background: "#FFFFFF",
            border: "1.5px solid #F0F0F0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.06)"
        }}>
            {/* Header */}
            <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "20px" }}>
                <div style={{
                    width: 52, height: 52, background: cc + "10", borderRadius: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                    <IconComponent size={24} color={cc} strokeWidth={1.75} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "17px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>
                            {agent.full_name || agent.name}
                        </span>
                        <Dot status={agent.active ? "active" : "inactive"} />
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: "1px",
                            background: cc + "10", border: `1px solid ${cc}22`,
                            borderRadius: "6px", padding: "2px 8px"
                        }}>
                            <span style={{ fontSize: "11px", color: cc, fontWeight: 900 }}>@</span>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: cc, fontFamily: "monospace" }}>{agent.handle}</span>
                        </div>
                        <Tag color={cc}>{agent.category}</Tag>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: "#F3F4F6", border: "none", width: 30, height: 30,
                        borderRadius: "8px", cursor: "pointer", color: "#6B7280",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                >
                    <X size={14} />
                </button>
            </div>

            {/* Add to project CTA */}
            <button
                onClick={() => router.push(`/app/projects?add=${agent.id}`)}
                style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    background: "linear-gradient(135deg, #E85D2F, #D14D22)", color: "#FFFFFF",
                    border: "none", borderRadius: "10px", padding: "10px 0", cursor: "pointer",
                    fontSize: "12px", fontWeight: 700, marginBottom: "18px",
                    transition: "all 0.15s", boxShadow: "0 2px 8px rgba(232,93,47,0.3)"
                }}
            >
                <Plus size={14} /> Adicionar ao meu projeto
            </button>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "2px", background: "#F3F4F6", borderRadius: "10px", padding: "3px", marginBottom: "18px" }}>
                {(["skills", "tools", "memory", "prompt"] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            flex: 1, background: tab === t ? "#FFFFFF" : "none", border: "none",
                            borderRadius: "8px", padding: "7px 0", cursor: "pointer",
                            fontSize: "11px", fontWeight: tab === t ? 700 : 500,
                            color: tab === t ? "#111827" : "#9CA3AF",
                            boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                            transition: "all 0.15s", textTransform: "capitalize"
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Skills tab */}
            {
                tab === "skills" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} style={{ height: 44, background: "#F9FAFB", borderRadius: "10px", animation: "pulse 1.5s infinite" }} />
                            ))
                        ) : skills.length === 0 ? (
                            <p style={{ color: "#9CA3AF", fontSize: "13px" }}>No skills registered yet.</p>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                {skills.map((sk: any) => (
                                    <div key={sk.id} style={{
                                        background: "#F9FAFB", border: "1px solid #F0F0F0",
                                        borderRadius: "10px", padding: "10px 12px",
                                        display: "flex", gap: "8px", alignItems: "center"
                                    }}>
                                        <Activity size={12} color={cc} strokeWidth={1.75} />
                                        <div>
                                            <div style={{ fontSize: "12px", color: "#374151", fontWeight: 600 }}>{sk.name}</div>
                                            {sk.level && <div style={{ fontSize: "10px", color: "#9CA3AF" }}>{sk.level}</div>}
                                        </div>
                                    </div>
                                ))}
                                <div style={{
                                    background: "#F9FAFB", border: "1.5px dashed #E5E7EB",
                                    borderRadius: "10px", padding: "10px 12px",
                                    display: "flex", gap: "8px", alignItems: "center", cursor: "pointer"
                                }}>
                                    <Plus size={12} color="#D1D5DB" />
                                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Add Skill</span>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Tools tab */}
            {
                tab === "tools" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {loading ? (
                            [1, 2].map(i => <div key={i} style={{ height: 56, background: "#F9FAFB", borderRadius: "10px" }} />)
                        ) : tools.length === 0 ? (
                            <p style={{ color: "#9CA3AF", fontSize: "13px" }}>No tools configured.</p>
                        ) : (
                            tools.map((tool: any) => {
                                const TIcon = TOOL_ICONS[tool.id] || Plug;
                                return (
                                    <div key={tool.id} style={{
                                        background: "#F9FAFB", border: "1px solid #F0F0F0",
                                        borderRadius: "10px", padding: "12px 14px",
                                        display: "flex", gap: "10px", alignItems: "center"
                                    }}>
                                        <div style={{
                                            width: 32, height: 32, background: "#F0F0F0",
                                            borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                            <TIcon size={15} color="#6B7280" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{tool.name}</div>
                                            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{tool.type}</div>
                                        </div>
                                        <Dot status={tool.status} />
                                        <span style={{
                                            fontSize: "11px", fontWeight: 600,
                                            color: tool.status === "connected" ? "#10B981" : "#EF4444"
                                        }}>{tool.status}</span>
                                    </div>
                                );
                            })
                        )}
                        <div style={{
                            background: "#F9FAFB", border: "1.5px dashed #E5E7EB",
                            borderRadius: "10px", padding: "12px 14px", cursor: "pointer",
                            color: "#9CA3AF", fontSize: "12px",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                        }}>
                            <Plus size={12} /> Connect Tool
                        </div>
                    </div>
                )
            }

            {/* Memory tab */}
            {
                tab === "memory" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {loading ? (
                            [1, 2].map(i => <div key={i} style={{ height: 72, background: "#F9FAFB", borderRadius: "10px" }} />)
                        ) : memory.length === 0 ? (
                            <p style={{ color: "#9CA3AF", fontSize: "13px" }}>No memory entries.</p>
                        ) : (
                            memory.map((m: any) => {
                                const tc = typeColors[m.memory_type] || "#6B7280";
                                return (
                                    <div key={m.id} style={{
                                        background: "#F9FAFB", border: "1px solid #F0F0F0",
                                        borderRadius: "10px", padding: "12px 14px"
                                    }}>
                                        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                                            <Tag color={tc}>{m.memory_type}</Tag>
                                            <span style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "monospace" }}>{m.key}</span>
                                            <span style={{ marginLeft: "auto", fontSize: "10px", color: "#D1D5DB" }}>
                                                {new Date(m.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.6", margin: 0 }}>
                                            {typeof m.content === "string" ? m.content : JSON.stringify(m.content)}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )
            }

            {/* Prompt tab */}
            {
                tab === "prompt" && (
                    <div style={{
                        background: "#F9FAFB", borderRadius: "10px", padding: "14px",
                        fontFamily: "monospace", fontSize: "11.5px", color: "#6B7280",
                        lineHeight: "1.8", whiteSpace: "pre-wrap", maxHeight: "400px", overflowY: "auto"
                    }}>
                        {loading ? "Loading..." : prompt}
                    </div>
                )
            }
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function AgentsContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get("category") || "All";

    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState(initialCategory);
    const [activeFilter, setActiveFilter] = useState("All");
    const [selected, setSelected] = useState<any | null>(null);

    useEffect(() => {
        if (searchParams.get("category")) {
            setCatFilter(searchParams.get("category") || "All");
        }
    }, [searchParams]);

    useEffect(() => {
        document.title = "Explore Agents | DMZ - OS Agents";
        async function fetchAgents() {
            // Usa a nova query robusta (View/RPC) que varre todo db se existir, senao fallback
            const { data, error } = await supabase.rpc('get_agents_leaderboard');
            
            if (data && !error) {
                setAgents(data);
            } else {
                // Fallback de seguranca caso RPC falhe
                const { data: fallbackD } = await supabase
                    .from("dmz_agents_definitions")
                    .select("*")
                    .order("active", { ascending: false });
                if (fallbackD) setAgents(fallbackD);
            }
            setLoading(false);
        }
        fetchAgents();
    }, []);

    const cats = ["All", ...Array.from(new Set(agents.map(a => a.category)))];

    const filtered = agents.filter(a => {
        const mc = catFilter === "All" || a.category === catFilter;
        const ma = activeFilter === "All" || (activeFilter === "Active" ? a.active : !a.active);
        const ms = !search || String(a.name || '').toLowerCase().includes(search.toLowerCase()) || String(a.handle || '').toLowerCase().includes(search.toLowerCase()) || String(a.category || '').toLowerCase().includes(search.toLowerCase());
        return mc && ma && ms;
    });

    const [viewMode, setViewMode] = useState<"grid" | "leaderboard">("grid");

    const getStars = (score: number) => {
        if (!score || score <= 20) return "⭐";
        if (score >= 90) return "⭐⭐⭐⭐⭐";
        if (score >= 75) return "⭐⭐⭐⭐";
        if (score >= 50) return "⭐⭐⭐";
        if (score >= 25) return "⭐⭐";
        return "⭐";
    };

    return (
        <div className="dmz-container pt-12 pb-24">
            <AppHeader />

            {/* Header + Mode Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>Squad Experts</h1>
                    <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "4px" }}>Manage, explore and rank your AI active agents.</p>
                </div>
                
                <div style={{ display: "flex", background: "#F3F4F6", borderRadius: "10px", padding: "4px" }}>
                    <button
                        onClick={() => { setViewMode("grid"); setSelected(null); }}
                        style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            background: viewMode === "grid" ? "#FFFFFF" : "transparent",
                            color: viewMode === "grid" ? "#111827" : "#6B7280",
                            border: "none", borderRadius: "8px", padding: "6px 14px", cursor: "pointer",
                            fontSize: "13px", fontWeight: 600,
                            boxShadow: viewMode === "grid" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                            transition: "all 0.2s"
                        }}
                    >
                        <Blocks size={14} /> Explorar
                    </button>
                    <button
                        onClick={() => { setViewMode("leaderboard"); setSelected(null); }}
                        style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            background: viewMode === "leaderboard" ? "#FFFFFF" : "transparent",
                            color: viewMode === "leaderboard" ? "#E85D2F" : "#6B7280",
                            border: "none", borderRadius: "8px", padding: "6px 14px", cursor: "pointer",
                            fontSize: "13px", fontWeight: 700,
                            boxShadow: viewMode === "leaderboard" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                            transition: "all 0.2s"
                        }}
                    >
                        <Target size={14} /> Leaderboard
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "28px" }}>
                {[
                    { label: "Total Agents", value: agents.length, sub: "registered", Icon: Bot, color: "#111827" },
                    { label: "Active", value: agents.filter(a => a.active).length, sub: "online now", Icon: Activity, color: "#059669" },
                    { label: "Categories", value: new Set(agents.map(a => a.category)).size, sub: "specializations", Icon: Layers, color: "#7C3AED" },
                    { label: "System", value: "Stable", sub: "all systems go", Icon: Blocks, color: "#0891B2" },
                ].map(s => (
                    <div key={s.label} style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                            <div style={{ fontSize: "28px", fontWeight: 800, color: s.color, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value}</div>
                            <div style={{ width: 32, height: 32, background: s.color + "10", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <s.Icon size={15} color={s.color} />
                            </div>
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{s.label}</div>
                        <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                    <Search size={13} color="#9CA3AF" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search agents..."
                        style={{
                            background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                            borderRadius: "9px", padding: "8px 12px 8px 30px",
                            fontSize: "12px", color: "#111827", width: "170px", outline: "none"
                        }}
                    />
                </div>
                <CustomSelect
                    value={catFilter}
                    onChange={setCatFilter}
                    options={cats.map(c => ({ value: c, label: c }))}
                    style={{ width: "150px" }}
                />
                <div style={{ display: "flex", background: "#F3F4F6", borderRadius: "9px", padding: "3px", gap: "2px" }}>
                    {["All", "Active", "Inactive"].map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            style={{
                                background: activeFilter === f ? "#FFFFFF" : "none", border: "none",
                                borderRadius: "7px", padding: "5px 12px", cursor: "pointer",
                                fontSize: "11px", fontWeight: activeFilter === f ? 700 : 500,
                                color: activeFilter === f ? "#111827" : "#9CA3AF",
                                boxShadow: activeFilter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: selected ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: "10px" }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} style={{ height: "160px", background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", animation: "pulse 1.5s infinite" }} />
                    ))}
                </div>
            ) : viewMode === "grid" ? (
                /* Grid + Panel */
                <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: selected ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: "10px" }}>
                        {filtered.map(agent => (
                            <AgentCard
                                key={agent.id}
                                agent={agent}
                                onClick={ag => setSelected(selected?.id === ag.id ? null : ag)}
                                selected={selected?.id === agent.id}
                            />
                        ))}
                    </div>
                    {selected && (
                        <AgentPanel agent={selected} onClose={() => setSelected(null)} />
                    )}
                </div>
            ) : (
                /* Leaderboard Table */
                <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ background: "#F9FAFB", borderBottom: "1.5px solid #F0F0F0" }}>
                                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Rank</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Agente</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Tasks Concluídas</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Reworks Gerados</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Score de Qualidade</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Patente</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...filtered].sort((a, b) => (b.ranking_score || 0) - (a.ranking_score || 0)).map((agent, index) => {
                                const cc = CAT_COLORS[agent.category] || "#475569";
                                const IconComponent = AGENT_ICONS[agent.icon] || Bot;
                                const isTop3 = index < 3;
                                
                                return (
                                    <tr key={agent.id} style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                        <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 800, color: isTop3 ? "#E85D2F" : "#9CA3AF" }}>
                                            #{index + 1}
                                        </td>
                                        <td style={{ padding: "16px 24px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{ width: 36, height: 36, borderRadius: "10px", background: cc + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <IconComponent size={18} color={cc} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: "6px" }}>
                                                        {agent.full_name || agent.name}
                                                        {isTop3 && <span title="Top 3 Performer" style={{ cursor: "default" }}>🔥</span>}
                                                    </div>
                                                    <div style={{ fontSize: "12px", color: cc, fontWeight: 600 }}>@{agent.handle}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 700, color: "#059669" }}>
                                            {agent.total_concluded ?? agent.tasks_completed ?? 0}
                                        </td>
                                        <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 600, color: "#EF4444" }}>
                                            {agent.total_reworks ?? 0}
                                        </td>
                                        <td style={{ padding: "16px 24px" }}>
                                            <span style={{ 
                                                background: (agent.ranking_score || 0) > 80 ? "#ECFDF5" : (agent.ranking_score || 0) > 40 ? "#FEF3C7" : "#FEE2E2", 
                                                color: (agent.ranking_score || 0) > 80 ? "#059669" : (agent.ranking_score || 0) > 40 ? "#D97706" : "#DC2626",
                                                padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 700
                                            }}>
                                                {(agent.ranking_score || 0).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px 24px", fontSize: "15px", letterSpacing: "2px" }}>
                                            {getStars(agent.ranking_score)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>
                                        Nenhum agente encontrado neste filtro.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default function AgentsPage() {
    return (
        <Suspense fallback={<div className="p-24 text-center">Loading search params...</div>}>
            <AgentsContent />
        </Suspense>
    );
}
