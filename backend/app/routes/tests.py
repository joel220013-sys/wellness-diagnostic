import re
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.data import supabase_db
from app.data.store import get_live_tests, _format_record

router = APIRouter(prefix="/api/tests", tags=["Diagnostic Tests"])

@router.get("")
def get_tests(
    category: Optional[str] = Query(default=None, description="Filter tests by category"),
    search: Optional[str] = Query(default=None, description="Search term in test name or description"),
    all: Optional[bool] = Query(default=False, description="Include inactive tests")
):
    is_all = False
    if isinstance(all, bool):
        is_all = all
    elif isinstance(all, str):
        is_all = all.lower() in ("true", "1", "yes")
        
    tests = get_live_tests(include_inactive=is_all)
    
    if isinstance(category, str) and category.strip() and category.upper() != "ALL":
        tests = [t for t in tests if str(t.get("category", "")).lower() == category.lower()]
        
    if isinstance(search, str) and search.strip():
        s = search.lower().strip()
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
    row = supabase_db.fetch_one(
        "SELECT * FROM public.tests WHERE id = %s OR LOWER(id) = LOWER(%s);", 
        (test_id, test_id)
    )
    if row:
        return {"success": True, "data": _format_record(row)}
        
    # Fallback to search by slug / name
    tests = get_live_tests(include_inactive=True)
    for t in tests:
        if t.get("id") == test_id or t.get("slug") == test_id or str(t.get("name", "")).lower() == test_id.lower():
            return {"success": True, "data": t}
            
    raise HTTPException(status_code=404, detail="Diagnostic test not found")

@router.post("")
def create_test(payload: Dict[str, Any]):
    name = (payload.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Test name is required")
    
    test_id = (payload.get("id") or "").strip()
    if not test_id:
        slug_base = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        test_id = f"test_{slug_base}_{int(datetime.utcnow().timestamp())}"
    
    category = payload.get("category") or "Routine Hemogram"
    try:
        price = float(payload.get("price") or 0)
    except (ValueError, TypeError):
        price = 0.0
        
    try:
        original_price = float(payload.get("original_price") or price)
    except (ValueError, TypeError):
        original_price = price
        
    tat = payload.get("turnaround_description") or payload.get("tat") or "Same Day (8-12 Hours)"
    sample_type = payload.get("sample_type") or "Blood"
    description = payload.get("description") or f"Diagnostic test screening for {name}."
    
    is_active = True
    if "active" in payload:
        is_active = bool(payload.get("active"))
    elif "is_active" in payload:
        is_active = bool(payload.get("is_active"))
        
    is_popular = bool(payload.get("popular") or payload.get("is_popular", False))
    fasting_required = bool(payload.get("fasting_required") or "fasting" in str(payload.get("preparation_instructions", "")).lower())
    fasting_hours = int(payload.get("fasting_hours") or (10 if fasting_required else 0))
    parameters_count = int(payload.get("parameters_count") or 1)
    
    params_list = payload.get("parameters_list")
    if isinstance(params_list, (list, dict)):
        params_json = json.dumps(params_list)
    elif isinstance(params_list, str):
        params_json = params_list
    else:
        params_json = json.dumps([{"name": name}])
        
    icon_name = payload.get("icon_name") or "flask"

    insert_sql = """
    INSERT INTO public.tests (
        id, name, category, price, original_price, tat, sample_type, description,
        parameters_count, parameters_list, fasting_required, fasting_hours,
        is_active, is_popular, icon_name
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s, %s
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        price = EXCLUDED.price,
        original_price = EXCLUDED.original_price,
        tat = EXCLUDED.tat,
        sample_type = EXCLUDED.sample_type,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active,
        is_popular = EXCLUDED.is_popular
    RETURNING *;
    """
    row = supabase_db.fetch_one(
        insert_sql,
        (
            test_id, name, category, price, original_price, tat, sample_type, description,
            parameters_count, params_json, fasting_required, fasting_hours,
            is_active, is_popular, icon_name
        )
    )
    if not row:
        raise HTTPException(status_code=500, detail="Failed to persist test to database")
        
    return {
        "success": True,
        "message": "Diagnostic test created successfully",
        "data": _format_record(row)
    }

@router.patch("/{test_id}")
@router.put("/{test_id}")
def update_test(test_id: str, payload: Dict[str, Any]):
    # Locate test row by id or lowercase id
    existing = supabase_db.fetch_one(
        "SELECT * FROM public.tests WHERE id = %s OR LOWER(id) = LOWER(%s);",
        (test_id, test_id)
    )
    if not existing:
        raise HTTPException(status_code=404, detail=f"Test '{test_id}' not found in database")
    
    target_id = existing["id"]
    
    field_mappings = {
        "name": ("name", str),
        "category": ("category", str),
        "price": ("price", float),
        "original_price": ("original_price", float),
        "tat": ("tat", str),
        "turnaround_description": ("tat", str),
        "sample_type": ("sample_type", str),
        "description": ("description", str),
        "is_active": ("is_active", bool),
        "active": ("is_active", bool),
        "is_popular": ("is_popular", bool),
        "popular": ("is_popular", bool),
        "fasting_required": ("fasting_required", bool),
        "fasting_hours": ("fasting_hours", int),
        "parameters_count": ("parameters_count", int),
        "icon_name": ("icon_name", str),
    }
    
    set_clauses = []
    values = []
    handled_cols = set()
    
    for key, val in payload.items():
        if key in field_mappings and val is not None:
            col_name, col_type = field_mappings[key]
            if col_name in handled_cols:
                continue
            handled_cols.add(col_name)
            try:
                converted_val = col_type(val)
            except Exception:
                converted_val = val
            set_clauses.append(f"{col_name} = %s")
            values.append(converted_val)
            
    # Handle parameters_list
    if "parameters_list" in payload and "parameters_list" not in handled_cols:
        p_list = payload["parameters_list"]
        if isinstance(p_list, (list, dict)):
            p_json = json.dumps(p_list)
        else:
            p_json = str(p_list)
        set_clauses.append("parameters_list = %s::jsonb")
        values.append(p_json)
        handled_cols.add("parameters_list")
        
    if not set_clauses:
        return {
            "success": True,
            "message": "No fields to update",
            "data": _format_record(existing)
        }
        
    values.append(target_id)
    update_sql = f"UPDATE public.tests SET {', '.join(set_clauses)} WHERE id = %s RETURNING *;"
    
    updated_row = supabase_db.fetch_one(update_sql, tuple(values))
    if not updated_row:
        raise HTTPException(status_code=500, detail="Failed to update test record in database")
        
    return {
        "success": True,
        "message": "Test updated successfully",
        "data": _format_record(updated_row)
    }

@router.delete("/{test_id}")
def delete_test(test_id: str):
    existing = supabase_db.fetch_one(
        "SELECT id FROM public.tests WHERE id = %s OR LOWER(id) = LOWER(%s);",
        (test_id, test_id)
    )
    if not existing:
        raise HTTPException(status_code=404, detail=f"Test '{test_id}' not found")
        
    supabase_db.execute("DELETE FROM public.tests WHERE id = %s;", (existing["id"],))
    return {
        "success": True,
        "message": f"Test '{existing['id']}' deleted permanently from database"
    }
