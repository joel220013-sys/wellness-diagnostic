import uuid
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.data.store import DB
from app.models.schemas import AddressSchema

router = APIRouter(prefix="/api/addresses", tags=["Patient Addresses"])

@router.get("")
def get_addresses(patient_id: Optional[str] = Query(None)):
    addrs = DB["addresses"]
    if patient_id:
        addrs = [a for a in addrs if a.get("patient_id") == patient_id]
    return {
        "success": True,
        "count": len(addrs),
        "data": addrs
    }

@router.post("")
def create_address(payload: AddressSchema):
    new_addr = payload.model_dump()
    new_addr["id"] = new_addr.get("id") or f"addr_{uuid.uuid4().hex[:8]}"
    
    # If set to default, unset other defaults for this patient
    if new_addr.get("is_default"):
        for a in DB["addresses"]:
            if a.get("patient_id") == new_addr.get("patient_id"):
                a["is_default"] = False
                
    DB["addresses"].append(new_addr)
    return {
        "success": True,
        "message": "Collection address saved successfully",
        "data": new_addr
    }

@router.patch("/{address_id}")
def update_address(address_id: str, payload: Dict[str, Any]):
    for addr in DB["addresses"]:
        if addr["id"] == address_id:
            addr.update(payload)
            return {
                "success": True,
                "message": "Address updated successfully",
                "data": addr
            }
    raise HTTPException(status_code=404, detail="Address not found")

@router.delete("/{address_id}")
def delete_address(address_id: str):
    for i, addr in enumerate(DB["addresses"]):
        if addr["id"] == address_id:
            deleted = DB["addresses"].pop(i)
            return {
                "success": True,
                "message": "Address removed successfully",
                "data": deleted
            }
    raise HTTPException(status_code=404, detail="Address not found")
