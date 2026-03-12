import { useState } from "react";
import {
  Music2, Users, ClipboardList, Target, CheckSquare, Zap,
  Code2, Rocket, Building2, ShieldAlert, Scale, Search,
  Sparkles, Paintbrush, PenLine, BookOpen, Brain, FlaskConical,
  Bot, Cpu, Bolt, Activity, ChevronRight, ArrowRight,
  Shield, Layers, GitBranch, Database, Lock, FileText,
  BarChart2, Wrench, Package, Blocks, Globe, Component,
  Palette, Monitor, Smartphone, Server, Star, Zap as ZapIcon,
  Circle, Hash, AlignLeft, Command, Crosshair,
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CAT_COLORS = {
  Orchestration: "#E85D2F",
  Product:       "#2563EB",
  Development:   "#0891B2",
  Security:      "#DC2626",
  Strategy:      "#D97706",
  Design:        "#DB2777",
  Copy:          "#7C3AED",
  Frameworks:    "#475569",
  Data:          "#0369A1",
};

const AGENT_ICONS = {
  orchestrator: Music2, squad_manager: Users, pm: ClipboardList,
  po: Target, qa: CheckSquare, sm: Zap, developer: Code2,
  devops: Rocket, architect: Building2, cyber_chief: ShieldAlert,
  legal_chief: Scale, analyst: Search, design_chief: Sparkles,
  ux: Paintbrush, copy_chief: PenLine, sop_extractor: BookOpen,
  db_sage: Brain, tools_orchestrator: FlaskConical,
};

const AGENTS = [
  {
    id: "orchestrator", handle: "orch", name: "ORCH", fullName: "Orchestrator Master",
    category: "Orchestration", color: "#E85D2F", active: true,
    level: "L0", role: "Maestro de coordenação do squad",
    mission: "Recebe demandas, interpreta, decompõe e delega para os agentes corretos — na sequência certa, com o contexto certo. Não executa. Dirige.",
    skills: ["Decomposição de demandas","Seleção de agentes","Paralelização de fluxos","Síntese de outputs","Detecção de bloqueios","Comunicação executiva"],
    tools: [{ name: "task_dispatcher", desc: "Despacha tarefas estruturadas para agentes" }, { name: "execution_tracker", desc: "Registra e monitora status de execução" }],
    protocols: ["Análise → Plano → Delegação → Integração"],
    connects: ["squad_manager","pm","po","kanya","ryan","emma","constantine","alex","oliver"],
  },
  {
    id: "squad_manager", handle: "syd", name: "Syd", fullName: "Squad Manager",
    category: "Orchestration", color: "#7C3AED", active: true,
    level: "L1", role: "Gestão de pessoas e saúde do squad",
    mission: "Garante que o squad funciona como organismo saudável: pessoas certas, nas tarefas certas, com clareza de papéis e energia para entregar.",
    skills: ["Mapeamento de capacidade","Detecção de conflitos de papel","Onboarding de agentes","Diagnóstico de saúde","Facilitação de alinhamentos","Identificação de gaps"],
    tools: [{ name: "squad_roster", desc: "Registro vivo de status e carga dos agentes" }, { name: "squad_log", desc: "Histórico de decisões e aprendizados do squad" }],
    protocols: ["Snapshot → Alertas → Recomendações → Ações"],
    connects: ["orchestrator","pm","david"],
  },
  {
    id: "pm", handle: "jose", name: "Jose", fullName: "Project Manager",
    category: "Product", color: "#2563EB", active: true,
    level: "L1", role: "Gestão de projetos e entregas",
    mission: "Transforma objetivos em planos executáveis e garante que esses planos se tornam realidade — dentro do prazo, do escopo e com a qualidade esperada.",
    skills: ["Planejamento de escopo e cronograma","Gestão de riscos SaaS","Controle de escopo","Replanejamento ágil","Comunicação executiva de status","Alocação de agentes"],
    tools: [{ name: "project_planner", desc: "Planos com marcos, entregas e cronograma" }, { name: "risk_register", desc: "Registro e monitoramento de riscos" }],
    protocols: ["Project Brief → Marcos → Riscos → Status Report"],
    connects: ["orchestrator","squad_manager","po","emma","oliver"],
  },
  {
    id: "po", handle: "lucas", name: "Lucas", fullName: "Product Owner",
    category: "Product", color: "#2563EB", active: true,
    level: "L1", role: "Visão e priorização de produto",
    mission: "Guardião da visão de produto. Decide o que será construído, em qual ordem e por quê. Representa o usuário dentro do squad e transforma necessidades reais em backlog executável.",
    skills: ["User stories e critérios de aceite","Priorização RICE/MoSCoW","Visão e roadmap","Refinamento de backlog","Validação de entregas","Product Discovery","Métricas de produto"],
    tools: [{ name: "backlog_manager", desc: "Backlog com score de priorização e aceite" }, { name: "product_metrics_tracker", desc: "Métricas para validar hipóteses de produto" }],
    protocols: ["Story → Critérios → RICE Score → Validação"],
    connects: ["orchestrator","pm","emma","kanya","ryan"],
  },
  {
    id: "qa", handle: "emma", name: "Emma", fullName: "QA Engineer",
    category: "Product", color: "#059669", active: true,
    level: "L2", role: "Qualidade, testes e validação",
    mission: "Última linha de defesa antes do usuário e primeira linha de prevenção desde o início. Garante que o produto funciona como deveria — sem surpresas.",
    skills: ["Estratégia de testes","Escrita de casos de teste","Testes exploratórios","Automação de testes","Reporte de bugs","Validação de critérios","Análise de qualidade"],
    tools: [{ name: "test_case_manager", desc: "Casos de teste vinculados a stories" }, { name: "bug_tracker", desc: "Ciclo completo de bugs com rastreabilidade" }],
    protocols: ["Test Plan → Execução → Bug Report → Validação"],
    connects: ["po","ryan","oliver"],
  },
  {
    id: "sm", handle: "david", name: "David", fullName: "Scrum Master",
    category: "Product", color: "#2563EB", active: false,
    level: "L2", role: "Rituais ágeis e remoção de impedimentos",
    mission: "Facilita os rituais do squad, remove impedimentos do caminho e garante que o processo ágil serve à entrega — não o contrário.",
    skills: ["Facilitação de sprints","Remoção de impedimentos","Coaching ágil","Retrospectivas","Métricas de velocidade"],
    tools: [{ name: "sprint_manager", desc: "Cerimônias e métricas de sprint" }, { name: "impediment_tracker", desc: "Registro e resolução de bloqueios" }],
    protocols: ["Sprint Planning → Daily → Review → Retrospectiva"],
    connects: ["squad_manager","pm","po"],
  },
  {
    id: "developer", handle: "ryan", name: "Ryan", fullName: "Developer",
    category: "Development", color: "#0891B2", active: true,
    level: "L2", role: "Execução técnica de software",
    mission: "Transforma requisitos em código funcional, limpo e sustentável. O executor técnico central: quando Lucas define o quê e Alex define o como, Ryan faz acontecer.",
    skills: ["Full-stack SaaS","Código limpo e sustentável","Testes automatizados","Investigação de bugs","Code review técnico","Documentação técnica (ADRs)","Integração com APIs","Gestão de débito técnico"],
    tools: [{ name: "code_executor", desc: "Sandbox para validação de lógica e algoritmos" }, { name: "repository_manager", desc: "Branches, commits e pull requests" }],
    protocols: ["Análise Técnica → Implementação → Testes → Code Review → Done"],
    connects: ["alex","emma","oliver","po"],
  },
  {
    id: "devops", handle: "oliver", name: "Oliver", fullName: "DevOps Engineer",
    category: "Development", color: "#0891B2", active: true,
    level: "L2", role: "Infraestrutura, CI/CD e confiabilidade",
    mission: "Garante que o produto chega em produção de forma confiável, rápida e segura — e permanece estável depois. Tudo que pode ser automatizado, deve ser.",
    skills: ["Design de pipelines CI/CD","Infraestrutura como código","Observabilidade e monitoramento","Gestão de deploy","Resposta a incidentes","Segurança de infra","SRE e SLOs","Gestão de ambientes"],
    tools: [{ name: "pipeline_manager", desc: "CI/CD: trigger, status, logs, rollback" }, { name: "infrastructure_monitor", desc: "Métricas e alertas de infra em tempo real" }],
    protocols: ["Deploy Checklist → Canary → Observação → Post-Mortem"],
    connects: ["alex","ryan","constantine","emma"],
  },
  {
    id: "architect", handle: "alex", name: "Alex", fullName: "Tech Architect",
    category: "Development", color: "#0891B2", active: false,
    level: "L1", role: "Arquitetura e decisões técnicas estruturais",
    mission: "Define as fundações técnicas do produto: decisões que determinam como o sistema cresce, escala e resiste a falhas ao longo do tempo. Cada decisão tem consequências que duram anos.",
    skills: ["Design de arquitetura SaaS","Seleção de tecnologias","Documentação arquitetural (ADRs)","Governança técnica","Análise de requisitos não-funcionais","Gestão de débito arquitetural","Design de APIs","Arquitetura de segurança"],
    tools: [{ name: "adr_manager", desc: "Architecture Decision Records versionados" }, { name: "architecture_diagram_generator", desc: "Diagramas C4 e Mermaid de componentes" }],
    protocols: ["Context → Decision → Alternatives → ADR → Review"],
    connects: ["ryan","oliver","constantine"],
  },
  {
    id: "cyber_chief", handle: "constantine", name: "Constantine", fullName: "Cyber Chief",
    category: "Security", color: "#DC2626", active: true,
    level: "L1", role: "Segurança, proteção de dados e conformidade",
    mission: "Protege o produto, os dados dos usuários e a infraestrutura contra ameaças — sem paralisar o squad. Segurança by design, não como camada final.",
    skills: ["Threat modeling STRIDE","Security review de código","Gestão de vulnerabilidades","Conformidade LGPD","Resposta a incidentes","Segurança de autenticação","Segurança em CI/CD","Gestão de secrets"],
    tools: [{ name: "vulnerability_scanner", desc: "SAST, DAST, SCA, secrets scanning" }, { name: "security_incident_tracker", desc: "Ciclo completo de incidentes de segurança" }],
    protocols: ["Threat Model → Review → Scan → Incident Response"],
    connects: ["alex","oliver","theron"],
  },
  {
    id: "legal_chief", handle: "theron", name: "Theron", fullName: "Legal Chief",
    category: "Security", color: "#DC2626", active: false,
    level: "L1", role: "Conformidade jurídica, contratos e riscos legais",
    mission: "Identifica, avalia e mitiga riscos jurídicos — antes que virem problemas. Parceiro legal ágil: mostra o que é possível, o que é arriscado e o que é inaceitável.",
    skills: ["Análise de risco jurídico SaaS","Conformidade LGPD","Revisão de contratos e termos","Propriedade intelectual","Monitoramento regulatório","Documentação jurídica","Gestão de consentimento","Resposta jurídica a incidentes"],
    tools: [{ name: "legal_document_manager", desc: "Termos, políticas e contratos versionados" }, { name: "compliance_checker", desc: "Avaliação de conformidade com LGPD" }],
    protocols: ["Risk Assessment → Controles → Documentação → Revisão"],
    connects: ["constantine","kanya"],
  },
  {
    id: "analyst", handle: "kanya", name: "Kanya", fullName: "Strategy Analyst",
    category: "Strategy", color: "#D97706", active: true,
    level: "L1", role: "Inteligência estratégica e direção de negócio",
    mission: "A inteligência estratégica do squad: enxerga o mercado, identifica oportunidades e riscos antes que se tornem óbvios — e transforma esse olhar em direção clara.",
    skills: ["Análise competitiva e de mercado","Modelagem de cenários","Síntese de inteligência","Frameworks de decisão","Análise de viabilidade","Strategy memos","Detecção de sinais fracos","SWOT e frameworks clássicos"],
    tools: [{ name: "market_intelligence_search", desc: "Busca estruturada de inteligência de mercado" }, { name: "scenario_modeler", desc: "Cenários otimista / base / pessimista" }],
    protocols: ["Contexto → Dados → Análise → Cenários → Recomendação"],
    connects: ["orchestrator","po","theron"],
  },
  {
    id: "design_chief", handle: "aurora", name: "Aurora", fullName: "Design Chief",
    category: "Design", color: "#DB2777", active: true,
    level: "L1", role: "Direção criativa e identidade visual",
    mission: "Garante que o produto não apenas funciona — mas é belo, coerente e comunica a identidade certa. Guardiã do padrão visual e da experiência estética.",
    skills: ["Direção criativa SaaS","Design systems","Identidade visual de produto","Design review estruturado","Acessibilidade visual (WCAG)","Curadoria de tendências","Handoff para desenvolvimento","Gestão de assets"],
    tools: [{ name: "design_system_manager", desc: "Tokens, componentes e changelog do sistema" }, { name: "figma_connector", desc: "Componentes, tokens e feedback no Figma" }],
    protocols: ["Brief → Direção → Sistema → Review → Aprovação"],
    connects: ["victoria","ryan","po"],
  },
  {
    id: "ux", handle: "victoria", name: "Victoria", fullName: "UX Designer",
    category: "Design", color: "#DB2777", active: true,
    level: "L2", role: "Experiência do usuário e design de interação",
    mission: "Projeta a experiência que o usuário tem com o produto: fluxos, interações e estruturas que tornam o produto intuitivo. Começa antes da tela existir.",
    skills: ["Pesquisa qualitativa","Arquitetura de informação","Design de fluxos","Prototipagem baixa/alta fidelidade","Testes de usabilidade","Design de estados","Análise de dados de uso","Handoff de UX"],
    tools: [{ name: "user_flow_builder", desc: "Fluxos com estados e edge cases documentados" }, { name: "usability_session_recorder", desc: "Achados de usabilidade por severidade" }],
    protocols: ["Pesquisa → Fluxo → Protótipo → Teste → Iteração"],
    connects: ["aurora","po","ryan"],
  },
  {
    id: "copy_chief", handle: "cassandra", name: "Cassandra", fullName: "Copy Chief",
    category: "Copy", color: "#7C3AED", active: false,
    level: "L1", role: "Comunicação, narrativa e linguagem do produto",
    mission: "Garante que cada palavra cumpre um propósito: informar, engajar, converter ou reter. Cada palavra tem custo de atenção — e ela sabe disso mais que ninguém.",
    skills: ["UX Writing e microcopy","Copywriting de conversão","Voz e tom de produto","Estratégia de conteúdo SaaS","Product storytelling","Revisão e edição","Copy para onboarding","Testes A/B de copy"],
    tools: [{ name: "copy_library", desc: "Biblioteca de copy aprovado por superfície" }, { name: "ab_test_manager", desc: "Testes A/B com hipótese e resultado" }],
    protocols: ["Objetivo → Rascunhos → Avaliação → Versão Final"],
    connects: ["aurora","victoria","po"],
  },
  {
    id: "sop_extractor", handle: "martin", name: "Martin", fullName: "SOP Extractor",
    category: "Frameworks", color: "#475569", active: true,
    level: "L2", role: "Extração e documentação de processos",
    mission: "Transforma processos implícitos em documentação explícita, replicável e auditável. O guardião da memória operacional do squad.",
    skills: ["Mapeamento de processos","Escrita de SOPs","Documentação técnica","Extração de conhecimento tácito","Padronização de workflows","Auditoria de processos"],
    tools: [{ name: "sop_builder", desc: "Estrutura e versiona SOPs do squad" }, { name: "process_mapper", desc: "Mapas visuais de fluxos operacionais" }],
    protocols: ["Observação → Extração → Estruturação → Validação → SOP"],
    connects: ["orchestrator","squad_manager","pm"],
  },
  {
    id: "db_sage", handle: "sofia", name: "Sofia", fullName: "DB Sage",
    category: "Data", color: "#0369A1", active: false,
    level: "L2", role: "Modelagem e inteligência de dados",
    mission: "Guardiã dos dados: modelagem, performance de queries, integridade e a inteligência que vive dentro do banco. O produto é tão bom quanto seus dados.",
    skills: ["Modelagem de dados SaaS","Query optimization","Migrations seguras","Indexação estratégica","Auditoria de dados","Schema design","Performance de banco","Integridade referencial"],
    tools: [{ name: "query_analyzer", desc: "Performance e planos de execução de queries" }, { name: "schema_manager", desc: "Migrations versionadas e rollback seguro" }],
    protocols: ["Schema → Migration → Query → Performance → Auditoria"],
    connects: ["ryan","alex","oliver"],
  },
  {
    id: "tools_orchestrator", handle: "quantum", name: "Quantum", fullName: "Tools Orchestrator",
    category: "Frameworks", color: "#475569", active: false,
    level: "L2", role: "Integração e orquestração de ferramentas",
    mission: "Conecta o squad ao ecossistema de ferramentas externas: MCPs, APIs, automações. Garante que as ferramentas certas estão disponíveis, configuradas e funcionando.",
    skills: ["Integração de MCPs","Gestão de APIs externas","Automação de workflows","Troubleshooting de integrações","Configuração de ambientes","Documentação de ferramentas"],
    tools: [{ name: "mcp_registry", desc: "Inventário e status de todos os MCPs" }, { name: "integration_tester", desc: "Valida integrações antes de produção" }],
    protocols: ["Discovery → Config → Test → Monitor → Documentação"],
    connects: ["orchestrator","oliver","ryan"],
  },
];

const CATEGORIES = [
  { name: "Orchestration", color: "#E85D2F", count: 2 },
  { name: "Product",       color: "#2563EB", count: 4 },
  { name: "Development",   color: "#0891B2", count: 4 },
  { name: "Security",      color: "#DC2626", count: 2 },
  { name: "Strategy",      color: "#D97706", count: 1 },
  { name: "Design",        color: "#DB2777", count: 3 },
  { name: "Copy",          color: "#7C3AED", count: 1 },
  { name: "Frameworks",    color: "#475569", count: 2 },
  { name: "Data",          color: "#0369A1", count: 1 },
];

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

function AgentIcon({ agentId, size = 18, color = "#6B7280" }) {
  const Icon = AGENT_ICONS[agentId] || Bot;
  return <Icon size={size} color={color} strokeWidth={1.75} />;
}

function StatusDot({ active }) {
  return (
    <span style={{
      display: "inline-block", width: 7, height: 7, borderRadius: "50%",
      background: active ? "#10B981" : "#D1D5DB", flexShrink: 0,
      boxShadow: active ? "0 0 0 2.5px #10B98130" : "none",
    }} />
  );
}

function Tag({ children, color, small }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: color + "12", color, border: `1px solid ${color}28`,
      borderRadius: "5px", padding: small ? "1px 6px" : "2px 8px",
      fontSize: small ? "9.5px" : "10.5px", fontWeight: "600", letterSpacing: "0.04em",
    }}>
      {children}
    </span>
  );
}

