"use client";

import { useState, useEffect } from "react";
import {
    Brain, Search, Clock, FileText, Bot,
    Activity, Database, BookOpen, Zap, Tag as TagIcon,
    FolderOpen, Filter, ArrowRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Primitives ──────────────────────────────────────────────────────────────
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

const TYPE_COLORS: Record<string, string> = {
    context: "#2563EB", artifact: "#E85D2F", report: "#059669",
    decision: "#7C3AED", task: "#D97706",
};

export default function MemoryPage() {
    const [memories, setMemories] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [projectFilter, setProjectFilter] = useState("All");
    const [agentFilter, setAgentFilter] = useState("All");

    useEffect(() => {
        async function load() {
            const [{ data: memData }, { data: projData }, { data: agentData }] = await Promise.all([
                supabase.from("dmz_agents_memory").select("*").order("created_at", { ascending: false }).limit(100),
                supabase.from("dmz_agents_projects").select("id, name"),
                supabase.from("dmz_agents_definitions").select("id, handle, name"),
            ]);
            setMemories(memData || []);
            setProjects(projData || []);
            setAgents(agentData || []);
            setLoading(false);
        }
        load();
    }, []);

    const memTypes = ["All", ...Array.from(new Set(memories.map(m => m.memory_type)))];

    const filtered = memories.filter(m => {
        const mt = typeFilter === "All" || m.memory_type === typeFilter;
        const mp = projectFilter === "All" || m.project_id === projectFilter;
        const ma = agentFilter === "All" || m.agent_id === agentFilter;
        const ms = !search || m.key.toLowerCase().includes(search.toLowerCase())
            || JSON.stringify(m.content).toLowerCase().includes(search.toLowerCase());
        return mt && mp && ma && ms;
    });

    const stats = {
        total: memories.length,
        types: new Set(memories.map(m => m.memory_type)).size,
        projects: new Set(memories.filter(m => m.project_id).map(m => m.project_id)).size,
    };

    function getAgentHandle(agentId: string) {
        const a = agents.find(ag => ag.id === agentId);
        return a ? `@${a.handle}` : agentId;
    }

    function getProjectName(projectId: string) {
        const p = projects.find(pr => pr.id === projectId);
        return p ? p.name : projectId;
    }

    function renderContent(content: any) {
        if (typeof content === "string") return content;
        try {
            return JSON.stringify(content, null, 2);
        } catch {
            return String(content);
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
            {/* Page header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
                        Memory
                    </h1>
                    <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "3px" }}>
                        Memória de trabalho dos agentes nos seus projetos
                    </p>
                </div>
                <a
                    href="/app/projects"
                    style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: "linear-gradient(135deg, #E85D2F, #D14D22)", color: "#FFFFFF",
                        border: "none", borderRadius: "10px", padding: "10px 20px",
                        fontSize: "13px", fontWeight: 700, textDecoration: "none",
                        boxShadow: "0 2px 12px rgba(232,93,47,0.3)", transition: "all 0.15s"
                    }}
                >
                    Utilizar Agentes <ArrowRight size={15} />
                </a>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
                {[
                    { label: "Total Entries", value: stats.total, sub: "memories stored", color: "#111827", Icon: Brain },
                    { label: "Types", value: stats.types, sub: "categories", color: "#7C3AED", Icon: TagIcon },
                    { label: "Projects", value: stats.projects, sub: "with memory", color: "#0891B2", Icon: FolderOpen },
                ].map(s => (
                    <div key={s.label} style={{
                        background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                        borderRadius: "14px", padding: "18px 20px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
                    }}>
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
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                    <Search size={13} color="#9CA3AF" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search memories..."
                        style={{
                            background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                            borderRadius: "9px", padding: "8px 12px 8px 30px",
                            fontSize: "12px", color: "#111827", width: "200px", outline: "none"
                        }}
                    />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{
                    background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                    borderRadius: "9px", padding: "8px 12px",
                    fontSize: "12px", color: "#374151", cursor: "pointer", outline: "none"
                }}>
                    {memTypes.map(t => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
                </select>
                {projects.length > 0 && (
                    <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{
                        background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                        borderRadius: "9px", padding: "8px 12px",
                        fontSize: "12px", color: "#374151", cursor: "pointer", outline: "none"
                    }}>
                        <option value="All">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                )}
                {agents.length > 0 && (
                    <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} style={{
                        background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                        borderRadius: "9px", padding: "8px 12px",
                        fontSize: "12px", color: "#374151", cursor: "pointer", outline: "none"
                    }}>
                        <option value="All">All Agents</option>
                        {agents.map(a => <option key={a.id} value={a.id}>@{a.handle} — {a.name}</option>)}
                    </select>
                )}
            </div>

            {/* Memory entries */}
            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ height: 100, background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", animation: "pulse 1.5s infinite" }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "48px",
                    background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                    borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                }}>
                    <Brain size={32} color="#D1D5DB" style={{ margin: "0 auto 12px" }} />
                    <p style={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }}>
                        Nenhuma memória encontrada.
                    </p>
                    <p style={{ fontSize: "12px", color: "#D1D5DB" }}>
                        As memórias aparecerão conforme os agentes trabalharem nos projetos.
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {filtered.map(m => {
                        const tc = TYPE_COLORS[m.memory_type] || "#6B7280";
                        return (
                            <div key={m.id} style={{
                                background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                                borderRadius: "14px", padding: "16px 20px",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                            }}>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                                    <Tag color={tc}>{m.memory_type}</Tag>
                                    <code style={{ fontSize: "11px", color: "#6B7280", fontFamily: "monospace", fontWeight: 600 }}>
                                        {m.key}
                                    </code>
                                    {m.agent_id && (
                                        <span style={{ fontSize: "10px", color: "#E85D2F", fontWeight: 600, fontFamily: "monospace" }}>
                                            {getAgentHandle(m.agent_id)}
                                        </span>
                                    )}
                                    {m.project_id && (
                                        <span style={{
                                            fontSize: "10px", color: "#2563EB", fontWeight: 500,
                                            background: "#2563EB10", padding: "1px 6px", borderRadius: "4px"
                                        }}>
                                            {getProjectName(m.project_id)}
                                        </span>
                                    )}
                                    <span style={{ marginLeft: "auto", fontSize: "10px", color: "#D1D5DB", fontFamily: "monospace" }}>
                                        {new Date(m.created_at).toLocaleString()}
                                    </span>
                                </div>
                                {m.tags && m.tags.length > 0 && (
                                    <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                                        {m.tags.map((t: string) => (
                                            <span key={t} style={{
                                                fontSize: "10px", background: "#F3F4F6",
                                                padding: "1px 6px", borderRadius: "4px", color: "#6B7280"
                                            }}>#{t}</span>
                                        ))}
                                    </div>
                                )}
                                <div style={{
                                    fontSize: "12px", color: "#6B7280", lineHeight: 1.7,
                                    whiteSpace: "pre-wrap", maxHeight: "120px",
                                    overflow: "hidden"
                                }}>
                                    {renderContent(m.content)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
