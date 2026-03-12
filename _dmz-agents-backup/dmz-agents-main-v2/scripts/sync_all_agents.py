import os
import re
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(".env.dmz")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# Mapping of file basename prefix to DB Agent ID
# This map covers both Core and Sales agents
id_map = {
    # Core Agents
    "alex": "architect",
    "aurora": "design_chief",
    "cassandra": "copy_chief",
    "constantine": "cyber_chief",
    "emma": "qa",
    "jose": "pm",
    "kanya": "analyst",
    "lucas": "po",
    "oliver": "devops",
    "orch": "orchestrator",
    "ryan": "developer",
    "syd": "squad_manager",
    "theron": "legal_chief",
    "victoria": "ux",
    # Sales Agents
    "closer": "closer",
    "cra": "cra",
    "deck": "deck",
    "draft": "draft_chief",
    "ecvc": "ecvc",
    "emailcopy": "emailcopy",
    "finmodel": "finmodel",
    "hunter": "hunter",
    "intel": "intel",
    "ir": "ir",
    "lens": "lens",
    "mapper": "mapper",
    "nurture": "nurture",
    "oracle": "oracle",
    "osint": "osint",
    "persona": "persona",
    "pitch": "pitch",
    "push": "push",
    "qualifier": "qualifier",
    "radar": "radar",
    "rebound": "rebound",
    "revops": "revops",
    "scheduler": "scheduler",
    "social": "social",
    "story": "story",
    "vault": "vault"
}

def sync_dir(directory):
    agents_data = {}
    for filename in os.listdir(directory):
        # Handle different separators like '-' or '_' or '.'
        prefix = re.split(r'[-_.]', filename)[0]
        if prefix not in agents_data:
            agents_data[prefix] = {"prompt": "", "skills": []}
        
        path = os.path.join(directory, filename)
        if os.path.isdir(path): continue

        if "prompt" in filename and filename.endswith(".md"):
            with open(path, "r", encoding="utf-8") as f:
                agents_data[prefix]["prompt"] = f.read()
        elif "skills" in filename and filename.endswith(".md"):
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                # Parse skills: SKILL_XX :: Name\n Description
                matches = re.findall(r"SKILL_\d+ :: (.*?)\n(.*?)(?=\nSKILL_|\Z)", content, re.DOTALL)
                for m in matches:
                    agents_data[prefix]["skills"].append({
                        "name": m[0].strip(),
                        "description": m[1].strip()
                    })
    
    for prefix, data in agents_data.items():
        agent_id = id_map.get(prefix)
        if not agent_id:
            print(f"Skipping unknown prefix: {prefix}")
            continue

        # Sync Prompt
        if data["prompt"]:
            supabase.table("dmz_agents_prompts").upsert({
                "agent_id": agent_id,
                "content": data["prompt"],
                "version": 1,
                "active": True,
                "change_notes": "Synchronized from documentation"
            }, on_conflict="agent_id").execute()
            print(f"Synced prompt for {agent_id}")

        # Sync Skills
        if data["skills"]:
            for s in data["skills"]:
                supabase.table("dmz_agents_skills").upsert({
                    "agent_id": agent_id,
                    "name": s["name"],
                    "category": "skill",
                    "level": "expert",
                    "description": s["description"]
                }, on_conflict="agent_id,name").execute()
            print(f"Synced {len(data['skills'])} skills for {agent_id}")

print("Starting Global Sync...")
sync_dir("docs/capabilities")
sync_dir("docs/capabilities/sales")
print("Global Sync Complete.")
