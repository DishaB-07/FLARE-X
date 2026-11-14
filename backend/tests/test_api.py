from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health_and_counts():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["records_loaded"] == 24

    metadata = client.get("/api/metadata").json()
    assert metadata["type_counts"] == {
        "Ground Investigation": 5,
        "Microgravity Investigation": 19,
    }


def test_search_and_detail():
    response = client.get("/api/investigations", params={"search": "BASS"})
    assert response.status_code == 200
    assert {item["id"] for item in response.json()["items"]} >= {"PSI-25", "PSI-26"}

    detail = client.get("/api/investigations/PSI-26")
    assert detail.status_code == 200
    assert detail.json()["fuel_material"] == [
        "custom-made fabric: 75% cotton and 25% fiberglass by mass"
    ]


def test_comparison_and_unknown_id():
    response = client.get(
        "/api/compare",
        params=[("ids", "PSI-26"), ("ids", "PSI-25")],
    )
    assert response.status_code == 200
    assert len(response.json()["items"]) == 2
    assert "doi" in response.json()["items"][0]

    missing = client.get("/api/investigations/PSI-999")
    assert missing.status_code == 404
