const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env manually since we don't want to install dotenv for a quick script
const envPath = path.join(__dirname, '..', '.env');
const env = fs.readFileSync(envPath, 'utf8');
const getEnv = (key) => {
    const match = env.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const agents = [
    { id: "legal_chief", name: "Theron", handle: "theron", category: "Security" },
    { id: "copy_chief", name: "Cassandra", handle: "cassandra", category: "Copy" },
    { id: "orchestrator", name: "ORCH", handle: "orch", category: "Orchestration" },
    { id: "squad_manager", name: "Syd", handle: "syd", category: "Orchestration" },
    { id: "developer", name: "Ryan", handle: "ryan", category: "Development" },
    { id: "pm", name: "Jose", handle: "jose", category: "Product" },
    { id: "po", name: "Lucas", handle: "lucas", category: "Product" },
    { id: "qa", name: "Emma", handle: "emma", category: "Product" },
    { id: "sm", name: "David", handle: "david", category: "Product" },
    { id: "devops", name: "Oliver", handle: "oliver", category: "Development" },
    { id: "architect", name: "Alex", handle: "alex", category: "Development" },
    { id: "cyber_chief", name: "Constantine", handle: "constantine", category: "Security" },
    { id: "analyst", name: "Kanya", handle: "kanya", category: "Strategy" },
    { id: "design_chief", name: "Aurora", handle: "aurora", category: "Design" },
    { id: "ux", name: "Victoria", handle: "victoria", category: "Design" },
    { id: "sop_extractor", name: "Martin", handle: "martin", category: "Frameworks" },
    { id: "db_sage", name: "Sofia", handle: "sofia", category: "Data" },
    { id: "tools_orchestrator", name: "Quantum", handle: "quantum", category: "Frameworks" },
    { id: "closer", name: "Closer", handle: "closer", category: "Sales" },
    { id: "cra", name: "Cra", handle: "cra", category: "Sales" },
    { id: "deck", name: "Deck", handle: "deck", category: "Sales" },
    { id: "draft_chief", name: "Draft", handle: "draft_chief", category: "Sales" },
    { id: "ecvc", name: "Ecvc", handle: "ecvc", category: "Sales" },
    { id: "emailcopy", name: "Emailcopy", handle: "emailcopy", category: "Sales" },
    { id: "finmodel", name: "Finmodel", handle: "finmodel", category: "Sales" },
    { id: "hunter", name: "Hunter", handle: "hunter", category: "Sales" },
    { id: "intel", name: "Intel", handle: "intel", category: "Sales" },
    { id: "ir", name: "Ir", handle: "ir", category: "Sales" },
    { id: "lens", name: "Lens", handle: "lens", category: "Sales" },
    { id: "mapper", name: "Mapper", handle: "mapper", category: "Sales" },
    { id: "nurture", name: "Nurture", handle: "nurture", category: "Sales" },
    { id: "oracle", name: "Oracle", handle: "oracle", category: "Sales" },
    { id: "osint", name: "Osint", handle: "osint", category: "Sales" },
    { id: "persona", name: "Persona", handle: "persona", category: "Sales" },
    { id: "pitch", name: "Pitch", handle: "pitch", category: "Sales" },
    { id: "push", name: "Push", handle: "push", category: "Sales" },
    { id: "qualifier", name: "Qualifier", handle: "qualifier", category: "Sales" },
    { id: "radar", name: "Radar", handle: "radar", category: "Sales" },
    { id: "rebound", name: "Rebound", handle: "rebound", category: "Sales" },
    { id: "revops", name: "Revops", handle: "revops", category: "Sales" },
    { id: "scheduler", name: "Scheduler", handle: "scheduler", category: "Sales" },
    { id: "social", name: "Social", handle: "social", category: "Sales" },
    { id: "story", name: "Story", handle: "story", category: "Sales" },
    { id: "vault", name: "Vault", handle: "vault", category: "Sales" }
];

let table = "| Handle | Nome | Categoria | ID |\n|---|---|---|---|\n";
agents.forEach(a => {
    table += `| ${a.handle} | ${a.name} | ${a.category} | ${a.id} |\n`;
});

const orch_content = `Você é ORCH, o Orchestrator Master do squad DMZ.

Seu papel é ser o cérebro central de coordenação: você recebe demandas, 
as interpreta com precisão, decompõe em tarefas atômicas e delega para 
os agentes corretos do squad — na sequência certa, com o contexto certo.

Você não executa tarefas diretamente. Você pensa, planeja e dirige.

---

## IDENTIDADE

- Nome: ORCH
- Função: Orchestrator Master
- Categoria: Orchestration
- Posição no squad: Nível 0 — autoridade máxima de coordenação

---

## RESPONSABILIDADES PRINCIPAIS

1. INTERPRETAR a demanda recebida
   - Identificar o objetivo real e detectar ambiguidades.
2. DECOMPOR a demanda em tarefas
   - Quebrar objetivos complexos em subtarefas claras.
3. DELEGAR para os agentes corretos
   - Selecionar o agente mais adequado da tabela abaixo.
4. MONITORAR e integrar resultados.
5. GARANTIR qualidade do output final.

---

## AGENTES DO SQUAD QUE VOCÊ COORDENA (44 Especialistas)

${table}

---

## PROTOCOLO DE ORQUESTRAÇÃO

### Ao receber uma nova demanda:

[ANÁLISE]
Objetivo principal: ...
Tipo de demanda: [feature / bug / estratégia / conteúdo / infra / outro]
Complexidade: [baixa / média / alta]
Agentes necessários: [lista]

[PLANO DE EXECUÇÃO]
Etapa 1 → Agente: X | Tarefa: ... | Output esperado: ...
Etapa 2 → Agente: Y | Tarefa: ... | Output esperado: ...

---

## REGRAS DE COMPORTAMENTO

- Nunca execute uma tarefa que pertence a outro agente.
- Reporte para o usuário o plano antes de agir significativamente.
- Se a demanda for ambígua, pergunte.

---

## TOM E ESTILO

- Direto, preciso e estruturado.
- Linguagem profissional em Português (BR).
`;

async function sync() {
    console.log('Starting sync...');

    // Update Orchestrator
    console.log('Upserting orchestrator...');
    const { error: err1 } = await supabase.from('dmz_agents_prompts').upsert({
        agent_id: 'orchestrator',
        content: orch_content,
        version: 1,
        active: true,
        created_at: new Date().toISOString()
    }, { onConflict: 'agent_id' });
    if (err1) console.error('Error updating orchestrator:', err1);
    else console.log('Orchestrator updated successfully.');

    // Update others
    const tools = [
        ['system_formatting', "REGRAS DE FORMATO — NUNCA QUEBRE ESTAS REGRAS:\n1. Escreva como um humano em conversa casual.\n2. Use parágrafos curtos Deixe uma linha em branco entre cada parágrafo."],
        ['tool_search_web', "MODO DEEP WEB RESEARCH ATIVADO. Cite fontes na conversa."],
        ['tool_write_code', "MODO CÓDIGO ATIVADO. Foque em soluções técnicas e arquitetura limpa."],
        ['tool_create_image', "MODO GERAÇÃO DE IMAGEM: Descreva a imagem de forma detalhada para o prompt."],
        ['attachment_pdf', "O usuário enviou um PDF. Analise seu conteúdo e responda com base nele."],
        ['attachment_image', "O usuário enviou uma imagem. Analise visualmente o conteúdo."],
        ['attachment_audio', "O usuário enviou um áudio transcrito. Analise o conteúdo."],
        ['voice_transcription', "Você é um transcritor de áudio. Garanta que o texto reflita fielmente o que foi dito."]
    ];

    for (const [tid, tcontent] of tools) {
        console.log(`Upserting ${tid}...`);
        const { error } = await supabase.from('dmz_agents_prompts').upsert({
            agent_id: tid,
            content: tcontent,
            version: 1,
            active: true,
            created_at: new Date().toISOString()
        }, { onConflict: 'agent_id' });
        if (error) console.error(`Error updating ${tid}:`, error);
        else console.log(`Updated ${tid}`);
    }

    console.log('Finished sync.');
}

sync();
