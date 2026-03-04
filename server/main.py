from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load .env first, then .env.dmz as fallback
load_dotenv()
if not os.getenv("GEMINI_API_KEY") and not os.getenv("ANTHROPIC_API_KEY") and not os.getenv("OPENAI_API_KEY"):
    load_dotenv(".env.dmz")

from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

app = FastAPI(title="DMZ Agents API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ─── LLM Engine (self-contained) ─────────────────────────────────────────────

def get_llm_response(system_prompt: str, user_prompt: str, history: list = None) -> str:
    if history is None:
        history = []
        
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    if anthropic_key:
        from anthropic import Anthropic
        client = Anthropic(api_key=anthropic_key)
        
        msgs = []
        for h in history:
            role = "user" if h.get("role") == "user" else "assistant"
            content = h.get("content", "")
            if content.strip():
                msgs.append({"role": role, "content": content})
        msgs.append({"role": "user", "content": user_prompt})
        
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,
            system=system_prompt,
            messages=msgs
        )
        return response.content[0].text

    elif openai_key:
        from openai import OpenAI
        client = OpenAI(api_key=openai_key)
        
        msgs = [{"role": "system", "content": system_prompt}]
        for h in history:
            role = "user" if h.get("role") == "user" else "assistant"
            content = h.get("content", "")
            if content.strip():
                msgs.append({"role": role, "content": content})
        msgs.append({"role": "user", "content": user_prompt})
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=msgs
        )
        return response.choices[0].message.content

    elif gemini_key:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=gemini_key)
        
        contents = []
        for h in history:
            role = "user" if h.get("role") == "user" else "model"
            content = h.get("content", "")
            if content.strip():
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=content)]))
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_prompt)]))
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
            ),
        )
        return response.text

    else:
        raise ValueError("Nenhuma chave de LLM configurada. Por favor, configure ANTHROPIC_API_KEY, OPENAI_API_KEY ou GEMINI_API_KEY.")


def get_agent_prompt(agent_id: str) -> str:
    """Fetches agent master prompt from DB. No hardcoded fallback — prompts MUST exist in admin."""
    try:
        res = supabase.table("dmz_agents_prompts") \
            .select("content") \
            .eq("agent_id", agent_id) \
            .eq("active", True) \
            .order("version", desc=True) \
            .limit(1) \
            .execute()
        if res.data and res.data[0].get("content"):
            return res.data[0]["content"]
    except Exception as e:
        print(f"[WARN] Failed to load prompt for agent '{agent_id}': {e}")
    # No hardcoded fallback — return a minimal identity so the LLM doesn't hallucinate
    return f"Você é o agente '{agent_id}' do squad DMZ. Seu prompt ainda não foi configurado no painel admin. Responda de forma prestativa até que seu prompt seja definido."


def get_sys_prompt(p_id: str) -> str:
    """Fetches a system/tool prompt from DB. No hardcoded fallback."""
    try:
        res = supabase.table("dmz_agents_prompts") \
            .select("content") \
            .eq("agent_id", p_id) \
            .eq("active", True) \
            .limit(1) \
            .execute()
        if res.data and res.data[0].get("content"):
            return res.data[0]["content"]
    except Exception as e:
        print(f"[WARN] Failed to load sys prompt '{p_id}': {e}")
    return ""


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "DMZ Agents API is running", "status": "healthy", "version": "2.0"}


@app.get("/health")
async def health():
    llm_provider = "none"
    if os.getenv("ANTHROPIC_API_KEY"): llm_provider = "anthropic"
    elif os.getenv("OPENAI_API_KEY"): llm_provider = "openai"
    elif os.getenv("GEMINI_API_KEY"): llm_provider = "gemini"
    return {"status": "healthy", "llm_provider": llm_provider}


@app.get("/agents")
async def get_agents():
    try:
        response = supabase.table("dmz_agents_definitions").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/projects")
async def get_projects():
    try:
        response = supabase.table("dmz_agents_projects").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ChatRequest(BaseModel):
    message: str
    agent_id: str = "orch"
    project_id: str = "default"
    tool: str | None = None
    file_url: str | None = None
    file_type: str | None = None
    history: list = []


