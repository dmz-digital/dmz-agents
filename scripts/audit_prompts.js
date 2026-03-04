const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const env = fs.readFileSync(envPath, 'utf8');
const getEnv = (k) => {
    const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
    return m ? m[1].trim().replace(/['\"]/g, '') : null;
};

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(url, key);

async function audit() {
    // Get all agents
    const { data: agents } = await supabase.from('dmz_agents_definitions').select('id, name, handle, category').order('category').order('name');
    // Get all prompts
    const { data: prompts } = await supabase.from('dmz_agents_prompts').select('agent_id, content');

    const promptMap = {};
    (prompts || []).forEach(p => {
        promptMap[p.agent_id] = (p.content || '').length;
    });

    const withPrompt = [];
    const without = [];
    const minimal = [];

    (agents || []).forEach(a => {
        const len = promptMap[a.id] || 0;
        if (len > 100) withPrompt.push({ ...a, len });
        else if (len > 0) minimal.push({ ...a, len });
        else without.push({ ...a, len: 0 });
    });

    // Also check system prompts not in definitions
    const systemIds = ['system_formatting', 'voice_transcription', 'tool_create_image', 'tool_search_web', 'tool_write_code', 'attachment_pdf', 'attachment_image', 'attachment_audio'];
    const systemStatus = systemIds.map(id => ({
        id,
        len: promptMap[id] || 0,
        status: (promptMap[id] || 0) > 10 ? '✅' : '⚠️'
    }));

    console.log(`\n📊 AUDIT: ${agents.length} agents total\n`);
    console.log(`✅ COM PROMPT (>${100} chars): ${withPrompt.length}`);
    withPrompt.forEach(a => console.log(`   ✅ ${a.category.padEnd(15)} ${a.id.padEnd(25)} ${a.name.padEnd(20)} (${a.len} chars)`));

    console.log(`\n⚠️  PROMPT MÍNIMO (1-100 chars): ${minimal.length}`);
    minimal.forEach(a => console.log(`   ⚠️  ${a.category.padEnd(15)} ${a.id.padEnd(25)} ${a.name.padEnd(20)} (${a.len} chars)`));

    console.log(`\n❌ SEM PROMPT: ${without.length}`);
    without.forEach(a => console.log(`   ❌ ${a.category.padEnd(15)} ${a.id.padEnd(25)} ${a.name.padEnd(20)}`));

    console.log(`\n🔧 SYSTEM PROMPTS:`);
    systemStatus.forEach(s => console.log(`   ${s.status} ${s.id.padEnd(25)} (${s.len} chars)`));

    console.log(`\n📈 RESUMO: ${withPrompt.length} completos | ${minimal.length} mínimos | ${without.length} vazios | ${systemStatus.filter(s => s.len > 10).length}/${systemIds.length} sistema`);
}

audit();
