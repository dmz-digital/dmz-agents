"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Bot, Rocket, Shield, Zap, Music2, Users, Code2,
    ArrowRight, CheckCircle2, Globe, Star, PlayCircle,
    ClipboardList, Target, CheckSquare, ShieldAlert, Building2,
    Scale, Search, Sparkles, Paintbrush, PenLine,
    BookOpen, Brain, FlaskConical, Cpu, Activity,
    Layers, Blocks, Wrench, X, Terminal, Check
} from "lucide-react";
import { Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
    Sales: "#10B981",
    Orchestration: "#E85D2F",
    Product: "#2563EB",
    Development: "#0891B2",
    Security: "#DC2626",
    Strategy: "#D97706",
    Design: "#DB2777",
    Copy: "#7C3AED",
    Frameworks: "#475569",
    Data: "#0369A1",
};

const AGENT_ICONS: Record<string, any> = {
    orchestrator: Music2,
    squad_manager: Users,
    pm: ClipboardList,
    po: Target,
    qa: CheckSquare,
    sm: Zap,
    developer: Code2,
    devops: Rocket,
    architect: Building2,
    cyber_chief: ShieldAlert,
    legal_chief: Scale,
    analyst: Search,
    design_chief: Sparkles,
    ux: Paintbrush,
    copy_chief: PenLine,
    sop_extractor: BookOpen,
    db_sage: Brain,
    tools_orchestrator: FlaskConical,
};

// Simplified Building2 mock since it might not be in the current lucide-react version or just to be safe
const Building2Icon = (props: any) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
    </svg>
);