@app.post("/chat")
async def chat_interaction(req: ChatRequest):
    try:
        # Original assigned agent
        agent_db_id = req.agent_id
        if agent_db_id == "orch":
            agent_db_id = "orchestrator"

        # Build full message early for routing 
        full_message = req.message or ""

        # --- ROUTING LOGIC ---
        # If talking to orch, check if user explicitly requested another agent
        if agent_db_id == "orchestrator" and full_message.strip():
            route_prompt = f"""O usuário está enviando uma mensagem para o Orchestrator do Squad. 
A mensagem: '{full_message}'
O usuário pediu explicitamente para falar com alguém de Design, UX, Backend, Jurídico ou outro especialista na equipe?
Responda APENAS com o handle do agente desejado se sim, ou "NOPE" se não pediu para mudar. 
Possíveis agentes e temas:
- aurora (Design: imagens, visual, design de interface)
- victoria (UX: fluxo, wireframes, usabilidade)
- ryan (Developer: backend, infra, código)
- theron (Legal: contratos, análise jurídica)
- cassandra (Copy: textos, marketing)
- lucas (PO: produto, requisitos)
- sofia (Banco de Dados)"""
            
            try:
                # Fast classification
                route_decision = get_llm_response("Você é um roteador rígido. Responda apenas com a palavra pedida.", route_prompt).strip().lower()
                valid_handles = ["aurora", "victoria", "ryan", "theron", "cassandra", "lucas", "sofia"]
                if any(h in route_decision for h in valid_handles):
                    for h in valid_handles:
                        if h in route_decision:
                            agent_db_id = "design_chief" if h == "aurora" else ("developer" if h == "ryan" else ("legal_chief" if h == "theron" else ("copy_chief" if h == "cassandra" else h)))
                            if h == "victoria": agent_db_id = "ux"
                            if h == "sofia": agent_db_id = "db_sage"
                            if h == "lucas": agent_db_id = "po"
                            # Update the returned agent_id!
                            req.agent_id = h
                            break
            except Exception:
                pass


        # Build system prompt from DB
        system_prompt = get_agent_prompt(agent_db_id)

        # Apply global formatting rule
        formatting = get_sys_prompt("system_formatting")
        if formatting:
            system_prompt += "\n" + formatting

        # Handle tool logic
        if req.tool == "searchWeb":
            tool_prompt = get_sys_prompt("tool_search_web")
            if tool_prompt:
                system_prompt += "\n" + tool_prompt
            firecrawl_key = os.getenv("FIRECRAWL_API_KEY")
            if firecrawl_key:
                try:
                    import requests as req_lib
                    search_query_prompt = f"Usuário ordenou pesquisa web sobre: '{full_message}'. Escreva APENAS o termo de busca (sem citações)."
                    search_query = get_llm_response("Seja direto.", search_query_prompt).strip()
                    fc_resp = req_lib.post(
                        "https://api.firecrawl.dev/v1/search", 
                        json={"query": search_query, "limit": 4}, 
                        headers={"Authorization": f"Bearer {firecrawl_key}", "Content-Type": "application/json"},
                        timeout=15
                    )
                    if fc_resp.status_code == 200:
                        results = fc_resp.json().get("data", [])
                        snippets = "\n\n".join([f"[{r.get('title')}]({r.get('url')}): {r.get('description', '')}" for r in results])
                        full_message += f"\n\n[CONTEXTO RETORNADO DA WEB VIA FIRECRAWL PARA '{search_query}']:\n{snippets[:3000]}"
                    else:
                        full_message += f"\n\n[Firecrawl API falhou com status {fc_resp.status_code}]"
                except Exception as e:
                    full_message += f"\n\n[Erro ao tentar Firecrawl: {str(e)}]"
        elif req.tool == "createImage":
            gemini_key = os.getenv("GEMINI_API_KEY")
            if gemini_key:
                from google import genai
                from google.genai import types
                import uuid
                
                # LLM determines the perfect image generation prompt based on conversation context
                img_prompt_generator = f"Você é um engenheiro de prompts de imagem. O usuário quer uma imagem. Resumo do pedido: '{full_message}'. Escreva um prompt EXTREMAMENTE detalhado em INGLÊS para o Imagen 3 gerar essa imagem. Responda APENAS com o texto em inglês do prompt."
                img_req_prompt = get_llm_response(system_prompt, img_prompt_generator, req.history[-3:])
                
                try:
                    client = genai.Client(api_key=gemini_key)
                    image_resp = client.models.generate_images(
                        model='imagen-3.0-generate-002',
                        prompt=img_req_prompt[:1000],
                        config=types.GenerateImagesConfig(
                            number_of_images=1,
                            output_mime_type="image/jpeg",
                            aspect_ratio="1:1"
                        )
                    )
                    
                    if not image_resp.generated_images:
                        raise ValueError("Nenhuma imagem gerada pelo Gemini.")
                        
                    img_bytes = image_resp.generated_images[0].image.image_bytes
                    file_name = f"generated/{uuid.uuid4()}.jpg"
                    
                    supabase.storage.from_("images").upload(file_name, img_bytes, {"content-type": "image/jpeg"})
                    img_url = supabase.storage.from_("images").get_public_url(file_name)
                    
                    # Call LLM just to write the message surrounding the image
                    msg_surround = get_llm_response(system_prompt, f"A imagem pedida acaba de ser gerada com sucesso via Google Imagen 3. Dê uma resposta muito breve confirmando amigavelmente e introduzindo a imagem. O usuário falou: {full_message}")
                    return {
                        "agent_id": req.agent_id,
                        "content": f"{msg_surround}\n\n![Imagem Gerada]({img_url})",
                        "status": "success"
                    }
                except Exception as e:
                    return {
                        "agent_id": req.agent_id,
                        "content": f"Ocorreu um erro ao gerar a imagem no Google Imagen 3: {str(e)}",
                        "status": "error"
                    }
            else:
                system_prompt += "\nMODO GERAÇÃO DE IMAGEM: A API do Google (Gemini API_KEY) não está configurada, então apenas descreva a imagem."
        elif req.tool == "writeCode":
            code_prompt = get_sys_prompt("tool_write_code")
            if code_prompt:
                system_prompt += "\n" + code_prompt

        # Detect attachment type
        att_type = (req.file_type or "").lower()
        file_ext = (req.file_url or "").split(".")[-1].lower() if req.file_url else ""
        is_image = "image" in att_type or file_ext in ["jpg", "jpeg", "png", "gif", "webp", "heic", "avif"]
        is_audio = "audio" in att_type or file_ext in ["mp3", "wav", "m4a", "ogg", "opus", "flac", "aac"]
        is_pdf = "pdf" in att_type or file_ext == "pdf"

        # Apply attachment-specific system prompts
        if req.file_url:
            if is_image:
                img_prompt = get_sys_prompt("attachment_image")
                if img_prompt:
                    system_prompt += "\n" + img_prompt
            elif is_audio:
                audio_prompt = get_sys_prompt("attachment_audio")
                if audio_prompt:
                    system_prompt += "\n" + audio_prompt
            elif is_pdf:
                pdf_prompt = get_sys_prompt("attachment_pdf")
                if pdf_prompt:
                    system_prompt += "\n" + pdf_prompt

        # For image attachments: use multimodal LLM if possible
        if req.file_url and is_image:
            gemini_key = os.getenv("GEMINI_API_KEY")
            anthropic_key = os.getenv("ANTHROPIC_API_KEY")

            if gemini_key:
                from google import genai
                from google.genai import types
                import requests as req_lib
                
                client = genai.Client(api_key=gemini_key)

                # Fetch the image to bytes since Gemini API requires direct bytes or gs:// URI
                img_resp = req_lib.get(req.file_url, timeout=10)
                img_part = types.Part.from_bytes(data=img_resp.content, mime_type=req.file_type or "image/jpeg")

                # Build conversation history for memory
                contents = []
                for h in req.history:
                    role_h = "user" if h.get("role") == "user" else "model"
                    content_h = h.get("content", "")
                    if content_h.strip():
                        contents.append(types.Content(role=role_h, parts=[types.Part.from_text(text=content_h)]))
                
                # Current message prompt
                prompt_parts = [img_part]
                if full_message:
                    prompt_parts.append(types.Part.from_text(text=full_message))
                
                contents.append(types.Content(role="user", parts=prompt_parts))

                try:
                    response = client.models.generate_content(
                        model='gemini-2.0-flash',
                        contents=contents,
                        config=types.GenerateContentConfig(system_instruction=system_prompt)
                    )
                    return {"agent_id": req.agent_id, "content": response.text, "status": "success"}
                except Exception as e:
                    return {"agent_id": req.agent_id, "content": f"Erro na análise de imagem com Gemini: {str(e)}", "status": "error"}

            elif anthropic_key:
                # Anthropic: fetch image and send as base64
                import base64, requests as req_lib
                img_resp = req_lib.get(req.file_url, timeout=10)
                img_b64 = base64.standard_b64encode(img_resp.content).decode("utf-8")
                media_type = req.file_type or "image/jpeg"

                from anthropic import Anthropic
                client = Anthropic(api_key=anthropic_key)
                
                msgs = []
                for h in req.history:
                    role_h = "user" if h.get("role") == "user" else "assistant"
                    content_h = h.get("content", "")
                    if content_h.strip():
                        msgs.append({"role": role_h, "content": content_h})
                
                msgs.append({
                    "role": "user",
                    "content": [
                        {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": img_b64}},
                        {"type": "text", "text": full_message or "Analise esta imagem."}
                    ]
                })

                response = client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=4096,
                    system=system_prompt,
                    messages=msgs
                )
                return {"agent_id": req.agent_id, "content": response.content[0].text, "status": "success"}

        # For audio with transcription: include the full transcription as context
        if req.file_url and is_audio:
            if full_message.strip():
                # The message IS the transcription or user added text alongside audio
                pass
            else:
                full_message = "[O usuário enviou um arquivo de áudio. URL: " + req.file_url + "]"

        # For non-image, non-audio or fallback: append context to message text
        elif req.file_url and not is_image:
            full_message += f"\n\n[Arquivo anexado: {req.file_url} — Tipo: {req.file_type}]"

        # Call LLM (text mode)
        response_text = get_llm_response(system_prompt, full_message, req.history)

        return {
            "agent_id": req.agent_id,
            "content": response_text,
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Audio Transcription Endpoint ─────────────────────────────────────────────

class TranscribeRequest(BaseModel):
    audio_url: str
    file_name: str = "audio.webm"

@app.post("/transcribe")
async def transcribe_audio(req: TranscribeRequest):
    """
    Downloads audio from URL, uploads to Gemini Files API,
    and returns full transcription. Supports files up to 2 hours.
    """
    import requests as req_lib
    import tempfile
    import time

    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    try:
        # 1. Download audio from Supabase
        print(f"[transcribe] Downloading: {req.audio_url[:80]}...")
        audio_resp = req_lib.get(req.audio_url, timeout=120, stream=True)
        if audio_resp.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to download audio: HTTP {audio_resp.status_code}")

        # Determine MIME type
        ext = req.file_name.rsplit(".", 1)[-1].lower() if "." in req.file_name else "webm"
        mime_map = {
            "mp3": "audio/mpeg", "wav": "audio/wav", "m4a": "audio/m4a",
            "ogg": "audio/ogg", "opus": "audio/opus", "flac": "audio/flac",
            "aac": "audio/aac", "webm": "audio/webm", "3gp": "audio/3gpp",
            "amr": "audio/amr",
        }
        mime_type = mime_map.get(ext, f"audio/{ext}")

        # 2. Save to temp file
        with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as tmp:
            for chunk in audio_resp.iter_content(chunk_size=8192):
                tmp.write(chunk)
            tmp_path = tmp.name

        file_size = os.path.getsize(tmp_path)
        print(f"[transcribe] Downloaded {file_size / 1024 / 1024:.1f} MB as {mime_type}")

        # 3. Upload to Gemini Files API
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=gemini_key)

        print(f"[transcribe] Uploading to Gemini Files API...")
        uploaded_file = client.files.upload(
            file=tmp_path,
            config={"mime_type": mime_type, "display_name": req.file_name}
        )

        # 4. Wait for file processing (Gemini processes async for large files)
        print(f"[transcribe] File uploaded: {uploaded_file.name}, state: {uploaded_file.state}")
        max_wait = 300  # 5 minutes max wait
        waited = 0
        while uploaded_file.state.name == "PROCESSING" and waited < max_wait:
            time.sleep(5)
            waited += 5
            uploaded_file = client.files.get(name=uploaded_file.name)
            print(f"[transcribe] Waiting... state: {uploaded_file.state} ({waited}s)")

        if uploaded_file.state.name == "FAILED":
            raise HTTPException(status_code=500, detail="Gemini failed to process the audio file")

        # 5. Transcribe using Gemini
        print(f"[transcribe] Requesting transcription...")
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Part.from_uri(
                    file_uri=uploaded_file.uri,
                    mime_type=mime_type
                ),
                "Transcreva este áudio completo em português, palavra por palavra. "
                "Inclua TODO o conteúdo do áudio sem resumir ou omitir nada. "
                "Separe em parágrafos para facilitar a leitura. "
                "Se houver múltiplos falantes, identifique-os quando possível."
            ],
            config=types.GenerateContentConfig(
                max_output_tokens=65536,
            )
        )

        transcription = response.text
        print(f"[transcribe] Done! Transcription length: {len(transcription)} chars")

        # 6. Cleanup
        try:
            os.unlink(tmp_path)
            client.files.delete(name=uploaded_file.name)
        except Exception:
            pass

        return {
            "transcription": transcription,
            "duration_estimate": f"{file_size / 1024 / 16:.0f}s",  # rough estimate
            "char_count": len(transcription),
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[transcribe] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
