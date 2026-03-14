"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Brain, Search, Bot,
    Tag as TagIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", background: color + "12", color, border: `1px solid ${color}25`, borderRadius: "5px", padding: "2px 8px", fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.04em" }}>
            {children}
        </span>
    );
}

const TYPE_COLORS: Record<string, string> = {
    context: "#2563EB", artifact: "#E85D2F", report: "#059669",
    decision: "#7C3AED", task: "#D97706", chat_log: "#0891B2",
};

export default function ProjectMemoryView({ slug }: { slug: string }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");
    const [project, setProject] = useState<any>(null);
    const [memories, setMemories] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [projectAgents, setProjectAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [agentFilter, setAgentFilter] = useState("All");

    useEffect(() => {
        async function load() {
            const { data: projData } = await supabase.from("dmz_agents_projects").select("*").eq("slug", slug).single();
            if (!projData) { setLoading(false); return; }
            setProject(projData);

            const [{ data: memData }, { data: chatData }, { data: agentData }, { data: paData }] = await Promise.all([
                supabase.from("dmz_agents_memory").select("*").eq("project_id", projData.id).order("created_at", { ascending: false }).limit(100),
                supabase.from("dmz_agents_chat").select("*").eq("project_id", projData.id).order("created_at", { ascending: false }).limit(100),
                supabase.from("dmz_agents_definitions").select("id, handle, name, color"),
                supabase.from("dmz_agents_project_agents").select("agent_id").eq("project_id", projData.id),
            ]);

            const formattedChat = (chatData || []).map((c: any) => ({
                id: `chat-${c.id}`, memory_type: "chat_log", key: "Mensagem de Chat",
                project_id: c.project_id, agent_id: c.agent_id || (c.role === "user" ? "user" : null),
                content: c.content || c.file_name || "Anexo", tags: [c.role].filter(Boolean), created_at: c.created_at,
                tab: "chat"
            }));

            const formattedMem = (memData || []).map((m: any) => ({
                ...m,
                tab: m.memory_type === "artifact" ? "code" : "brain"
            }));

            const combined = [...formattedMem, ...formattedChat]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 150);

            setMemories(combined); setAgents(agentData || []); setProjectAgents(paData || []); setLoading(false);
        }
        load();
    }, [slug]);

    const squadAgents = agents.filter(a => projectAgents.some(pa => pa.agent_id === a.id));

    const filtered = memories.filter(m => {
        const mt = activeTab === "all" || m.tab === activeTab;
        const ma = agentFilter === "All" || m.agent_id === agentFilter;
        const ms = !search || (m.key || "").toLowerCase().includes(search.toLowerCase()) || JSON.stringify(m.content).toLowerCase().includes(search.toLowerCase());
        return mt && ma && ms;
    });

    function getAgentHandle(agentId: string) {
        if (agentId === "user") return "👤 user";
        const a = agents.find(ag => ag.id === agentId);
        return a ? `@${a.handle}` : agentId;
    }
    function getAgentColor(agentId: string) { return agents.find(a => a.id === agentId)?.color || "#6B7280"; }
    function renderContent(content: any) { 
        if (typeof content === "string") return content;
        return JSON.stringify(content, null, 2);
    }

    if (!loading && !project) return (
        <div className="dmz-container pt-12 pb-24">
            <AppHeader />
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
                <Brain size={48} color="#D1D5DB" style={{ margin: "0 auto 16px" }} />
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>Projeto não encontrado</h2>
                <button onClick={() => router.push("/app/projects")} style={{ marginTop: 16, background: "#E85D2F", color: "#FFF", border: "none", borderRadius: "10px", padding: "10px 24px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Voltar</button>
            </div>
        </div>
    );

    const TABS = [
        { id: "all", label: "Toda a Memória", icon: Brain },
        { id: "chat", label: "Histórico de Chat", icon: Bot },
        { id: "brain", label: "Conhecimento Base", icon: TagIcon },
        { id: "code", label: "Artefatos & Código", icon: Search },
    ];

    return (
        <div className="dmz-container pt-12 pb-24">
            <AppHeader />
            <button onClick={() => router.push(`/app/projects?id=${slug}`)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "#9CA3AF", fontSize: "13px", fontWeight: 500, marginBottom: "16px" }}>
                <ArrowLeft size={14} /> Board — {project?.name}
            </button>

            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Brain size={24} color="#7C3AED" /> Memória do Projeto
                </h1>
                <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "4px" }}>Isolamento e curadoria de tudo que o squad produziu</p>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1.5px solid #F0F0F0", marginBottom: "24px", paddingBottom: "2px" }}>
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px",
                                border: "none", background: "none", cursor: "pointer", position: "relative",
                                color: isActive ? "#111827" : "#9CA3AF", fontSize: "13px", fontWeight: 600, transition: "all 0.2s"
                            }}>
                            <tab.icon size={14} color={isActive ? "#7C3AED" : "#9CA3AF"} />
                            {tab.label}
                            {isActive && <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, height: "2px", background: "#7C3AED", borderRadius: "10px" }} />}
                        </button>
                    )
                })}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                    <Search size={13} color="#9CA3AF" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nesta aba..."
                        style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "9px", padding: "8px 12px 8px 30px", fontSize: "12px", color: "#111827", width: "200px", outline: "none" }} />
                </div>
                {squadAgents.length > 0 && (
                    <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "9px", padding: "8px 12px", fontSize: "12px", color: "#111827", outline: "none" }}>
                        <option value="All">Filtro por Agente</option>
                        {squadAgents.map(a => <option key={a.id} value={a.id}>@{a.handle} — {a.name}</option>)}
                    </select>
                )}
            </div>

            {/* Entries */}
            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[1, 2, 3].map(i => <div key={i} style={{ height: 120, background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", animation: "pulse 1.5s infinite" }} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 24px", background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px" }}>
                    <Brain size={32} color="#D1D5DB" style={{ margin: "0 auto 12px" }} />
                    <p style={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }}>Nenhum registro encontrado nesta categoria.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filtered.map(m => {
                        const tc = TYPE_COLORS[m.memory_type] || "#6B7280";
                        const isSystem = m.agent_id && m.agent_id !== "user";
                        return (
                            <div key={m.id} style={{ 
                                background: "#FFFFFF", 
                                border: "1.5px solid #F0F0F0", 
                                borderLeft: `4px solid ${tc}`,
                                borderRadius: "14px", 
                                padding: "18px 22px", 
                                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                                transition: "all 0.15s"
                            }}>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
                                    <Tag color={tc}>{m.memory_type.toUpperCase()}</Tag>
                                    {isSystem && <span style={{ fontSize: "11px", color: getAgentColor(m.agent_id), fontWeight: 700, fontFamily: "monospace", background: getAgentColor(m.agent_id) + "10", padding: "2px 8px", borderRadius: "6px" }}>{getAgentHandle(m.agent_id)}</span>}
                                    {!isSystem && m.agent_id === "user" && <span style={{ fontSize: "11px", color: "#111827", fontWeight: 700 }}>VOCÊ</span>}
                                    <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500 }}>• {m.key}</span>
                                    <span style={{ marginLeft: "auto", fontSize: "10px", color: "#D1D5DB", fontFamily: "monospace" }}>{new Date(m.created_at).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</span>
                                </div>
                                <div style={{ 
                                    fontSize: "13px", 
                                    color: "#374151", 
                                    lineHeight: 1.6, 
                                    whiteSpace: "pre-wrap", 
                                    maxHeight: activeTab === "all" ? "120px" : "none", 
                                    overflow: "auto",
                                    padding: "4px 0"
                                }}>
                                    {renderContent(m.content)}
                                </div>
                                {m.tags?.length > 0 && (
                                    <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
                                        {m.tags.map((t: string) => <span key={t} style={{ fontSize: "10px", background: "#F9FAFB", padding: "2px 8px", borderRadius: "5px", color: "#9CA3AF", border: "1px solid #F0F0F0" }}>#{t}</span>)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
    );
}
