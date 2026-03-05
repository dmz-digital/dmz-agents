import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(".env.dmz")
try:
    print("DB anon query test:")
    client_anon = create_client(os.getenv("SUPABASE_URL"), "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcWl5eXhjb3V0Ym11c3p3ZWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5OTg5NSwiZXhwIjoyMDY4ODc1ODk1fQ.FAKE")
    print("DB anon:", len(client_anon.table("admin_system_models").select("*").execute().data))
except Exception as e:
    print("DB Anon Error:", e)

try:
    print("Storage anon query test:")
    client_anon.storage.from_("images").upload("test_anon.txt", b"hello world")
except Exception as e:
    print("Storage Anon Error:", e)
