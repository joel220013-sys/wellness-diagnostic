# 🚀 Production Deployment Guide: Supabase + Render + Vercel

This document guides you through connecting **Supabase**, deploying the **Python FastAPI Backend on Render**, and deploying the **Next.js Frontend on Vercel**.

---

## Part 1: Connect to Supabase

### 1. Create a Supabase Project
1. Go to [database.new](https://database.new) (or log in to [supabase.com](https://supabase.com)).
2. Click **New Project**, choose an organization, project name (`wellness-diagnostic`), and secure database password.
3. Select the region closest to your customers (e.g. *South Asia (Mumbai)* or *US East*).

### 2. Run Database Schema Migrations
1. In your Supabase dashboard, click **SQL Editor** on the left menu.
2. Open the file [`supabase/migrations/20261021_init_wellness_schema.sql`](./supabase/migrations/20261021_init_wellness_schema.sql) from this repository.
3. Copy its entire content, paste it into the Supabase SQL Editor, and click **Run**.
4. *(Optional Sample Data)*: Open [`supabase/seed.sql`](./supabase/seed.sql), copy, paste into SQL Editor, and click **Run** to load initial clinical tests and demo records.

### 3. Retrieve Your Supabase API Credentials
1. Go to **Project Settings** > **API**.
2. Note down:
   - **Project URL:** `https://your-project-id.supabase.co`
   - **Anon Key (public):** `eyJhbGciOi...`
   - **Service Role Key (secret):** `eyJhbGciOi...`

---

## Part 2: Deploy Python Backend on Render

Render provides free hosting for Python FastAPI services.

### Option A: Automatic via Blueprint (Easiest)
1. Go to [dashboard.render.com](https://dashboard.render.com) and sign in with GitHub.
2. Click **New +** > **Blueprint**.
3. Connect your repository: `https://github.com/joel220013-sys/wellness-diagnostic`.
4. Render will automatically detect [`render.yaml`](./render.yaml) and configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Apply**.
6. Once deployed, Render will provide your public backend URL (e.g. `https://wellness-diagnostic-backend.onrender.com`).

### Option B: Manual Web Service
1. Click **New +** > **Web Service**.
2. Select your repository `wellness-diagnostic`.
3. Set:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Click **Create Web Service**.

---

## Part 3: Deploy Next.js Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** > **Project**.
3. Import your repository: `wellness-diagnostic`.
4. In **Configure Project**, add the following **Environment Variables**:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `BACKEND_URL` | `https://wellness-diagnostic-backend.onrender.com` | Your live Render backend URL |
| `NEXT_PUBLIC_BACKEND_URL` | `https://wellness-diagnostic-backend.onrender.com` | Public backend URL |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Anon Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase Service Role Key |
| `NEXT_PUBLIC_APP_URL` | `https://wellness-diagnostic.vercel.app` | Your Vercel frontend URL |

5. Click **Deploy**.
6. Vercel will build and launch your site with zero configuration!

---

## Part 4: Local `.env.local` Setup

To connect your local machine directly to Supabase and Python backend:

Create `.env.local` in the project root:
```env
# Backend Connection
BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000

# Live Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-supabase-service-role-key

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
