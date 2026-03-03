"use client";

import { useState, useEffect } from "react";
import {
    Wrench, Search, Plus, ExternalLink, Database, GitBranch,
    Paintbrush, FileText, Pin, CreditCard, Cloud, Rocket,
    Plug, Bot, Activity, Globe, Server, Zap, Code2,
    MessageSquare, BarChart2, Lock, Cpu, Settings,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Icon map ────────────────────────────────────────────────────────────────
const TOOL_ICONS: Record<string, any> = {
    Database, GitBranch: GitBranch, Paintbrush, FileText, Pin,
    CreditCard, Cloud, Rocket, Plug, Bot, Globe, Server,
    Zap, Code2, MessageSquare, BarChart2, Lock, Cpu, Settings, Wrench,
};

const TYPE_COLORS: Record<string, string> = {
    MCP: "#7C3AED", Token: "#E85D2F", API: "#0891B2", Webhook: "#059669",
};

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

function Dot({ status }: { status: string }) {
    const c: Record<string, string> = {
        connected: "#10B981", disconnected: "#EF4444", not_configured: "#D1D5DB"
    };
    const col = c[status] || "#D1D5DB";
    return (
        <span style={{
            display: "inline-block", width: 7, height: 7, borderRadius: "50%",
            background: col, boxShadow: status === "connected" ? `0 0 0 2px ${col}30` : "none"
        }} />
    );
}

export default function ToolsPage() {
    const [tools, setTools] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    useEffect(() => {
        async function load() {
            const [{ data: toolsData }, { data: assignData }] = await Promise.all([
                supabase.from("dmz_agents_tools").select("*").order("name"),
                supabase.from("dmz_agents_tool_assignments")
                    .select("tool_id, agent:dmz_agents_definitions(id, handle, name, icon, category)")
            ]);
            setTools(toolsData || []);
            setAssignments(assignData || []);
            setLoading(false);
        }
        load();
    }, []);

    const types = ["All", ...Array.from(new Set(tools.map(t => t.type)))];

    const filtered = tools.filter(t => {
        const mt = typeFilter === "All" || t.type === typeFilter;
        const ms = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
        return mt && ms;
    });

    function getAgentsForTool(toolId: string) {
        return assignments.filter((a: any) => a.tool_id === toolId).map((a: any) => a.agent).filter(Boolean);
    }

    const stats = {
        total: tools.length,
        connected: tools.filter(t => t.status === "connected").length,
        mcps: tools.filter(t => t.type === "MCP").length,
    };

    return (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
                    Tools
                </h1>
                <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "3px" }}>
                    Todas as ferramentas e integrações disponíveis para os agentes
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
                {[
                    { label: "Total Tools", value: stats.total, sub: "registered", color: "#111827", Icon: Wrench },
                    { label: "Connected", value: stats.connected, sub: "active now", color: "#10B981", Icon: Activity },
                    { label: "MCPs", value: stats.mcps, sub: "integrations", color: "#7C3AED", Icon: Plug },
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
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                    <Search size={13} color="#9CA3AF" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search tools..."
                        style={{
                            background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                            borderRadius: "9px", padding: "8px 12px 8px 30px",
                            fontSize: "12px", color: "#111827", width: "200px", outline: "none"
                        }}
                    />
                </div>
                <div style={{ display: "flex", background: "#F3F4F6", borderRadius: "9px", padding: "3px", gap: "2px" }}>
                    {types.map(f => (
                        <button key={f} onClick={() => setTypeFilter(f)} style={{
                            background: typeFilter === f ? "#FFFFFF" : "none", border: "none",
                            borderRadius: "7px", padding: "5px 12px", cursor: "pointer",
                            fontSize: "11px", fontWeight: typeFilter === f ? 700 : 500,
                            color: typeFilter === f ? "#111827" : "#9CA3AF",
                            boxShadow: typeFilter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                        }}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tool cards */}
            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ height: 120, background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", animation: "pulse 1.5s infinite" }} />
                    ))}
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                    {filtered.map(tool => {
                        const TIcon = TOOL_ICONS[tool.icon] || Plug;
                        const tc = TYPE_COLORS[tool.type] || "#475569";
                        const agents = getAgentsForTool(tool.id);
                        return (
                            <div key={tool.id} style={{
                                background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                                borderRadius: "14px", padding: "18px 20px",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                                transition: "all 0.15s"
                            }}>
                                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                    <div style={{
                                        width: 42, height: 42, background: "#F3F4F6",
                                        borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0
                                    }}>
                                        <TIcon size={18} color="#6B7280" strokeWidth={1.75} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{tool.name}</span>
                                            <Dot status={tool.status} />
                                            <span style={{
                                                fontSize: "10px", fontWeight: 600,
                                                color: tool.status === "connected" ? "#10B981" : tool.status === "disconnected" ? "#EF4444" : "#9CA3AF"
                                            }}>
                                                {tool.status}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "8px" }}>
                                            <Tag color={tc}>{tool.type}</Tag>
                                            <code style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "monospace" }}>{tool.id}</code>
                                        </div>
                                        {tool.description && (
                                            <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5, margin: "0 0 8px" }}>
                                                {tool.description}
                                            </p>
                                        )}
                                        {agents.length > 0 && (
                                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                                <span style={{ fontSize: "10px", color: "#9CA3AF", marginRight: "2px" }}>Used by:</span>
                                                {agents.map((a: any) => (
                                                    <span key={a.id} style={{
                                                        fontSize: "10px", fontWeight: 600,
                                                        color: "#E85D2F", fontFamily: "monospace",
                                                        background: "#E85D2F10", padding: "1px 6px",
                                                        borderRadius: "4px"
                                                    }}>
                                                        @{a.handle}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {tool.docs_url && (
                                        <a href={tool.docs_url} target="_blank" rel="noreferrer"
                                            style={{ color: "#9CA3AF", flexShrink: 0 }}>
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Add new tool card */}
                    <div style={{
                        background: "#FFFFFF", border: "1.5px dashed #E5E7EB",
                        borderRadius: "14px", padding: "18px 20px",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        cursor: "pointer", color: "#9CA3AF", fontSize: "13px", fontWeight: 500,
                        minHeight: 100
                    }}>
                        <Plus size={16} /> Adicionar nova tool
                    </div>
                </div>
            )}
        </div>
    );
}
