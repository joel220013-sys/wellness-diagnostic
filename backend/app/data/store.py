"""
Production Data Store for Wellness Diagnostic Backend
Handles state management, Supabase persistence, and clean empty initialization.
"""
from typing import Dict, List, Any
from app.data import supabase_db

# Clean live data store (zero mock/fake orders or fake reports)
DB: Dict[str, List[Dict[str, Any]]] = {
    "bookings": [],
    "addresses": [],
    "drivers": [],
    "reports": [],
    "invoices": [],
    "events": []
}

def _format_record(r: Dict[str, Any]) -> Dict[str, Any]:
    price = float(r.get("price") or 0)
    orig_price = float(r.get("original_price") or price)
    return {
        **r,
        "price": price,
        "original_price": orig_price,
        "popular": bool(r.get("is_popular")),
        "active": bool(r.get("is_active", True)),
        "slug": r.get("id"),
        "turnaround_description": r.get("tat") or "Same Day (8-12 Hours)",
        "parameters_count": int(r.get("parameters_count") or 1),
    }

def get_live_tests(include_inactive: bool = False) -> List[Dict[str, Any]]:
    """Fetch live diagnostic tests catalog from Supabase PostgreSQL database."""
    if include_inactive:
        tests = supabase_db.fetch_all("SELECT * FROM public.tests ORDER BY name ASC;")
    else:
        tests = supabase_db.fetch_all("SELECT * FROM public.tests WHERE is_active = true ORDER BY name ASC;")
    if not tests:
        return []
    return [_format_record(t) for t in tests]

def get_live_packages() -> List[Dict[str, Any]]:
    """Fetch live diagnostic health packages from Supabase PostgreSQL database."""
    query = """
    SELECT * FROM public.tests 
    WHERE is_active = true 
      AND (id LIKE 'pkg_%%' OR category ILIKE '%%package%%' OR category ILIKE '%%checkup%%' OR category ILIKE '%%full body%%')
      AND category NOT IN ('Diabetes', 'Hematology')
    ORDER BY is_popular DESC, price ASC;
    """
    packages = supabase_db.fetch_all(query)
    if not packages:
        return []
    return [_format_record(p) for p in packages]

