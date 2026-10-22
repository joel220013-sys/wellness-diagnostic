import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.data.mock_db import DB

router = APIRouter(prefix="/api/reports", tags=["Pathology Reports"])

@router.get("")
def get_reports(patient_id: Optional[str] = Query(None)):
    reps = DB["reports"]
    if patient_id:
        reps = [r for r in reps if r.get("patient_id") == patient_id]
    return {
        "success": True,
        "count": len(reps),
        "data": reps
    }

@router.post("")
def upload_report(payload: Dict[str, Any]):
    new_rep = {
        "id": f"rep_{uuid.uuid4().hex[:6]}",
        "booking_id": payload.get("booking_id"),
        "patient_id": payload.get("patient_id", "user_patient_1"),
        "test_name": payload.get("test_name", "Laboratory Pathology Report"),
        "download_url": payload.get("download_url", "/reports/mock-report.pdf"),
        "file_size": payload.get("file_size", "412 KB"),
        "release_status": "Released",
        "pathologist_signoff": payload.get("pathologist_signoff", "Dr. Eleanor Vance, MD (Chief Pathologist)"),
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    DB["reports"].append(new_rep)
    
    # Update booking status to Report Ready
    for b in DB["bookings"]:
        if b["id"] == new_rep["booking_id"]:
            b["status"] = "Report Ready"
            
    return {
        "success": True,
        "message": "Report released to patient portal",
        "data": new_rep
    }
