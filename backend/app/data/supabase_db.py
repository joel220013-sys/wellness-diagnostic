import os
import urllib.parse
from typing import Optional, List, Dict, Any
import threading

try:
    import psycopg2
    from psycopg2 import pool
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False
    psycopg2 = None
    pool = None
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

_pool: Optional[Any] = None
_pool_lock = threading.Lock()

def get_pool():
    global _pool
    if _pool is not None:
        return _pool
    if not PSYCOPG2_AVAILABLE or not DATABASE_URL:
        return None
    with _pool_lock:
        if _pool is None:
            try:
                # Thread-safe connection pool for handling 10-25 concurrent requests effortlessly
                _pool = pool.ThreadedConnectionPool(
                    minconn=2,
                    maxconn=25,
                    dsn=DATABASE_URL,
                    sslmode="require",
                    connect_timeout=8
                )
            except Exception as e:
                print(f"[Supabase DB Warning] Could not initialize connection pool: {e}")
                _pool = None
    return _pool

def get_connection():
    p = get_pool()
    if p:
        try:
            conn = p.getconn()
            if conn and conn.closed == 0:
                conn.autocommit = True
                return conn, True
            elif conn:
                p.putconn(conn, close=True)
        except Exception as e:
            print(f"[Supabase Pool Warning] getconn error, falling back to direct: {e}")

    # Fallback to direct connect if pool is full or unavailable
    if not PSYCOPG2_AVAILABLE or not DATABASE_URL:
        return None, False
    try:
        conn = psycopg2.connect(DATABASE_URL, sslmode="require", connect_timeout=5)
        conn.autocommit = True
        return conn, False
    except Exception as e:
        print(f"[Supabase DB Warning] Could not connect to Supabase: {e}")
        return None, False

def release_connection(conn, from_pool: bool, is_bad: bool = False):
    if not conn:
        return
    p = get_pool()
    if from_pool and p:
        try:
            p.putconn(conn, close=is_bad)
            return
        except Exception:
            pass
    try:
        conn.close()
    except Exception:
        pass

def fetch_all(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    conn, from_pool = get_connection()
    if not conn:
        return []
    is_bad = False
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if params:
                cur.execute(query, params)
            else:
                cur.execute(query)
            rows = cur.fetchall()
            return [dict(r) for r in rows]
    except Exception as e:
        is_bad = True
        print(f"[Supabase DB Error] fetch_all: {e}")
        return []
    finally:
        release_connection(conn, from_pool, is_bad)

def fetch_one(query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
    conn, from_pool = get_connection()
    if not conn:
        return None
    is_bad = False
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if params:
                cur.execute(query, params)
            else:
                cur.execute(query)
            row = cur.fetchone()
            return dict(row) if row else None
    except Exception as e:
        is_bad = True
        print(f"[Supabase DB Error] fetch_one: {e}")
        return None
    finally:
        release_connection(conn, from_pool, is_bad)

def execute(query: str, params: tuple = ()) -> bool:
    conn, from_pool = get_connection()
    if not conn:
        return False
    is_bad = False
    try:
        with conn.cursor() as cur:
            if params:
                cur.execute(query, params)
            else:
                cur.execute(query)
            return True
    except Exception as e:
        is_bad = True
        print(f"[Supabase DB Error] execute: {e}")
        return False
    finally:
        release_connection(conn, from_pool, is_bad)
