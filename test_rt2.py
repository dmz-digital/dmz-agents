import os
import asyncio
from dotenv import load_dotenv
from supabase import create_async_client, AsyncClient

load_dotenv(".env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

async def main():
    if not url or not key:
        print("Missing URL or KEY")
        return
        
    print(f"Connecting to {url}")
    supabase: AsyncClient = await create_async_client(url, key)
    
    def callback(payload):
        print("Payload:", payload)

    channel = supabase.channel("tasks")
    channel = channel.on("postgres_changes", event="*", schema="public", table="dmz_agents_tasks", callback=callback)
    await channel.subscribe()

    print("Listening for 10 seconds...")
    await asyncio.sleep(10)
    print("Done listening")

if __name__ == "__main__":
    asyncio.run(main())
