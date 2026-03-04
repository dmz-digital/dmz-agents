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
    agent_id: str = "orchestrator"
    project_id: str = "default"

@app.post("/chat")
async def chat_interaction(req: ChatRequest):
    try:
        # Load agent context
        agent = AgentContext(supabase, req.project_id, req.agent_id)
        
        # Build prompt
        system_prompt = agent.build_system_prompt()
        
        # Call LLM
        # Ensure the response is NOT markdown as requested by user
        system_prompt += "\nIMPORTANTE: Sua resposta NÃO pode conter markdown (como bold **, headers #, etc). Use apenas texto simples e quebras de linha para organizar a resposta."
        
        response = get_llm_response(system_prompt, req.message)
        
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
