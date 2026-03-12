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
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const contentType = req.headers.get('content-type') || '';
        let audioFile: Blob | null = null;
        let fileName = `audio-${Date.now()}.mp3`;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            audioFile = formData.get('file') as Blob;
        } else {
            audioFile = await req.blob();
        }

        if (!audioFile) {
            return new Response(JSON.stringify({ error: 'No audio file provided' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 1. Upload to Supabase Storage
        const bucketName = 'dmz_agents_audios_chat';
        const { data: uploadData, error: uploadError } = await supabaseClient
            .storage
            .from(bucketName)
            .upload(fileName, audioFile, {
                contentType: audioFile.type || 'audio/mpeg',
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
            .from(bucketName)
            .getPublicUrl(fileName);

        // 2. Transcribe with Whisper
        const openAiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openAiKey) {
            return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const whisperFormData = new FormData();
        const file = new File([audioFile], 'audio.mp3', { type: audioFile.type || 'audio/mpeg' });

        // Load transcription prompt dynamically
        const { data: promptData } = await supabaseClient
            .from('dmz_agents_prompts')
            .select('content')
            .eq('agent_id', 'voice_transcription')
            .limit(1)
            .single();

        const prompt = promptData?.content || "Transcreva o áudio de forma fiel, removendo ruídos e focando na fala em português.";

        whisperFormData.append('file', file);
        whisperFormData.append('model', 'whisper-1');
        whisperFormData.append('prompt', prompt);

        console.log('Transcribing...');
        const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${openAiKey}` },
            body: whisperFormData,
        });

        if (!whisperResponse.ok) {
            const errorData = await whisperResponse.json();
            return new Response(JSON.stringify({ error: 'Whisper failed', details: errorData }), {
                status: whisperResponse.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const whisperResult = await whisperResponse.json();

        return new Response(JSON.stringify({
            text: whisperResult.text,
            audioUrl: publicUrl
        }), {
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
