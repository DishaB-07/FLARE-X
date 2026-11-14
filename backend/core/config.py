"""Application configuration and filesystem locations.

Never expose GEMINI_API_KEY through an API route or the frontend build.
Environment values are read at use time so tests and deployment overrides work.
"""
from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env", override=False)
CATALOGUE_PATH = PROJECT_ROOT / "data" / "investigations.json"
CITATION_AUDIT_PATH = PROJECT_ROOT / "data" / "psi_citation_audit.json"
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"
NASA_PSI_SEARCH_URL = "https://psi.nasa.gov/physci/repo/search?q=&data_source=psi&data_type=investigation"


def allowed_origins() -> list[str]:
    """Development origins plus explicitly configured production origins."""
    extra = [origin.strip() for origin in os.getenv("FLAREX_CORS_ORIGINS", "").split(",") if origin.strip()]
    return list(dict.fromkeys(["http://localhost:5173", "http://127.0.0.1:5173", *extra]))
