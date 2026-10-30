import os
import time
from collections import defaultdict
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.routes import tests, packages, addresses, bookings, admin, driver, reports, invoices, geocode, auth

IS_PROD = os.environ.get("ENVIRONMENT", "").lower() == "production" or os.environ.get("RENDER", "").lower() == "true"

# 1. Initialize FastAPI Application with hardened production settings
app = FastAPI(
    title="Wellness Diagnostic Pathology & Clinical API",
    description="Production-grade asynchronous healthcare API powering blood test catalogs, home collections, phlebotomy dispatch, and laboratory reporting.",
    version="1.0.0",
    docs_url="/docs" if not IS_PROD else None,
    redoc_url="/redoc" if not IS_PROD else None,
    openapi_url="/openapi.json" if not IS_PROD else None,
)

# 2. In-Memory Sliding Window Rate Limiter
class SecurityRateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)

    def is_allowed(self, key: str, max_requests: int, window_seconds: int = 60) -> bool:
        now = time.time()
        # Prune expired timestamps
        self.requests[key] = [t for t in self.requests[key] if now - t < window_seconds]
        if len(self.requests[key]) >= max_requests:
            return False
        self.requests[key].append(now)
        return True

rate_limiter = SecurityRateLimiter()

# 3. Security Headers and Rate Limiting Middleware
class SecurityAndRateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        # Rate Limit Auth Endpoints (Brute-force protection: 20 per minute)
        if path in ["/api/auth/login", "/api/auth/register"]:
            if not rate_limiter.is_allowed(f"auth:{client_ip}", max_requests=20, window_seconds=60):
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Too many authentication requests. Please try again in 60 seconds."},
                    headers={"Retry-After": "60"}
                )

        # Rate Limit Booking Creations (Abuse protection: 30 per minute)
        elif path == "/api/bookings" and request.method == "POST":
            if not rate_limiter.is_allowed(f"booking:{client_ip}", max_requests=30, window_seconds=60):
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Booking rate limit exceeded. Please wait a minute before submitting again."},
                    headers={"Retry-After": "60"}
                )

        # General API Rate Limit (DDoS protection: 300 per minute)
        elif path.startswith("/api/"):
            if not rate_limiter.is_allowed(f"api:{client_ip}", max_requests=300, window_seconds=60):
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "API rate limit exceeded. Please slow down."},
                    headers={"Retry-After": "60"}
                )

        response: Response = await call_next(request)

        # Enforce HTTP Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response

app.add_middleware(SecurityAndRateLimitMiddleware)

# 4. Strict CORS Configuration (Whitelisted Origins Only)
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://www.wellnessdiagnosticcenter.in",
    "https://wellnessdiagnosticcenter.in",
    "https://wellness-diagnostic.vercel.app",
    "https://wellness-diagnostic-backend.onrender.com",
]

env_origins = os.environ.get("ALLOWED_ORIGINS")
if env_origins:
    for o in env_origins.split(","):
        cleaned = o.strip()
        if cleaned and cleaned not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
)

# 5. Mount domain routers
app.include_router(auth.router)
app.include_router(tests.router)
app.include_router(packages.router)
app.include_router(addresses.router)
app.include_router(bookings.router)
app.include_router(admin.router)
app.include_router(driver.router)
app.include_router(reports.router)
app.include_router(invoices.router)
app.include_router(geocode.router)

@app.api_route("/ping", methods=["GET", "HEAD"])
@app.api_route("/api/ping", methods=["GET", "HEAD"])
def ping():
    return "ok"

@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {
        "service": "Wellness Diagnostic Pathology API",
        "status": "online",
        "version": "1.0.0"
    }

@app.api_route("/api/health", methods=["GET", "HEAD"])
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
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=not IS_PROD)
