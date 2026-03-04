import os
import re
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(".env.dmz")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

base_dir = "docs/capabilities/sales"
agents = {}

# Map of prefix to DB ID (based on populate_agents.sql)
id_map = {
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

for filename in os.listdir(base_dir):
    prefix = filename.split("-")[0]
    if prefix not in agents:
        agents[prefix] = {"prompt": "", "skills": []}
    
    path = os.path.join(base_dir, filename)
    if filename.endswith("-prompt.md"):
        with open(path, "r", encoding="utf-8") as f:
            agents[prefix]["prompt"] = f.read()
    elif filename.endswith("-skills.md"):
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
            # Parse skills: SKILL_XX :: Name\n Description
            matches = re.findall(r"SKILL_\d+ :: (.*?)\n(.*?)(?=\nSKILL_|\Z)", content, re.DOTALL)
            for m in matches:
                agents[prefix]["skills"].append({
                    "name": m[0].strip(),
                    "description": m[1].strip()
                })

# Insert into DB
for prefix, data in agents.items():
    agent_id = id_map.get(prefix)
    if not agent_id:
        print(f"Skipping unknown prefix: {prefix}")
        continue

    # Prompt
    if data["prompt"]:
        supabase.table("dmz_agents_prompts").upsert({
            "agent_id": agent_id,
            "content": data["prompt"],
            "version": 1,
            "active": True,
            "change_notes": "Incorporate sales agent prompt"
        }).execute()
        print(f"Upserted prompt for {agent_id}")

    # Skills
    if data["skills"]:
        # Delete old skills first to avoid duplicates or keep it simple with upsert if possible
        # Actually dmz_agents_skills has no simple PK for upsert besides potentially agent_id+name
        # Let's just insert
        for s in data["skills"]:
            supabase.table("dmz_agents_skills").upsert({
                "agent_id": agent_id,
                "name": s["name"],
                "category": "skill",
                "level": "expert",
                "description": s["description"]
            }).execute()
        print(f"Upserted {len(data['skills'])} skills for {agent_id}")

print("Sync complete.")
