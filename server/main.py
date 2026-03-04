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

def get_llm_response(system_prompt: str, user_prompt: str) -> str:
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    if anthropic_key:
        from anthropic import Anthropic
        client = Anthropic(api_key=anthropic_key)
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}]
        )
        return response.content[0].text

    elif openai_key:
        from openai import OpenAI
        client = OpenAI(api_key=openai_key)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        return response.choices[0].message.content

    elif gemini_key:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=gemini_key)
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
            ),
        )
        return response.text

    else:
        raise ValueError("Nenhuma chave de LLM configurada. Por favor, configure ANTHROPIC_API_KEY, OPENAI_API_KEY ou GEMINI_API_KEY.")


def get_agent_prompt(agent_id: str) -> str:
    """Fetches agent master prompt from DB. Falls back to a sensible default."""
    try:
        res = supabase.table("dmz_agents_prompts") \
            .select("content") \
            .eq("agent_id", agent_id) \
            .order("version", desc=True) \
            .limit(1) \
            .execute()
        if res.data:
            return res.data[0]["content"]
    except Exception:
        pass
    return "Você é ORCH, o Orchestrator Master do squad DMZ. Ajude o usuário a estruturar projetos e debates com clareza e objetividade."


def get_sys_prompt(p_id: str, default: str = "") -> str:
    """Fetches a system/tool prompt from DB with fallback."""
    try:
        res = supabase.table("dmz_agents_prompts") \
            .select("content") \
            .eq("agent_id", p_id) \
            .limit(1) \
            .execute()
        return res.data[0]["content"] if res.data else default
    except Exception:
        return default


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


@app.post("/chat")
async def chat_interaction(req: ChatRequest):
    try:
        # Map short names to DB IDs
        agent_db_id = req.agent_id
        if agent_db_id == "orch":
            agent_db_id = "orchestrator"

        # Build system prompt from DB
        system_prompt = get_agent_prompt(agent_db_id)

        # Apply global formatting rule
        system_prompt += "\n" + get_sys_prompt(
            "system_formatting",
            (
                "REGRAS DE FORMATO — NUNCA QUEBRE ESTAS REGRAS:\n"
                "1. Escreva como um humano em conversa casual, não como um relatório ou apresentação.\n"
                "2. Use parágrafos curtos de 1 a 3 frases. Deixe uma linha em branco entre cada parágrafo.\n"
                "3. NUNCA use markdown: sem **, sem #, sem -, sem bullets, sem numeração de listas.\n"
                "4. Não enumere tópicos. Se precisar listar coisas, escreva em texto corrido separado por parágrafo.\n"
                "5. Faça perguntas para engajar o usuário. Termine sempre com uma pergunta ou próximo passo claro.\n"
                "6. Tom: direto, humano, especialista que fala sem jargão, como um sócio experiente conversando."
            )
        )

        # Apply tool-specific prompts
        if req.tool == "searchWeb":
            system_prompt += "\n" + get_sys_prompt(
                "tool_search_web",
                "MODO DEEP WEB RESEARCH ATIVADO. Busque informações atualizadas com profundidade. Cite fontes quando possível."
            )
        elif req.tool == "createImage":
            system_prompt += "\n" + get_sys_prompt(
                "tool_create_image",
                "MODO GERAÇÃO DE IMAGEM ATIVADO. Descreva a imagem que seria gerada detalhadamente com base no pedido do usuário."
            )
        elif req.tool == "writeCode":
            system_prompt += "\n" + get_sys_prompt(
                "tool_write_code",
                "MODO CÓDIGO ATIVADO. Foque em soluções técnicas e arquitetura limpa. Explique o código linha a linha quando necessário."
            )

        # Detect attachment type
        att_type = (req.file_type or "").lower()
        file_ext = (req.file_url or "").split(".")[-1].lower() if req.file_url else ""
        is_image = "image" in att_type or file_ext in ["jpg", "jpeg", "png", "gif", "webp", "heic", "avif"]
        is_audio = "audio" in att_type or file_ext in ["mp3", "wav", "m4a", "ogg", "opus", "flac", "aac"]
        is_pdf = "pdf" in att_type or file_ext == "pdf"

        # Apply attachment-specific system prompts
        if req.file_url:
            if is_image:
                system_prompt += "\n" + get_sys_prompt(
                    "attachment_image",
                    "O usuário enviou uma imagem. Analise visualmente o conteúdo da imagem e responda de forma detalhada sobre o que você vê."
                )
            elif is_audio:
                system_prompt += "\n" + get_sys_prompt(
                    "attachment_audio",
                    "O usuário enviou um arquivo de áudio transcrito. Analise o conteúdo da transcrição e responda com base nela."
                )
            elif is_pdf:
                system_prompt += "\n" + get_sys_prompt(
                    "attachment_pdf",
                    "O usuário enviou um PDF. Analise seu conteúdo e responda com base nele."
                )

        # Build full message
        full_message = req.message or ""

        # For image attachments: use multimodal LLM if possible
        if req.file_url and is_image:
            gemini_key = os.getenv("GEMINI_API_KEY")
            anthropic_key = os.getenv("ANTHROPIC_API_KEY")

            if gemini_key:
                # Gemini supports image URL directly
                from google import genai
                from google.genai import types
                client = genai.Client(api_key=gemini_key)

                prompt_parts = []
                if full_message:
                    prompt_parts.append(full_message)
                prompt_parts.append(types.Part.from_uri(file_uri=req.file_url, mime_type=req.file_type or "image/jpeg"))

                response = client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=prompt_parts,
                    config=types.GenerateContentConfig(system_instruction=system_prompt)
                )
                return {"agent_id": req.agent_id, "content": response.text, "status": "success"}

            elif anthropic_key:
                # Anthropic: fetch image and send as base64
                import base64, requests as req_lib
                img_resp = req_lib.get(req.file_url, timeout=10)
                img_b64 = base64.standard_b64encode(img_resp.content).decode("utf-8")
                media_type = req.file_type or "image/jpeg"

                from anthropic import Anthropic
                client = Anthropic(api_key=anthropic_key)
                response = client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=4096,
                    system=system_prompt,
                    messages=[{
                        "role": "user",
                        "content": [
                            {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": img_b64}},
                            {"type": "text", "text": full_message or "Analise esta imagem."}
                        ]
                    }]
                )
                return {"agent_id": req.agent_id, "content": response.content[0].text, "status": "success"}

        # For non-image or fallback: append context to message text
        if req.file_url and not is_image:
            full_message += f"\n\n[Arquivo anexado: {req.file_url} — Tipo: {req.file_type}]"

        # Call LLM (text mode)
        response_text = get_llm_response(system_prompt, full_message)

        return {
            "agent_id": req.agent_id,
            "content": response_text,
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
