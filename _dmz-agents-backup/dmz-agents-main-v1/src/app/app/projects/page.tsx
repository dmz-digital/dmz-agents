"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Bot, Users, FolderOpen, Plus, ArrowRight, ArrowLeft,
    Download, GitBranch, Terminal, FileText, ClipboardList,
    Clock, ListChecks, BookOpen, BarChart2, CheckCircle2,
    Search, Activity, ExternalLink, Music2, Code2,
    ClipboardList as Clipboard, Target, CheckSquare, Zap, Rocket,
    Building2, ShieldAlert, Scale, Sparkles, Paintbrush,
    PenLine, Brain, FlaskConical, Copy, Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";

// ── Icon map ────────────────────────────────────────────────────────────────
const AGENT_ICONS: Record<string, any> = {
    Music2, Users, Code2, ClipboardList: Clipboard, Target, CheckSquare,
    Zap, Rocket, Building2, ShieldAlert, Scale, Search,
    Sparkles, Paintbrush, PenLine, BookOpen, Brain, FlaskConical, Bot
};

const CAT_COLORS: Record<string, string> = {
    Orchestration: "#E85D2F", Product: "#2563EB", Development: "#0891B2",
    Security: "#DC2626", Strategy: "#D97706", Design: "#DB2777",
    Copy: "#7C3AED", Frameworks: "#475569", Data: "#0369A1", Marketing: "#059669",
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
    const c: Record<string, string> = { active: "#10B981", inactive: "#D1D5DB" };
    const col = c[status] || "#D1D5DB";
    return (
        <span style={{
            display: "inline-block", width: 7, height: 7, borderRadius: "50%",
            background: col, boxShadow: status === "active" ? `0 0 0 2px ${col}30` : "none"
        }} />
    );
}

// ── Copy to clipboard button ─────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{
                background: "none", border: "none", cursor: "pointer", padding: "4px",
                color: copied ? "#10B981" : "#9CA3AF", display: "flex", alignItems: "center"
            }}
            title="Copy"
        >
            {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
    );
}

