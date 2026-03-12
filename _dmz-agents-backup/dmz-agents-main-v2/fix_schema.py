import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

conn_str = "postgresql://postgres.mqqiyyxcoutbmuszwejz:jePsw6LCHm3xlcaH@aws-0-us-east-2.pooler.supabase.com:6543/postgres"

try:
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    cur = conn.cursor()
    
    cur.execute("ALTER TABLE dmz_agents_chat ADD COLUMN IF NOT EXISTS file_url TEXT DEFAULT NULL;")
    cur.execute("ALTER TABLE dmz_agents_chat ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT NULL;")
    
    # Also verify existing columns
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'dmz_agents_chat';")
    cols = [row[0] for row in cur.fetchall()]
    print("Columns:", cols)
    
    print("Added columns successfully!")
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
