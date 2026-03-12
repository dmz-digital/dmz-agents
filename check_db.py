import os, json
from supabase import create_client, ClientOptions
from dotenv import load_dotenv

load_dotenv(".env.dmz")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_ANON_KEY")

opts = ClientOptions(headers={"x-dmz-api-key": os.environ.get("DMZ_API_KEY")})
db = create_client(url, key, options=opts)

data = db.table("dmz_agents_tasks").select("id, title, agent_id, status").order("created_at", desc=True).limit(5).execute()
print(json.dumps(data.data, indent=2))
