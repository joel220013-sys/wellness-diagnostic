# Running Wellness Diagnostic (Next.js Frontend + Python Backend)

This application is composed of two services:
1. **Frontend**: Next.js (React 19 + Tailwind CSS) running on `http://localhost:3000`
2. **Backend**: Python (FastAPI + Uvicorn) running on `http://127.0.0.1:8000`

All frontend API calls to `/api/*` are transparently proxied by Next.js to the Python backend on port 8000.

---

## 🚀 Running the Project

### Terminal 1: Start the Python Backend

You have 3 easy options to run the backend:

#### Option A: Quick npm script (Works in both CMD and PowerShell)
```cmd
npm run backend
```

#### Option B: Standard Windows Command Prompt (CMD)
```cmd
backend\venv\Scripts\python.exe backend\run.py
```
*(Or navigate into the backend folder)*:
```cmd
cd backend
venv\Scripts\activate.bat
python run.py
```

#### Option C: PowerShell
```powershell
.\backend\venv\Scripts\python.exe backend/run.py
```
*(Or activate first)*:
```powershell
.\backend\venv\Scripts\Activate.ps1
python backend/run.py
```

* **Backend Live Base URL:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
* **Interactive Swagger API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
* **Health Check Endpoint:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

### Terminal 2: Start the Next.js Frontend
Open a second terminal in the project root:

```powershell
npm run dev
```

* **Portal Selection Screen (Gateway):** [http://localhost:3000/](http://localhost:3000/)
* **Public Landing Page:** [http://localhost:3000/home](http://localhost:3000/home)

---

## 🔑 Demo Login Credentials

Each login screen provides credentials or quick fill options:

| Portal | URL | Email | Password |
| :--- | :--- | :--- | :--- |
| **Patient Portal** | [http://localhost:3000/patient/login](http://localhost:3000/patient/login) | `patient@wellness.com` | `Patient@123` |
| **Admin Portal** | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) | `admin@wellness.com` | `Admin@123` |
| **Driver / Phlebotomist** | [http://localhost:3000/driver/login](http://localhost:3000/driver/login) | `driver@wellness.com` | `Driver@123` |

---

## 🧪 Testing & Verification

```powershell
# Run unit tests
npm test

# Run dependency audit (0 vulnerabilities)
npm audit

# Build frontend production bundle
npm run build
```
