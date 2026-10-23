import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional
from app.data import supabase_db

router = APIRouter(prefix="/api/auth", tags=["User Authentication & Profiles"])

class RegisterInput(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    role: str = "patient" # 'patient', 'admin', 'driver'
    badge_id: Optional[str] = None
    designation: Optional[str] = None

class LoginInput(BaseModel):
    identifier: str # email or phone
    password: str
    required_role: Optional[str] = None

@router.get("/users")
def get_users(role: Optional[str] = Query(None)):
    query = "SELECT id, email, phone, name, role, avatar_url, badge_id, designation, created_at FROM public.profiles"
    params = ()
    if role:
        query += " WHERE role = %s::user_role"
        params = (role,)
    query += " ORDER BY created_at ASC;"
    
    rows = supabase_db.fetch_all(query, params)
    return {
        "success": True,
        "count": len(rows),
        "data": rows
    }

@router.post("/register")
def register_user(payload: RegisterInput):
    clean_email = payload.email.strip().lower()
    clean_phone = payload.phone.strip()
    clean_role = payload.role.strip().lower()

    if clean_role not in ["patient", "admin", "driver"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'patient', 'admin', or 'driver'.")

    # Check for existing email in profiles
    existing = supabase_db.fetch_one(
        "SELECT id, email FROM public.profiles WHERE LOWER(email) = %s OR phone = %s;",
        (clean_email, clean_phone)
    )
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email or phone number already exists.")

    user_id = str(uuid.uuid4())
    badge_id = payload.badge_id
    if not badge_id:
        if clean_role == "admin":
            badge_id = f"WD-ADM-{user_id[:4].upper()}"
        elif clean_role == "driver":
            badge_id = f"WD-PHLEB-{user_id[:4].upper()}"
        else:
            badge_id = f"WD-PT-{user_id[:4].upper()}"

    designation = payload.designation or ("Medical Director" if clean_role == "admin" else ("Phlebotomist" if clean_role == "driver" else "Patient"))

    query = """
    INSERT INTO public.profiles (id, email, phone, name, role, badge_id, designation, created_at, updated_at)
    VALUES (%s, %s, %s, %s, %s::user_role, %s, %s, NOW(), NOW())
    RETURNING id, email, phone, name, role, badge_id, designation, created_at;
    """
    row = supabase_db.fetch_one(query, (
        user_id,
        clean_email,
        clean_phone,
        payload.name.strip(),
        clean_role,
        badge_id,
        designation
    ))

    if not row:
        # Fallback if returning fails
        row = {
            "id": user_id,
            "email": clean_email,
            "phone": clean_phone,
            "name": payload.name.strip(),
            "role": clean_role,
            "badge_id": badge_id,
            "designation": designation
        }

    return {
        "success": True,
        "message": f"Successfully registered new {clean_role} account",
        "data": row
    }

@router.post("/login")
def login_user(payload: LoginInput):
    ident = payload.identifier.strip().lower()
    req_role = payload.required_role.strip().lower() if payload.required_role else None

    # Search in profiles by email or phone
    query = "SELECT id, email, phone, name, role, badge_id, designation, created_at FROM public.profiles WHERE LOWER(email) = %s OR phone = %s"
    params = [ident, ident]
    if req_role:
        query += " AND role = %s::user_role"
        params.append(req_role)

    row = supabase_db.fetch_one(query, tuple(params))
    if not row:
        raise HTTPException(
            status_code=401, 
            detail=f"No {req_role or 'user'} account found matching '{ident}'. Please register first."
        )

    return {
        "success": True,
        "message": "Login successful",
        "data": row
    }