const AGENTS = [
    {
        id: "orchestrator", handle: "orch", name: "ORCH", fullName: "Orchestrator Master",
        category: "Orchestration", color: "#E85D2F", active: true,
        level: "L0", role: "Maestro de coordenação do squad",
        mission: "Recebe demandas, interpreta, decompõe e delega para os agentes corretos — na sequência certa, com o contexto certo. Não executa. Dirige.",
        skills: ["Decomposição de demandas", "Seleção de agentes", "Paralelização de fluxos", "Síntese de outputs", "Detecção de bloqueios", "Comunicação executiva"],
        tools: [{ name: "task_dispatcher", desc: "Despacha tarefas estruturadas para agentes" }, { name: "execution_tracker", desc: "Registra e monitora status de execução" }],
        protocols: ["Análise → Plano → Delegação → Integração"],
        connects: ["squad_manager", "pm", "po", "kanya", "ryan", "emma", "constantine", "alex", "oliver"],
    },
    {
        id: "squad_manager", handle: "syd", name: "Syd", fullName: "Squad Manager",
        category: "Orchestration", color: "#7C3AED", active: true,
        level: "L1", role: "Gestão de pessoas e saúde do squad",
        mission: "Garante que o squad funciona como organismo saudável: pessoas certas, nas tarefas certas, com clareza de papéis e energia para entregar.",
        skills: ["Mapeamento de capacidade", "Detecção de conflitos de papel", "Onboarding de agentes", "Diagnóstico de saúde", "Facilitação de alinhamentos", "Identificação de gaps"],
        tools: [{ name: "squad_roster", desc: "Registro vivo de status e carga dos agentes" }, { name: "squad_log", desc: "Histórico de decisões e aprendizados do squad" }],
        protocols: ["Snapshot → Alertas → Recomendações → Ações"],
        connects: ["orchestrator", "pm", "david"],
    },
    {
        id: "pm", handle: "jose", name: "Jose", fullName: "Project Manager",
        category: "Product", color: "#2563EB", active: true,
        level: "L1", role: "Gestão de projetos e entregas",
        mission: "Transforma objetivos em planos executáveis e garante que esses planos se tornam realidade — dentro do prazo, do escopo e com a qualidade esperada.",
        skills: ["Planejamento de escopo e cronograma", "Gestão de riscos SaaS", "Controle de escopo", "Replanejamento ágil", "Comunicação executiva de status", "Alocação de agentes"],
        tools: [{ name: "project_planner", desc: "Planos com marcos, entregas e cronograma" }, { name: "risk_register", desc: "Registro e monitoramento de riscos" }],
        protocols: ["Project Brief → Marcos → Riscos → Status Report"],
        connects: ["orchestrator", "squad_manager", "po", "emma", "oliver"],
    },
    {
        id: "po", handle: "lucas", name: "Lucas", fullName: "Product Owner",
        category: "Product", color: "#2563EB", active: true,
        level: "L1", role: "Visão e priorização de produto",
        mission: "Guardião da visão de produto. Decide o que será construído, em qual ordem e por quê. Representa o usuário dentro do squad e transforma necessidades reais em backlog executável.",
        skills: ["User stories e critérios de aceite", "Priorização RICE/MoSCoW", "Visão e roadmap", "Refinamento de backlog", "Validação de entregas", "Product Discovery", "Métricas de produto"],
        tools: [{ name: "backlog_manager", desc: "Backlog com score de priorização e aceite" }, { name: "product_metrics_tracker", desc: "Métricas para validar hipóteses de produto" }],
        protocols: ["Story → Critérios → RICE Score → Validação"],
        connects: ["orchestrator", "pm", "emma", "kanya", "ryan"],
    },
    {
        id: "qa", handle: "emma", name: "Emma", fullName: "QA Engineer",
        category: "Product", color: "#059669", active: true,
        level: "L2", role: "Qualidade, testes e validação",
        mission: "Última linha de defesa antes do usuário e primeira linha de prevenção desde o início. Garante que o produto funciona como deveria — sem surpresas.",
        skills: ["Estratégia de testes", "Escrita de casos de teste", "Testes exploratórios", "Automação de testes", "Reporte de bugs", "Validação de critérios", "Análise de qualidade"],
        tools: [{ name: "test_case_manager", desc: "Casos de teste vinculados a stories" }, { name: "bug_tracker", desc: "Ciclo completo de bugs com rastreabilidade" }],
        protocols: ["Test Plan → Execução → Bug Report → Validação"],
        connects: ["po", "ryan", "oliver"],
    },
    {
        id: "developer", handle: "ryan", name: "Ryan", fullName: "Developer",
        category: "Development", color: "#0891B2", active: true,
        level: "L2", role: "Execução técnica de software",
        mission: "Transforma requisitos em código funcional, limpo e sustentável. O executor técnico central: quando Lucas define o quê e Alex define o como, Ryan faz acontecer.",
        skills: ["Full-stack SaaS", "Código limpo e sustentável", "Testes automatizados", "Investigação de bugs", "Code review técnico", "Documentação técnica (ADRs)", "Integração com APIs", "Gestão de débito técnico"],
        tools: [{ name: "code_executor", desc: "Sandbox para validação de lógica e algoritmos" }, { name: "repository_manager", desc: "Branches, commits e pull requests" }],
        protocols: ["Análise Técnica → Implementação → Testes → Code Review → Done"],
        connects: ["alex", "emma", "oliver", "po"],
    },
    {
        id: "devops", handle: "oliver", name: "Oliver", fullName: "DevOps Engineer",
        category: "Development", color: "#0891B2", active: true,
        level: "L2", role: "Infraestrutura, CI/CD e confiabilidade",
        mission: "Garante que o produto chega em produção de forma confiável, rápida e segura — e permanece estável depois. Tudo que pode ser automatizado, deve ser.",
        skills: ["Design de pipelines CI/CD", "Infraestrutura como código", "Observabilidade e monitoramento", "Gestão de deploy", "Resposta a incidentes", "Segurança de infra", "SRE e SLOs", "Gestão de ambientes"],
        tools: [{ name: "pipeline_manager", desc: "CI/CD: trigger, status, logs, rollback" }, { name: "infrastructure_monitor", desc: "Métricas e alertas de infra em tempo real" }],
        protocols: ["Deploy Checklist → Canary → Observação → Post-Mortem"],
        connects: ["alex", "ryan", "constantine", "emma"],
    },
    {
        id: "cyber_chief", handle: "constantine", name: "Constantine", fullName: "Cyber Chief",
        category: "Security", color: "#DC2626", active: true,
        level: "L1", role: "Segurança, proteção de dados e conformidade",
        mission: "Protege o produto, os dados dos usuários e a infraestrutura contra ameaças — sem paralisar o squad. Segurança by design, não como camada final.",
        skills: ["Threat modeling STRIDE", "Security review de código", "Gestão de vulnerabilidades", "Conformidade LGPD", "Resposta a incidentes", "Segurança de autenticação", "Segurança em CI/CD", "Gestão de secrets"],
        tools: [{ name: "vulnerability_scanner", desc: "SAST, DAST, SCA, secrets scanning" }, { name: "security_incident_tracker", desc: "Ciclo completo de incidentes de segurança" }],
        protocols: ["Threat Model → Review → Scan → Incident Response"],
        connects: ["alex", "oliver", "theron"],
    },
    {
        id: "analyst", handle: "kanya", name: "Kanya", fullName: "Strategy Analyst",
        category: "Strategy", color: "#D97706", active: true,
        level: "L1", role: "Inteligência estratégica e direção de negócio",
        mission: "A inteligência estratégica do squad: enxerga o mercado, identifica oportunidades e riscos antes que se tornem óbvios — e transforma esse olhar em direção clara.",
        skills: ["Análise competitiva e de mercado", "Modelagem de cenários", "Síntese de inteligência", "Frameworks de decisão", "Análise de viabilidade", "Strategy memos", "Detecção de sinais fracos", "SWOT e frameworks clássicos"],
        tools: [{ name: "market_intelligence_search", desc: "Busca estruturada de inteligência de mercado" }, { name: "scenario_modeler", desc: "Cenários otimista / base / pessimista" }],
        protocols: ["Contexto → Dados → Análise → Cenários → Recomendação"],
        connects: ["orchestrator", "po", "theron"],
    },
    {
        id: "design_chief", handle: "aurora", name: "Aurora", fullName: "Design Chief",
        category: "Design", color: "#DB2777", active: true,
        level: "L1", role: "Direção criativa e identidade visual",
        mission: "Garante que o produto não apenas funciona — mas é belo, coerente e comunica a identidade certa. Guardiã do padrão visual e da experiência estética.",
        skills: ["Direção criativa SaaS", "Design systems", "Identidade visual de produto", "Design review estruturado", "Acessibilidade visual (WCAG)", "Curadoria de tendências", "Handoff para desenvolvimento", "Gestão de assets"],
        tools: [{ name: "design_system_manager", desc: "Tokens, componentes e changelog do sistema" }, { name: "figma_connector", desc: "Componentes, tokens e feedback no Figma" }],
        protocols: ["Brief → Direção → Sistema → Review → Aprovação"],
        connects: ["victoria", "ryan", "po"],
    },
    {
        id: "ux", handle: "victoria", name: "Victoria", fullName: "UX Designer",
        category: "Design", color: "#DB2777", active: true,
        level: "L2", role: "Experiência do usuário e design de interação",
        mission: "Projeta a experiência que o usuário tem com o produto: fluxos, interações e estruturas que tornam o produto intuitivo. Começa antes da tela existir.",
        skills: ["Pesquisa qualitativa", "Arquitetura de informação", "Design de fluxos", "Prototipagem baixa/alta fidelidade", "Testes de usabilidade", "Design de estados", "Análise de dados de uso", "Handoff de UX"],
        tools: [{ name: "user_flow_builder", desc: "Fluxos com estados e edge cases documentados" }, { name: "usability_session_recorder", desc: "Achados de usabilidade por severidade" }],
        protocols: ["Pesquisa → Fluxo → Protótipo → Teste → Iteração"],
        connects: ["aurora", "po", "ryan"],
    },
    {
        id: "sop_extractor", handle: "martin", name: "Martin", fullName: "SOP Extractor",
        category: "Frameworks", color: "#475569", active: true,
        level: "L2", role: "Extração e documentação de processos",
        mission: "Transforma processos implícitos em documentação explícita, replicável e auditável. O guardião da memória operacional do squad.",
        skills: ["Mapeamento de processos", "Escrita de SOPs", "Documentação técnica", "Extração de conhecimento tácito", "Padronização de workflows", "Auditoria de processos"],
        tools: [{ name: "sop_builder", desc: "Estrutura e versiona SOPs do squad" }, { name: "process_mapper", desc: "Mapas visuais de fluxos operacionais" }],
        protocols: ["Observação → Extração → Estruturação → Validação → SOP"],
        connects: ["orchestrator", "squad_manager", "pm"],
    },


    {
        id: "closer", handle: "closer", name: "Closer", fullName: "Deal Closer Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 1", role: "Deal Closer Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "cra", handle: "cra", name: "Cra", fullName: "Chief Revenue Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "L0", role: "Chief Revenue Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "deck", handle: "deck", name: "Deck", fullName: "Deck Architect",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Deck Architect",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "draft_chief", handle: "draft_chief", name: "Draft", fullName: "Proposal Drafter",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Proposal Drafter",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "ecvc", handle: "ecvc", name: "Ecvc", fullName: "Ecvc",
        category: "Sales", color: "#10B981", active: true,
        level: "None", role: "None",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "emailcopy", handle: "emailcopy", name: "Emailcopy", fullName: "Email Copywriter",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Email Copywriter",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "finmodel", handle: "finmodel", name: "Finmodel", fullName: "Financial Modeler",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Financial Modeler",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "hunter", handle: "hunter", name: "Hunter", fullName: "Outbound Hunter Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 1", role: "Outbound Hunter Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "intel", handle: "intel", name: "Intel", fullName: "Market Intel Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Market Intel Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "ir", handle: "ir", name: "Ir", fullName: "Investor Relations Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 1", role: "Investor Relations Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "lens", handle: "lens", name: "Lens", fullName: "Social Lens Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Social Lens Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "mapper", handle: "mapper", name: "Mapper", fullName: "Account Mapper",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Account Mapper",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "nurture", handle: "nurture", name: "Nurture", fullName: "Nurture Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 1", role: "Nurture Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "oracle", handle: "oracle", name: "Oracle", fullName: "Oracle Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Oracle Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "osint", handle: "osint", name: "Osint", fullName: "Osint Scout",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Osint Scout",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "persona", handle: "persona", name: "Persona", fullName: "Persona Builder",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Persona Builder",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "pitch", handle: "pitch", name: "Pitch", fullName: "Pitch Master Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 1", role: "Pitch Master Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "push", handle: "push", name: "Push", fullName: "Push Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Push Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "qualifier", handle: "qualifier", name: "Qualifier", fullName: "Lead Qualifier",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Lead Qualifier",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "radar", handle: "radar", name: "Radar", fullName: "Trigger Radar Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Trigger Radar Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "rebound", handle: "rebound", name: "Rebound", fullName: "Rebound Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Rebound Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "revops", handle: "revops", name: "Revops", fullName: "Revenue Ops Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Revenue Ops Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "scheduler", handle: "scheduler", name: "Scheduler", fullName: "Meeting Scheduler",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Meeting Scheduler",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "social", handle: "social", name: "Social", fullName: "Social Selling Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Social Selling Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "story", handle: "story", name: "Story", fullName: "Storyteller Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Storyteller Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    },
    {
        id: "vault", handle: "vault", name: "Vault", fullName: "Content Vault Agent",
        category: "Sales", color: "#10B981", active: true,
        level: "Nível 2", role: "Content Vault Agent",
        mission: "Agent for sales automation.",
        skills: ["Strategy", "Analytics"],
        tools: [],
        protocols: ["Analysis -> Action"],
        connects: ["cra", "orchestrator"]
    }
];

