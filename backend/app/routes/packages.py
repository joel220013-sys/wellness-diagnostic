from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.data.mock_db import DB

router = APIRouter(prefix="/api/packages", tags=["Health Packages"])

@router.get("")
def get_packages():
    pkgs = [p for p in DB["packages"] if p.get("active", True)]
    return {
        "success": True,
        "count": len(pkgs),
        "data": pkgs
    }

@router.get("/{package_id}")
def get_package_by_id(package_id: str):
    for p in DB["packages"]:
        if p["id"] == package_id or p.get("slug") == package_id:
            return {
                "success": True,
                "data": p
            }
    raise HTTPException(status_code=404, detail="Health package not found")