function Handle({ handle, color }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "1px",
      background: color + "10", border: `1px solid ${color}22`,
      borderRadius: "6px", padding: "2px 8px",
    }}>
      <span style={{ fontSize: "11px", color, fontWeight: "900", lineHeight: 1, marginRight: 1 }}>@</span>
      <span style={{ fontSize: "11.5px", fontWeight: "700", color, fontFamily: "monospace", letterSpacing: "0.02em" }}>{handle}</span>
    </div>
  );
}

function LevelBadge({ level }) {
  const colors = { L0: "#E85D2F", L1: "#7C3AED", L2: "#6B7280" };
  const labels = { L0: "Maestro", L1: "Lead", L2: "Specialist" };
  const c = colors[level] || "#6B7280";
  return (
    <span style={{
      fontSize: "9px", fontWeight: "800", letterSpacing: "0.08em",
      color: c, background: c + "10", border: `1px solid ${c}25`,
      borderRadius: "4px", padding: "1px 6px", textTransform: "uppercase",
    }}>
      {level} · {labels[level]}
    </span>
  );
}

// ─── AGENT DETAIL PANEL ───────────────────────────────────────────────────────

function AgentDetailPanel({ agent, onClose }) {
  const [tab, setTab] = useState("mission");
  const cc = CAT_COLORS[agent.category] || "#475569";

  const tabs = ["mission", "skills", "tools", "protocolo"];

  return (
    <div style={{
      background: "#FFFFFF", border: "1.5px solid #F0F0F0",
      borderRadius: "20px", padding: "28px",
      boxShadow: "0 12px 48px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
      position: "sticky", top: "24px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "20px" }}>
        <div style={{
          width: 56, height: 56, background: cc + "10",
          borderRadius: "16px", border: `1.5px solid ${cc}22`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <AgentIcon agentId={agent.id} size={26} color={cc} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "18px", fontWeight: "800", color: "#111827", letterSpacing: "-0.03em" }}>{agent.fullName}</span>
            <StatusDot active={agent.active} />
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            <Handle handle={agent.handle} color={cc} />
            <Tag color={cc}>{agent.category}</Tag>
            <LevelBadge level={agent.level} />
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "#F3F4F6", border: "none", width: 30, height: 30,
          borderRadius: "8px", cursor: "pointer", color: "#6B7280",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          ✕
        </button>
      </div>

      {/* Role subtitle */}
      <div style={{
        background: cc + "06", border: `1px solid ${cc}15`,
        borderRadius: "10px", padding: "10px 14px", marginBottom: "18px",
        fontSize: "12px", color: cc, fontWeight: "600",
      }}>
        {agent.role}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "2px", background: "#F3F4F6",
        borderRadius: "10px", padding: "3px", marginBottom: "20px",
      }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, background: tab === t ? "#FFFFFF" : "none",
            border: "none", borderRadius: "8px", padding: "7px 0",
            cursor: "pointer", fontSize: "10.5px",
            fontWeight: tab === t ? "700" : "500",
            color: tab === t ? "#111827" : "#9CA3AF",
            boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.15s", textTransform: "capitalize",
          }}>{t}</button>
        ))}
      </div>

      {/* Mission tab */}
      {tab === "mission" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Missão</div>
            <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, margin: 0 }}>{agent.mission}</p>
          </div>
          {agent.connects && agent.connects.length > 0 && (
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Conecta com</div>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {agent.connects.map(id => {
                  const a = AGENTS.find(ag => ag.id === id);
                  if (!a) return null;
                  const ac = CAT_COLORS[a.category];
                  return (
                    <div key={id} style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      background: ac + "10", border: `1px solid ${ac}20`,
                      borderRadius: "7px", padding: "3px 8px",
                    }}>
                      <AgentIcon agentId={id} size={10} color={ac} />
                      <span style={{ fontSize: "10.5px", fontWeight: "700", color: ac, fontFamily: "monospace" }}>@{a.handle}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skills tab */}
      {tab === "skills" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {agent.skills.map((sk, i) => (
            <div key={i} style={{
              background: "#F9FAFB", border: "1px solid #F0F0F0",
              borderRadius: "10px", padding: "10px 14px",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: cc, flexShrink: 0,
              }} />
              <span style={{ fontSize: "12.5px", color: "#374151", fontWeight: "500" }}>{sk}</span>
              <div style={{ marginLeft: "auto" }}>
                <span style={{ fontSize: "9.5px", fontWeight: "700", color: cc, background: cc + "10", borderRadius: "4px", padding: "1px 6px" }}>
                  {i < 3 ? "expert" : "senior"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tools tab */}
      {tab === "tools" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {agent.tools.map((tool, i) => (
            <div key={i} style={{
              background: "#F9FAFB", border: "1px solid #F0F0F0",
              borderRadius: "12px", padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <Wrench size={12} color={cc} />
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#111827", fontFamily: "monospace" }}>{tool.name}</span>
              </div>
              <p style={{ fontSize: "11.5px", color: "#6B7280", margin: 0, lineHeight: 1.5 }}>{tool.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Protocolo tab */}
      {tab === "protocolo" && (
        <div>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Fluxo de trabalho</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {agent.protocols[0].split(" → ").map((step, i, arr) => (
              <div key={i}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px",
                  background: i === 0 ? cc + "10" : "#F9FAFB",
                  border: `1px solid ${i === 0 ? cc + "25" : "#F0F0F0"}`,
                  borderRadius: "10px",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: i === 0 ? cc : "#E5E7EB",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: "10px", fontWeight: "800", color: i === 0 ? "#fff" : "#6B7280" }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: "12.5px", fontWeight: i === 0 ? "700" : "500", color: i === 0 ? cc : "#374151" }}>{step}</span>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: "23px", height: "12px", alignItems: "center" }}>
                    <div style={{ width: 1, height: "100%", background: "#E5E7EB" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AGENT CARD ───────────────────────────────────────────────────────────────

function AgentCard({ agent, onClick, selected }) {
  const cc = CAT_COLORS[agent.category] || "#475569";
  return (
    <div
      onClick={() => onClick(agent)}
      style={{
        background: "#FFFFFF",
        border: selected ? `1.5px solid ${cc}` : "1.5px solid #F0F0F0",
        borderRadius: "14px", padding: "18px", cursor: "pointer",
        transition: "all 0.18s ease",
        boxShadow: selected ? `0 4px 24px ${cc}20` : "0 1px 4px rgba(0,0,0,0.04)",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Subtle bg accent */}
      {selected && (
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 80, height: 80,
          background: `radial-gradient(circle at top right, ${cc}12, transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div style={{
          width: 42, height: 42, borderRadius: "12px",
          background: cc + "10", border: `1px solid ${cc}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <AgentIcon agentId={agent.id} size={20} color={cc} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
          <StatusDot active={agent.active} />
          <LevelBadge level={agent.level} />
        </div>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <div style={{ fontSize: "14px", fontWeight: "800", color: "#111827", letterSpacing: "-0.02em", marginBottom: "5px" }}>
          {agent.name}
        </div>
        <Handle handle={agent.handle} color={cc} />
        <div style={{ fontSize: "10.5px", color: "#9CA3AF", marginTop: "4px" }}>{agent.fullName}</div>
      </div>

      <Tag color={cc}>{agent.category}</Tag>

      <div style={{ marginTop: "10px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {agent.skills.slice(0, 2).map(s => (
          <span key={s} style={{
            background: "#F3F4F6", color: "#6B7280",
            borderRadius: "5px", padding: "2px 7px",
            fontSize: "10px", fontWeight: "500",
          }}>{s}</span>
        ))}
        {agent.skills.length > 2 && (
          <span style={{
            background: "#F3F4F6", color: "#9CA3AF",
            borderRadius: "5px", padding: "2px 7px",
            fontSize: "10px", fontWeight: "500",
          }}>+{agent.skills.length - 2}</span>
        )}
      </div>
    </div>
  );
}

// ─── OVERVIEW STATS ───────────────────────────────────────────────────────────

function OverviewStats() {
  const activeCount = AGENTS.filter(a => a.active).length;
  const totalCount = AGENTS.length;
  const categories = [...new Set(AGENTS.map(a => a.category))].length;

  const stats = [
    { label: "Agentes totais", value: totalCount, color: "#111827", icon: Bot },
    { label: "Ativos agora", value: activeCount, color: "#10B981", icon: Activity },
    { label: "Categorias", value: categories, color: "#7C3AED", icon: Layers },
    { label: "Nível maestro", value: 1, color: "#E85D2F", icon: Star },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.label} style={{
            background: "#FFFFFF", border: "1.5px solid #F0F0F0",
            borderRadius: "14px", padding: "16px 18px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "26px", fontWeight: "800", color: s.color, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px", fontWeight: "500" }}>{s.label}</div>
              </div>
              <div style={{ width: 32, height: 32, background: s.color + "10", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={15} color={s.color} strokeWidth={1.75} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CATEGORY BREAKDOWN ───────────────────────────────────────────────────────

function CategoryBreakdown({ activeFilter, onFilter }) {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
      <button
        onClick={() => onFilter(null)}
        style={{
          background: activeFilter === null ? "#111827" : "#FFFFFF",
          border: `1.5px solid ${activeFilter === null ? "#111827" : "#F0F0F0"}`,
          borderRadius: "8px", padding: "6px 12px",
          cursor: "pointer", fontSize: "11px",
          fontWeight: "600", color: activeFilter === null ? "#FFFFFF" : "#6B7280",
          transition: "all 0.15s",
        }}
      >
        Todos · {AGENTS.length}
      </button>
      {CATEGORIES.map(cat => (
        <button
          key={cat.name}
          onClick={() => onFilter(cat.name)}
          style={{
            background: activeFilter === cat.name ? cat.color : "#FFFFFF",
            border: `1.5px solid ${activeFilter === cat.name ? cat.color : "#F0F0F0"}`,
            borderRadius: "8px", padding: "6px 12px",
            cursor: "pointer", fontSize: "11px",
            fontWeight: "600",
            color: activeFilter === cat.name ? "#FFFFFF" : cat.color,
            transition: "all 0.15s",
          }}
        >
          {cat.name} · {AGENTS.filter(a => a.category === cat.name).length}
        </button>
      ))}
    </div>
  );
}

// ─── HIERARCHY VIEW ───────────────────────────────────────────────────────────

function HierarchyView() {
  const levels = {
    "L0 — Maestro": AGENTS.filter(a => a.level === "L0"),
    "L1 — Leads": AGENTS.filter(a => a.level === "L1"),
    "L2 — Specialists": AGENTS.filter(a => a.level === "L2"),
  };

  const levelColors = { "L0 — Maestro": "#E85D2F", "L1 — Leads": "#7C3AED", "L2 — Specialists": "#6B7280" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {Object.entries(levels).map(([lvl, agents]) => {
        const lc = levelColors[lvl];
        return (
          <div key={lvl}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: 3, height: 16, background: lc, borderRadius: "2px" }} />
              <span style={{ fontSize: "11px", fontWeight: "700", color: lc, textTransform: "uppercase", letterSpacing: "0.08em" }}>{lvl}</span>
              <span style={{ fontSize: "11px", color: "#D1D5DB" }}>·</span>
              <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{agents.length} agente{agents.length !== 1 ? "s" : ""}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
              {agents.map(agent => {
                const cc = CAT_COLORS[agent.category];
                return (
                  <div key={agent.id} style={{
                    background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                    borderRadius: "12px", padding: "12px 14px",
                    display: "flex", alignItems: "center", gap: "10px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "10px",
                      background: cc + "10", border: `1px solid ${cc}18`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <AgentIcon agentId={agent.id} size={16} color={cc} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#111827", marginBottom: "2px" }}>{agent.name}</div>
                      <div style={{ fontSize: "10px", color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{agent.fullName}</div>
                    </div>
                    <StatusDot active={agent.active} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AGENTS VIEW ─────────────────────────────────────────────────────────────

function AgentsView() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState(null);
  const [view, setView] = useState("grid"); // grid | hierarchy

  const filtered = filter ? AGENTS.filter(a => a.category === filter) : AGENTS;

  return (
    <div>
      <OverviewStats />

      {/* View toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <CategoryBreakdown activeFilter={filter} onFilter={setFilter} />
        <div style={{ display: "flex", gap: "2px", background: "#F3F4F6", borderRadius: "8px", padding: "2px", flexShrink: 0, marginLeft: "12px" }}>
          {[{ id: "grid", label: "Grid" }, { id: "hierarchy", label: "Hierarquia" }].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              background: view === v.id ? "#FFFFFF" : "none",
              border: "none", borderRadius: "6px", padding: "5px 12px",
              cursor: "pointer", fontSize: "11px",
              fontWeight: view === v.id ? "700" : "500",
              color: view === v.id ? "#111827" : "#9CA3AF",
              boxShadow: view === v.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s", whiteSpace: "nowrap",
            }}>{v.label}</button>
          ))}
        </div>
      </div>

      {view === "hierarchy" ? (
        <HierarchyView />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px", alignItems: "start" }}>
          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: selected ? "repeat(auto-fill, minmax(200px, 1fr))" : "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
            {filtered.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={a => setSelected(selected?.id === a.id ? null : a)}
                selected={selected?.id === agent.id}
              />
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <AgentDetailPanel agent={selected} onClose={() => setSelected(null)} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── ABOUT VIEW ───────────────────────────────────────────────────────────────

function AboutView() {
  const principles = [
    { icon: Command, title: "Orquestração inteligente", desc: "O ORCH decompõe demandas complexas e delega para o agente certo — com contexto suficiente para executar sem ambiguidade." },
    { icon: Crosshair, title: "Especialização profunda", desc: "Cada agente tem um domínio claro e não invade o território do outro. Papéis bem definidos eliminam ruído e sobreposição." },
    { icon: GitBranch, title: "Paralelismo quando possível", desc: "Tarefas independentes rodam em paralelo. O squad não é uma fila — é um grafo de execução otimizado." },
    { icon: Shield, title: "Qualidade por design", desc: "Emma valida, Constantine protege, Theron conforma. Qualidade e segurança não são fases — são responsabilidades distribuídas." },
    { icon: AlignLeft, title: "Documentação como ativo", desc: "ADRs do Alex, SOPs do Martin, copy aprovado da Cassandra. O conhecimento do squad vive em documentação, não em cabeças." },
    { icon: Hash, title: "Decisões rastreáveis", desc: "Cada decisão técnica, estratégica ou jurídica é registrada com contexto, alternativas e raciocínio. Sem caixas pretas." },
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
        borderRadius: "20px", padding: "40px 48px", marginBottom: "24px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          borderRadius: "50%", background: "radial-gradient(circle, #E85D2F20, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: 60, width: 150, height: 150,
          borderRadius: "50%", background: "radial-gradient(circle, #7C3AED20, transparent 70%)",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #E85D2F, #7C3AED)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bolt size={20} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", letterSpacing: "0.1em", textTransform: "uppercase" }}>DMZ Squad</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#9CA3AF" }}>Produto Digital / SaaS</div>
            </div>
          </div>
          <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 12px" }}>
            Um squad de agentes<br />que pensa como sistema.
          </h2>
          <p style={{ fontSize: "14px", color: "#9CA3AF", lineHeight: 1.7, margin: 0, maxWidth: 520 }}>
            18 agentes especializados, cada um com domínio claro, protocolos definidos e
            ferramentas configuradas — coordenados pelo ORCH para entregar produtos SaaS
            com qualidade, velocidade e rastreabilidade.
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
            {[
              { v: "18", l: "Agentes" }, { v: "9", l: "Categorias" },
              { v: "36+", l: "Tools sugeridas" }, { v: "100+", l: "Skills mapeadas" }
            ].map(s => (
              <div key={s.l} style={{ background: "#FFFFFF10", border: "1px solid #FFFFFF15", borderRadius: "10px", padding: "10px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#FFFFFF", letterSpacing: "-0.03em" }}>{s.v}</div>
                <div style={{ fontSize: "10px", color: "#6B7280", fontWeight: "600" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Principles */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Princípios do squad</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {principles.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                <div style={{ width: 32, height: 32, background: "#F3F4F6", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                  <Icon size={15} color="#374151" strokeWidth={1.75} />
                </div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#111827", marginBottom: "5px" }}>{p.title}</div>
                <div style={{ fontSize: "11.5px", color: "#6B7280", lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories breakdown */}
      <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Distribuição por categoria</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {CATEGORIES.map(cat => {
            const pct = Math.round((cat.count / AGENTS.length) * 100);
            return (
              <div key={cat.name} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 100, fontSize: "11px", fontWeight: "600", color: cat.color, flexShrink: 0 }}>{cat.name}</div>
                <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: cat.color, borderRadius: "99px", minWidth: 4 }} />
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "600", width: 40, textAlign: "right" }}>{cat.count} ag.</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────

const NAV = [
  { id: "agents", label: "Agentes", icon: Bot },
  { id: "about",  label: "Sobre o Squad", icon: Layers },
];

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("agents");

  const titles = {
    agents: { h: "Squad DMZ", sub: "18 agentes especializados para produtos SaaS" },
    about:  { h: "Sobre o Squad", sub: "Visão, princípios e arquitetura do squad" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5", fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 99px; }
        button { font-family: inherit; cursor: pointer; }
      `}</style>

      {/* Floating Side Nav */}
      <div style={{
        position: "fixed", left: 20, top: "50%", transform: "translateY(-50%)",
        background: "#FFFFFF", borderRadius: "22px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
        padding: "14px 10px", display: "flex", flexDirection: "column",
        alignItems: "center", gap: "4px", zIndex: 1000, border: "1px solid #F0F0F0",
      }}>
        <div style={{
          width: 36, height: 36,
          background: "linear-gradient(135deg, #E85D2F, #7C3AED)",
          borderRadius: "12px", display: "flex", alignItems: "center",
          justifyContent: "center", marginBottom: "10px",
        }}>
          <Bolt size={17} color="#FFFFFF" strokeWidth={2.5} />
        </div>
        <div style={{ width: 24, height: 1, background: "#F0F0F0", margin: "2px 0 6px" }} />
        {NAV.map(({ id, icon: Icon, label }) => (
          <button key={id} title={label} onClick={() => setView(id)} style={{
            width: 42, height: 42,
            background: view === id ? "#111827" : "none",
            border: "none", borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>
            <Icon size={18} color={view === id ? "#FFFFFF" : "#9CA3AF"} strokeWidth={1.75} />
          </button>
        ))}
        <div style={{ width: 24, height: 1, background: "#F0F0F0", margin: "6px 0 4px" }} />
        <StatusDot active={true} />
      </div>

      {/* Main */}
      <div style={{ marginLeft: 90, padding: "36px 40px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#111827", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              {titles[view].h}
            </h1>
            <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "3px" }}>{titles[view].sub}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{
              background: "#FFFFFF", border: "1.5px solid #F0F0F0",
              borderRadius: "10px", padding: "8px 14px",
              display: "flex", gap: "6px", alignItems: "center",
              fontSize: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <StatusDot active={true} />
              <span style={{ fontWeight: "600", color: "#111827" }}>@orch</span>
              <span style={{ color: "#9CA3AF" }}>online</span>
            </div>
            <div style={{
              background: "#FFFFFF", border: "1.5px solid #F0F0F0",
              borderRadius: "10px", padding: "8px 14px",
              display: "flex", gap: "6px", alignItems: "center",
              fontSize: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <Cpu size={13} color="#9CA3AF" />
              <span style={{ fontWeight: "700", color: "#111827" }}>DMZ</span>
              <span style={{ color: "#9CA3AF" }}>Squad</span>
            </div>
          </div>
        </div>

        {view === "agents" && <AgentsView />}
        {view === "about"  && <AboutView />}
      </div>
    </div>
  );
}
