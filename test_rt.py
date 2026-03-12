import os
import time
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(".env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

def callback(payload):
    print("Payload received:", payload)

print("Subscribing to realtime...")
channel = supabase.channel("test_channel")
channel.on("postgres_changes", event="*", schema="public", table="dmz_agents_tasks", callback=callback)
channel.subscribe()

print("Listening for 10 seconds...")
time.sleep(10)
print("Done")
