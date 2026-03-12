"""Motor base de Agentes"""

from typing import Dict, Any, List

class AgentContext:
    def __init__(self, db_client, project_id: str, agent_id: str):
        self.db = db_client
        self.project_id = project_id
        self.agent_id = agent_id
        self.handle = f"@{agent_id}"

    def get_prompt(self) -> str:
        """Puxa o prompt master do banco de dados"""
        res = self.db.table("dmz_agents_prompts")\
            .select("content")\
            .eq("agent_id", self.agent_id)\
            .order("version", desc=True)\
            .limit(1)\
            .execute()
        
        if res.data:
            return res.data[0]["content"]
        return "You are a helpful AI agent."

    def get_skills(self) -> List[Dict]:
        """Puxa as skills que o agente domina"""
        res = self.db.table("dmz_agents_skills")\
            .select("name, description")\
            .eq("agent_id", self.agent_id)\
            .execute()
        return res.data or []

    def save_memory(self, content: str, task_context: str = "general"):
        """Persiste um output no banco como memória deste agente."""
        import uuid
        self.db.table("dmz_agents_memory").insert({
            "project_id": self.project_id,
            "agent_id": self.agent_id,
            "content": content,
            "memory_type": "task",
            "key": f"orch-task-{uuid.uuid4().hex[:8]}"
        }).execute()

    def build_system_prompt(self, project_context: str = "") -> str:
        base_prompt = self.get_prompt()
        skills = self.get_skills()
        
        rendered = f"{base_prompt}\n\n"
        if skills:
            rendered += "### Your Core Skills:\n"
            for s in skills:
                rendered += f"- {s['name']}: {s['description']}\n"
        
        rendered += f"\n### Project Context:\n{project_context}"
        return rendered
