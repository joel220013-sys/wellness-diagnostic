from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.data.store import get_live_tests

router = APIRouter(prefix="/api/tests", tags=["Diagnostic Tests"])

@router.get("")
def get_tests(
    category: Optional[str] = Query(None, description="Filter tests by category"),
    search: Optional[str] = Query(None, description="Search term in test name or description")
):
    tests = get_live_tests()
    
    if category and category.upper() != "ALL":
        tests = [t for t in tests if str(t.get("category", "")).lower() == category.lower()]
        
    if search:
        s = search.lower()
        tests = [
            t for t in tests 
            if s in str(t.get("name", "")).lower() or s in str(t.get("description", "")).lower()
        ]
        
    return {
        "success": True,
        "count": len(tests),
        "source": "supabase",
        "data": tests
    }

@router.get("/{test_id}")
def get_test_by_id(test_id: str):
    tests = get_live_tests()
    for t in tests:
        if t.get("id") == test_id or t.get("slug") == test_id:
            return {
                "success": True,
                "data": t
            }
    raise HTTPException(status_code=404, detail="Diagnostic test not found")
