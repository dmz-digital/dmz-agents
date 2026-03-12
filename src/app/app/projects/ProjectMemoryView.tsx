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
    const [project, setProject] = useState<any>(null);
    const [memories, setMemories] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [projectAgents, setProjectAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
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
                content: c.content || c.file_name || "Anexo", tags: [c.role].filter(Boolean), created_at: c.created_at
            }));

            const combined = [...(memData || []), ...formattedChat]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 150);

            setMemories(combined); setAgents(agentData || []); setProjectAgents(paData || []); setLoading(false);
        }
        load();
    }, [slug]);

    const memTypes = ["All", ...Array.from(new Set(memories.map(m => m.memory_type)))];
    const squadAgents = agents.filter(a => projectAgents.some(pa => pa.agent_id === a.id));

    const filtered = memories.filter(m => {
        const mt = typeFilter === "All" || m.memory_type === typeFilter;
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
    function renderContent(content: any) { return typeof content === "string" ? content : JSON.stringify(content, null, 2); }

    if (!loading && !project) return (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
            <AppHeader />
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
                <Brain size={48} color="#D1D5DB" style={{ margin: "0 auto 16px" }} />
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>Projeto não encontrado</h2>
                <button onClick={() => router.push("/app/projects")} style={{ marginTop: 16, background: "#E85D2F", color: "#FFF", border: "none", borderRadius: "10px", padding: "10px 24px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Voltar</button>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
            <AppHeader />
            <button onClick={() => router.push(`/app/projects?id=${slug}`)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "#9CA3AF", fontSize: "13px", fontWeight: 500, marginBottom: "16px" }}>
                <ArrowLeft size={14} /> Board — {project?.name}
            </button>

            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Brain size={24} color="#7C3AED" /> Memória do Projeto
                </h1>
                <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "4px" }}>Tudo que os agentes aprenderam e registraram neste projeto</p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
                {[
                    { label: "Total Entries", value: memories.length, sub: "memórias", color: "#7C3AED", Icon: Brain },
                    { label: "Tipos", value: new Set(memories.map(m => m.memory_type)).size, sub: "categorias", color: "#2563EB", Icon: TagIcon },
                    { label: "Agentes", value: new Set(memories.filter(m => m.agent_id).map(m => m.agent_id)).size, sub: "contribuíram", color: "#E85D2F", Icon: Bot },
                ].map(s => (
                    <div key={s.label} style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                            <div style={{ fontSize: "28px", fontWeight: 800, color: s.color, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value}</div>
                            <div style={{ width: 32, height: 32, background: s.color + "10", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}><s.Icon size={15} color={s.color} /></div>
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
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar memórias..."
                        style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "9px", padding: "8px 12px 8px 30px", fontSize: "12px", color: "#111827", width: "200px", outline: "none" }} />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "9px", padding: "8px 12px", fontSize: "12px", color: "#111827", outline: "none" }}>
                    {memTypes.map(t => <option key={t} value={t}>{t === "All" ? "Todos os Tipos" : t}</option>)}
                </select>
                {squadAgents.length > 0 && (
                    <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "9px", padding: "8px 12px", fontSize: "12px", color: "#111827", outline: "none" }}>
                        <option value="All">Todos os Agentes</option>
                        {squadAgents.map(a => <option key={a.id} value={a.id}>@{a.handle} — {a.name}</option>)}
                    </select>
                )}
            </div>

            {/* Entries */}
            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[1, 2, 3].map(i => <div key={i} style={{ height: 100, background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", animation: "pulse 1.5s infinite" }} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px", background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px" }}>
                    <Brain size={32} color="#D1D5DB" style={{ margin: "0 auto 12px" }} />
                    <p style={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }}>Nenhuma memória encontrada.</p>
                    <p style={{ fontSize: "12px", color: "#D1D5DB" }}>As memórias aparecerão conforme os agentes trabalharem.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {filtered.map(m => {
                        const tc = TYPE_COLORS[m.memory_type] || "#6B7280";
                        return (
                            <div key={m.id} style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                                    <Tag color={tc}>{m.memory_type}</Tag>
                                    <code style={{ fontSize: "11px", color: "#6B7280", fontFamily: "monospace", fontWeight: 600 }}>{m.key}</code>
                                    {m.agent_id && <span style={{ fontSize: "10px", color: getAgentColor(m.agent_id), fontWeight: 600, fontFamily: "monospace" }}>{getAgentHandle(m.agent_id)}</span>}
                                    <span style={{ marginLeft: "auto", fontSize: "10px", color: "#D1D5DB", fontFamily: "monospace" }}>{new Date(m.created_at).toLocaleString("pt-BR")}</span>
                                </div>
                                {m.tags?.length > 0 && (
                                    <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                                        {m.tags.map((t: string) => <span key={t} style={{ fontSize: "10px", background: "#F3F4F6", padding: "1px 6px", borderRadius: "4px", color: "#6B7280" }}>#{t}</span>)}
                                    </div>
                                )}
                                <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: "120px", overflow: "hidden" }}>{renderContent(m.content)}</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
