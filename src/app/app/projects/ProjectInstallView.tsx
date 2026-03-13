"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Terminal, Copy, Check, GitBranch, Key,
    Rocket, RefreshCw, FolderOpen, Package, Settings, ChevronRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <div style={{
            background: "#0F172A", borderRadius: "12px", padding: "16px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px",
            border: "1px solid rgba(255,255,255,0.06)"
        }}>
            <code style={{ color: "#7DD3FC", fontSize: "13px", fontFamily: "monospace", lineHeight: 1.6, flex: 1, whiteSpace: "pre-wrap" }}>
                {code}
            </code>
            <button
                onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{
                    background: copied ? "#10B98120" : "rgba(255,255,255,0.08)", border: "none",
                    borderRadius: "8px", padding: "6px 10px", cursor: "pointer",
                    color: copied ? "#10B981" : "#94A3B8", display: "flex", alignItems: "center",
                    gap: "5px", fontSize: "11px", fontWeight: 600, transition: "all 0.15s", flexShrink: 0
                }}
            >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copiado" : "Copiar"}
            </button>
        </div>
    );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "16px",
            padding: "24px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)"
        }}>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#111827", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: "linear-gradient(135deg, #E85D2F, #D14D22)",
                    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 800, flexShrink: 0
                }}>{number}</span>
                {title}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {children}
            </div>
        </div>
    );
}

function InfoText({ children }: { children: React.ReactNode }) {
    return <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.7, margin: 0 }}>{children}</p>;
}

