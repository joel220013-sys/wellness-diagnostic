import uvicorn
import sys
import os

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    is_dev = os.environ.get("ENV", "development").lower() != "production"
    print("=" * 60)
    print(f"Starting Wellness Diagnostic Python (FastAPI) Backend on port {port}")
    print(f"API Docs:  http://127.0.0.1:{port}/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=is_dev)
