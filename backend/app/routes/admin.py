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
    import json
    status_val = payload.get("status")
    payment_val = payload.get("payment_status")
    sample_details = payload.get("sample_details")
    clean_id = str(order_id).lstrip("#").strip()
    
    set_clauses = []
    params = []
    if status_val:
        set_clauses.append("status = %s")
        params.append(status_val)
    if payment_val:
        set_clauses.append("payment_status = %s")
        params.append(payment_val)
    if sample_details is not None:
        set_clauses.append("sample_details = %s")
        params.append(json.dumps(sample_details) if isinstance(sample_details, (dict, list)) else str(sample_details))

    if set_clauses:
        set_clauses.append("updated_at = NOW()")
        params.extend([clean_id, clean_id, f"#{clean_id}"])
        sql = f"""
        UPDATE public.bookings 
        SET {', '.join(set_clauses)} 
        WHERE id::text = %s OR order_number = %s OR order_number = %s;
        """
        try:
            supabase_db.execute(sql, tuple(params))
        except Exception as e:
            print(f"[Supabase update_order_status] error: {e}")

    for o in DB["bookings"]:
        if o["id"] == order_id or o.get("booking_reference") == order_id or str(o.get("id")) == clean_id or o.get("booking_reference") == clean_id:
            if status_val:
                o["status"] = status_val
            if payment_val:
                o["payment_status"] = payment_val
            if sample_details:
                o["sample_details"] = sample_details
                
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
    clean_id = str(payload.booking_id).lstrip("#").strip()
    try:
        supabase_db.execute(
            """
            UPDATE public.bookings 
            SET assigned_driver_id = %s, status = 'Assigned', updated_at = NOW() 
            WHERE id::text = %s OR order_number = %s OR order_number = %s;
            """,
            (payload.driver_id, clean_id, clean_id, f"#{clean_id}")
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
                "actor_name": "Lab Administrator",
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

@router.get("/drivers")
def get_admin_drivers():
    from app.data import supabase_db
    drivers = []
    try:
        query = """
        SELECT 
            p.id, 
            p.name, 
            p.phone, 
            p.email, 
            p.badge_id, 
            p.designation, 
            p.created_at,
            COALESCE(b.active_count, 0) as assigned_orders_count
        FROM public.profiles p
        LEFT JOIN (
            SELECT assigned_driver_id::text as driver_id, COUNT(*) as active_count
            FROM public.bookings
            WHERE status IN ('Assigned', 'Collection Scheduled', 'Sample Collected')
            GROUP BY assigned_driver_id::text
        ) b ON b.driver_id = p.id::text
        WHERE p.role = 'driver'::user_role
        ORDER BY p.name ASC;
        """
        rows = supabase_db.fetch_all(query)

        # Auto-seed standard certified phlebotomist staff into public.profiles if none exist
        if not rows:
            default_staff = [
                ("e4a2c1f0-7b3d-4c8e-9f1a-2b3c4d5e6f01", "Rajesh Kumar", "+91 98111 22334", "rajesh.phleb@wellness.com", "WD-PHLEB-DEL-01", "Senior Phlebotomist & Cold-Chain Lead"),
                ("e4a2c1f0-7b3d-4c8e-9f1a-2b3c4d5e6f02", "Pooja Sharma", "+91 98222 33445", "pooja.phleb@wellness.com", "WD-PHLEB-DEL-02", "Certified Pediatric Phlebotomist"),
                ("e4a2c1f0-7b3d-4c8e-9f1a-2b3c4d5e6f03", "Amit Patel", "+91 98333 44556", "amit.phleb@wellness.com", "WD-PHLEB-DEL-03", "Emergency Sample Transport Specialist")
            ]
            for s_id, s_name, s_phone, s_email, s_badge, s_desig in default_staff:
                try:
                    supabase_db.execute(
                        """
                        INSERT INTO public.profiles (id, email, phone, name, role, badge_id, designation, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, 'driver'::user_role, %s, %s, NOW(), NOW())
                        ON CONFLICT (id) DO NOTHING;
                        """,
                        (s_id, s_email, s_phone, s_name, s_badge, s_desig)
                    )
                except Exception as seed_err:
                    print(f"[Supabase seed default driver] error: {seed_err}")
            rows = supabase_db.fetch_all(query)

        if rows:
            for r in rows:
                d_id = str(r["id"])
                drivers.append({
                    "id": d_id,
                    "name": r.get("name") or "Phlebotomist",
                    "phone": r.get("phone") or "+91 98765 00000",
                    "email": r.get("email") or "",
                    "badge_id": r.get("badge_id") or f"WD-PHLEB-{d_id[:4].upper()}",
                    "assigned_orders_count": int(r.get("assigned_orders_count") or 0),
                    "is_active": True,
                    "vehicle_details": "Davangere Cold-Chain Van",
                    "created_at": str(r.get("created_at") or "")
                })
    except Exception as e:
        print(f"[Supabase get_admin_drivers] error: {e}")

    # Fallback to in-memory if DB has no drivers or failed
    if not drivers and DB.get("drivers"):
        drivers = DB["drivers"]

    return {
        "success": True,
        "count": len(drivers),
        "data": drivers
    }

@router.post("/drivers")
def create_admin_driver(payload: Dict[str, Any]):
    from app.data import supabase_db
    driver_id = str(uuid.uuid4())
    name = payload.get("name", "").strip()
    phone = payload.get("phone", "").strip()
    email = payload.get("email", f"phleb_{driver_id[:6]}@wellness.com").strip().lower()
    badge_id = payload.get("badge_id", f"WD-PHLEB-{driver_id[:4].upper()}").strip()
    designation = payload.get("designation", "Certified Senior Phlebotomist").strip()

    if not name or not phone:
        raise HTTPException(status_code=400, detail="Name and Phone number are required")

    try:
        supabase_db.execute(
            """
            INSERT INTO public.profiles (id, email, phone, name, role, badge_id, designation, created_at, updated_at)
            VALUES (%s, %s, %s, %s, 'driver'::user_role, %s, %s, NOW(), NOW())
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone;
            """,
            (driver_id, email, phone, name, badge_id, designation)
        )
    except Exception as e:
        print(f"[Supabase create_admin_driver] error: {e}")

    driver_obj = {
        "id": driver_id,
        "name": name,
        "phone": phone,
        "email": email,
        "badge_id": badge_id,
        "designation": designation,
        "assigned_orders_count": 0,
        "is_active": True,
        "vehicle_details": payload.get("vehicle_details", "Davangere Cold-Chain Van"),
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    if not any(d["id"] == driver_id for d in DB.get("drivers", [])):
        DB.setdefault("drivers", []).append(driver_obj)

    return {
        "success": True,
        "message": f"Successfully registered phlebotomist {name}",
        "data": driver_obj
    }

@router.patch("/drivers/{driver_id}")
@router.put("/drivers/{driver_id}")
def update_admin_driver(driver_id: str, payload: Dict[str, Any]):
    from app.data import supabase_db
    name = payload.get("name")
    phone = payload.get("phone")
    email = payload.get("email")
    badge_id = payload.get("badge_id")
    designation = payload.get("designation")
    
    set_clauses = []
    values = []
    if name is not None:
        set_clauses.append("name = %s")
        values.append(name.strip())
    if phone is not None:
        set_clauses.append("phone = %s")
        values.append(phone.strip())
    if email is not None:
        set_clauses.append("email = %s")
        values.append(email.strip().lower())
    if badge_id is not None:
        set_clauses.append("badge_id = %s")
        values.append(badge_id.strip())
    if designation is not None:
        set_clauses.append("designation = %s")
        values.append(designation.strip())

    if set_clauses:
        set_clauses.append("updated_at = NOW()")
        values.append(driver_id)
        values.append(driver_id)
        query = f"""
        UPDATE public.profiles 
        SET {', '.join(set_clauses)} 
        WHERE id::text = %s OR badge_id = %s
        RETURNING id, name, phone, email, badge_id, designation;
        """
        row = supabase_db.fetch_one(query, tuple(values))
        if row:
            return {"success": True, "message": "Driver updated successfully", "data": row}

    return {"success": True, "message": "No fields updated"}

@router.delete("/drivers/{driver_id}")
def delete_admin_driver(driver_id: str):
    from app.data import supabase_db
    supabase_db.execute("DELETE FROM public.profiles WHERE id::text = %s OR badge_id = %s;", (driver_id, driver_id))
    return {"success": True, "message": f"Driver {driver_id} deleted successfully"}
