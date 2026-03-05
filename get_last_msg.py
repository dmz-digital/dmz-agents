import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(".env.dmz")
client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
res = client.table("dmz_agents_chat").select("*").order("created_at", desc=True).limit(8).execute()
for r in res.data:
    print(f"[{r['role']}] ID: {r['id']}")
    print(r['content'][:150])
    if '<dmz_artifact' in r['content']:
        print("CONTAINS ARTIFACT!")
        print("LENGTH:", len(r['content']))
    print("----------------")
