# 🛡️ Wellness Diagnostic Center — Security Hardening Documentation

This document records the security controls deployed to protect the platform against common web and API vulnerabilities (OWASP Top 10).

## 1. Secrets Management
- All sensitive credentials (`DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `R2_SECRET_ACCESS_KEY`, `R2_ACCESS_KEY_ID`, `R2_ACCOUNT_ID`) are strictly loaded via environment variables with zero fallback secrets in source code.
- `.gitignore` rules prevent any `.env*`, `*.pem`, `*.key`, `*.cert`, `credentials.json`, or temporary debug logs from being committed to Git.

## 2. Route Protection & Role-Based Access Control (RBAC)
- Next.js edge router in `middleware.ts` guards:
  - `/admin/:path*` (accessible only with verified `admin` role cookie)
  - `/driver/:path*` (accessible only with verified `driver` or `admin` role cookie)
  - `/patient/:path*` (accessible only with authenticated patient session)
- Unauthenticated or unauthorized attempts are immediately intercepted and redirected to their respective login portals with return URLs.

## 3. Anti-XSS & Form Input Sanitization
- `src/lib/security/sanitize.ts` sanitizes incoming form inputs across patient registration, login forms, phlebotomist onboarding, and booking submissions.
- Strips `<script>`, inline event handlers (e.g. `onclick=`), and raw HTML tags.

## 4. API Rate Limiting & Denial of Service Protection
- In-memory sliding window rate limiter in FastAPI:
  - `/api/auth/*`: 20 requests per minute per IP.
  - `/api/bookings` [POST]: 30 requests per minute per IP.
  - General API endpoints: 300 requests per minute per IP.
  - Exceeded thresholds return `HTTP 429 Too Many Requests` with a `Retry-After: 60` response header.

## 5. CORS Restrictions
- Replaced permissive wildcard `"*"` with an explicit whitelist:
  - `https://www.wellnessdiagnosticcenter.in`
  - `https://wellnessdiagnosticcenter.in`
  - `https://wellness-diagnostic.vercel.app`
  - `https://wellness-diagnostic-backend.onrender.com`
  - `http://localhost:3000` / `http://127.0.0.1:3000`

## 6. HTTP Security Headers
Configured in `next.config.js` and FastAPI middleware:
- `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
- `X-Content-Type-Options: nosniff` (prevents MIME confusion)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (forces HTTPS)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`

## 7. Password Hashing
- Passwords hashed using **PBKDF2-HMAC-SHA256** with 100,000 iterations and a cryptographically random 16-byte salt per user.
- Verified using constant-time comparison (`secrets.compare_digest`) to prevent timing side-channel attacks.
- Column `password_hash` active in `public.profiles` in Supabase PostgreSQL.
- API responses explicitly strip `password_hash` to avoid accidental exposure.
