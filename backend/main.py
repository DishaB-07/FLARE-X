"""FLARE-X FastAPI composition root.

Start locally: py -3.12 -m uvicorn backend.main:app --reload
Business logic is in services; catalogue I/O in data_access; routes in api.
"""
from __future__ import annotations
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from backend.core.config import allowed_origins, FRONTEND_DIST as DEFAULT_FRONTEND_DIST
from backend.data_access.catalogue import CATALOGUE, RECORDS, RECORD_BY_ID, CITATION_AUDIT, load_catalogue
from backend.api.routes import catalogue, research, citations, assistant

# Kept public for existing integrations / regression tests.
FRONTEND_DIST = DEFAULT_FRONTEND_DIST

app = FastAPI(
    title="FLARE-X API", version="0.5.0",
    description="Search and compare the supplied NASA PSI Combustion Science catalogue.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept"],
)

app.include_router(catalogue.router)
app.include_router(research.router)
app.include_router(citations.router)
app.include_router(assistant.router)


@app.get("/health", tags=["Health"])
def health() -> dict[str, str | int]:
    return {"status": "ok", "records_loaded": len(RECORDS)}


# Only built public assets are exposed by the production FastAPI process.
# In development Vite serves the client and proxies /api and /health.
if (FRONTEND_DIST / "assets").is_dir():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="frontend-assets")


@app.get("/", include_in_schema=False)
def frontend_home():
    index_file = FRONTEND_DIST / "index.html"
    if not index_file.is_file():
        raise HTTPException(status_code=404, detail="Frontend not built; use Vite locally or run npm run build.")
    return FileResponse(index_file, media_type="text/html", headers={"Cache-Control": "no-cache"})


@app.get("/favicon.svg", include_in_schema=False)
def frontend_favicon():
    favicon_file = FRONTEND_DIST / "favicon.svg"
    if not favicon_file.is_file():
        raise HTTPException(status_code=404, detail="Favicon not built.")
    return FileResponse(favicon_file, media_type="image/svg+xml")
