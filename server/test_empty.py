import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(".env.dmz")
try:
    print("Empty key DB test:")
    client = create_client(os.getenv("SUPABASE_URL"), "")
    print("DB empty:", len(client.table("admin_system_models").select("*").execute().data))
except Exception as e:
    print("DB Empty Error:", e)

try:
    print("Storage empty test:")
    client.storage.from_("images").upload("test_empty.txt", b"hello world")
except Exception as e:
    print("Storage Empty Error:", e)
