"""Guard source boundaries and local cross-links; no NASA endpoint is queried."""
from backend.main import RECORDS


def test_catalogue_integrity_snapshot():
    assert len(RECORDS) == 24
    ids = {record["id"] for record in RECORDS}
    assert len(ids) == 24
    assert {record["id"] for record in RECORDS if record.get("doi")} == {"PSI-25", "PSI-69", "PSI-98"}
    for record in RECORDS:
        assert record["id"].startswith("PSI-")
        assert record["source_url"].startswith("https://psi.nasa.gov/")
        for relative in record.get("related_investigation_ids", []):
            assert relative in ids
        for field in ("objective", "approach"):
            assert record[field]["text"]
            assert record[field]["completeness"] in {
                "truncated_catalogue_excerpt",
                "summary_from_official_NASA_PSI_landing_page",
                "summary_from_official_NASA_PSI_landing_page_and_user_supplied_catalogue_excerpt",
                "summary_from_official_NASA_PSI_landing_page_and_user_supplied_challenge_context",
            }
