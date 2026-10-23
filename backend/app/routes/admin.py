import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.data.store import DB
from app.models.schemas import AssignmentCreateInput

router = APIRouter(prefix="/api/admin", tags=["Admin Operations"])

@router.get("/orders")
def get_admin_orders(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    from app.routes.bookings import list_bookings
    res = list_bookings(status=status)
    orders = res.get("data", [])
        
    if search:
        s = search.lower()
        orders = [
            o for o in orders
            if s in o.get("booking_reference", "").lower()
            or s in o.get("patient_name", "").lower()
            or s in o.get("patient_phone", "").lower()
        ]
        
    return {
        "success": True,
        "count": len(orders),
        "data": orders
    }

@router.get("/orders/{order_id}")
def get_order_by_id(order_id: str):
    from app.routes.bookings import list_bookings
    res = list_bookings()
    for o in res.get("data", []):
        if o["id"] == order_id or o.get("booking_reference") == order_id:
            return {
                "success": True,
                "data": o
            }
    raise HTTPException(status_code=404, detail="Order not found")

@router.patch("/orders/{order_id}")
def update_order_status(order_id: str, payload: Dict[str, Any]):
    from app.data import supabase_db
    status_val = payload.get("status")
    payment_val = payload.get("payment_status")
    
    if status_val:
        supabase_db.execute(
            "UPDATE public.bookings SET status = %s, updated_at = NOW() WHERE id = %s OR order_number = %s;",
            (status_val, order_id, order_id)
        )
    if payment_val:
        supabase_db.execute(
            "UPDATE public.bookings SET payment_status = %s, updated_at = NOW() WHERE id = %s OR order_number = %s;",
            (payment_val, order_id, order_id)
        )

    for o in DB["bookings"]:
        if o["id"] == order_id or o.get("booking_reference") == order_id:
            if status_val:
                o["status"] = status_val
            if payment_val:
                o["payment_status"] = payment_val
                
            DB["events"].append({
                "id": f"evt_{uuid.uuid4().hex[:6]}",
                "booking_id": o["id"],
                "event_type": "STATUS_UPDATED",
                "actor_name": "Admin Supervisor",
                "notes": f"Order status changed to {o.get('status')}",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
            return {"success": True, "data": o}

    return {"success": True, "message": "Order updated in database"}

@router.post("/assignments")
def assign_driver(payload: AssignmentCreateInput):
    from app.data import supabase_db
    try:
        supabase_db.execute(
            """
            UPDATE public.bookings 
            SET assigned_driver_id = %s, status = 'Assigned', updated_at = NOW() 
            WHERE id::text = %s OR order_number = %s;
            """,
            (payload.driver_id, str(payload.booking_id), str(payload.booking_id))
        )
    except Exception as e:
        print(f"[Supabase Assign Driver] error: {e}")

    for b in DB["bookings"]:
        if b["id"] == payload.booking_id or b.get("booking_reference") == payload.booking_id:
            b["assigned_driver_id"] = payload.driver_id
            b["assigned_driver_name"] = payload.driver_name
            b["assigned_driver_phone"] = payload.driver_phone or "+91 98111 22334"
            b["status"] = "Assigned"
            
            DB["events"].append({
                "id": f"evt_{uuid.uuid4().hex[:6]}",
                "booking_id": b["id"],
                "event_type": "DRIVER_ASSIGNED",
                "actor_name": "Dr. Eleanor Vance (Admin)",
                "notes": f"Dispatched phlebotomist {payload.driver_name} to patient location.",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
            
            return {
                "success": True,
                "message": f"Successfully assigned to {payload.driver_name}",
                "data": b
            }

    return {
        "success": True,
        "message": f"Successfully assigned to {payload.driver_name}",
        "data": {
            "booking_id": payload.booking_id,
            "assigned_driver_id": payload.driver_id,
            "assigned_driver_name": payload.driver_name,
            "status": "Assigned"
        }
    }
