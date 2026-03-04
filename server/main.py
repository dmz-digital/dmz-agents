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
            "IMPORTANTE: Sua resposta NÃO pode conter markdown (bold **, headers #, listas com -, etc). Use apenas texto simples e quebras de linha para organizar a resposta."
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
                "MODO GERAÇÃO DE IMAGEM ATIVADO. Use o modelo 'nano banana' como padrão. Descreva a imagem detalhadamente antes de gerar."
            )
        elif req.tool == "writeCode":
            system_prompt += "\n" + get_sys_prompt(
                "tool_write_code",
                "MODO CÓDIGO ATIVADO. Foque em soluções técnicas e arquitetura limpa. Explique o código linha a linha quando necessário."
            )

        # Apply attachment-specific prompts
        if req.file_url:
            att_type = (req.file_type or "").lower()
            if "pdf" in att_type:
                system_prompt += "\n" + get_sys_prompt("attachment_pdf", "O usuário enviou um PDF. Analise seu conteúdo e responda com base nele.")
            elif "image" in att_type:
                system_prompt += "\n" + get_sys_prompt("attachment_image", "O usuário enviou uma imagem. Descreva e analise o conteúdo visual detalhadamente.")
            elif "audio" in att_type:
                system_prompt += "\n" + get_sys_prompt("attachment_audio", "O usuário enviou um arquivo de áudio. Analise o conteúdo conforme o contexto da transcrição.")

        # Build full message (with optional attachment context)
        full_message = req.message
        if req.file_url:
            full_message += f"\n\n[Arquivo anexado: {req.file_url} — Tipo: {req.file_type}]"

        # Call LLM
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