// ── Code block ──────────────────────────────────────────────────────────────
function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
    return (
        <div style={{
            background: "#1A1A1A", borderRadius: "10px", padding: "12px 14px",
            position: "relative", fontFamily: "monospace", fontSize: "12px",
            color: "#E5E7EB", lineHeight: 1.8, overflowX: "auto"
        }}>
            <div style={{ position: "absolute", top: 8, right: 8 }}>
                <CopyButton text={code} />
            </div>
            <div style={{ position: "absolute", top: 8, left: 14, fontSize: "10px", color: "#6B7280" }}>{lang}</div>
            <pre style={{ margin: 0, marginTop: "16px", whiteSpace: "pre-wrap" }}>{code}</pre>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: THREE LANDING CARDS
// ═══════════════════════════════════════════════════════════════════════════════
function LandingCards({
    onGoTo,
    projectCount
}: {
    onGoTo: (v: string) => void;
    projectCount: number;
}) {
    const cards = [
        {
            id: "select",
            icon: Users,
            color: "#E85D2F",
            title: "Selecionar Agentes",
            desc: "Escolha os agentes do squad para seu projeto",
            cta: "Começar projeto",
        },
        {
            id: "install",
            icon: Terminal,
            color: "#0891B2",
            title: "Como Instalar",
            desc: "Guia completo de instalação em projetos novos ou existentes",
            cta: "Ver guia",
        },
        {
            id: "history",
            icon: BarChart2,
            color: "#7C3AED",
            title: "Histórico de Trabalho",
            desc: `Acompanhe o progresso das tarefas dos agentes`,
            cta: projectCount > 0 ? "Ver histórico" : "Nenhum projeto",
            disabled: projectCount === 0,
        },
    ];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {cards.map(card => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.id}
                        onClick={() => !card.disabled && onGoTo(card.id)}
                        style={{
                            background: "#FFFFFF",
                            border: "1.5px solid #F0F0F0",
                            borderRadius: "16px",
                            padding: "28px 24px",
                            cursor: card.disabled ? "default" : "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                            opacity: card.disabled ? 0.5 : 1,
                            display: "flex",
                            flexDirection: "column" as const,
                            gap: "16px",
                        }}
                    >
                        <div style={{
                            width: 48, height: 48, borderRadius: "14px",
                            background: card.color + "10", border: `1px solid ${card.color}18`,
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <Icon size={22} color={card.color} strokeWidth={1.75} />
                        </div>
                        <div>
                            <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>
                                {card.title}
                            </div>
                            <div style={{ fontSize: "13px", color: "#9CA3AF", lineHeight: 1.5 }}>
                                {card.desc}
                            </div>
                        </div>
                        <div
                            style={{
                                marginTop: "auto",
                                display: "flex", alignItems: "center", gap: "6px",
                                color: card.disabled ? "#D1D5DB" : card.color,
                                fontSize: "13px", fontWeight: 600
                            }}
                        >
                            {card.cta} {!card.disabled && <ArrowRight size={14} />}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: CREATE PROJECT + SELECT AGENTS
// ═══════════════════════════════════════════════════════════════════════════════
function CreateProjectView({ preSelectedAgent, onBack }: { preSelectedAgent?: string; onBack: () => void }) {
    const router = useRouter();
    const [step, setStep] = useState<"info" | "agents">(preSelectedAgent ? "agents" : "info");
    const [projectName, setProjectName] = useState("");
    const [projectSlug, setProjectSlug] = useState("");
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgents, setSelectedAgents] = useState<string[]>(preSelectedAgent ? [preSelectedAgent] : []);
    const [creating, setCreating] = useState(false);
    const [created, setCreated] = useState(false);
    const [projectId, setProjectId] = useState("");

    useEffect(() => {
        supabase.from("dmz_agents_definitions").select("*").order("active", { ascending: false })
            .then(({ data }) => { if (data) setAgents(data); });
    }, []);

    function slugify(text: string) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    async function handleCreate() {
        if (!projectName.trim() || !projectSlug.trim()) return;
        setCreating(true);

        const slug = slugify(projectSlug);
        const { error } = await supabase.from("dmz_agents_projects").insert({
            id: slug,
            name: projectName,
            slug: slug,
            status: "setup",
            progress: 0,
        });

        if (error) {
            alert(`Erro: ${error.message}`);
            setCreating(false);
            return;
        }

        setProjectId(slug);
        setStep("agents");
        setCreating(false);
    }

    async function handleSaveAgents() {
        if (selectedAgents.length === 0) return;
        setCreating(true);

        // If we skipped info step (pre-selected agent), create project first
        let pid = projectId;
        if (!pid) {
            const autoName = `Meu Projeto`;
            const autoSlug = `projeto-${Date.now()}`;
            const { error } = await supabase.from("dmz_agents_projects").insert({
                id: autoSlug, name: autoName, slug: autoSlug, status: "setup", progress: 0,
            });
            if (error) { alert(error.message); setCreating(false); return; }
            pid = autoSlug;
            setProjectId(pid);
        }

        const rows = selectedAgents.map(agentId => ({ project_id: pid, agent_id: agentId }));
        await supabase.from("dmz_agents_project_agents").insert(rows);

        setCreated(true);
        setCreating(false);
    }

    function toggleAgent(id: string) {
        setSelectedAgents(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    }

    // ── Step 1: Project Info ──
    if (step === "info") {
        return (
            <div>
                <button onClick={onBack} style={{
                    background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "6px",
                    color: "#9CA3AF", fontSize: "13px", fontWeight: 500, marginBottom: "24px"
                }}>
                    <ArrowLeft size={14} /> Voltar
                </button>

                <div style={{
                    maxWidth: 520, margin: "0 auto",
                    background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                    borderRadius: "16px", padding: "32px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
                }}>
                    <div style={{ marginBottom: "24px" }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: "14px",
                            background: "#E85D2F10", display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: "16px"
                        }}>
                            <FolderOpen size={22} color="#E85D2F" />
                        </div>
                        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", marginBottom: "4px" }}>
                            Criar Novo Projeto
                        </h2>
                        <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
                            Defina o nome e slug do seu projeto. Em seguida, selecione os agentes.
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                                Nome do Projeto
                            </label>
                            <input
                                value={projectName}
                                onChange={e => { setProjectName(e.target.value); if (!projectSlug || projectSlug === slugify(projectName)) setProjectSlug(slugify(e.target.value)); }}
                                placeholder="Ex: Meu SaaS App"
                                style={{
                                    width: "100%", background: "#F9FAFB", border: "1.5px solid #F0F0F0",
                                    borderRadius: "10px", padding: "10px 14px", fontSize: "14px",
                                    color: "#111827", outline: "none"
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                                Slug
                            </label>
                            <input
                                value={projectSlug}
                                onChange={e => setProjectSlug(slugify(e.target.value))}
                                placeholder="meu-saas-app"
                                style={{
                                    width: "100%", background: "#F9FAFB", border: "1.5px solid #F0F0F0",
                                    borderRadius: "10px", padding: "10px 14px", fontSize: "14px",
                                    color: "#111827", fontFamily: "monospace", outline: "none"
                                }}
                            />
                            <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>
                                URL-safe, gerado automaticamente do nome
                            </p>
                        </div>
                        <button
                            onClick={handleCreate}
                            disabled={!projectName.trim() || !projectSlug.trim() || creating}
                            style={{
                                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                background: projectName.trim() ? "linear-gradient(135deg, #E85D2F, #D14D22)" : "#F3F4F6",
                                color: projectName.trim() ? "#FFFFFF" : "#9CA3AF",
                                border: "none", borderRadius: "10px", padding: "12px 0",
                                fontSize: "14px", fontWeight: 700, cursor: projectName.trim() ? "pointer" : "default",
                                transition: "all 0.15s"
                            }}
                        >
                            {creating ? "Criando..." : <>Próximo: Selecionar Agentes <ArrowRight size={15} /></>}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Step 2: Select Agents ──
    if (created) {
        return (
            <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center", padding: "60px 0" }}>
                <div style={{
                    width: 64, height: 64, borderRadius: "50%", background: "#10B98112",
                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
                }}>
                    <CheckCircle2 size={32} color="#10B981" />
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", marginBottom: "8px" }}>
                    Projeto Criado!
                </h2>
                <p style={{ fontSize: "14px", color: "#9CA3AF", marginBottom: "24px" }}>
                    {selectedAgents.length} agentes adicionados ao projeto. Agora siga o guia de instalação.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: "#F3F4F6", border: "none", borderRadius: "10px",
                            padding: "10px 20px", fontSize: "13px", fontWeight: 600,
                            color: "#6B7280", cursor: "pointer"
                        }}
                    >
                        Voltar ao início
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <button onClick={projectId ? () => setStep("info") : onBack} style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
                color: "#9CA3AF", fontSize: "13px", fontWeight: 500, marginBottom: "24px"
            }}>
                <ArrowLeft size={14} /> Voltar
            </button>

            <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", marginBottom: "4px" }}>
                    Selecionar Agentes
                </h2>
                <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
                    Escolha os agentes que deseja no seu squad. Clique para selecionar.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
                {agents.map(agent => {
                    const cc = CAT_COLORS[agent.category] || "#475569";
                    const isSelected = selectedAgents.includes(agent.id);
                    const IconComp = AGENT_ICONS[agent.icon] || Bot;
                    return (
                        <div
                            key={agent.id}
                            onClick={() => toggleAgent(agent.id)}
                            style={{
                                background: isSelected ? cc + "08" : "#FFFFFF",
                                border: isSelected ? `1.5px solid ${cc}` : "1.5px solid #F0F0F0",
                                borderRadius: "14px", padding: "16px", cursor: "pointer",
                                transition: "all 0.15s", position: "relative" as const,
                            }}
                        >
                            {isSelected && (
                                <div style={{
                                    position: "absolute", top: 10, right: 10,
                                    width: 20, height: 20, borderRadius: "50%",
                                    background: cc, display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <Check size={12} color="#FFFFFF" />
                                </div>
                            )}
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: "10px",
                                    background: cc + "10", display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <IconComp size={17} color={cc} strokeWidth={1.75} />
                                </div>
                                <div>
                                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                                        {agent.full_name || agent.name}
                                    </div>
                                    <div style={{ fontSize: "11px", color: cc, fontFamily: "monospace", fontWeight: 600 }}>
                                        @{agent.handle}
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: "8px" }}>
                                <Tag color={cc}>{agent.category}</Tag>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                borderRadius: "14px", padding: "16px 20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
            }}>
                <div>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                        {selectedAgents.length}
                    </span>
                    <span style={{ fontSize: "13px", color: "#9CA3AF", marginLeft: "6px" }}>
                        agentes selecionados
                    </span>
                </div>
                <button
                    onClick={handleSaveAgents}
                    disabled={selectedAgents.length === 0 || creating}
                    style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: selectedAgents.length > 0 ? "linear-gradient(135deg, #E85D2F, #D14D22)" : "#F3F4F6",
                        color: selectedAgents.length > 0 ? "#FFFFFF" : "#9CA3AF",
                        border: "none", borderRadius: "10px", padding: "10px 24px",
                        fontSize: "13px", fontWeight: 700, cursor: selectedAgents.length > 0 ? "pointer" : "default",
                        transition: "all 0.15s"
                    }}
                >
                    {creating ? "Salvando..." : <>Criar Projeto <ArrowRight size={14} /></>}
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: INSTALLATION GUIDE
// ═══════════════════════════════════════════════════════════════════════════════
function InstallGuide({ onBack }: { onBack: () => void }) {
    const [section, setSection] = useState<"zero" | "existing">("zero");
    const [envKeys, setEnvKeys] = useState<any[]>([]);

    useEffect(() => {
        supabase.from("dmz_agents_env_keys").select("*").order("sort_order")
            .then(({ data }) => { if (data) setEnvKeys(data); });
    }, []);

    const categories = [...new Set(envKeys.map(k => k.category))];

    return (
        <div>
            <button onClick={onBack} style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
                color: "#9CA3AF", fontSize: "13px", fontWeight: 500, marginBottom: "24px"
            }}>
                <ArrowLeft size={14} /> Voltar
            </button>

            <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", marginBottom: "4px" }}>
                    Como Instalar os Agentes
                </h2>
                <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
                    Siga o passo a passo para integrar o squad no seu projeto.
                </p>
            </div>

            {/* Section toggle */}
            <div style={{ display: "flex", gap: "2px", background: "#F3F4F6", borderRadius: "10px", padding: "3px", marginBottom: "24px", maxWidth: 400 }}>
                {([
                    { id: "zero" as const, label: "Projeto do Zero" },
                    { id: "existing" as const, label: "Projeto em Andamento" },
                ]).map(s => (
                    <button key={s.id} onClick={() => setSection(s.id)} style={{
                        flex: 1, background: section === s.id ? "#FFFFFF" : "none", border: "none",
                        borderRadius: "8px", padding: "8px 0", cursor: "pointer",
                        fontSize: "12px", fontWeight: section === s.id ? 700 : 500,
                        color: section === s.id ? "#111827" : "#9CA3AF",
                        boxShadow: section === s.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}>
                        {s.label}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Step-by-step */}
                {section === "zero" ? (
                    <>
                        <StepCard num={1} title="Clone o repositório base">
                            <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, margin: "0 0 10px" }}>
                                Faça o clone do template oficial do DMZ Agents que já vem com a estrutura de pastas,
                                configuração de orquestração e prompts base.
                            </p>
                            <CodeBlock code="git clone https://github.com/dmz-agents/squad-template.git meu-projeto\ncd meu-projeto" />
                        </StepCard>
                        <StepCard num={2} title="Instale as dependências">
                            <CodeBlock code="pip install -r requirements.txt" lang="bash" />
                        </StepCard>
                        <StepCard num={3} title="Configure o .env.dmz">
                            <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, margin: "0 0 10px" }}>
                                Copie o template e preencha com suas credenciais:
                            </p>
                            <CodeBlock code="cp .env.dmz.example .env.dmz" />
                        </StepCard>
                        <StepCard num={4} title="Conecte a orquestração">
                            <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, margin: "0 0 10px" }}>
                                Inicialize a conexão entre agentes, registre tools e habilite o report hierárquico:
                            </p>
                            <CodeBlock code="python -m dmz_agents connect --project meu-projeto" />
                        </StepCard>
                        <StepCard num={5} title="Inicie o squad">
                            <CodeBlock code="python -m dmz_agents start" />
                        </StepCard>
                    </>
                ) : (
                    <>
                        <StepCard num={1} title="Baixe o pacote de integração">
                            <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, margin: "0 0 10px" }}>
                                Faça download do ZIP com a pasta <code style={{
                                    background: "#F3F4F6", padding: "1px 6px", borderRadius: "4px", fontSize: "12px"
                                }}>.agents/</code> e salve no root do seu projeto.
                            </p>
                            <a href="https://github.com/dmz-agents/squad-template/archive/refs/heads/main.zip"
                                target="_blank" rel="noreferrer"
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: "6px",
                                    background: "#111827", color: "#FFFFFF", borderRadius: "8px",
                                    padding: "8px 16px", fontSize: "12px", fontWeight: 600,
                                    textDecoration: "none", marginBottom: "10px"
                                }}
                            >
                                <Download size={14} /> Download ZIP
                            </a>
                        </StepCard>
                        <StepCard num={2} title="Extraia a pasta .agents/ no root">
                            <CodeBlock code="unzip squad-template-main.zip -d temp\ncp -r temp/.agents/ ./\nrm -rf temp" />
                        </StepCard>
                        <StepCard num={3} title="Instale as dependências">
                            <CodeBlock code="pip install -r .agents/requirements.txt" />
                        </StepCard>
                        <StepCard num={4} title="Configure o .env.dmz">
                            <CodeBlock code="cp .agents/.env.dmz.example .env.dmz" />
                        </StepCard>
                        <StepCard num={5} title="Conecte e sincronize">
                            <CodeBlock code="python -m dmz_agents connect --project meu-projeto\npython -m dmz_agents sync" />
                        </StepCard>
                    </>
                )}

                {/* ENV KEYS Reference */}
                <div style={{
                    background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                    borderRadius: "16px", padding: "24px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <FileText size={16} color="#E85D2F" />
                        <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                            Referência de Credenciais (.env.dmz)
                        </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "16px", lineHeight: 1.5 }}>
                        Todas as chaves suportadas. Clique nos links para obter suas credenciais.
                    </p>

                    {categories.map(cat => (
                        <div key={cat} style={{ marginBottom: "16px" }}>
                            <div style={{
                                fontSize: "11px", fontWeight: 700, color: "#9CA3AF",
                                textTransform: "uppercase", letterSpacing: "0.06em",
                                marginBottom: "8px", paddingBottom: "6px",
                                borderBottom: "1px solid #F0F0F0"
                            }}>{cat}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                {envKeys.filter(k => k.category === cat).map(k => (
                                    <div key={k.id} style={{
                                        display: "flex", alignItems: "center", gap: "10px",
                                        padding: "6px 10px", borderRadius: "8px",
                                        background: "#F9FAFB"
                                    }}>
                                        <code style={{ fontSize: "11.5px", fontWeight: 600, color: "#374151", fontFamily: "monospace", minWidth: 220 }}>
                                            {k.env_var}
                                        </code>
                                        <span style={{ fontSize: "11px", color: "#9CA3AF", flex: 1 }}>
                                            {k.description}
                                        </span>
                                        {k.required && <Tag color="#E85D2F">required</Tag>}
                                        {k.docs_url && (
                                            <a href={k.docs_url} target="_blank" rel="noreferrer"
                                                style={{ color: "#9CA3AF", display: "flex" }}>
                                                <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StepCard({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: "#FFFFFF", border: "1.5px solid #F0F0F0",
            borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "#E85D2F12", color: "#E85D2F",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 800, flexShrink: 0
                }}>
                    {num}
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{title}</span>
            </div>
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: WORK HISTORY (placeholder — per-project later)
// ═══════════════════════════════════════════════════════════════════════════════
function WorkHistory({ onBack }: { onBack: () => void }) {
    const [tab, setTab] = useState<"master_plan" | "task_checklist" | "on_going" | "backlog" | "consolidated">("master_plan");
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        supabase.from("dmz_agents_projects").select("*").order("created_at", { ascending: false })
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setProjects(data);
                    // Prefer 'active' project, fall back to most recent
                    const active = data.find((p: any) => p.status === "active");
                    setSelectedProject(active || data[0]);
                }
            });
    }, []);

    useEffect(() => {
        if (!selectedProject) return;
        supabase.from("dmz_agents_tasks").select("*").eq("project_id", selectedProject.id).order("created_at", { ascending: false })
            .then(({ data }) => setTasks(data || []));
    }, [selectedProject]);

    const tabs = [
        { id: "master_plan" as const, label: "Master Plan", icon: BookOpen },
        { id: "task_checklist" as const, label: "Tasks Checklist", icon: ListChecks },
        { id: "on_going" as const, label: "On Going", icon: Activity },
        { id: "backlog" as const, label: "Backlog", icon: Clock },
        { id: "consolidated" as const, label: "Consolidado", icon: BarChart2 },
    ];

    const filteredTasks = tab === "consolidated" ? tasks : tasks.filter(t => t.type === tab);

    const statusColors: Record<string, string> = {
        pending: "#D97706", in_progress: "#2563EB", completed: "#10B981", blocked: "#EF4444", cancelled: "#9CA3AF"
    };

    return (
        <div>
            <button onClick={onBack} style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
                color: "#9CA3AF", fontSize: "13px", fontWeight: 500, marginBottom: "24px"
            }}>
                <ArrowLeft size={14} /> Voltar
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111827" }}>Histórico de Trabalho</h2>
                    <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Acompanhe o progresso das tarefas dos agentes</p>
                </div>
                {projects.length > 1 && (
                    <select
                        value={selectedProject?.id || ""}
                        onChange={e => setSelectedProject(projects.find(p => p.id === e.target.value))}
                        style={{
                            background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                            borderRadius: "9px", padding: "8px 12px",
                            fontSize: "12px", color: "#374151", outline: "none"
                        }}
                    >
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "2px", background: "#F3F4F6", borderRadius: "10px", padding: "3px", marginBottom: "20px" }}>
                {tabs.map(t => {
                    const Icon = t.icon;
                    return (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                            background: tab === t.id ? "#FFFFFF" : "none", border: "none",
                            borderRadius: "8px", padding: "8px 0", cursor: "pointer",
                            fontSize: "11px", fontWeight: tab === t.id ? 700 : 500,
                            color: tab === t.id ? "#111827" : "#9CA3AF",
                            boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                        }}>
                            <Icon size={12} /> {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Tasks list */}
            {filteredTasks.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "48px",
                    background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                    borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                }}>
                    <Clock size={32} color="#D1D5DB" style={{ margin: "0 auto 12px" }} />
                    <p style={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }}>
                        Nenhuma tarefa registrada nesta categoria.
                    </p>
                    <p style={{ fontSize: "12px", color: "#D1D5DB" }}>
                        As tarefas aparecerão aqui conforme os agentes trabalharem no projeto.
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {filteredTasks.map(task => (
                        <div key={task.id} style={{
                            background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                            borderRadius: "12px", padding: "14px 18px",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                <Tag color={statusColors[task.status] || "#9CA3AF"}>{task.status}</Tag>
                                <span style={{ fontSize: "10px", color: "#D1D5DB", fontFamily: "monospace" }}>
                                    {new Date(task.created_at).toLocaleDateString()}
                                </span>
                                {task.agent_id && (
                                    <span style={{ fontSize: "10px", color: "#E85D2F", fontWeight: 600, fontFamily: "monospace" }}>
                                        @{task.agent_id}
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{task.title}</div>
                            {task.description && (
                                <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6, margin: "4px 0 0" }}>
                                    {task.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE with Suspense wrapper
// ═══════════════════════════════════════════════════════════════════════════════
function ProjectsPageContent() {
    const searchParams = useSearchParams();
    const addAgent = searchParams.get("add");
    const viewParam = searchParams.get("view");
    const [view, setView] = useState<"landing" | "select" | "install" | "history">("landing");

    useEffect(() => {
        if (addAgent || viewParam === "select") {
            setView("select");
        } else if (viewParam === "landing") {
            setView("landing");
        }
    }, [addAgent, viewParam]);

    const [projectCount, setProjectCount] = useState(0);

    useEffect(() => {
        supabase.from("dmz_agents_projects").select("id", { count: "exact", head: true })
            .then(({ count }) => setProjectCount(count || 0));
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
            <AppHeader />

            {view === "landing" && (
                <LandingCards onGoTo={setView as any} projectCount={projectCount} />
            )}

            {view === "select" && (
                <CreateProjectView
                    preSelectedAgent={addAgent || undefined}
                    onBack={() => setView("landing")}
                />
            )}

            {view === "install" && (
                <InstallGuide onBack={() => setView("landing")} />
            )}

            {view === "history" && (
                <WorkHistory onBack={() => setView("landing")} />
            )}
        </div>
    );
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={
            <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
                <div style={{ height: 200 }} />
            </div>
        }>
            <ProjectsPageContent />
        </Suspense>
    );
}
