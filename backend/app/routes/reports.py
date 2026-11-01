import uuid
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from typing import List, Dict, Any, Optional
from app.data.store import DB
from app.data import supabase_db
from app.services import r2_storage

router = APIRouter(prefix="/api/reports", tags=["Pathology Reports"])

def to_uuid(val: Any) -> str:
    try:
        return str(uuid.UUID(str(val)))
    except (ValueError, AttributeError):
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(val)))

def _format_db_report(r: Dict[str, Any]) -> Dict[str, Any]:
    file_path = r.get("file_path")
    download_url = None
    if file_path:
        download_url = r2_storage.generate_download_url(file_path, expires_in=86400)
    if not download_url:
        download_url = "/reports/mock-report.pdf"

    results = r.get("results")
    if isinstance(results, str):
        try:
            results = json.loads(results)
        except Exception:
            results = []
    elif not isinstance(results, list):
        results = []

    created_str = datetime.utcnow().isoformat() + "Z"
    if r.get("created_at"):
        if hasattr(r.get("created_at"), "isoformat"):
            created_str = r.get("created_at").isoformat()
        else:
            created_str = str(r.get("created_at"))

    return {
        "id": str(r.get("id")),
        "report_number": r.get("report_number") or f"WD-REP-{str(r.get('id'))[:6].upper()}",
        "booking_id": str(r.get("booking_id")) if r.get("booking_id") else None,
        "patient_id": str(r.get("patient_id")) if r.get("patient_id") else None,
        "file_path": file_path,
        "download_url": download_url,
        "status": r.get("status") or "Released",
        "results": results,
        "overall_remarks": r.get("overall_remarks") or "",
        "doctor_name": r.get("doctor_name") or "Chief Pathologist, MD",
        "lab_technician": r.get("lab_technician") or "Robert Thorne, B.Sc MLT",
        "created_at": created_str,
        "storage_provider": "cloudflare_r2" if file_path else "local"
    }

@router.get("")
def get_reports(patient_id: Optional[str] = Query(None)):
    db_reports = []
    try:
        query = "SELECT id, report_number, booking_id, patient_id, file_path, status, results, overall_remarks, doctor_name, lab_technician, created_at FROM public.reports"
        params: List[Any] = []
        if patient_id:
            query += " WHERE patient_id::text = %s OR patient_id = %s"
            params = [patient_id, to_uuid(patient_id)]
        query += " ORDER BY created_at DESC;"
        
        rows = supabase_db.fetch_all(query, tuple(params))
        if rows:
            db_reports = [_format_db_report(r) for r in rows]
    except Exception as e:
        print(f"[Supabase get_reports] error: {e}")

    # Fall back to in-memory if db returned nothing
    if not db_reports:
        mem = DB.get("reports", [])
        if patient_id:
            mem = [r for r in mem if r.get("patient_id") == patient_id]
        return {
            "success": True,
            "count": len(mem),
            "data": mem
        }

    return {
        "success": True,
        "count": len(db_reports),
        "data": db_reports
    }

