from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

settings = Settings()

app = FastAPI(title="DMZ Agents API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Client
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

@app.get("/")
async def root():
    return {"message": "DMZ Agents API is running", "status": "healthy"}

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

from pydantic import BaseModel
import sys

# Add cli to path to import engine
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "cli"))

from dmz_os.engine.llm import get_llm_response
from dmz_os.engine.agent import AgentContext

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
        
        # Load agent context
        agent = AgentContext(supabase, req.project_id, agent_db_id)
        
        # Build prompt
        system_prompt = agent.build_system_prompt()
        
        # Call LLM
        # Ensure the response is NOT markdown as requested by user
        system_prompt += "\nIMPORTANTE: Sua resposta NÃO pode conter markdown (como bold **, headers #, etc). Use apenas texto simples e quebras de linha para organizar a resposta."
        
        if req.tool == "deepResearch":
            system_prompt += "\nMODO PESQUISA PROFUNDA ATIVADO. Você agora tem acesso a ferramentas de busca via Firecrawl. Analise profundamente e forneça uma resposta técnica e embasada."

        full_message = req.message
        if req.file_url:
            full_message = f"{full_message}\n\n[Anexo enviado pelo usuário: {req.file_url} (Tipo: {req.file_type})]"

        response = get_llm_response(system_prompt, full_message)
        
        return {
            "agent_id": req.agent_id,
            "content": response,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
