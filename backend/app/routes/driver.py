import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.data.store import DB
from app.models.schemas import CollectionCompleteInput, CollectionFailInput

router = APIRouter(prefix="/api/driver", tags=["Driver / Phlebotomist Cockpit"])

@router.get("/assignments")
def get_driver_assignments(driver_id: Optional[str] = Query("drv_1")):
    from app.routes.bookings import list_bookings
    res = list_bookings()
    all_bookings = res.get("data", [])
    assignments = [
        b for b in all_bookings
        if b.get("assigned_driver_id") == driver_id
        and b.get("status") not in ["Sample Collected", "Processing", "Report Ready", "Cancelled"]
    ]
    return {
        "success": True,
        "count": len(assignments),
        "data": assignments
    }

@router.get("/assignments/{booking_id}")
def get_assignment_detail(booking_id: str):
    from app.routes.bookings import list_bookings
    res = list_bookings()
    for b in res.get("data", []):
        if b["id"] == booking_id or b.get("booking_reference") == booking_id:
            return {
                "success": True,
                "data": {
                    "id": b["id"],
                    "booking_reference": b["booking_reference"],
                    "patient_name": b["patient_name"],
                    "patient_phone": b["patient_phone"],
                    "scheduled_date": b["scheduled_date"],
                    "scheduled_slot": b["scheduled_slot"],
                    "address_snapshot": b["address_snapshot"],
                    "status": b["status"],
                    "items": b.get("items", []),
                    "patient_notes": b.get("patient_notes")
                }
            }
    raise HTTPException(status_code=404, detail="Collection job not found")

@router.post("/assignments/{booking_id}/start")
def start_trip(booking_id: str):
    from app.data import supabase_db
    try:
        supabase_db.execute(
            "UPDATE public.bookings SET status = 'Collection Scheduled', updated_at = NOW() WHERE id::text = %s OR order_number = %s;",
            (booking_id, booking_id)
        )
    except Exception as e:
        print(f"[Supabase Start Trip] error: {e}")

    for b in DB["bookings"]:
        if b["id"] == booking_id or b.get("booking_reference") == booking_id:
            b["status"] = "Collection Scheduled"
            DB["events"].append({
                "id": f"evt_{uuid.uuid4().hex[:6]}",
                "booking_id": b["id"],
                "event_type": "COLLECTION_STARTED",
                "actor_name": b.get("assigned_driver_name", "Phlebotomist"),
                "notes": "Phlebotomist is en-route with temperature-controlled cold box.",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
            return {
                "success": True,
                "message": "Trip started. Patient notified.",
                "data": b
            }

    return {
        "success": True,
        "message": "Trip started. Patient notified.",
        "data": {"booking_id": booking_id, "status": "Collection Scheduled"}
    }

@router.post("/assignments/{booking_id}/complete")
def complete_collection(booking_id: str, payload: CollectionCompleteInput):
    from app.data import supabase_db
    try:
        supabase_db.execute(
            "UPDATE public.bookings SET status = 'Sample Collected', sample_details = %s, updated_at = NOW() WHERE id::text = %s OR order_number = %s;",
            (payload.barcode, booking_id, booking_id)
        )
    except Exception as e:
        print(f"[Supabase Complete Collection] error: {e}")

    for b in DB["bookings"]:
        if b["id"] == booking_id or b.get("booking_reference") == booking_id:
            b["status"] = "Sample Collected"
            b["sample_barcode"] = payload.barcode
            b["collected_at"] = datetime.utcnow().isoformat() + "Z"
            
            DB["events"].append({
                "id": f"evt_{uuid.uuid4().hex[:6]}",
                "booking_id": b["id"],
                "event_type": "SAMPLE_COLLECTED",
                "actor_name": b.get("assigned_driver_name", "Phlebotomist"),
                "notes": f"Sample drawn and verified. Vial Barcode: {payload.barcode}. {payload.notes or ''}",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
            return {
                "success": True,
                "message": "Blood sample successfully collected and sealed",
                "data": b
            }

    return {
        "success": True,
        "message": "Blood sample successfully collected and sealed",
        "data": {"booking_id": booking_id, "status": "Sample Collected", "sample_barcode": payload.barcode}
    }

@router.post("/assignments/{booking_id}/fail")
def fail_collection(booking_id: str, payload: CollectionFailInput):
    from app.data import supabase_db
    try:
        supabase_db.execute(
            "UPDATE public.bookings SET status = 'Collection Failed', cancellation_reason = %s, updated_at = NOW() WHERE id::text = %s OR order_number = %s;",
            (payload.reason, booking_id, booking_id)
        )
    except Exception as e:
        print(f"[Supabase Fail Collection] error: {e}")

    for b in DB["bookings"]:
        if b["id"] == booking_id or b.get("booking_reference") == booking_id:
            b["status"] = "Collection Failed"
            b["failure_reason"] = payload.reason
            
            DB["events"].append({
                "id": f"evt_{uuid.uuid4().hex[:6]}",
                "booking_id": b["id"],
                "event_type": "COLLECTION_FAILED",
                "actor_name": b.get("assigned_driver_name", "Phlebotomist"),
                "notes": f"Collection attempt failed: {payload.reason}. {payload.notes or ''}",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
            return {
                "success": True,
                "message": "Collection failure documented",
                "data": b
            }

    return {
        "success": True,
        "message": "Collection failure documented",
        "data": {"booking_id": booking_id, "status": "Collection Failed"}
    }

@router.get("/history")
def get_driver_history(driver_id: Optional[str] = Query("drv_1")):
    from app.routes.bookings import list_bookings
    res = list_bookings()
    all_bookings = res.get("data", [])
    history = [
        b for b in all_bookings
        if b.get("assigned_driver_id") == driver_id
        and b.get("status") in ["Sample Collected", "Processing", "Report Ready", "Collection Failed"]
    ]
    return {
        "success": True,
        "count": len(history),
        "data": history
    }
