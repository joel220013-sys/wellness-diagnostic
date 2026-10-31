import uuid
import hashlib
import secrets
import html
import re
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional
from app.data import supabase_db

router = APIRouter(prefix="/api/auth", tags=["User Authentication & Profiles"])

def sanitize_text(text: Optional[str]) -> str:
    """Strips HTML tags and escapes dangerous entities to prevent XSS."""
    if not text:
        return ""
    clean = re.sub(r'<[^>]*>', '', str(text))
    return html.escape(clean.strip())

def hash_password(password: str) -> str:
    """Hashes password using PBKDF2-HMAC-SHA256 with a unique cryptographic 16-byte salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}:{key.hex()}"

def verify_password(stored_hash: Optional[str], provided_password: str) -> bool:
    """Verifies a plaintext password against a stored PBKDF2-HMAC-SHA256 hash using constant-time comparison."""
    if not stored_hash or ":" not in stored_hash:
        return False
    try:
        salt, key_hex = stored_hash.split(":", 1)
        expected_key = hashlib.pbkdf2_hmac("sha256", provided_password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(key_hex, expected_key.hex())
    except Exception:
        return False

def generate_next_badge_id(role: str) -> str:
    """Generates an order-wise sequential badge ID starting from 001 (e.g. WD-PT-001, WD-PT-002)."""
    if role == "patient":
        prefix = "WD-PT"
    elif role == "driver":
        prefix = "WD-PHLEB"
    elif role == "admin":
        prefix = "WD-ADM"
    else:
        prefix = f"WD-{role.upper()[:3]}"

    rows = supabase_db.fetch_all(
        f"SELECT badge_id FROM public.profiles WHERE role = %s::user_role AND badge_id LIKE '{prefix}-%';",
        (role,)
    )
    max_num = 0
    for r in (rows or []):
        bid = str(r.get("badge_id") or "")
        m = re.search(rf"{prefix}-(\d+)", bid)
        if m:
            try:
                val = int(m.group(1))
                if val > max_num:
                    max_num = val
            except ValueError:
                pass

    next_num = max_num + 1
    return f"{prefix}-{next_num:03d}"

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
        clean_role = sanitize_text(role).lower()
        query += " WHERE role = %s::user_role"
        params = (clean_role,)
    query += " ORDER BY created_at ASC;"
    
    rows = supabase_db.fetch_all(query, params)
    return {
        "success": True,
        "count": len(rows),
        "data": rows
    }

@router.post("/register")
def register_user(payload: RegisterInput):
    clean_email = sanitize_text(payload.email).lower()
    clean_phone = sanitize_text(payload.phone)
    clean_name = sanitize_text(payload.name)
    clean_role = sanitize_text(payload.role).lower()

    if clean_role not in ["patient", "admin", "driver"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'patient', 'admin', or 'driver'.")

    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    # Check for existing email in profiles
    existing = supabase_db.fetch_one(
        "SELECT id, email FROM public.profiles WHERE LOWER(email) = %s OR phone = %s;",
        (clean_email, clean_phone)
    )
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email or phone number already exists.")

    user_id = str(uuid.uuid4())
    badge_id = sanitize_text(payload.badge_id) if payload.badge_id else None
    if not badge_id:
        badge_id = generate_next_badge_id(clean_role)

    designation = sanitize_text(payload.designation) if payload.designation else (
        "Medical Director" if clean_role == "admin" else ("Phlebotomist" if clean_role == "driver" else "Patient")
    )

    pwd_hash = hash_password(payload.password)

    query = """
    INSERT INTO public.profiles (id, email, phone, name, role, badge_id, designation, password_hash, created_at, updated_at)
    VALUES (%s, %s, %s, %s, %s::user_role, %s, %s, %s, NOW(), NOW())
    RETURNING id, email, phone, name, role, badge_id, designation, created_at;
    """
    row = supabase_db.fetch_one(query, (
        user_id,
        clean_email,
        clean_phone,
        clean_name,
        clean_role,
        badge_id,
        designation,
        pwd_hash
    ))

    if not row:
        row = {
            "id": user_id,
            "email": clean_email,
            "phone": clean_phone,
            "name": clean_name,
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
    ident = sanitize_text(payload.identifier).lower()
    req_role = sanitize_text(payload.required_role).lower() if payload.required_role else None

    # Search in profiles by email or phone
    query = "SELECT id, email, phone, name, role, badge_id, designation, created_at, password_hash FROM public.profiles WHERE LOWER(email) = %s OR phone = %s"
    params = [ident, ident]
    if req_role:
        query += " AND role = %s::user_role"
        params.append(req_role)

    row = supabase_db.fetch_one(query, tuple(params))
    if not row:
        raise HTTPException(
            status_code=401, 
            detail="Invalid login credentials. Please check your email/phone and password."
        )

    stored_hash = row.get("password_hash")
    if stored_hash:
        # Strict PBKDF2 hash verification
        if not verify_password(stored_hash, payload.password):
            raise HTTPException(status_code=401, detail="Invalid login credentials. Please check your email/phone and password.")
    else:
        # First-time login for seeded/legacy profile: upgrade password to cryptographic hash
        if len(payload.password) >= 4:
            new_hash = hash_password(payload.password)
            supabase_db.execute(
                "UPDATE public.profiles SET password_hash = %s, updated_at = NOW() WHERE id = %s;",
                (new_hash, row["id"])
            )
        else:
            raise HTTPException(status_code=401, detail="Invalid login credentials. Please check your email/phone and password.")

    # Sanitize returned profile data (never leak password_hash)
    profile_data = {
        "id": row["id"],
        "email": row["email"],
        "phone": row["phone"],
        "name": row["name"],
        "role": row["role"],
        "badge_id": row["badge_id"],
        "designation": row["designation"],
        "preferences": row.get("preferences") or {},
        "created_at": row.get("created_at")
    }

    return {
        "success": True,
        "message": "Login successful",
        "data": profile_data
    }

class ChangePasswordInput(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    current_password: str
    new_password: str

@router.post("/change-password")
def change_password(payload: ChangePasswordInput):
    if not payload.user_id and not payload.email:
        raise HTTPException(status_code=400, detail="User identification (ID or Email) is required.")

    query = "SELECT id, email, password_hash FROM public.profiles WHERE "
    params = []
    if payload.user_id:
        query += "id = %s;"
        params.append(payload.user_id)
    else:
        query += "LOWER(email) = %s;"
        params.append(sanitize_text(payload.email).lower())

    row = supabase_db.fetch_one(query, tuple(params))
    if not row:
        raise HTTPException(status_code=404, detail="User account not found.")

    stored_hash = row.get("password_hash")
    if stored_hash:
        if not verify_password(stored_hash, payload.current_password):
            raise HTTPException(status_code=400, detail="The current password you entered is incorrect.")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")

    if payload.new_password == payload.current_password:
        raise HTTPException(status_code=400, detail="New password must be different from current password.")

    new_hash = hash_password(payload.new_password)
    supabase_db.execute(
        "UPDATE public.profiles SET password_hash = %s, updated_at = NOW() WHERE id = %s;",
        (new_hash, row["id"])
    )

    return {
        "success": True,
        "message": "Password updated successfully. Your account is secured."
    }

class UpdateProfileInput(BaseModel):
    user_id: str
    name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_notes: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

@router.post("/update-profile")
def update_profile(payload: UpdateProfileInput):
    clean_uid = payload.user_id.strip()
    row = supabase_db.fetch_one("SELECT id, role, preferences FROM public.profiles WHERE id = %s;", (clean_uid,))
    if not row:
        raise HTTPException(status_code=404, detail="User account not found.")

    import json

    # 1. Update basic profile
    fields = []
    vals = []
    if payload.name:
        fields.append("name = %s")
        vals.append(sanitize_text(payload.name))
    if payload.phone:
        fields.append("phone = %s")
        vals.append(sanitize_text(payload.phone))
    if payload.preferences is not None:
        merged_pref = {**(row.get("preferences") or {}), **payload.preferences}
        fields.append("preferences = %s::jsonb")
        vals.append(json.dumps(merged_pref))

    if fields:
        fields.append("updated_at = NOW()")
        vals.append(clean_uid)
        sql = f"UPDATE public.profiles SET {', '.join(fields)} WHERE id = %s RETURNING id, email, phone, name, role, badge_id, designation, preferences;"
        updated_profile = supabase_db.fetch_one(sql, tuple(vals))
    else:
        updated_profile = row

    # 2. Update or insert patient_details if medical fields provided
    pref_json = json.dumps(payload.preferences or {})
    existing_det = supabase_db.fetch_one("SELECT id FROM public.patient_details WHERE patient_id = %s;", (clean_uid,))
    if existing_det:
        supabase_db.execute("""
            UPDATE public.patient_details 
            SET date_of_birth = COALESCE(%s, date_of_birth),
                gender = COALESCE(%s, gender),
                blood_group = COALESCE(%s, blood_group),
                emergency_contact = COALESCE(%s, emergency_contact),
                medical_notes = COALESCE(%s, medical_notes),
                preferences = COALESCE(%s::jsonb, preferences)
            WHERE patient_id = %s;
        """, (
            payload.date_of_birth or None,
            sanitize_text(payload.gender) or None,
            sanitize_text(payload.blood_group) or None,
            sanitize_text(payload.emergency_contact) or None,
            sanitize_text(payload.medical_notes) or None,
            pref_json,
            clean_uid
        ))
    else:
        det_id = str(uuid.uuid4())
        supabase_db.execute("""
            INSERT INTO public.patient_details (
                id, patient_id, date_of_birth, gender, blood_group, emergency_contact, medical_notes, preferences, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, NOW());
        """, (
            det_id,
            clean_uid,
            payload.date_of_birth or None,
            sanitize_text(payload.gender) or None,
            sanitize_text(payload.blood_group) or None,
            sanitize_text(payload.emergency_contact) or None,
            sanitize_text(payload.medical_notes) or None,
            pref_json
        ))

    return {
        "success": True,
        "message": "Patient profile and settings saved successfully.",
        "data": updated_profile
    }

@router.get("/patient-details/{patient_id}")
def get_patient_details(patient_id: str):
    clean_uid = patient_id.strip()
    profile = supabase_db.fetch_one("SELECT id, email, phone, name, role, badge_id, designation, preferences, created_at FROM public.profiles WHERE id = %s;", (clean_uid,))
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    details = supabase_db.fetch_one("SELECT * FROM public.patient_details WHERE patient_id = %s;", (clean_uid,))
    return {
        "success": True,
        "data": {
            "profile": profile,
            "details": details or {}
        }
    }
