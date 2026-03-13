"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Terminal, Copy, Check, Download, GitBranch, Key } from "lucide-react";
import { supabase } from "@/lib/supabase";

function CopyBtn({ text, children }: { text: string; children?: React.ReactNode }) {
    const [copied, setCopied] = useState(false);
    return (
        <button 
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ 
                background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: "6px", 
                padding: children ? "6px 12px" : "6px", 
                color: copied ? "#10B981" : "#4B5563", 
                display: "flex", alignItems: "center", gap: "6px",
                fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s"
            }}
        >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {children}
        </button>
    );
}

export default function ProjectInstallView({ slug }: { slug: string }) {
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const { data } = await supabase.from("dmz_agents_projects").select("*").eq("slug", slug).single();
            if (data) setProject(data);
            setLoading(false);
        }
        load();
    }, [slug]);

    if (loading) {
        return <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}><div style={{ width: 32, height: 32, border: "3px solid #F3F4F6", borderTopColor: "#E85D2F", borderRadius: "50%", animation: "spin 1s linear infinite" }} /></div>;
    }

    if (!project) {
        return <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Projeto não encontrado.</div>;
    }

    return (
        <div style={{ maxWidth: "100%", margin: "0 auto", paddingBottom: "60px" }}>
            {/* Header Mínimo */}
            <div style={{ marginBottom: "24px" }}>
                <button onClick={() => router.push(`/app/projects?id=${slug}`)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "#9CA3AF", fontSize: "13px", fontWeight: 500, marginBottom: "16px" }}>
                    <ArrowLeft size={14} /> Voltar para o Board
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ background: "#F3F4F6", padding: "10px", borderRadius: "12px", color: "#4B5563" }}>
                        <Terminal size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>Conexão do Nó Local</h1>
                        <p style={{ fontSize: "14px", color: "#6B7280" }}>Instale o esquadrão no seu ambiente de desenvolvimento.</p>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Left Column: Instructions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#4B5563", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>1</span>
                            Instale o DMZ CLI
                        </h2>
                        <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px", lineHeight: 1.6 }}>Para que o seu squad de agentes funcione no seu código ele precisa rodar localmente no repositório do seu projeto. Execute o instalador globalmente:</p>
                        <div style={{ background: "#111827", borderRadius: "8px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <code style={{ color: "#E5E7EB", fontSize: "13px", fontFamily: "monospace" }}>pip install dmz-os</code>
                            <CopyBtn text="pip install dmz-os" />
                        </div>
                    </div>

                    <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#4B5563", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>2</span>
                            Faça o Bind do Projeto
                        </h2>
                        <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px", lineHeight: 1.6 }}>Dentro da pasta raiz do seu projeto local (novo ou existente), ative o squad. Ele vai criar a pasta <code style={{ background: "#F3F4F6", padding: "2px 6px", borderRadius: "4px" }}>.agents</code> e perguntar suas credenciais.</p>
                        <div style={{ background: "#111827", borderRadius: "8px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <code style={{ color: "#E5E7EB", fontSize: "13px", fontFamily: "monospace" }}>dmz-os install</code>
                            <CopyBtn text="dmz-os install" />
                        </div>
                    </div>

                    <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#E85D2F", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>3</span>
                            Dê vida ao Squad!
                        </h2>
                        <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px", lineHeight: 1.6 }}>Inicie o "motor" do DMZ-OS. Mantenha essa aba do terminal viva. A partir daqui ele lê este Board e se atualiza enquanto coda na sua máquina!</p>
                        <div style={{ background: "#111827", borderRadius: "8px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <code style={{ color: "#E5E7EB", fontSize: "13px", fontFamily: "monospace" }}>dmz-os start</code>
                            <CopyBtn text="dmz-os start" />
                        </div>
                    </div>
                </div>

                {/* Right Column: Credentials */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", borderRadius: "16px", padding: "24px" }}>
                        <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#111827", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Key size={16} color="#E85D2F" /> Suas Credenciais de Instalação
                        </h2>
                        <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>O comando <code style={{ color: "#111827", fontWeight: 600 }}>dmz-os install</code> vai pedir 2 dados cruciais para associar a versão local à nuvem:</p>

                        <div style={{ marginBottom: "16px" }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", marginBottom: "6px" }}>Project Slug</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FFFFFF", border: "1px solid #D1D5DB", padding: "10px 14px", borderRadius: "8px" }}>
                                <code style={{ fontSize: "14px", color: "#111827", fontFamily: "monospace", flex: 1, fontWeight: 600 }}>{project.slug}</code>
                                <CopyBtn text={project.slug}>Copiar</CopyBtn>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", marginBottom: "6px" }}>DMZ Security Key</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FFFFFF", border: "1px solid #D1D5DB", padding: "10px 14px", borderRadius: "8px" }}>
                                <code style={{ fontSize: "14px", color: "#111827", fontFamily: "monospace", flex: 1, fontWeight: 600 }}>{project.api_key || "Nenhuma gerada ainda"}</code>
                                <CopyBtn text={project.api_key || ""}>Copiar</CopyBtn>
                            </div>
                            {!project.api_key && (
                                <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "8px", fontWeight: 500 }}>
                                    Aviso: Vá até a "Configuração" do projeto para gerar sua chave DMZ_API_KEY. Sem ela o CLI não vai funcionar em modo seguro.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Pro-Tips */}
                    <div style={{ background: "#E85D2F0A", border: "1px solid #E85D2F20", borderRadius: "16px", padding: "20px" }}>
                        <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#D14D22", marginBottom: "10px" }}>💡 Como o DMZ OS funciona?</h3>
                        <ul style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.6, paddingLeft: "16px", margin: 0 }}>
                            <li style={{ marginBottom: "6px" }}>Nenhum código fonte do seu repositório local é sincronizado conosco.</li>
                            <li style={{ marginBottom: "6px" }}>Os grandes modelos (GPT, Claude) avaliam localmente as regras através da <code>.env.dmz</code> que o CLI gerencia.</li>
                            <li>A comunicação de status do Kanban é criptografada e trafega isoladamente sob a sua <strong>Security Key</strong>.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
