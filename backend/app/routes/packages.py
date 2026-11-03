import re
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.data import supabase_db
from app.data.store import get_live_packages, _format_record

router = APIRouter(prefix="/api/packages", tags=["Health Packages"])

@router.get("")
def get_packages():
    pkgs = get_live_packages()
    return {
        "success": True,
        "count": len(pkgs),
        "data": pkgs
    }

@router.get("/{package_id}")
def get_package_by_id(package_id: str):
    pkgs = get_live_packages()
    for p in pkgs:
        if p.get("id") == package_id or p.get("slug") == package_id:
            return {
                "success": True,
                "data": p
            }
    raise HTTPException(status_code=404, detail="Health package not found")

@router.post("")
def create_package(payload: Dict[str, Any]):
    name = (payload.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Package name is required")
    
    pkg_id = (payload.get("id") or "").strip()
    if not pkg_id:
        slug_base = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        pkg_id = f"pkg_{slug_base}_{int(datetime.utcnow().timestamp())}"
    
    category = payload.get("category") or "Health Packages"
    try:
        price = float(payload.get("price") or 0)
    except (ValueError, TypeError):
        price = 0.0
        
    try:
        original_price = float(payload.get("original_price") or price)
    except (ValueError, TypeError):
        original_price = price
        
    tat = payload.get("turnaround_description") or payload.get("tat") or "24-38 Hours"
    sample_type = payload.get("sample_type") or "Blood"
    description = payload.get("description") or f"Diagnostic checkup package profile for {name}."
    
    is_active = True
    if "active" in payload:
        is_active = bool(payload.get("active"))
    elif "is_active" in payload:
        is_active = bool(payload.get("is_active"))
        
    is_popular = bool(payload.get("popular") or payload.get("is_popular", False))
    fasting_required = bool(payload.get("fasting_required") or "fasting" in str(payload.get("preparation_instructions", "")).lower())
    fasting_hours = int(payload.get("fasting_hours") or (10 if fasting_required else 0))
    parameters_count = int(payload.get("parameters_count") or 50)
    
    params_list = payload.get("parameters_list") or []
    if isinstance(params_list, (list, dict)):
        params_json = json.dumps(params_list)
    else:
        params_json = str(params_list)

    icon_name = payload.get("icon_name") or "Package"

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
        parameters_count = EXCLUDED.parameters_count,
        is_active = EXCLUDED.is_active,
        is_popular = EXCLUDED.is_popular
    RETURNING *;
    """
    row = supabase_db.fetch_one(
        insert_sql,
        (
            pkg_id, name, category, price, original_price, tat, sample_type, description,
            parameters_count, params_json, fasting_required, fasting_hours,
            is_active, is_popular, icon_name
        )
    )
    if not row:
        raise HTTPException(status_code=500, detail="Failed to persist health package to database")
        
    return {
        "success": True,
        "message": "Health package created successfully",
        "data": _format_record(row)
    }

@router.patch("/{package_id}")
@router.put("/{package_id}")
def update_package(package_id: str, payload: Dict[str, Any]):
    existing = supabase_db.fetch_one(
        "SELECT * FROM public.tests WHERE id = %s OR LOWER(id) = LOWER(%s);",
        (package_id, package_id)
    )
    if not existing:
        raise HTTPException(status_code=404, detail=f"Package '{package_id}' not found in database")
    
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
        raise HTTPException(status_code=500, detail="Failed to update health package in database")
        
    return {
        "success": True,
        "message": "Health package updated successfully",
        "data": _format_record(updated_row)
    }

@router.delete("/{package_id}")
def delete_package(package_id: str):
    existing = supabase_db.fetch_one(
        "SELECT id FROM public.tests WHERE id = %s OR LOWER(id) = LOWER(%s);",
        (package_id, package_id)
    )
    if not existing:
        raise HTTPException(status_code=404, detail=f"Package '{package_id}' not found")
        
    supabase_db.execute("DELETE FROM public.tests WHERE id = %s;", (existing["id"],))
    return {
        "success": True,
        "message": f"Package '{existing['id']}' deleted permanently from database"
    }
