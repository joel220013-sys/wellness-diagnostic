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

def get_live_tests() -> List[Dict[str, Any]]:
    """Fetch live diagnostic tests catalog from Supabase PostgreSQL database."""
    tests = supabase_db.fetch_all("SELECT * FROM public.tests WHERE is_active = true ORDER BY name ASC;")
    return tests or []

def get_live_packages() -> List[Dict[str, Any]]:
    """Fetch live diagnostic health packages from Supabase PostgreSQL database."""
    # Packages can be fetched from tests categorized as package or packages table
    packages = supabase_db.fetch_all("SELECT * FROM public.tests WHERE category ILIKE '%package%' OR category ILIKE '%checkup%' AND is_active = true;")
    return packages or []