// ── Scenario A: New Project ──────────────────────────────────────────────────
function NewProjectInstructions({ project }: { project: any }) {
    const envBlock = `DMZ_PROJECT_SLUG=${project.slug}\nDMZ_API_KEY=${project.api_key}`;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Step number={1} title="Clone o repositório dos agentes">
                <InfoText>
                    Primeiro, clone o repositório oficial do DMZ OS Agents. Este repositório contém o CLI e o motor de execução dos agentes.
                </InfoText>
                <CodeBlock code="git clone https://github.com/dmz-digital/dmz-agents.git" />
                <CodeBlock code="cd dmz-agents" />
            </Step>

            <Step number={2} title="Instale o DMZ CLI globalmente">
                <InfoText>
                    Instale o CLI que permite ao squad rodar no seu ambiente local e conectar com a plataforma.
                </InfoText>
                <CodeBlock code="pip install dmz-os" />
            </Step>

            <Step number={3} title="Crie seu arquivo de configuração .env.dmz">
                <InfoText>
                    Na raiz do <strong>seu novo projeto</strong>, crie o arquivo <code style={{ background: "#F3F4F6", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>.env.dmz</code> com as credenciais do projeto:
                </InfoText>
                <CodeBlock code={envBlock} />
            </Step>

            <Step number={4} title="Inicie o squad">
                <InfoText>
                    Com o CLI instalado e o arquivo configurado, inicie os agentes na raiz do seu projeto:
                </InfoText>
                <CodeBlock code="dmz start" />
            </Step>

            <Step number={5} title="Confirme a conexão">
                <InfoText>
                    Abra o painel no seu Board e verifique se os agentes aparecem com status Online. O squad está pronto para receber tarefas do @orch!
                </InfoText>
                <CodeBlock code="dmz status" />
            </Step>
        </div>
    );
}

// ── Scenario B: Existing Project ─────────────────────────────────────────────
function ExistingProjectInstructions({ project }: { project: any }) {
    const envBlock = `DMZ_PROJECT_SLUG=${project.slug}\nDMZ_API_KEY=${project.api_key}`;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Step number={1} title="Clone o repositório dos agentes (caso ainda não tenha)">
                <InfoText>
                    Se ainda não clonou o repositório do DMZ OS, este é o ponto de partida:
                </InfoText>
                <CodeBlock code="git clone https://github.com/dmz-digital/dmz-agents.git" />
            </Step>

            <Step number={2} title="Instale o DMZ CLI globalmente">
                <InfoText>
                    Se o CLI ainda não estiver instalado no seu ambiente, execute:
                </InfoText>
                <CodeBlock code="pip install dmz-os" />
            </Step>

            <Step number={3} title="Adicione o .env.dmz no seu projeto existente">
                <InfoText>
                    Navegue até a <strong>raiz do seu projeto atual</strong> e crie o arquivo <code style={{ background: "#F3F4F6", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>.env.dmz</code>. Não esqueça de adicioná-lo ao <code style={{ background: "#F3F4F6", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>.gitignore</code>!
                </InfoText>
                <CodeBlock code={envBlock} />
                <CodeBlock code={`# Adicione ao .gitignore:\necho ".env.dmz" >> .gitignore`} />
            </Step>

            <Step number={4} title="Sincronize o squad com o seu projeto">
                <InfoText>
                    No terminal, dentro do seu projeto existente, execute o comando de inicialização. Os agentes vão se conectar ao Board já existente:
                </InfoText>
                <CodeBlock code="dmz start --attach" />
            </Step>

            <Step number={5} title="Importe tarefas existentes (opcional)">
                <InfoText>
                    Se você tiver tarefas ou contexto do projeto que deseja alimentar ao squad, use:
                </InfoText>
                <CodeBlock code="dmz sync --context" />
            </Step>

            <Step number={6} title="Verifique a conexão">
                <InfoText>
                    Confirme que o squad está online e vinculado ao projeto correto:
                </InfoText>
                <CodeBlock code="dmz status" />
            </Step>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProjectInstallView({ slug }: { slug: string }) {
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scenario, setScenario] = useState<"new" | "existing" | null>(null);

    useEffect(() => {
        async function load() {
            const { data } = await supabase.from("dmz_agents_projects").select("*").eq("slug", slug).single();
            if (data) setProject(data);
            setLoading(false);
        }
        load();
    }, [slug]);

    if (loading) return (
        <div className="dmz-container pt-12 pb-24">
            <AppHeader />
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 36, height: 36, border: "3px solid #F3F4F6", borderTopColor: "#E85D2F", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    if (!project) return (
        <div className="dmz-container pt-12 pb-24">
            <AppHeader />
            <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>Projeto não encontrado.</div>
        </div>
    );

    return (
        <div className="dmz-container pt-12 pb-24">
            <AppHeader />

            {/* Back + Title */}
            <button
                onClick={() => router.push(`/app/projects?id=${slug}`)}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "#9CA3AF", fontSize: "13px", fontWeight: 500, marginBottom: "24px" }}
            >
                <ArrowLeft size={14} /> Voltar para o Board
            </button>

            <div style={{ marginBottom: "36px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "14px", background: "linear-gradient(135deg, #0F172A, #1E293B)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Terminal size={22} color="#7DD3FC" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", margin: 0 }}>
                            Instalação do Squad
                        </h1>
                        <p style={{ fontSize: "14px", color: "#9CA3AF", margin: "4px 0 0" }}>
                            Projeto: <code style={{ fontFamily: "monospace", color: "#E85D2F" }}>{project.slug}</code>
                        </p>
                    </div>
                </div>

                {/* Git Repo Info Box */}
                <div style={{
                    background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: "14px",
                    padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", marginTop: "20px"
                }}>
                    <GitBranch size={20} color="#16A34A" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "12px", fontWeight: 700, color: "#15803D", marginBottom: "4px" }}>Repositório do DMZ OS Agents</p>
                        <code style={{ fontSize: "13px", color: "#166534", fontFamily: "monospace" }}>
                            https://github.com/dmz-digital/dmz-agents.git
                        </code>
                    </div>
                    <button
                        onClick={() => navigator.clipboard.writeText("git clone https://github.com/dmz-digital/dmz-agents.git")}
                        style={{ background: "#16A34A10", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", color: "#16A34A", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}
                    >
                        <Copy size={12} /> git clone
                    </button>
                </div>
            </div>

            {/* Scenario Selector */}
            {!scenario && (
                <div>
                    <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", marginBottom: "6px" }}>
                        Como você quer instalar os agentes?
                    </h2>
                    <p style={{ fontSize: "14px", color: "#9CA3AF", marginBottom: "24px" }}>
                        Escolha o cenário que melhor descreve sua situação:
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: "720px" }}>
                        {/* Card A */}
                        <button
                            onClick={() => setScenario("new")}
                            style={{
                                background: "#FFFFFF", border: "2px solid #E5E7EB", borderRadius: "18px",
                                padding: "28px 24px", cursor: "pointer", textAlign: "left",
                                transition: "all 0.2s", boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E85D2F"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(232,93,47,0.12)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}
                        >
                            <div style={{ width: 44, height: 44, borderRadius: "12px", background: "linear-gradient(135deg, #DBEAFE, #BFDBFE)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                                <Rocket size={22} color="#2563EB" />
                            </div>
                            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#111827", marginBottom: "6px" }}>
                                Projeto novo
                            </h3>
                            <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6 }}>
                                Estou começando um projeto do zero e quero instalar o squad desde o início.
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "16px", color: "#2563EB", fontSize: "12px", fontWeight: 700 }}>
                                Ver instruções <ChevronRight size={14} />
                            </div>
                        </button>

                        {/* Card B */}
                        <button
                            onClick={() => setScenario("existing")}
                            style={{
                                background: "#FFFFFF", border: "2px solid #E5E7EB", borderRadius: "18px",
                                padding: "28px 24px", cursor: "pointer", textAlign: "left",
                                transition: "all 0.2s", boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E85D2F"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(232,93,47,0.12)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}
                        >
                            <div style={{ width: 44, height: 44, borderRadius: "12px", background: "linear-gradient(135deg, #F0FDF4, #DCFCE7)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                                <RefreshCw size={22} color="#16A34A" />
                            </div>
                            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#111827", marginBottom: "6px" }}>
                                Projeto existente
                            </h3>
                            <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6 }}>
                                Já tenho um projeto em andamento e quero integrar o squad ao fluxo atual.
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "16px", color: "#16A34A", fontSize: "12px", fontWeight: 700 }}>
                                Ver instruções <ChevronRight size={14} />
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Instructions for chosen scenario */}
            {scenario && (
                <div>
                    {/* Scenario Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                        <button
                            onClick={() => setScenario(null)}
                            style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280" }}
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: "10px",
                                background: scenario === "new" ? "linear-gradient(135deg, #DBEAFE, #BFDBFE)" : "linear-gradient(135deg, #F0FDF4, #DCFCE7)",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                {scenario === "new" ? <Rocket size={18} color="#2563EB" /> : <RefreshCw size={18} color="#16A34A" />}
                            </div>
                            <div>
                                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", margin: 0 }}>
                                    {scenario === "new" ? "Instalando em novo projeto" : "Integrando em projeto existente"}
                                </h2>
                                <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "2px 0 0" }}>
                                    {scenario === "new" ? "Siga os passos abaixo para conectar seu squad do zero" : "Siga os passos para integrar o squad sem interromper o fluxo atual"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ maxWidth: "680px" }}>
                        {scenario === "new"
                            ? <NewProjectInstructions project={project} />
                            : <ExistingProjectInstructions project={project} />
                        }
                    </div>

                    {/* Credentials summary */}
                    <div style={{
                        marginTop: "32px", background: "#FFFBF5", border: "1.5px solid #FED7AA",
                        borderRadius: "14px", padding: "20px 24px", maxWidth: "680px"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                            <Key size={16} color="#D97706" />
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#92400E" }}>Credenciais do Projeto</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "12px", color: "#92400E", fontWeight: 600 }}>Project Slug:</span>
                                <code style={{ fontSize: "12px", fontFamily: "monospace", color: "#B45309" }}>{project.slug}</code>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "12px", color: "#92400E", fontWeight: 600 }}>API Key:</span>
                                <code style={{ fontSize: "12px", fontFamily: "monospace", color: "#B45309" }}>{project.api_key?.slice(0, 12)}••••••••</code>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
