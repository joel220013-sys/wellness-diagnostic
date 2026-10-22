import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.data.store import DB

router = APIRouter(prefix="/api/invoices", tags=["Billing & Invoices"])

@router.get("")
def get_invoices(patient_id: Optional[str] = Query(None)):
    invs = DB["invoices"]
    if patient_id:
        invs = [i for i in invs if i.get("patient_id") == patient_id]
    return {
        "success": True,
        "count": len(invs),
        "data": invs
    }

@router.post("")
def create_invoice(payload: Dict[str, Any]):
    new_inv = {
        "id": f"inv_{uuid.uuid4().hex[:6]}",
        "invoice_number": f"INV-2026-{uuid.uuid4().hex[:4].upper()}",
        "booking_id": payload.get("booking_id"),
        "patient_id": payload.get("patient_id", "user_patient_1"),
        "patient_name": payload.get("patient_name", "Sarah Jenkins"),
        "amount": payload.get("amount", 0),
        "status": payload.get("status", "Pending"),
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    DB["invoices"].append(new_inv)
    return {
        "success": True,
        "message": "Invoice generated successfully",
        "data": new_inv
    }
