import uuid
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.data.store import DB
from app.data import supabase_db
from app.models.schemas import BookingCreateInput

router = APIRouter(prefix="/api/bookings", tags=["Bookings & Home Collection"])

def to_uuid(val: Any) -> str:
    try:
        return str(uuid.UUID(str(val)))
    except (ValueError, AttributeError):
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(val)))

def _format_db_booking(r: Dict[str, Any]) -> Dict[str, Any]:
    ref = r.get("order_number") or str(r.get("id"))
    addr = r.get("address_snapshot")
    if isinstance(addr, str):
        try:
            addr = json.loads(addr)
        except Exception:
            addr = {}
    elif not isinstance(addr, dict):
        addr = {}

    items = r.get("items")
    if isinstance(items, str):
        try:
            items = json.loads(items)
        except Exception:
            items = []
    elif not isinstance(items, list):
        items = []

    created_str = datetime.utcnow().isoformat() + "Z"
    if r.get("created_at"):
        if hasattr(r.get("created_at"), "isoformat"):
            created_str = r.get("created_at").isoformat()
        else:
            created_str = str(r.get("created_at"))

    return {
        "id": str(r.get("id")),
        "booking_reference": ref,
        "patient_id": str(r.get("patient_id")),
        "patient_name": r.get("patient_name") or "Patient",
        "patient_phone": r.get("patient_phone") or "",
        "scheduled_date": str(r.get("scheduled_date") or r.get("collection_date") or ""),
        "scheduled_slot": r.get("scheduled_slot") or r.get("time_slot") or "07:30 AM – 09:00 AM",
        "status": r.get("status") or "Confirmed",
        "total_amount": float(r.get("total_amount") or 0),
        "subtotal": float(r.get("subtotal") or r.get("total_amount") or 0),
        "collection_fee": float(r.get("collection_fee") or 0),
        "payment_status": r.get("payment_status") or "Pending",
        "payment_method": r.get("payment_method") or "Cash on Collection",
        "address_snapshot": addr,
        "items": items,
        "assigned_driver_id": str(r.get("assigned_driver_id")) if r.get("assigned_driver_id") else None,
        "patient_notes": r.get("patient_notes") or "",
        "created_at": created_str,
        "updated_at": created_str
    }

@router.get("")
def list_bookings(
    patient_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    all_bookings: List[Dict[str, Any]] = []
    seen_refs = set()

    # 1. Fetch live records from Supabase PostgreSQL
    try:
        rows = supabase_db.fetch_all("SELECT * FROM public.bookings ORDER BY created_at DESC;")
        for r in rows:
            formatted = _format_db_booking(r)
            seen_refs.add(formatted["booking_reference"])
            seen_refs.add(formatted["id"])
            all_bookings.append(formatted)
    except Exception as e:
        print(f"[Supabase DB Bookings] fetch error: {e}")

    # 2. Add any in-memory bookings that aren't yet in Supabase
    for b in DB.get("bookings", []):
        ref = b.get("booking_reference") or b.get("id")
        if ref not in seen_refs and b.get("id") not in seen_refs:
            seen_refs.add(ref)
            all_bookings.append(b)

    # 3. Apply filters if requested
    if patient_id:
        all_bookings = [b for b in all_bookings if b.get("patient_id") == patient_id]
    if status and status.upper() != "ALL":
        all_bookings = [b for b in all_bookings if str(b.get("status")).lower() == status.lower()]

    return {
        "success": True,
        "count": len(all_bookings),
        "data": all_bookings
    }

@router.post("")
def create_booking(payload: BookingCreateInput):
    ref_suffix = uuid.uuid4().hex[:4].upper()
    booking_id = str(uuid.uuid4())
    ref = f"WD-2026-{ref_suffix}"

    new_booking = payload.model_dump()
    new_booking.update({
        "id": booking_id,
        "booking_reference": ref,
        "status": "Confirmed",
        "payment_status": "Pending",
        "created_at": datetime.utcnow().isoformat() + "Z"
    })

    # Save to local in-memory store
    DB["bookings"].append(new_booking)

    # Persist directly into Supabase PostgreSQL
    try:
        p_uuid = to_uuid(payload.patient_id)
        coll_date = payload.scheduled_date if payload.scheduled_date else datetime.utcnow().strftime("%Y-%m-%d")
        addr_dict = payload.address_snapshot.model_dump() if hasattr(payload.address_snapshot, "model_dump") else dict(payload.address_snapshot)
        items_list = [it.model_dump() if hasattr(it, "model_dump") else dict(it) for it in payload.items]

        insert_sql = """
        INSERT INTO public.bookings (
            id, order_number, patient_id, patient_name, patient_phone,
            collection_date, time_slot, scheduled_date, scheduled_slot,
            status, total_amount, subtotal, collection_fee,
            payment_status, payment_method, address_snapshot,
            items, patient_notes, created_at, updated_at
        ) VALUES (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s,
            %s, %s, NOW(), NOW()
        );
        """
        supabase_db.execute(insert_sql, (
            booking_id,
            ref,
            p_uuid,
            payload.patient_name,
            payload.patient_phone,
            coll_date,
            payload.scheduled_slot,
            payload.scheduled_date,
            payload.scheduled_slot,
            "Confirmed",
            float(payload.total_amount),
            float(payload.subtotal),
            float(payload.collection_fee),
            "Pending",
            "Cash on Collection",
            json.dumps(addr_dict),
            json.dumps(items_list),
            payload.patient_notes or ""
        ))
    except Exception as e:
        print(f"[Supabase DB Bookings] Insert error: {e}")

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
