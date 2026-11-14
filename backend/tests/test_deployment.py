"""Single-origin deployment route regression tests; no live hosting required."""

from fastapi.testclient import TestClient

from backend import main

client = TestClient(main.app)


def test_build_index_and_favicon_are_served(tmp_path, monkeypatch):
    build_dir = tmp_path / "dist"
    build_dir.mkdir()
    (build_dir / "index.html").write_text("<html><title>FLARE-X build fixture</title></html>")
    (build_dir / "favicon.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
    monkeypatch.setattr(main, "FRONTEND_DIST", build_dir)

    response = client.get("/")
    assert response.status_code == 200
    assert "FLARE-X build fixture" in response.text
    assert response.headers["cache-control"] == "no-cache"

    favicon = client.get("/favicon.svg")
    assert favicon.status_code == 200
    assert favicon.headers["content-type"].startswith("image/svg+xml")

    assert client.get("/.env").status_code == 404
    assert client.get("/health").json()["records_loaded"] == 24


def test_missing_frontend_build_reports_404(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "FRONTEND_DIST", tmp_path / "not-built")
    response = client.get("/")
    assert response.status_code == 404
    assert "Frontend not built" in response.json()["detail"]
    assert client.get("/docs").status_code == 200
