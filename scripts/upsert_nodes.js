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

const systemNodes = [
    { id: 'voice_transcription', name: 'Voice Transcription', handle: 'voice', category: 'Chat', active: false },
    { id: 'tool_create_image', name: 'Image Generator', handle: 'image_gen', category: 'Frameworks', active: false },
    { id: 'tool_search_web', name: 'Web Search', handle: 'web_search', category: 'Frameworks', active: false },
    { id: 'tool_write_code', name: 'Code Expert', handle: 'code_expert', category: 'Frameworks', active: false },
    { id: 'attachment_pdf', name: 'PDF Analyzer', handle: 'pdf_analyzer', category: 'Frameworks', active: false },
    { id: 'attachment_image', name: 'Vision Analyzer', handle: 'vision_analyzer', category: 'Frameworks', active: false },
    { id: 'attachment_audio', name: 'Audio Analyzer', handle: 'audio_analyzer', category: 'Frameworks', active: false },
    { id: 'system_formatting', name: 'Global Formatting', handle: 'formatting', category: 'Orchestration', active: false }
];

async function run() {
    console.log('Running script nodes...');
    for (const node of systemNodes) {
        console.log(`Upserting ${node.id}...`);
        const { error } = await supabase.from('dmz_agents_definitions').upsert(node, { onConflict: 'id' });
        if (error) console.error(`Error updating node ${node.id}:`, error);
        else console.log(`Upserted node ${node.id}`);
    }
    console.log('Done script nodes.');
}
run();
