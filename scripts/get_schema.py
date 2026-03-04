import os
import sys
import json
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
if not url: url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
if not key: key = os.getenv('SUPABASE_ANON_KEY')

print(f"Connecting to {url}", file=sys.stderr)
supabase = create_client(url, key)
try:
    res = supabase.table('dmz_agents_definitions').select('*').limit(1).execute()
    if res.data:
        print(f"KEYS: {list(res.data[0].keys())}")
    else:
        print("No rows in dmz_agents_definitions")
except Exception as e:
    print(f"ERROR: {e}")
