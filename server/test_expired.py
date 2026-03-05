import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(".env.dmz")

# A token that is correctly signed (presumably) but explicitly expired? We can't forge it without the secret.
# Let's test with a completely random token that is valid Base64 JSON but wrong signature.
try:
    print("Storage anon query test:")
    client_anon = create_client(os.getenv("SUPABASE_URL"), "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcWl5eXhjb3V0Ym11c3p3ZWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTUwMzI5OTg5NSwiZXhwIjoxNTAzMzAwODk1fQ.FAKE")
    client_anon.storage.from_("images").upload("test_anon.txt", b"hello world")
except Exception as e:
    print("Storage Anon Error:", e)
