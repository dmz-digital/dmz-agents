"use client";

import { useState, useEffect } from "react";
import {
    Wrench, Search, Plus, ExternalLink, Database, GitBranch,
    Paintbrush, FileText, Pin, CreditCard, Cloud, Rocket,
    Plug, Bot, Activity, Globe, Server, Zap, Code2,
    MessageSquare, BarChart2, Lock, Cpu, Settings, ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";

// ── Icon map ────────────────────────────────────────────────────────────────
const TOOL_ICONS: Record<string, any> = {
    Database, GitBranch: GitBranch, Paintbrush, FileText, Pin,
    CreditCard, Cloud, Rocket, Plug, Bot, Globe, Server,
    Zap, Code2, MessageSquare, BarChart2, Lock, Cpu, Settings, Wrench,
};

const TYPE_COLORS: Record<string, string> = {
    MCP: "#7C3AED", Token: "#E85D2F", API: "#0891B2", Webhook: "#059669",
    UI: "#EC4899", Platform: "#F59E0B",
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

function ToolModal({ tool, onClose, onSave, onDelete }: { tool: any, onClose: () => void, onSave: (t: any) => void, onDelete: (id: string) => void }) {
    const isNew = !tool;
    const [formData, setFormData] = useState(tool || {
        id: "", name: "", type: "Platform", icon: "Plug", description: "", docs_url: "", status: "not_configured"
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", padding: "16px" }}>
            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{isNew ? "Adicionar Integração/Ferramenta" : "Editar Ferramenta"}</h2>
                    <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "20px" }}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {isNew && (
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>ID</label>
                            <input required value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "14px", outline: "none" }} placeholder="ex: stripe_api" />
                        </div>
                    )}
                    <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Nome</label>
                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "14px", outline: "none" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Descrição</label>
                        <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "14px", minHeight: "60px", outline: "none" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Tipo</label>
                            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "14px", outline: "none" }}>
                                <option value="MCP">MCP</option>
                                <option value="Token">Token</option>
                                <option value="API">API</option>
                                <option value="Webhook">Webhook</option>
                                <option value="UI">UI</option>
                                <option value="Platform">Platform</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "14px", outline: "none" }}>
                                <option value="connected">Connected</option>
                                <option value="disconnected">Disconnected</option>
                                <option value="not_configured">Not Configured</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Ícone (Lucide Name ou URL da imagem)</label>
                        <input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "14px", outline: "none" }} placeholder="ex: Plug, Database, ou https://..." />
                        <p style={{fontSize: "10px", color: "#9CA3AF", marginTop: "4px"}}>Dica: Você pode inserir a URL de uma logo real para ficar mais bonito!</p>
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Docs URL (opcional)</label>
                        <input value={formData.docs_url || ""} onChange={e => setFormData({...formData, docs_url: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "14px", outline: "none" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                        {!isNew ? (
                            <button type="button" onClick={() => { if(window.confirm("Deseja excluir definitivamente esta plataforma/integração?")) onDelete(formData.id); }} style={{ padding: "8px 16px", borderRadius: "8px", background: "#FEE2E2", color: "#EF4444", fontWeight: 600, border: "none", cursor: "pointer", fontSize: "13px" }}>Excluir</button>
                        ) : <div/>}
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: "8px", background: "#F3F4F6", color: "#374151", fontWeight: 600, border: "1px solid #D1D5DB", cursor: "pointer", fontSize: "13px" }}>Cancelar</button>
                            <button type="submit" style={{ padding: "8px 16px", borderRadius: "8px", background: "#D8663E", color: "#FFF", fontWeight: 600, border: "none", cursor: "pointer", fontSize: "13px" }}>{isNew ? "Adicionar" : "Salvar"}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ToolsPage() {
    const [tools, setTools] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTool, setEditTool] = useState<any>(null);

    const loadData = async () => {
        const [{ data: toolsData }, { data: assignData }] = await Promise.all([
            supabase.from("dmz_agents_tools").select("*").order("name"),
            supabase.from("dmz_agents_tool_assignments")
                .select("tool_id, agent:dmz_agents_definitions(id, handle, name, icon, category)")
        ]);
        setTools(toolsData || []);
        setAssignments(assignData || []);
        if (loading) setLoading(false);
    };

    useEffect(() => {
        loadData();
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

    async function handleSaveTool(toolData: any) {
        if (!editTool) {
            await supabase.from("dmz_agents_tools").insert({
                id: toolData.id,
                name: toolData.name,
                type: toolData.type,
                description: toolData.description,
                icon: toolData.icon,
                status: toolData.status,
                docs_url: toolData.docs_url
            });
        } else {
            const { id, ...updates } = toolData;
            await supabase.from("dmz_agents_tools").update({
                name: updates.name,
                type: updates.type,
                description: updates.description,
                icon: updates.icon,
                status: updates.status,
                docs_url: updates.docs_url
            }).eq("id", id);
        }
        setIsModalOpen(false);
        loadData();
    }

    async function handleDeleteTool(id: string) {
        await supabase.from("dmz_agents_tools").delete().eq("id", id);
        setIsModalOpen(false);
        loadData();
    }

    const stats = {
        total: tools.length,
        connected: tools.filter(t => t.status === "connected").length,
        mcps: tools.filter(t => t.type === "MCP").length,
    };

    return (
        <div className="dmz-container pt-12 pb-24">
            <AppHeader />

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
                <div style={{ display: "flex", background: "#F3F4F6", borderRadius: "9px", padding: "3px", gap: "2px", overflowX: "auto" }}>
                    {types.map(f => (
                        <button key={f} onClick={() => setTypeFilter(f)} style={{
                            background: typeFilter === f ? "#FFFFFF" : "none", border: "none",
                            borderRadius: "7px", padding: "5px 12px", cursor: "pointer",
                            fontSize: "11px", fontWeight: typeFilter === f ? 700 : 500,
                            color: typeFilter === f ? "#111827" : "#9CA3AF",
                            boxShadow: typeFilter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                            whiteSpace: "nowrap"
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
                        const isIconUrl = tool.icon && (tool.icon.startsWith("http") || tool.icon.startsWith("/"));
                        const TIcon = !isIconUrl ? (TOOL_ICONS[tool.icon] || Plug) : null;
                        const tc = TYPE_COLORS[tool.type] || "#475569";
                        const agents = getAgentsForTool(tool.id);
                        return (
                            <div key={tool.id} 
                                onClick={(e) => {
                                    // prevent opening modal if clicking docs url
                                    if ((e.target as HTMLElement).closest('a')) return;
                                    setEditTool(tool);
                                    setIsModalOpen(true);
                                }}
                                style={{
                                background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                                borderRadius: "14px", padding: "18px 20px",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                                transition: "all 0.15s",
                                cursor: "pointer"
                            }}
                            className="hover:border-[#D8663E] hover:shadow-md"
                            >
                                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                    <div style={{
                                        width: 42, height: 42, background: "#F3F4F6",
                                        borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0
                                    }}>
                                        {isIconUrl ? (
                                            <img src={tool.icon} alt={tool.name} style={{ width: 24, height: 24, objectFit: "contain", borderRadius: "4px" }} />
                                        ) : (
                                            <TIcon size={18} color="#6B7280" strokeWidth={1.75} />
                                        )}
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
                                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
                                                <span style={{ fontSize: "10px", color: "#9CA3AF", marginRight: "2px" }}>Servido para:</span>
                                                {agents.map((a: any) => (
                                                    <span key={a.id} style={{
                                                        fontSize: "10px", fontWeight: 600,
                                                        color: "#E85D2F", fontFamily: "monospace",
                                                        background: "#E85D2F10", padding: "2px 6px",
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
                                            style={{ color: "#D8663E", flexShrink: 0, padding: "4px", background: "#D8663E10", borderRadius: "6px" }}>
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Add new tool card */}
                    <div 
                        onClick={() => { setEditTool(null); setIsModalOpen(true); }}
                        style={{
                        background: "#FFFFFF", border: "1.5px dashed #E5E7EB",
                        borderRadius: "14px", padding: "18px 20px",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        cursor: "pointer", color: "#9CA3AF", fontSize: "13px", fontWeight: 500,
                        minHeight: 100, transition: "background 0.2s"
                    }}
                        className="hover:bg-neutral-50"
                    >
                        <Plus size={16} /> Adicionar nova platforma/tool
                    </div>
                </div>
            )}

            {isModalOpen && (
                <ToolModal
                    tool={editTool}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveTool}
                    onDelete={handleDeleteTool}
                />
            )}
        </div>
    );
}
