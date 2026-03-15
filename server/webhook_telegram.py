from fastapi import Request
import httpx
import tempfile
import os
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

# Carrega ambiente
load_dotenv()
load_dotenv(".env.dmz")

async def handle_telegram_webhook(data: dict, supabase, get_llm_response, get_sys_prompt):
    """Webhook do Telegram para a Agente Yvi."""
    
    if "message" in data:
        msg = data["message"]
        chat_id = msg.get("chat", {}).get("id")
        text = msg.get("text", "").strip()
        user_first_name = msg.get("from", {}).get("first_name", "Daniel")
        
        # Ignora mensagens sem texto
        if not text:
            return {"status": "ok"}

        # Identificação de Sessão
        session_id = f"telegram_{chat_id}"
        
        # 1. Recupera o projeto atual desta sessão (metadata nas chats antigas)
        current_project_id = "dmz-agents" # Default
        chat_res = supabase.table("dmz_agents_chat").select("metadata").eq("session_id", session_id).order("created_at", desc=True).limit(1).execute()
        if chat_res.data and chat_res.data[0].get("metadata"):
            current_project_id = chat_res.data[0]["metadata"].get("project_id", "dmz-agents")

        # 2. Lógica de troca de projeto se o usuário mandar um SLUG novo
        # Padrão: "slug: xxxx" ou "projeto: xxxx"
        new_slug = None
        if text.lower().startswith("slug:") or text.lower().startswith("projeto:"):
            new_slug = text.split(":")[-1].strip().lower()
        elif len(text.split()) == 1 and "-" in text and "." not in text: 
            # Heurística: se for uma palavra só com hífen, pode ser um slug
            new_slug = text.lower()

        if new_slug:
            # Valida se o projeto existe
            proj_check = supabase.table("dmz_agents_projects").select("id, name").eq("slug", new_slug).single().execute()
            if proj_check.data:
                current_project_id = proj_check.data["id"]
                msg_confirm = f"Perfeito, {user_first_name}! Conectei você ao projeto **{proj_check.data['name']}**. Agora tenho acesso aos relatórios e Kanban dele. O que deseja saber?"
                
                # Salva log de troca no chat
                supabase.table("dmz_agents_chat").insert({
                    "session_id": session_id, "role": "assistant", "content": msg_confirm, "agent_id": "yvi", "metadata": {"project_id": current_project_id}
                }).execute()

                bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
                async with httpx.AsyncClient() as client:
                    await client.post(f"https://api.telegram.org/bot{bot_token}/sendMessage", json={
                        "chat_id": chat_id, "text": msg_confirm, "parse_mode": "Markdown"
                    })
                return {"status": "ok"}

        # Resposta imediata de "recebido"
        bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        if bot_token:
            async with httpx.AsyncClient() as client:
                await client.post(f"https://api.telegram.org/bot{bot_token}/sendMessage", json={
                    "chat_id": chat_id,
                    "text": f"Claro, {user_first_name}! Vou preparar o relatório do projeto '{current_project_id}' agora mesmo. Só um momento."
                })
            
        # Puxa as tasks do projeto ATUAL
        res = supabase.table("dmz_agents_tasks").select("title, status, agent_id, updated_at").eq("project_id", current_project_id).order("updated_at", desc=True).limit(20).execute()
        
        tasks = res.data or []
        
        if not tasks:
            info = f"O painel DMZ não registrou nenhuma tarefa até o momento no projeto {current_project_id}."
        else:
            completed = [t for t in tasks if t['status'] in ['completed', 'done']]
            ongoing = [t for t in tasks if t['status'] in ['in_progress', 'on_going', 'pending']]
            
            info = f"Status atual do projeto {current_project_id}:\n"
            info += f"Resolvidas recentemente ({len(completed)}):\n" + "\n".join([f"- {t['title']} (por @{t['agent_id']})" for t in completed[:10]]) + "\n\n"
            info += f"Em andamento ({len(ongoing)}):\n" + "\n".join([f"- {t['title']} (com @{t['agent_id']})" for t in ongoing[:10]])
            
        # Gera o roteiro
        system_prompt = get_sys_prompt("yvi_telegram_report")
        if not system_prompt:
            system_prompt = "Você é Yvi, a Status Report Specialist do DMZ OS. Aja como uma secretária executiva moderna e carismática."
        
        # Interpolação
        now = datetime.now()
        date_full = now.strftime("%d/%m/%Y %H:%M")
        date_str = now.strftime("%d/%m/%Y")
        
        system_prompt = system_prompt.replace("{user_first_name}", user_first_name)
        system_prompt = system_prompt.replace("{date_full}", date_full)
        system_prompt = system_prompt.replace("{date_str}", date_str)
        # Adiciona instrução de multi-projeto
        system_prompt += f"\n\nAtualmente você está visualizando o projeto: {current_project_id}. Se o usuário quiser ver outro, ele deve dizer 'slug: nome-do-projeto'. Se você não souber o projeto ou o usuário pedir algo de outro lugar, peça o slug educadamente."
        
        user_prompt = f"O CEO {user_first_name} disse: '{text}'\n\nDados do Kanban ({current_project_id}):\n{info}"
        
        resumo_texto = get_llm_response(system_prompt, user_prompt)

        # Salva o chat no banco para manter memória do project_id
        supabase.table("dmz_agents_chat").insert({
            "session_id": session_id,
            "role": "user",
            "content": text,
            "metadata": {"project_id": current_project_id, "user_first_name": user_first_name}
        }).execute()
        
        # ElevenLabs TTS
        elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
        bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        
        if not elevenlabs_key or not bot_token:
            return {"status": "error", "message": "Tokens not found"}
        
        try:
            print(f"[Telegram] TTS para {current_project_id}...")
            voice_id = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
            headers = {"Accept": "audio/mpeg", "Content-Type": "application/json", "xi-api-key": elevenlabs_key}
            payload = {"text": resumo_texto, "model_id": "eleven_multilingual_v2", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}
            
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, json=payload, headers=headers, timeout=60.0)
            
            if resp.status_code != 200:
                raise Exception(f"ElevenLabs error: {resp.text}")
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f_mp3:
                f_mp3.write(resp.content)
                mp3_path = f_mp3.name
            ogg_path = mp3_path.replace(".mp3", ".ogg")
            
            import subprocess
            subprocess.run(["ffmpeg", "-y", "-i", mp3_path, "-c:a", "libopus", ogg_path], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            with open(ogg_path, "rb") as audio_file:
                async with httpx.AsyncClient() as client:
                    await client.post(f"https://api.telegram.org/bot{bot_token}/sendVoice", data={"chat_id": chat_id}, files={"voice": ("report.ogg", audio_file, "audio/ogg")})
            
            # Salva resposta da assistente com metadata
            supabase.table("dmz_agents_chat").insert({
                "session_id": session_id, "role": "assistant", "content": resumo_texto, "agent_id": "yvi", "metadata": {"project_id": current_project_id}
            }).execute()

            if os.path.exists(mp3_path): os.remove(mp3_path)
            if os.path.exists(ogg_path): os.remove(ogg_path)
        except Exception as e:
            print(f"[Telegram] Erro TTS: {e}")
            async with httpx.AsyncClient() as client:
                await client.post(f"https://api.telegram.org/bot{bot_token}/sendMessage", json={
                    "chat_id": chat_id, "text": f"Ocorreu um erro no áudio. Segue resposta:\n\n{resumo_texto}"
                })
        
    return {"status": "ok"}
