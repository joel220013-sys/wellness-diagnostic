import os
import urllib.parse
from typing import Optional, List, Dict, Any
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False
    psycopg2 = None
    RealDictCursor = None

# Get DATABASE_URL from environment or fallback to .env.local
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    env_local_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env.local"))
    if os.path.exists(env_local_path):
        with open(env_local_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("DATABASE_URL="):
                    DATABASE_URL = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break

def get_connection():
    if not PSYCOPG2_AVAILABLE or not DATABASE_URL:
        return None
    try:
        conn = psycopg2.connect(DATABASE_URL, sslmode="require", connect_timeout=5)
        conn.autocommit = True
        return conn
    except Exception as e:
        print(f"[Supabase DB Warning] Could not connect to Supabase: {e}")
        return None

def fetch_all(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    conn = get_connection()
    if not conn:
        return []
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            rows = cur.fetchall()
            return [dict(r) for r in rows]
    except Exception as e:
        print(f"[Supabase DB Error] fetch_all: {e}")
        return []
    finally:
        conn.close()

def fetch_one(query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    if not conn:
        return None
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            row = cur.fetchone()
            return dict(row) if row else None
    except Exception as e:
        print(f"[Supabase DB Error] fetch_one: {e}")
        return None
    finally:
        conn.close()

def execute(query: str, params: tuple = ()) -> bool:
    conn = get_connection()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return True
    except Exception as e:
        print(f"[Supabase DB Error] execute: {e}")
        return False
    finally:
        conn.close()
