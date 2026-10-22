from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.data.mock_db import DB
from app.data import supabase_db

router = APIRouter(prefix="/api/tests", tags=["Diagnostic Tests"])

@router.get("")
def get_tests(
    category: Optional[str] = Query(None, description="Filter tests by category"),
    search: Optional[str] = Query(None, description="Search term in test name or description")
):
    # Try fetching directly from live Supabase
    supabase_tests = supabase_db.fetch_all("SELECT * FROM public.tests WHERE is_active = true ORDER BY name ASC;")
    if supabase_tests:
        tests = supabase_tests
    else:
        tests = [t for t in DB["tests"] if t.get("active", True)]
    
    if category and category.upper() != "ALL":
        tests = [t for t in tests if t.get("category", "").lower() == category.lower()]
        
    if search:
        s = search.lower()
        tests = [
            t for t in tests 
            if s in t.get("name", "").lower() or s in t.get("description", "").lower()
        ]
        
    return {
        "success": True,
        "count": len(tests),
        "source": "supabase" if supabase_tests else "local",
        "data": tests
    }

@router.get("/{test_id}")
def get_test_by_id(test_id: str):
    for t in DB["tests"]:
        if t["id"] == test_id or t.get("slug") == test_id:
            return {
                "success": True,
                "data": t
            }
    raise HTTPException(status_code=404, detail="Diagnostic test not found")
