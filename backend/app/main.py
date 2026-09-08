import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth, users, incidents, locations, rescued, missing,
    shelters, rescue_teams, resources, medical, relief,
    dashboard, reports, audit_logs
)

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Flood Rescue Data Management & Dynamic Reporting API",
    description="Comprehensive disaster management, location tracking, rescue monitoring, shelter occupancy, resource allocation, and dynamic PDF/Excel reporting system.",
    version="1.0.0"
)

# Configure CORS Middleware
origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event: Auto-seed Database if required
@app.on_event("startup")
def on_startup():
    try:
        import sys
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if backend_dir not in sys.path:
            sys.path.insert(0, backend_dir)
        from seed import seed_database
        print("[STARTUP] Checking database seed data...")
        seed_database()
        print("[STARTUP] Database seed check completed.")
    except Exception as e:
        print(f"[STARTUP] Notice: Seed execution warning: {e}")

# Include Routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(rescued.router, prefix="/api")
app.include_router(missing.router, prefix="/api")
app.include_router(shelters.router, prefix="/api")
app.include_router(rescue_teams.router, prefix="/api")
app.include_router(resources.router, prefix="/api")
app.include_router(medical.router, prefix="/api")
app.include_router(relief.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(audit_logs.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "flood-rescue-backend", "version": "1.0.0"}

# Detect built Frontend SPA directory (frontend/dist)
current_dir = os.path.dirname(os.path.abspath(__file__))
possible_dist_paths = [
    os.path.abspath(os.path.join(current_dir, "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(current_dir, "..", "dist")),
    os.path.abspath(os.path.join(current_dir, "dist")),
]

frontend_dist = None
for path in possible_dist_paths:
    if os.path.exists(os.path.join(path, "index.html")):
        frontend_dist = path
        break

if frontend_dist:
    print(f"[STATIC] Serving frontend static build from: {frontend_dist}")
    assets_path = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Exclude API endpoints, Swagger docs, and health checks
        if full_path.startswith("api/") or full_path == "api" or full_path in ["docs", "redoc", "openapi.json"]:
            raise HTTPException(status_code=404, detail="API route not found")
        
        target_file = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "status": "Online",
            "system": "Flood Rescue Data Management & Dynamic Reporting Dashboard",
            "version": "1.0.0",
            "docs": "/docs"
        }