@router.post("")
def upload_report(payload: Dict[str, Any]):
    report_id = str(uuid.uuid4())
    b_id = payload.get("booking_id")
    p_id = payload.get("patient_id") or "user_patient_1"
    rep_num = payload.get("report_number") or f"WD-REP-{datetime.utcnow().strftime('%Y%m%d')}-{report_id[:4].upper()}"
    file_path = payload.get("file_path")
    results = payload.get("results") or []
    remarks = payload.get("overall_remarks") or "Sample analyzed in accordance with ISO 15189:2022 guidelines."
    doctor = payload.get("doctor_name") or "Chief Pathologist, MD"
    tech = payload.get("lab_technician") or "Robert Thorne, B.Sc MLT"

    # Insert into Supabase
    try:
        booking_uuid = to_uuid(b_id) if b_id else None
        patient_uuid = to_uuid(p_id) if p_id else None
        
        supabase_db.execute(
            """
            INSERT INTO public.reports (id, report_number, booking_id, patient_id, file_path, status, results, overall_remarks, doctor_name, lab_technician, created_at)
            VALUES (%s, %s, %s, %s, %s, 'Released', %s, %s, %s, %s, NOW())
            ON CONFLICT (id) DO NOTHING;
            """,
            (
                report_id,
                rep_num,
                booking_uuid,
                patient_uuid,
                file_path,
                json.dumps(results) if isinstance(results, list) else results,
                remarks,
                doctor,
                tech
            )
        )

        # Update booking status in Supabase
        if b_id:
            supabase_db.execute(
                """
                UPDATE public.bookings 
                SET status = 'Report Ready', report_id = %s, updated_at = NOW() 
                WHERE id::text = %s OR order_number = %s;
                """,
                (report_id, str(b_id), str(b_id))
            )
    except Exception as e:
        print(f"[Supabase upload_report] error: {e}")

    # Presigned URL if file_path is set in R2
    download_url = None
    if file_path:
        download_url = r2_storage.generate_download_url(file_path, expires_in=86400)
    if not download_url:
        download_url = payload.get("download_url") or "/reports/mock-report.pdf"

    new_rep = {
        "id": report_id,
        "report_number": rep_num,
        "booking_id": b_id,
        "patient_id": p_id,
        "file_path": file_path,
        "download_url": download_url,
        "file_size": payload.get("file_size", "345 KB"),
        "release_status": "Released",
        "results": results,
        "overall_remarks": remarks,
        "doctor_name": doctor,
        "lab_technician": tech,
        "storage_provider": "cloudflare_r2" if file_path else "local",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    DB["reports"].append(new_rep)
    for b in DB["bookings"]:
        if b["id"] == b_id or b.get("booking_reference") == b_id:
            b["status"] = "Report Ready"
            b["report_id"] = report_id

    return {
        "success": True,
        "message": "Report released to patient portal and stored",
        "data": new_rep
    }

@router.post("/upload-file")
async def upload_report_file(
    file: UploadFile = File(...),
    booking_id: Optional[str] = Form(None),
    patient_id: Optional[str] = Form("user_patient_1"),
    doctor_name: Optional[str] = Form("Chief Pathologist, MD"),
    lab_technician: Optional[str] = Form("Robert Thorne, B.Sc MLT"),
    overall_remarks: Optional[str] = Form("Official digital pathology report verified.")
):
    """
    Accepts an uploaded PDF lab report and stores it directly in Cloudflare R2 bucket.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    report_id = str(uuid.uuid4())
    filename = file.filename or f"report_{report_id[:6]}.pdf"
    safe_filename = "".join(c for c in filename if c.isalnum() or c in "._-")
    object_key = f"reports/{report_id}/{safe_filename}"
    
    # Upload to Cloudflare R2
    presigned_url = r2_storage.upload_file(
        file_content=contents,
        object_key=object_key,
        content_type=file.content_type or "application/pdf"
    )
    if not presigned_url:
        raise HTTPException(status_code=500, detail="Failed to upload report to Cloudflare R2 storage")

    rep_num = f"WD-REP-{datetime.utcnow().strftime('%Y%m%d')}-{report_id[:4].upper()}"
    file_size_kb = f"{max(1, len(contents) // 1024)} KB"

    # Persist in Supabase
    try:
        booking_uuid = to_uuid(booking_id) if booking_id else None
        patient_uuid = to_uuid(patient_id) if patient_id else None

        supabase_db.execute(
            """
            INSERT INTO public.reports (id, report_number, booking_id, patient_id, file_path, status, results, overall_remarks, doctor_name, lab_technician, created_at)
            VALUES (%s, %s, %s, %s, %s, 'Released', '[]'::jsonb, %s, %s, %s, NOW())
            ON CONFLICT (id) DO NOTHING;
            """,
            (report_id, rep_num, booking_uuid, patient_uuid, object_key, overall_remarks, doctor_name, lab_technician)
        )

        if booking_id:
            supabase_db.execute(
                """
                UPDATE public.bookings 
                SET status = 'Report Ready', report_id = %s, updated_at = NOW() 
                WHERE id::text = %s OR order_number = %s;
                """,
                (report_id, str(booking_id), str(booking_id))
            )
    except Exception as e:
        print(f"[Supabase upload_report_file] error: {e}")

    report_data = {
        "id": report_id,
        "report_number": rep_num,
        "booking_id": booking_id,
        "patient_id": patient_id,
        "file_path": object_key,
        "download_url": presigned_url,
        "file_size": file_size_kb,
        "release_status": "Released",
        "doctor_name": doctor_name,
        "lab_technician": lab_technician,
        "overall_remarks": overall_remarks,
        "storage_provider": "cloudflare_r2",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    DB["reports"].append(report_data)

    return {
        "success": True,
        "message": "Report uploaded to Cloudflare R2 and linked to patient booking",
        "data": report_data
    }

@router.get("/{report_id}/download")
def download_report(report_id: str):
    """
    Generates a secure direct download link to Cloudflare R2 for the specified report.
    """
    row = supabase_db.fetch_one(
        "SELECT file_path FROM public.reports WHERE id::text = %s OR report_number = %s",
        (report_id, report_id)
    )
    file_path = row.get("file_path") if row else None

    if not file_path:
        for r in DB.get("reports", []):
            if r.get("id") == report_id or r.get("report_number") == report_id:
                file_path = r.get("file_path")
                break

    if file_path:
        url = r2_storage.generate_download_url(file_path, expires_in=86400)
        if url:
            return RedirectResponse(url=url)

    raise HTTPException(status_code=404, detail="Report file not found")
