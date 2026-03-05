import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(".env.dmz")
print("URL:", os.getenv("SUPABASE_URL", ""))
print("KEY:", os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")[:15] + "...")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    print("Uploading file to images bucket...")
    res = supabase.storage.from_("images").upload("test_auth_sig.txt", b"hello world")
    print("Success:", res)
except Exception as e:
    print("Storage Error:", e)

