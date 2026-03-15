from fastapi import Request
import httpx
import tempfile
import os
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

# Carrega ambiente
load_dotenv()
load_dotenv(".env.dmz")

async def handle_telegram_webhook(req: Request, supabase, get_llm_response, get_sys_prompt):
    """Webhook do Telegram para a Agente Yvi."""
    data = await req.json()
    
    if "message" in data:
        msg = data["message"]
        chat_id = msg.get("chat", {}).get("id")
        text = msg.get("text", "").lower()
        user_first_name = msg.get("from", {}).get("first_name", "Daniel")
        
        # Ignora mensagens sem texto
        if not text:
            return {"status": "ok"}

        # Resposta imediata de "recebido" para evitar que o Daniel ache que travou
        bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        if bot_token:
            async with httpx.AsyncClient() as client:
                await client.post(f"https://api.telegram.org/bot{bot_token}/sendMessage", json={
                    "chat_id": chat_id,
                    "text": f"Claro, {user_first_name}! Vou preparar o relatório agora mesmo e já te envio o áudio. Só um momento enquanto processo os dados do Kanban."
                })
            
        # Puxa as tasks mais recentes (independente de hoje) para dar contexto à Yvi
        res = supabase.table("dmz_agents_tasks").select("title, status, agent_id, updated_at").eq("project_id", "dmz-agents").order("updated_at", desc=True).limit(20).execute()
        
        tasks = res.data or []
        
        if not tasks:
            info = "O painel DMZ não registrou nenhuma tarefa até o momento no projeto dmz-agents."
        else:
            completed = [t for t in tasks if t['status'] in ['completed', 'done']]
            ongoing = [t for t in tasks if t['status'] in ['in_progress', 'on_going', 'pending']]
            
            info = f"Últimas tarefas que constam no Kanban:\n"
            info += f"Resolvidas recentemente ({len(completed)}):\n" + "\n".join([f"- {t['title']} (finalizado por @{t['agent_id']})" for t in completed[:10]]) + "\n\n"
            info += f"Em andamento ({len(ongoing)}):\n" + "\n".join([f"- {t['title']} (com @{t['agent_id']})" for t in ongoing[:10]])
            
        # Gera o roteiro
        system_prompt = get_sys_prompt("yvi_telegram_report")
        if not system_prompt:
            # Fallback de segurança caso delete do banco
            system_prompt = "Você é Yvi, a Status Report Specialist do DMZ OS. Aja como uma secretária executiva moderna e carismática."
        
        # Interpolação de variáveis no prompt do Daniel
        now = datetime.now()
        date_full = now.strftime("%d/%m/%Y %H:%M")
        date_str = now.strftime("%d/%m/%Y")
        
        system_prompt = system_prompt.replace("{user_first_name}", user_first_name)
        system_prompt = system_prompt.replace("{date_full}", date_full)
        system_prompt = system_prompt.replace("{date_str}", date_str)
        
        user_prompt = f"O CEO {user_first_name} enviou a seguinte mensagem no chat para você: '{text}'\n\nResponda diretamente a ele (simule a fala fluida). Use os dados abaixo do Kanban como seu conhecimento atual do projeto caso precise contextualizar ou focar no report que ele pediu:\n\n{info}"
        
        resumo_texto = get_llm_response(system_prompt, user_prompt)
        
        # ElevenLabs TTS para MP3 -> Convete para Opus (OGG)
        elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
        bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        
        if not elevenlabs_key or not bot_token:
            print("[Telegram] Falta ElevenLabs Key ou Bot Token")
            return {"status": "error", "message": "Tokens not found"}
        
        try:
            print(f"[Telegram Webhook] Gerando TTS ElevenLabs para Yvi...")
            
            voice_id = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": elevenlabs_key
            }
            
            payload = {
                "text": resumo_texto,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75
                }
            }
            
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, json=payload, headers=headers, timeout=60.0)
            
            if resp.status_code != 200:
                raise Exception(f"ElevenLabs error: {resp.text}")
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f_mp3:
                f_mp3.write(resp.content)
                mp3_path = f_mp3.name
                
            ogg_path = mp3_path.replace(".mp3", ".ogg")
            
            # Converte mp3 para OGG OPUS com ffmpeg via subprocess
            import subprocess
            subprocess.run(["ffmpeg", "-y", "-i", mp3_path, "-c:a", "libopus", ogg_path], 
                           check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            print("[Telegram Webhook] Enviando sendVoice API pro chat:", chat_id)
            with open(ogg_path, "rb") as audio_file:
                async with httpx.AsyncClient() as client:
                    await client.post(
                        f"https://api.telegram.org/bot{bot_token}/sendVoice",
                        data={"chat_id": chat_id},
                        files={"voice": ("report.ogg", audio_file, "audio/ogg")}
                    )
                    
            os.remove(mp3_path)
            os.remove(ogg_path)
        except Exception as e:
            print(f"[Telegram Webhook] Erro Yvi TTS: {e}")
            async with httpx.AsyncClient() as client:
                await client.post(f"https://api.telegram.org/bot{bot_token}/sendMessage", json={
                    "chat_id": chat_id,
                    "text": f"Ocorreu um erro gerando minha voz. Aqui está sua resposta transcrita:\n\n{resumo_texto}"
                })
        
    return {"status": "ok"}
