"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    FolderOpen, Plus, ArrowRight, Clock, CheckCircle2,
    Users, Bot, Activity, MoreHorizontal, Search,
    Key, Copy, Check, ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";

// ── Primitives ──────────────────────────────────────────────────────────────
function Tag({ children, color }: { children: React.ReactNode; color: string }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            background: color + "12", color, border: `1px solid ${color}25`,
            borderRadius: "6px", padding: "2px 10px",
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.03em"
        }}>
            {children}
        </span>
    );
}

function CopyButton({ text, size = 13 }: { text: string; size?: number }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{
                background: "none", border: "none", cursor: "pointer", padding: "4px",
                color: copied ? "#10B981" : "#9CA3AF", display: "flex", alignItems: "center"
            }}
            title="Copiar"
        >
            {copied ? <Check size={size} /> : <Copy size={size} />}
        </button>
    );
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    setup: { color: "#D97706", label: "Setup" },
    active: { color: "#10B981", label: "Ativo" },
    paused: { color: "#9CA3AF", label: "Pausado" },
    completed: { color: "#2563EB", label: "Concluído" },
    archived: { color: "#6B7280", label: "Arquivado" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProjectsListView() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [projects, setProjects] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [projectAgents, setProjectAgents] = useState<any[]>([]);
    const [taskCounts, setTaskCounts] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [showApiKey, setShowApiKey] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    // Auto-open create modal when ?create=1
    useEffect(() => {
        if (searchParams.get("create") === "1") {
            setShowCreate(true);
        }
    }, [searchParams]);

    async function loadData() {
        const [{ data: projData }, { data: agentData }, { data: paData }, { data: taskData }] = await Promise.all([
            supabase.from("dmz_agents_projects").select("*").order("created_at", { ascending: false }),
            supabase.from("dmz_agents_definitions").select("id, handle, name, icon, color, category"),
            supabase.from("dmz_agents_project_agents").select("project_id, agent_id"),
            supabase.from("dmz_agents_tasks").select("project_id, type"),
        ]);

        setProjects(projData || []);
        setAgents(agentData || []);
        setProjectAgents(paData || []);

        // Count tasks by type per project
        const counts: Record<string, any> = {};
        (taskData || []).forEach((t: any) => {
            if (!counts[t.project_id]) counts[t.project_id] = { master_plan: 0, on_going: 0, done: 0, rework: 0 };
            if (counts[t.project_id][t.type] !== undefined) counts[t.project_id][t.type]++;
        });
        setTaskCounts(counts);
        setLoading(false);
    }

    function getProjectAgentCount(projectId: string) {
        return projectAgents.filter(pa => pa.project_id === projectId).length;
    }

    function getProjectAgentAvatars(projectId: string) {
        const pas = projectAgents.filter(pa => pa.project_id === projectId);
        return pas.slice(0, 5).map(pa => agents.find(a => a.id === pa.agent_id)).filter(Boolean);
    }

    const filtered = projects.filter(p =>
        !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.slug?.toLowerCase().includes(search.toLowerCase())
    );

    if (showCreate) {
        return <CreateProject onBack={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadData(); }} />;
    }

    return (
        <div className="dmz-container pt-12 pb-24">
            <AppHeader />

            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111827", letterSpacing: "-0.04em" }}>
                    Meus Projetos
                </h1>
                <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "4px" }}>
                    Gerencie e acompanhe seus projetos com o squad de agentes
                </p>
            </div>

            {/* Search */}
            {projects.length > 0 && (
                <div style={{ position: "relative", marginBottom: "20px", maxWidth: "360px" }}>
                    <Search size={14} color="#9CA3AF" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar projetos..."
                        style={{
                            width: "100%", background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                            borderRadius: "10px", padding: "10px 14px 10px 38px",
                            fontSize: "13px", color: "#111827", outline: "none",
                            transition: "border-color 0.2s"
                        }}
                    />
                </div>
            )}

            {/* Projects Grid */}
            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: 220, background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "16px", animation: "pulse 1.5s infinite" }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "64px 24px",
                    background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                    borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                }}>
                    <FolderOpen size={40} color="#D1D5DB" style={{ margin: "0 auto 16px" }} />
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
                        {search ? "Nenhum projeto encontrado" : "Nenhum projeto ainda"}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "24px" }}>
                        {search ? "Tente outro termo de busca" : "Crie seu primeiro projeto para começar a usar os agentes"}
                    </p>
                    {!search && (
                        <button
                            onClick={() => setShowCreate(true)}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: "6px",
                                background: "linear-gradient(135deg, #E85D2F, #D14D22)",
                                color: "#FFFFFF", border: "none", borderRadius: "10px",
                                padding: "10px 20px", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                            }}
                        >
                            <Plus size={14} /> Criar Projeto
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                    {filtered.map(project => {
                        const sc = STATUS_CONFIG[project.status] || STATUS_CONFIG.setup;
                        const agentAvatars = getProjectAgentAvatars(project.id);
                        const agentCount = getProjectAgentCount(project.id);
                        const tc = taskCounts[project.id] || { master_plan: 0, on_going: 0, done: 0, rework: 0 };

                        return (
                            <div
                                key={project.id}
                                onClick={() => router.push(`/app/projects?id=${project.slug || project.id}`)}
                                style={{
                                    background: "#FFFFFF",
                                    border: "1.5px solid #F0F0F0",
                                    borderRadius: "16px",
                                    padding: "24px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                                    display: "flex", flexDirection: "column", gap: "16px",
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E85D2F40"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(232,93,47,0.08)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#F0F0F0"; (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
                            >
                                {/* Header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: "12px",
                                            background: "#E85D2F10", border: "1px solid #E85D2F18",
                                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                        }}>
                                            <FolderOpen size={20} color="#E85D2F" strokeWidth={1.75} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                                                {project.name}
                                            </h3>
                                            <code style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>
                                                {project.slug}
                                            </code>
                                        </div>
                                    </div>
                                    <Tag color={sc.color}>{sc.label}</Tag>
                                </div>

                                {project.description && (
                                    <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                                        {project.description.length > 100 ? project.description.slice(0, 100) + "..." : project.description}
                                    </p>
                                )}

                                {/* Task Stats Mini */}
                                <div style={{ display: "flex", gap: "12px" }}>
                                    {[
                                        { label: "Plan", count: tc.master_plan, color: "#2563EB" },
                                        { label: "Going", count: tc.on_going, color: "#D97706" },
                                        { label: "Done", count: tc.done, color: "#10B981" },
                                        { label: "Rework", count: tc.rework, color: "#EF4444" },
                                    ].map(s => (
                                        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                                            <span style={{ fontSize: "11px", color: "#6B7280", fontWeight: 500 }}>
                                                {s.count} {s.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                                    {/* Agent Avatars */}
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        {agentAvatars.map((agent: any, i: number) => (
                                            <div
                                                key={agent.id}
                                                title={`@${agent.handle}`}
                                                style={{
                                                    width: 26, height: 26, borderRadius: "50%",
                                                    background: agent.color + "20",
                                                    border: `2px solid #FFFFFF`,
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    marginLeft: i > 0 ? "-8px" : "0",
                                                    fontSize: "9px", fontWeight: 700, color: agent.color,
                                                    zIndex: 5 - i,
                                                }}
                                            >
                                                {agent.handle?.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                        {agentCount > 5 && (
                                            <div style={{
                                                width: 26, height: 26, borderRadius: "50%",
                                                background: "#F3F4F6", border: "2px solid #FFFFFF",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                marginLeft: "-8px", fontSize: "9px", fontWeight: 700, color: "#9CA3AF"
                                            }}>
                                                +{agentCount - 5}
                                            </div>
                                        )}
                                        {agentCount === 0 && (
                                            <span style={{ fontSize: "11px", color: "#D1D5DB" }}>
                                                Sem agentes
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#E85D2F", fontSize: "12px", fontWeight: 600 }}>
                                        Abrir Board <ArrowRight size={13} />
                                    </div>
                                </div>

                                {/* API Key (toggle) */}
                                <div
                                    onClick={(e) => { e.stopPropagation(); setShowApiKey(showApiKey === project.id ? null : project.id); }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "6px",
                                        padding: "6px 10px", borderRadius: "8px",
                                        background: "#F9FAFB", cursor: "pointer",
                                        borderTop: "1px solid #F0F0F0",
                                    }}
                                >
                                    <Key size={11} color="#9CA3AF" />
                                    <span style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "monospace" }}>
                                        {showApiKey === project.id
                                            ? project.api_key
                                            : `dmz_pk_${"•".repeat(16)}`
                                        }
                                    </span>
                                    {showApiKey === project.id && <CopyButton text={project.api_key} size={11} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════════════════
// CREATE PROJECT FORM
// ═══════════════════════════════════════════════════════════════════════════════
function CreateProject({ onBack, onCreated }: { onBack: () => void; onCreated: () => void }) {
    const [step, setStep] = useState<"info" | "agents" | "done">("info");
    const [projectName, setProjectName] = useState("");
    const [projectSlug, setProjectSlug] = useState("");
    const [projectDesc, setProjectDesc] = useState("");
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
    const [creating, setCreating] = useState(false);
    const [createdProject, setCreatedProject] = useState<any>(null);

    useEffect(() => {
        supabase.from("dmz_agents_definitions").select("*").eq("active", true).order("category")
            .then(({ data }) => { if (data) setAgents(data); });
    }, []);

    function slugify(text: string) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    async function handleCreateProject() {
        if (!projectName.trim()) return;
        setCreating(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { alert("Sessão expirada. Faça login novamente."); setCreating(false); return; }

        const slug = projectSlug || slugify(projectName);
        const apiKey = "dmz_pk_" + Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, "0")).join("");

        const { data, error } = await supabase.from("dmz_agents_projects").insert({
            id: slug,
            name: projectName,
            slug: slug,
            description: projectDesc || null,
            owner_id: user.id,
            api_key: apiKey,
            status: "setup",
            progress: 0,
        }).select().single();

        if (error) {
            alert(`Erro: ${error.message}`);
            setCreating(false);
            return;
        }

        setCreatedProject(data);
        setStep("agents");
        setCreating(false);
    }

    async function handleSaveAgents() {
        if (!createdProject || selectedAgents.length === 0) return;
        setCreating(true);

        const rows = selectedAgents.map(agentId => ({
            project_id: createdProject.id,
            agent_id: agentId,
            status: "active",
        }));

        await supabase.from("dmz_agents_project_agents").insert(rows);

        // Update project status to active
        await supabase.from("dmz_agents_projects").update({ status: "active" }).eq("id", createdProject.id);

        setStep("done");
        setCreating(false);
    }

    const CAT_COLORS: Record<string, string> = {
        Orchestration: "#E85D2F", Product: "#2563EB", Development: "#0891B2",
        Security: "#DC2626", Strategy: "#D97706", Design: "#DB2777",
        Copy: "#7C3AED", Frameworks: "#475569", Data: "#0369A1", Marketing: "#059669",
    };

    // ── Step: Done ──
    if (step === "done" && createdProject) {
        return (
            <div className="dmz-container pt-12 pb-24">
                <AppHeader />
                <div style={{ maxWidth: 560, margin: "40px auto", textAlign: "center" }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: "50%", background: "#10B98112",
                        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px"
                    }}>
                        <CheckCircle2 size={36} color="#10B981" />
                    </div>
                    <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#111827", marginBottom: "8px" }}>
                        Projeto Criado com Sucesso! 🚀
                    </h2>
                    <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "32px" }}>
                        {selectedAgents.length} agentes adicionados ao squad.
                        Use o slug e a API Key abaixo para conectar o projeto local.
                    </p>

                    {/* Credentials Card */}
                    <div style={{
                        background: "#1A1A1A", borderRadius: "14px", padding: "24px",
                        textAlign: "left", marginBottom: "24px",
                    }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Credenciais do Projeto
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "2px" }}>SLUG</div>
                                    <code style={{ fontSize: "13px", color: "#10B981", fontFamily: "monospace" }}>
                                        {createdProject.slug}
                                    </code>
                                </div>
                                <CopyButton text={createdProject.slug} />
                            </div>
                            <div style={{ height: 1, background: "#333" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "2px" }}>API KEY</div>
                                    <code style={{ fontSize: "13px", color: "#E85D2F", fontFamily: "monospace", wordBreak: "break-all" }}>
                                        {createdProject.api_key}
                                    </code>
                                </div>
                                <CopyButton text={createdProject.api_key} />
                            </div>
                        </div>
                    </div>

                    {/* .env.dmz snippet */}
                    <div style={{
                        background: "#1A1A1A", borderRadius: "14px", padding: "20px",
                        textAlign: "left", marginBottom: "24px", position: "relative",
                    }}>
                        <div style={{ position: "absolute", top: 12, right: 12 }}>
                            <CopyButton text={`DMZ_PROJECT_SLUG=${createdProject.slug}\nDMZ_API_KEY=${createdProject.api_key}`} />
                        </div>
                        <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "8px" }}>.env.dmz</div>
                        <pre style={{ margin: 0, fontSize: "12px", color: "#E5E7EB", fontFamily: "monospace", lineHeight: 1.8 }}>
{`DMZ_PROJECT_SLUG=${createdProject.slug}
DMZ_API_KEY=${createdProject.api_key}`}
                        </pre>
                    </div>

                    <button
                        onClick={onCreated}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            background: "linear-gradient(135deg, #E85D2F, #D14D22)",
                            color: "#FFFFFF", border: "none", borderRadius: "12px",
                            padding: "14px 32px", fontSize: "14px", fontWeight: 700,
                            cursor: "pointer", boxShadow: "0 2px 12px rgba(232,93,47,0.3)"
                        }}
                    >
                        Ir para o Board <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    }

    // ── Step: Select Agents ──
    if (step === "agents") {
        const categories = [...new Set(agents.map(a => a.category))];

        return (
            <div className="dmz-container pt-12 pb-24">
                <AppHeader />
                <button onClick={() => setStep("info")} style={{
                    background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "6px",
                    color: "#9CA3AF", fontSize: "13px", fontWeight: 500, marginBottom: "24px"
                }}>
                    ← Voltar
                </button>

                <div style={{ marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", marginBottom: "4px" }}>
                        Selecionar Agentes
                    </h2>
                    <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
                        Escolha os agentes para o squad do projeto <strong>{createdProject?.name}</strong>. Clique para selecionar.
                    </p>
                </div>

                <div style={{ columnCount: "auto", columnWidth: "340px", columnGap: "24px" }}>
                {categories.map(cat => {
                    const catAgents = agents.filter(a => a.category === cat);
                    const allSelected = catAgents.length > 0 && catAgents.every(a => selectedAgents.includes(a.id));

                    return (
                    <div key={cat} style={{ breakInside: "avoid", marginBottom: "24px" }}>
                        <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            marginBottom: "12px", paddingBottom: "8px", borderBottom: `2px solid ${(CAT_COLORS[cat] || "#6B7280")}15`
                        }}>
                            <span style={{
                                fontSize: "12px", fontWeight: 800, color: CAT_COLORS[cat] || "#6B7280",
                                textTransform: "uppercase", letterSpacing: "0.06em"
                            }}>{cat}</span>
                            <button 
                                onClick={() => {
                                    if (allSelected) {
                                        setSelectedAgents(prev => prev.filter(id => !catAgents.some(a => a.id === id)));
                                    } else {
                                        const newIds = catAgents.map(a => a.id).filter(id => !selectedAgents.includes(id));
                                        setSelectedAgents(prev => [...prev, ...newIds]);
                                    }
                                }}
                                style={{
                                    background: allSelected ? (CAT_COLORS[cat] || "#6B7280") + "15" : "transparent",
                                    border: `1px solid ${(CAT_COLORS[cat] || "#6B7280")}40`,
                                    borderRadius: "6px", cursor: "pointer", padding: "4px 8px",
                                    fontSize: "10px", fontWeight: 700, color: CAT_COLORS[cat] || "#6B7280",
                                    transition: "all 0.15s"
                                }}
                            >
                                {allSelected ? "Desmarcar Todos" : "Selecionar Todos"}
                            </button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {catAgents.map(agent => {
                                const cc = CAT_COLORS[agent.category] || "#475569";
                                const isSelected = selectedAgents.includes(agent.id);
                                return (
                                    <div
                                        key={agent.id}
                                        onClick={() => setSelectedAgents(prev => prev.includes(agent.id) ? prev.filter(a => a !== agent.id) : [...prev, agent.id])}
                                        style={{
                                            background: isSelected ? cc + "08" : "#FFFFFF",
                                            border: isSelected ? `1.5px solid ${cc}` : "1.5px solid #F0F0F0",
                                            borderRadius: "12px", padding: "12px", cursor: "pointer",
                                            transition: "all 0.15s", position: "relative",
                                        }}
                                    >
                                        {isSelected && (
                                            <div style={{
                                                position: "absolute", top: 8, right: 8,
                                                width: 18, height: 18, borderRadius: "50%",
                                                background: cc, display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>
                                                <Check size={10} color="#FFFFFF" />
                                            </div>
                                        )}
                                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                            <div style={{
                                                width: 34, height: 34, borderRadius: "8px",
                                                background: cc + "10", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                            }}>
                                                <Bot size={16} color={cc} strokeWidth={1.75} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "13px", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>
                                                    {agent.full_name || agent.name}
                                                </div>
                                                <div style={{ fontSize: "11px", color: cc, fontFamily: "monospace", fontWeight: 600, marginTop: "2px" }}>
                                                    @{agent.handle}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )})}
                </div>

                {/* Save bar */}
                <div style={{
                    position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
                    display: "flex", alignItems: "center", gap: "16px",
                    background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                    borderRadius: "16px", padding: "14px 24px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 40,
                }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#E85D2F" }}>
                        {selectedAgents.length}
                    </span>
                    <span style={{ fontSize: "13px", color: "#6B7280" }}>agentes selecionados</span>
                    <button
                        onClick={handleSaveAgents}
                        disabled={selectedAgents.length === 0 || creating}
                        style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            background: selectedAgents.length > 0 ? "linear-gradient(135deg, #E85D2F, #D14D22)" : "#F3F4F6",
                            color: selectedAgents.length > 0 ? "#FFFFFF" : "#9CA3AF",
                            border: "none", borderRadius: "10px", padding: "10px 24px",
                            fontSize: "13px", fontWeight: 700, cursor: selectedAgents.length > 0 ? "pointer" : "default",
                        }}
                    >
                        {creating ? "Criando..." : <>Finalizar <ArrowRight size={14} /></>}
                    </button>
                </div>
            </div>
        );
    }

    // ── Step: Info ──
    return (
        <div className="dmz-container pt-12 pb-24">
            <AppHeader />
            <button onClick={onBack} style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
                color: "#9CA3AF", fontSize: "13px", fontWeight: 500, marginBottom: "24px"
            }}>
                ← Voltar
            </button>

            <div style={{
                maxWidth: 520, margin: "0 auto",
                background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                borderRadius: "18px", padding: "36px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.05)"
            }}>
                <div style={{ marginBottom: "28px" }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: "14px",
                        background: "#E85D2F10", display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: "16px"
                    }}>
                        <FolderOpen size={24} color="#E85D2F" />
                    </div>
                    <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", marginBottom: "6px" }}>
                        Criar Novo Projeto
                    </h2>
                    <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
                        Defina o nome e slug. Em seguida, selecione os agentes do squad.
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                            Nome do Projeto *
                        </label>
                        <input
                            value={projectName}
                            onChange={e => { setProjectName(e.target.value); if (!projectSlug || projectSlug === slugify(projectName)) setProjectSlug(slugify(e.target.value)); }}
                            placeholder="Ex: Meu SaaS App"
                            style={{
                                width: "100%", background: "#F9FAFB", border: "1.5px solid #F0F0F0",
                                borderRadius: "10px", padding: "12px 14px", fontSize: "14px",
                                color: "#111827", outline: "none"
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                            Slug (URL do projeto)
                        </label>
                        <input
                            value={projectSlug}
                            onChange={e => setProjectSlug(slugify(e.target.value))}
                            placeholder="meu-saas-app"
                            style={{
                                width: "100%", background: "#F9FAFB", border: "1.5px solid #F0F0F0",
                                borderRadius: "10px", padding: "12px 14px", fontSize: "14px",
                                color: "#111827", fontFamily: "monospace", outline: "none"
                            }}
                        />
                        <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>
                            Identificador único do projeto. Gerado automaticamente a partir do nome.
                        </p>
                    </div>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                            Descrição (opcional)
                        </label>
                        <textarea
                            value={projectDesc}
                            onChange={e => setProjectDesc(e.target.value)}
                            placeholder="Breve descrição do projeto..."
                            rows={3}
                            style={{
                                width: "100%", background: "#F9FAFB", border: "1.5px solid #F0F0F0",
                                borderRadius: "10px", padding: "12px 14px", fontSize: "14px",
                                color: "#111827", outline: "none", resize: "vertical",
                            }}
                        />
                    </div>
                    <button
                        onClick={handleCreateProject}
                        disabled={!projectName.trim() || creating}
                        style={{
                            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            background: projectName.trim() ? "linear-gradient(135deg, #E85D2F, #D14D22)" : "#F3F4F6",
                            color: projectName.trim() ? "#FFFFFF" : "#9CA3AF",
                            border: "none", borderRadius: "12px", padding: "14px 0",
                            fontSize: "14px", fontWeight: 700, cursor: projectName.trim() ? "pointer" : "default",
                            transition: "all 0.2s"
                        }}
                    >
                        {creating ? "Criando..." : <>Próximo: Selecionar Agentes <ArrowRight size={16} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
}