const PRINCIPLES = [
    { icon: Terminal, title: "Orquestração inteligente", desc: "O ORCH decompõe demandas complexas e delega para o agente certo — com contexto suficiente para executar sem ambiguidade." },
    { icon: Target, title: "Especialização profunda", desc: "Cada agente tem um domínio claro e não invade o território do outro. Papéis bem definidos eliminam ruído e sobreposição." },
    { icon: Zap, title: "Paralelismo eficiente", desc: "Tarefas independentes rodam em paralelo. O squad não é uma fila — é um grafo de execução otimizado." },
    { icon: Shield, title: "Qualidade por design", desc: "Validação constante e proteção nativa. Qualidade e segurança não são fases — são responsabilidades distribuídas." },
    { icon: BookOpen, title: "Documentação como ativo", desc: "O conhecimento do squad vive em documentação estruturada, ADRs e SOPs, garantindo continuidade." },
    { icon: Activity, title: "Decisões rastreáveis", desc: "Cada decisão técnica ou estratégica é registrada com contexto e raciocínio. Total transparência." },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Navbar() {
    return (
        <header className="fixed top-0 w-full z-50 px-6 py-4">
            <nav className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
                <Link href="/home" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center p-1.5">
                        <img src="/logo.svg" alt="DMZ OS Logo" className="w-full h-full" />
                    </div>
                    <span className="font-extrabold text-lg tracking-tight text-[#D8663E]">DMZ – OS Agents</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
                    <Link href="/home#agents" className="hover:text-white transition-colors">Agentes</Link>
                    <Link href="/home#cases" className="hover:text-white transition-colors">Casos de Uso</Link>
                    <Link href="/home#pricing" className="hover:text-white transition-colors">Preços</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/sign-in" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors px-4 py-2">Login</Link>
                    <Link href="/sign-up" className="bg-dmz-accent text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-orange-500 transition-all shadow-lg shadow-dmz-accent/20">Sign Up</Link>
                </div>
            </nav>
        </header>
    );
}

function Footer() {
    return (
        <footer className="py-20 border-t border-white/5 bg-[#030303]">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-20">
                <div className="col-span-2 text-white">
                    <div className="flex items-center gap-3 mb-6 text-white">
                        <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center p-1.5">
                            <img src="/logo.svg" alt="DMZ OS Logo" className="w-full h-full" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-[#D8663E]">DMZ – OS Agents</span>
                    </div>
                    <p className="text-neutral-500 max-w-sm mb-8">
                        A camada de inteligência organizacional que torna seu repositório vivo.
                        Built by agents, for developers.
                    </p>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-6">Plataforma</h5>
                    <div className="flex flex-col gap-4 text-sm text-neutral-500">
                        <Link href="/app/agents" className="hover:text-dmz-accent">Especialistas</Link>
                        <Link href="/app/projects" className="hover:text-dmz-accent">Projetos</Link>
                        <Link href="/sign-in" className="hover:text-dmz-accent">Login</Link>
                        <Link href="/sign-up" className="hover:text-dmz-accent">Cadastro</Link>
                    </div>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-6">Legal</h5>
                    <div className="flex flex-col gap-4 text-sm text-neutral-500">
                        <Link href="/terms" className="hover:text-dmz-accent">Termos de Uso</Link>
                        <Link href="/privacy" className="hover:text-dmz-accent">Privacidade</Link>
                        <Link href="/cookies" className="hover:text-dmz-accent">Cookies</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[11px] text-neutral-600 font-medium">© 2024 DMZ Labs. Todos os direitos reservados.</p>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-neutral-600 uppercase font-black tracking-widest">System Status: All systems go</span>
                </div>
            </div>
        </footer>
    );
}

function AgentCard({ agent, onOpen }: { agent: any, onOpen: (a: any) => void }) {
    const Icon = AGENT_ICONS[agent.id] || Bot;
    const color = agent.color || "#6B7280";

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={() => onOpen(agent)}
            className="group relative bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-dmz-accent/40 transition-all cursor-pointer backdrop-blur-sm"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon size={24} style={{ color }} />
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${agent.active ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`} />
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{agent.active ? 'Online' : 'Offline'}</span>
                    </div>
                    <span className="text-[8px] font-black tracking-widest text-neutral-600 uppercase bg-neutral-900 px-2 py-1 rounded-md border border-white/5">{agent.level}</span>
                </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{agent.name}</h3>
            <p className="text-[10px] font-mono font-bold mb-4 opacity-50 transition-opacity group-hover:opacity-100" style={{ color }}>@{agent.handle}</p>

            <div className="flex flex-wrap gap-2">
                {agent.skills.slice(0, 2).map((skill: string, i: number) => (
                    <span key={i} className="text-[9px] font-bold py-1 px-2 rounded-lg bg-white/5 text-neutral-400 border border-white/5 uppercase tracking-tighter">
                        {skill.split(' ')[0]}
                    </span>
                ))}
                {agent.skills.length > 2 && (
                    <span className="text-[9px] font-bold py-1 px-2 rounded-lg bg-white/5 text-neutral-600 border border-white/5 uppercase">+{agent.skills.length - 2}</span>
                )}
            </div>

            <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <ArrowRight size={14} className="text-dmz-accent" />
            </div>
        </motion.div>
    );
}

function PrincipleCard({ principle }: { principle: any }) {
    const Icon = principle.icon;
    return (
        <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] hover:border-white/20 transition-all group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-dmz-accent/10 transition-colors">
                <Icon className="text-neutral-500 group-hover:text-dmz-accent transition-colors" size={20} />
            </div>
            <h4 className="text-lg font-bold text-white mb-3 tracking-tight">{principle.title}</h4>
            <p className="text-neutral-400 leading-relaxed text-sm">{principle.desc}</p>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function SquadAboutPage() {
    const [selectedAgent, setSelectedAgent] = useState<any | null>(null);

    return (
        <div className="bg-[#050505] text-white selection:bg-dmz-accent font-jakarta">
            <Navbar />

            {/* Modal */}
            <AnimatePresence>
                {selectedAgent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAgent(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="p-8 pb-4 flex justify-between items-start">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] flex items-center justify-center"
                                        style={{ backgroundColor: `${selectedAgent.color}15`, border: `1px solid ${selectedAgent.color}30` }}>
                                        {/* Dynamic Icon */}
                                        {(() => {
                                            const Icon = AGENT_ICONS[selectedAgent.id] || Bot;
                                            return <Icon size={32} style={{ color: selectedAgent.color }} />;
                                        })()}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight">{selectedAgent.fullName}</h2>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-sm font-bold uppercase tracking-widest bg-neutral-800 px-3 py-1 rounded-full text-neutral-400 border border-white/5">{selectedAgent.category}</span>
                                            <span className="text-xs font-mono font-bold" style={{ color: selectedAgent.color }}>@{selectedAgent.handle}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedAgent(null)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 pt-4 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[3px] text-dmz-accent mb-4">A Missão</h4>
                                    <p className="text-neutral-300 leading-relaxed text-lg">{selectedAgent.mission}</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[3px] text-neutral-500 mb-4">Especialidade</h4>
                                        <ul className="space-y-3">
                                            {selectedAgent.skills.map((skill: string, i: number) => (
                                                <li key={i} className="flex items-center gap-3 text-sm text-neutral-300">
                                                    <Check size={14} className="text-dmz-accent" />
                                                    {skill}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[3px] text-neutral-500 mb-4">Protocolo Base</h4>
                                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                                            <p className="text-sm font-mono text-neutral-400 leading-loose">{selectedAgent.protocols[0]}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[3px] text-neutral-500 mb-4">Integração de Rede</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAgent.connects.map((conn: string, i: number) => (
                                            <span key={i} className="text-[10px] font-bold bg-neutral-800 text-neutral-400 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-tighter">
                                                @{conn}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 bg-black/40 border-t border-white/5">
                                <Link href="/sign-up" className="w-full bg-dmz-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-xl shadow-dmz-accent/20">
                                    Adicionar ao Meu Squad <ArrowRight size={18} />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-dmz-accent/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/5 blur-[150px] rounded-full" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8"
                    >
                        <Bot size={14} className="text-dmz-accent" />
                        <span className="text-[11px] font-bold tracking-widest text-neutral-300 uppercase">A Elite da IA Organizacional</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black mb-8 leading-none tracking-tight"
                    >
                        Conheça o seu <br />
                        <span className="text-dmz-accent italic">Living Squad.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-neutral-400 mb-12 leading-relaxed max-w-2xl mx-auto"
                    >
                        44 agentes especializados orquestrados para planejar, executar,
                        vender e auditar cada detalhe do seu ciclo de vida SaaS.
                    </motion.p>
                </div>
            </section>

            {/* Stats section */}
            <section className="pb-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Especialistas Ativos", value: "44", color: "#E85D2F" },
                        { label: "Categorias", value: "10", color: "#2563EB" },
                        { label: "Skills Mapeadas", value: "100+", color: "#059669" },
                        { label: "Protocolos", value: "24/7", color: "#7C3AED" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[32px] text-center backdrop-blur-sm">
                            <div className="text-4xl font-black mb-2" style={{ color: stat.color }}>{stat.value}</div>
                            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-[2px]">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Agents Grid */}
            <section className="py-32 bg-white/[0.02] px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
                        <div className="max-w-xl">
                            <h2 className="text-4xl md:text-5xl font-black mb-6">O Squad</h2>
                            <p className="text-neutral-400">Clique em um agente para ver sua missão, conjunto de habilidades e protocolos de integração.</p>
                        </div>
                        <div className="flex gap-4">
                            {/* Categories could go here as filters if needed */}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {AGENTS.map((agent) => (
                            <AgentCard key={agent.id} agent={agent} onOpen={setSelectedAgent} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Principles Section */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Como o Squad<br />Pensa como Sistema.</h2>
                        <p className="text-neutral-400 max-w-2xl mx-auto">A orquestração não é apenas sobre delegação, é sobre arquitetura organizacional viva.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {PRINCIPLES.map((p, i) => (
                            <PrincipleCard key={i} principle={p} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Hierarchy Section */}
            <section className="py-32 bg-white/[0.02] px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Arquitetura do Squad</h2>
                        <p className="text-neutral-400 max-w-2xl">A estrutura de comando e execução que garante a entrega de alto nível, do maestro aos especialistas.</p>
                    </div>

                    <div className="space-y-16">
                        {[
                            { lvl: "L0", title: "Maestro (Orquestração Central)", color: "#E85D2F" },
                            { lvl: "L1", title: "Leads (Estratégia & Direção)", color: "#7C3AED" },
                            { lvl: "L2", title: "Specialists (Execução Técnica)", color: "#0891B2" },
                        ].map((tier) => (
                            <div key={tier.lvl} className="relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-widest uppercase" style={{ color: tier.color }}>
                                        Nível {tier.lvl}
                                    </div>
                                    <h3 className="text-2xl font-bold tracking-tight">{tier.title}</h3>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent ml-4" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {AGENTS.filter(a => a.level === tier.lvl).map(agent => {
                                        const Icon = AGENT_ICONS[agent.id] || Bot;
                                        return (
                                            <div
                                                key={agent.id}
                                                onClick={() => setSelectedAgent(agent)}
                                                className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:border-white/20 transition-all cursor-pointer group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-neutral-500 group-hover:text-white transition-colors">
                                                    <Icon size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold truncate">{agent.name}</div>
                                                    <div className="text-[10px] text-neutral-500 font-mono truncate">@{agent.handle}</div>
                                                </div>
                                                <div className={`w-1.5 h-1.5 rounded-full ${agent.active ? 'bg-green-500' : 'bg-neutral-700'}`} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-dmz-accent to-orange-800 rounded-[50px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-dmz-accent/20">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-10 left-10 w-64 h-64 border border-white rounded-full" />
                        <div className="absolute bottom-10 right-10 w-96 h-96 border border-white rounded-full" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight text-white relative z-10">Pronto para injetar <br />inteligência no seu projeto?</h2>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                        <Link href="/sign-up" className="bg-white text-dmz-accent px-12 py-5 rounded-2xl font-black text-lg hover:bg-neutral-100 transition-all shadow-xl">
                            Começar agora
                        </Link>
                        <Link href="/sign-in" className="bg-transparent border-2 border-white/40 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-white/10 transition-all">
                            Login
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
