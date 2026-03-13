import os
from dotenv import load_dotenv
load_dotenv(".env.dmz")
from supabase import create_client, ClientOptions

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_ANON_KEY")
api_key = os.environ.get("DMZ_API_KEY")

opts = ClientOptions(headers={"x-dmz-api-key": api_key})
db = create_client(url, key, options=opts)

db.table("dmz_agents_tasks").update({"status": "pending"}).eq("status", "blocked").execute()
print("Tasks restabelecidas para pending.")
