import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { script, project_id, date_str } = await req.json();

        if (!script) {
            return new Response(JSON.stringify({ error: 'No script provided' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 0. Fetch Config
        const { data: configData } = await supabaseClient
            .from('dmz_agents_config')
            .select('value')
            .eq('key', 'reports_config')
            .single();
        
        const reportsConfig = configData?.value || {};
        const elSettings = reportsConfig?.elevenlabs || reportsConfig; // Backward compatibility check

        const elKey = Deno.env.get('ELEVENLABS_API_KEY');
        const voiceId = elSettings.voice_id || Deno.env.get('ELEVENLABS_VOICE_ID') || 'r2fkFV8WAqXq2AqBpgJT';
        const modelId = elSettings.model_id || 'eleven_multilingual_v2';
        const voiceSettings = elSettings.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
        };

        if (!elKey) {
            return new Response(JSON.stringify({ error: 'ELEVENLABS_API_KEY not set in Supabase' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log(`Generating audio for project ${project_id} - date ${date_str} using voice ${voiceId}`);

        // 1. Call ElevenLabs
        const elResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': elKey,
            },
            body: JSON.stringify({
                text: script,
                model_id: modelId,
                voice_settings: voiceSettings
            }),
        });

        if (!elResponse.ok) {
            const errorText = await elResponse.text();
            console.error('ElevenLabs error:', errorText);
            return new Response(JSON.stringify({ error: 'ElevenLabs failed', details: errorText }), {
                status: elResponse.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const audioBlob = await elResponse.blob();
        const fileName = `reports/${project_id}_${date_str}_${crypto.randomUUID()}.mp3`;

        // 2. Upload to Storage
        const { data: uploadData, error: uploadError } = await supabaseClient
            .storage
            .from('audio')
            .upload(fileName, audioBlob, {
                contentType: 'audio/mpeg',
                upsert: true
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return new Response(JSON.stringify({ error: 'Storage upload failed', details: uploadError }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Get Public URL
        const { data: { publicUrl } } = supabaseClient
            .storage
            .from('audio')
            .getPublicUrl(fileName);

        // 3. Update DB
        const { error: dbError } = await supabaseClient
            .from('dmz_agents_reports')
            .update({
                has_audio: true,
                audio_url: publicUrl
            })
            .match({ project_id, report_date: date_str });

        if (dbError) {
            console.error('DB Update error:', dbError);
        }

        return new Response(JSON.stringify({ audioUrl: publicUrl }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
