from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv(".env.dmz")
print("Local query test:")
client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
try:
    print("DB:", len(client.table("admin_system_models").select("*").execute().data))
except Exception as e:
    print("DB Error:", e)

print("Anon query test:")
client_anon = create_client(os.getenv("SUPABASE_URL"), "eyJh")
try:
    print("DB anon:", len(client_anon.table("admin_system_models").select("*").execute().data))
except Exception as e:
    print("DB Anon Error:", e)
