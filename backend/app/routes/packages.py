from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.data.store import get_live_packages

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
