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
        const contentType = req.headers.get('content-type') || '';
        let audioFile: Blob | null = null;

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

        const openAiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openAiKey) {
            return new Response(JSON.stringify({ error: 'OPENAI_API_KEY environment variable is not set in Supabase' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Prepare Whisper API request
        const whisperFormData = new FormData();
        // OpenAI Whisper expects a file with a proper extension. 
        // We'll create a File object from the blob if it's not one already.
        const file = new File([audioFile], 'audio.mp3', { type: audioFile.type || 'audio/mpeg' });
        whisperFormData.append('file', file);
        whisperFormData.append('model', 'whisper-1');

        console.log('Sending to OpenAI Whisper...');
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiKey}`,
            },
            body: whisperFormData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI Error:', errorData);
            return new Response(JSON.stringify({ error: 'OpenAI Whisper failed', details: errorData }), {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const data = await response.json();
        console.log('Transcription successful');

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Transcription error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
