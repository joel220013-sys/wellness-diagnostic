# Wellness Diagnostic — Python (FastAPI) Backend

This is the dedicated Python backend service for **Wellness Diagnostic**. It provides an asynchronous, high-performance REST API powering blood test catalogs, appointment bookings, phlebotomist dispatch, pathology reports, and billing.

---

## 🏗️ Architecture

```text
backend/
├── app/
│   ├── main.py             # FastAPI entry point & CORS configuration
│   ├── models/
│   │   └── schemas.py      # Pydantic v2 data models & validators
│   ├── routes/
│   │   ├── tests.py        # /api/tests catalog endpoints
│   │   ├── packages.py     # /api/packages health packages
│   │   ├── addresses.py    # /api/addresses CRUD operations
│   │   ├── bookings.py     # /api/bookings creation & cancellation
│   │   ├── admin.py        # /api/admin orders & driver assignment
│   │   ├── driver.py       # /api/driver phlebotomist collection workflow
│   │   ├── reports.py      # /api/reports laboratory report release
│   │   ├── invoices.py     # /api/invoices billing & invoices
│   │   └── geocode.py      # /api/geocode map coordinates proxy
│   └── data/
│       ├── store.py        # Production clinical store
│       └── supabase_db.py  # Supabase live PostgreSQL client connection
├── venv/                   # Python virtual environment
├── requirements.txt        # Python package dependencies
├── run.py                  # Server runner script
└── README.md
```

---

## 🚀 Running the Python Backend

### 1. Activate the Virtual Environment
* **Windows (PowerShell):**
  ```powershell
  .\backend\venv\Scripts\Activate.ps1
  ```
* **macOS / Linux:**
  ```bash
  source backend/venv/bin/activate
  ```

### 2. Start the Server
```powershell
python backend/run.py
```

* **API Server:** `http://127.0.0.1:8000`
* **Interactive Swagger UI (API Docs):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc API Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
* **Health Check:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
