"""Backend tests for WeHA audit-requests endpoints."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback: try frontend env file
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
                    break
    except Exception:
        pass

API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Health / root ----
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert "message" in r.json()


# ---- POST /api/audit-requests (success) ----
def test_create_audit_request_success(session):
    payload = {
        "name": "TEST_John Doe",
        "company": "TEST_Acme Co",
        "country": "UAE",
        "industry": "Real Estate",
        "process": "We copy Bayut leads into a spreadsheet every morning.",
        "contact_method": "Email",
        "email": "test_john@example.com",
    }
    r = session.post(f"{API}/audit-requests", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    # Required returned fields
    for k in ("id", "name", "company", "country", "industry", "process",
              "contact_method", "email", "created_at"):
        assert k in data, f"missing field: {k}"
    assert data["name"] == payload["name"]
    assert data["process"] == payload["process"]
    assert isinstance(data["id"], str) and len(data["id"]) > 0

    # Verify GET returns the created submission
    r2 = session.get(f"{API}/audit-requests")
    assert r2.status_code == 200
    items = r2.json()
    assert isinstance(items, list)
    ids = [i["id"] for i in items]
    assert data["id"] in ids


# ---- POST /api/audit-requests (validation) ----
def test_create_audit_request_empty_name(session):
    payload = {
        "name": "",
        "company": "TEST_Acme",
        "country": "UAE",
        "industry": "Real Estate",
        "process": "Some process",
        "contact_method": "Email",
    }
    r = session.post(f"{API}/audit-requests", json=payload)
    assert r.status_code == 422


def test_create_audit_request_empty_process(session):
    payload = {
        "name": "TEST_Name",
        "company": "TEST_Acme",
        "country": "UAE",
        "industry": "Real Estate",
        "process": "   ",
        "contact_method": "Email",
    }
    r = session.post(f"{API}/audit-requests", json=payload)
    assert r.status_code == 422


def test_create_audit_request_missing_field(session):
    # missing 'process' entirely -> Pydantic 422
    payload = {
        "name": "TEST_Name",
        "company": "TEST_Acme",
        "country": "UAE",
        "industry": "Real Estate",
        "contact_method": "Email",
    }
    r = session.post(f"{API}/audit-requests", json=payload)
    assert r.status_code == 422


# ---- GET /api/audit-requests ----
def test_get_audit_requests_list(session):
    r = session.get(f"{API}/audit-requests")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    if data:
        item = data[0]
        for k in ("id", "name", "process", "created_at"):
            assert k in item
        # ensure mongo _id not leaked
        assert "_id" not in item
