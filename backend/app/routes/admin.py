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
    orders = DB["bookings"]
    if status and status.upper() != "ALL":
        orders = [o for o in orders if o.get("status") == status]
        
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
    for o in DB["bookings"]:
        if o["id"] == order_id or o.get("booking_reference") == order_id:
            return {
                "success": True,
                "data": o
            }
    raise HTTPException(status_code=404, detail="Order not found")

@router.patch("/orders/{order_id}")
def update_order_status(order_id: str, payload: Dict[str, Any]):
    for o in DB["bookings"]:
        if o["id"] == order_id or o.get("booking_reference") == order_id:
            if "status" in payload:
                o["status"] = payload["status"]
            if "payment_status" in payload:
                o["payment_status"] = payload["payment_status"]
                
            DB["events"].append({
                "id": f"evt_{uuid.uuid4().hex[:6]}",
                "booking_id": o["id"],
                "event_type": "STATUS_UPDATED",
                "actor_name": "Admin Supervisor",
                "notes": f"Order status changed to {o.get('status')}",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
            return {
                "success": True,
                "message": "Order updated successfully",
                "data": o
            }
    raise HTTPException(status_code=404, detail="Order not found")

@router.post("/assignments")
def assign_driver(payload: AssignmentCreateInput):
    for b in DB["bookings"]:
        if b["id"] == payload.booking_id:
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
            
    raise HTTPException(status_code=404, detail="Booking not found for assignment")
