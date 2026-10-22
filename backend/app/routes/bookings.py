import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.data.store import DB
from app.models.schemas import BookingCreateInput

router = APIRouter(prefix="/api/bookings", tags=["Bookings & Home Collection"])

@router.get("")
def list_bookings(
    patient_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    bookings = DB["bookings"]
    if patient_id:
        bookings = [b for b in bookings if b.get("patient_id") == patient_id]
    if status and status.upper() != "ALL":
        bookings = [b for b in bookings if b.get("status") == status]
        
    return {
        "success": True,
        "count": len(bookings),
        "data": bookings
    }

@router.post("")
def create_booking(payload: BookingCreateInput):
    ref_suffix = uuid.uuid4().hex[:4].upper()
    booking_id = f"b_{uuid.uuid4().hex[:8]}"
    ref = f"WD-2026-{ref_suffix}"
    
    new_booking = payload.model_dump()
    new_booking.update({
        "id": booking_id,
        "booking_reference": ref,
        "status": "Confirmed",
        "payment_status": "Pending",
        "created_at": datetime.utcnow().isoformat() + "Z"
    })
    
    DB["bookings"].append(new_booking)
    
    # Add audit event
    DB["events"].append({
        "id": f"evt_{uuid.uuid4().hex[:6]}",
        "booking_id": booking_id,
        "event_type": "BOOKING_CREATED",
        "actor_name": payload.patient_name,
        "notes": f"Home collection appointment booked for {payload.scheduled_date} ({payload.scheduled_slot})",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })
    
    # Auto-generate draft invoice
    inv_id = f"inv_{uuid.uuid4().hex[:6]}"
    inv_num = f"INV-2026-{ref_suffix}"
    DB["invoices"].append({
        "id": inv_id,
        "invoice_number": inv_num,
        "booking_id": booking_id,
        "patient_id": payload.patient_id,
        "patient_name": payload.patient_name,
        "amount": payload.total_amount,
        "status": "Pending Collection",
        "created_at": datetime.utcnow().isoformat() + "Z"
    })
    
    return {
        "success": True,
        "message": "Home blood collection booked successfully",
        "data": new_booking
    }

@router.get("/{booking_id}")
def get_booking_detail(booking_id: str):
    for b in DB["bookings"]:
        if b["id"] == booking_id or b.get("booking_reference") == booking_id:
            return {
                "success": True,
                "data": b
            }
    raise HTTPException(status_code=404, detail="Booking record not found")

@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: str, payload: Optional[Dict[str, Any]] = None):
    reason = payload.get("reason", "Patient requested cancellation") if payload else "Patient requested cancellation"
    for b in DB["bookings"]:
        if b["id"] == booking_id or b.get("booking_reference") == booking_id:
            if b.get("status") in ["Sample Collected", "Processing", "Report Ready"]:
                raise HTTPException(status_code=400, detail="Cannot cancel booking after sample has been collected")
                
            b["status"] = "Cancelled"
            DB["events"].append({
                "id": f"evt_{uuid.uuid4().hex[:6]}",
                "booking_id": b["id"],
                "event_type": "BOOKING_CANCELLED",
                "actor_name": "System / User",
                "notes": f"Booking cancelled. Reason: {reason}",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
            return {
                "success": True,
                "message": "Booking has been cancelled",
                "data": b
            }
    raise HTTPException(status_code=404, detail="Booking record not found")

@router.get("/{booking_id}/events")
def get_booking_events(booking_id: str):
    events = [e for e in DB["events"] if e.get("booking_id") == booking_id]
    return {
        "success": True,
        "count": len(events),
        "data": events
    }
