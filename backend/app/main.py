from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import tests, packages, addresses, bookings, admin, driver, reports, invoices, geocode

app = FastAPI(
    title="Wellness Diagnostic Pathology & Clinical API",
    description="Production-grade asynchronous healthcare API powering blood test catalogs, home collections, phlebotomy dispatch, and laboratory reporting.",
    version="1.0.0"
)

# CORS Middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all domain routers
app.include_router(tests.router)
app.include_router(packages.router)
app.include_router(addresses.router)
app.include_router(bookings.router)
app.include_router(admin.router)
app.include_router(driver.router)
app.include_router(reports.router)
app.include_router(invoices.router)
app.include_router(geocode.router)

@app.get("/")
def root():
    return {
        "service": "Wellness Diagnostic Pathology API",
        "status": "online",
        "documentation": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    from app.data import supabase_db
    from app.services import r2_storage
    conn = supabase_db.get_connection()
    is_supabase = conn is not None
    if conn:
        conn.close()
    return {
        "status": "healthy",
        "database": "supabase_postgresql" if is_supabase else "local_in_memory",
        "supabase_connected": is_supabase,
        "r2_storage_connected": r2_storage.is_configured(),
        "storage_bucket": r2_storage.R2_BUCKET_NAME,
        "region": "ap-northeast-2 (Seoul)",
        "timestamp": "2026-10-23T14:35:00Z"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
