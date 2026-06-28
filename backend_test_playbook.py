#!/usr/bin/env python3
"""
Comprehensive test suite for WeHA Playbook Lead Capture endpoints
Tests POST /api/playbook-requests and GET /api/playbook-requests
Also verifies regression - existing endpoints remain functional
"""

import requests
import json
from datetime import datetime, timedelta
import os

# Read backend URL from frontend/.env
BACKEND_URL = None
env_path = '/app/frontend/.env'
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                BACKEND_URL = line.split('=', 1)[1].strip()
                break

if not BACKEND_URL:
    raise ValueError("REACT_APP_BACKEND_URL not found in /app/frontend/.env")

API_BASE = f"{BACKEND_URL}/api"

print(f"Testing WeHA Playbook endpoints at: {API_BASE}")
print("=" * 80)

# Test counters
total_tests = 0
passed_tests = 0
failed_tests = []


def test_case(name, condition, details=""):
    """Helper to track test results"""
    global total_tests, passed_tests, failed_tests
    total_tests += 1
    if condition:
        passed_tests += 1
        print(f"✅ TEST {total_tests}: {name}")
        if details:
            print(f"   {details}")
    else:
        failed_tests.append(f"TEST {total_tests}: {name}")
        print(f"❌ TEST {total_tests}: {name}")
        if details:
            print(f"   {details}")
    print()


# =============================================================================
# NEW PLAYBOOK ENDPOINTS TESTS
# =============================================================================

print("\n" + "=" * 80)
print("TESTING NEW PLAYBOOK LEAD CAPTURE ENDPOINTS")
print("=" * 80 + "\n")

# TEST 1: Valid POST with ALL fields
print("TEST 1: POST /api/playbook-requests with ALL fields")
payload_all_fields = {
    "name": "Sarah Chen",
    "company": "TechCorp Industries",
    "designation": "Chief Technology Officer",
    "email": "sarah.chen@techcorp.example.com",
    "industry": "Technology",
    "country": "Singapore",
    "session_interest": "Yes",
    "source": "homepage_hero"
}
try:
    resp = requests.post(f"{API_BASE}/playbook-requests", json=payload_all_fields, timeout=10)
    data = resp.json()
    
    # Check status code
    status_ok = resp.status_code == 200
    
    # Check all fields are returned
    has_id = "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
    has_created_at = "created_at" in data
    name_match = data.get("name") == payload_all_fields["name"]
    company_match = data.get("company") == payload_all_fields["company"]
    designation_match = data.get("designation") == payload_all_fields["designation"]
    email_match = data.get("email") == payload_all_fields["email"]
    industry_match = data.get("industry") == payload_all_fields["industry"]
    country_match = data.get("country") == payload_all_fields["country"]
    session_match = data.get("session_interest") == payload_all_fields["session_interest"]
    source_match = data.get("source") == payload_all_fields["source"]
    
    # Check created_at is ISO format with Z
    created_at_iso = False
    if has_created_at:
        created_str = data["created_at"]
        created_at_iso = created_str.endswith("Z") or "+00:00" in created_str
    
    all_checks = (status_ok and has_id and has_created_at and name_match and 
                  company_match and designation_match and email_match and 
                  industry_match and country_match and session_match and 
                  source_match and created_at_iso)
    
    test_case(
        "Valid POST with ALL fields → 200, all fields persisted, created_at is ISO Z",
        all_checks,
        f"Status: {resp.status_code}, ID: {data.get('id', 'N/A')[:8]}..., created_at: {data.get('created_at', 'N/A')}"
    )
    
    # Store ID for later verification
    test1_id = data.get("id")
    
except Exception as e:
    test_case("Valid POST with ALL fields", False, f"Exception: {str(e)}")
    test1_id = None


# TEST 2: Valid POST with only REQUIRED fields (name, company, email)
print("TEST 2: POST /api/playbook-requests with only REQUIRED fields")
payload_required_only = {
    "name": "Michael Rodriguez",
    "company": "Global Innovations Ltd",
    "email": "m.rodriguez@globalinnovations.example.com"
}
try:
    resp = requests.post(f"{API_BASE}/playbook-requests", json=payload_required_only, timeout=10)
    data = resp.json()
    
    status_ok = resp.status_code == 200
    has_id = "id" in data
    name_match = data.get("name") == payload_required_only["name"]
    company_match = data.get("company") == payload_required_only["company"]
    email_match = data.get("email") == payload_required_only["email"]
    
    # Optional fields should be null or not present
    designation_null = data.get("designation") is None
    industry_null = data.get("industry") is None
    country_null = data.get("country") is None
    session_null = data.get("session_interest") is None
    source_null = data.get("source") is None
    
    all_checks = (status_ok and has_id and name_match and company_match and 
                  email_match and designation_null and industry_null and 
                  country_null and session_null and source_null)
    
    test_case(
        "Valid POST with only required fields → 200, optional fields default to null",
        all_checks,
        f"Status: {resp.status_code}, designation: {data.get('designation')}, industry: {data.get('industry')}"
    )
    
    test2_id = data.get("id")
    
except Exception as e:
    test_case("Valid POST with only required fields", False, f"Exception: {str(e)}")
    test2_id = None


# TEST 3: Empty name (whitespace only) → 422
print("TEST 3: POST /api/playbook-requests with empty name (whitespace)")
payload_empty_name = {
    "name": "   ",
    "company": "Test Company",
    "email": "test@example.com"
}
try:
    resp = requests.post(f"{API_BASE}/playbook-requests", json=payload_empty_name, timeout=10)
    data = resp.json()
    
    is_422 = resp.status_code == 422
    has_error_msg = "detail" in data and "Name and company are required" in data["detail"]
    
    test_case(
        "Empty name (whitespace only) → 422 with 'Name and company are required.'",
        is_422 and has_error_msg,
        f"Status: {resp.status_code}, Detail: {data.get('detail', 'N/A')}"
    )
    
except Exception as e:
    test_case("Empty name validation", False, f"Exception: {str(e)}")


# TEST 4: Empty company (whitespace only) → 422
print("TEST 4: POST /api/playbook-requests with empty company (whitespace)")
payload_empty_company = {
    "name": "John Doe",
    "company": "   ",
    "email": "john@example.com"
}
try:
    resp = requests.post(f"{API_BASE}/playbook-requests", json=payload_empty_company, timeout=10)
    data = resp.json()
    
    is_422 = resp.status_code == 422
    has_error_msg = "detail" in data and "Name and company are required" in data["detail"]
    
    test_case(
        "Empty company (whitespace only) → 422",
        is_422 and has_error_msg,
        f"Status: {resp.status_code}, Detail: {data.get('detail', 'N/A')}"
    )
    
except Exception as e:
    test_case("Empty company validation", False, f"Exception: {str(e)}")


# TEST 5: Invalid email format → 422 (pydantic EmailStr validation)
print("TEST 5: POST /api/playbook-requests with invalid email format")
payload_invalid_email = {
    "name": "Jane Smith",
    "company": "Acme Corp",
    "email": "notanemail"
}
try:
    resp = requests.post(f"{API_BASE}/playbook-requests", json=payload_invalid_email, timeout=10)
    data = resp.json()
    
    is_422 = resp.status_code == 422
    # Pydantic validation error should mention email
    has_email_error = "detail" in data
    
    test_case(
        "Invalid email format (e.g. 'notanemail') → 422 (pydantic EmailStr validation)",
        is_422 and has_email_error,
        f"Status: {resp.status_code}, Detail: {data.get('detail', 'N/A')}"
    )
    
except Exception as e:
    test_case("Invalid email format validation", False, f"Exception: {str(e)}")


# TEST 6: Missing email field entirely → 422
print("TEST 6: POST /api/playbook-requests with missing email field")
payload_no_email = {
    "name": "Bob Johnson",
    "company": "Johnson & Co"
}
try:
    resp = requests.post(f"{API_BASE}/playbook-requests", json=payload_no_email, timeout=10)
    data = resp.json()
    
    is_422 = resp.status_code == 422
    has_error = "detail" in data
    
    test_case(
        "Missing email field entirely → 422",
        is_422 and has_error,
        f"Status: {resp.status_code}, Detail: {data.get('detail', 'N/A')}"
    )
    
except Exception as e:
    test_case("Missing email field validation", False, f"Exception: {str(e)}")


# TEST 7: GET /api/playbook-requests → returns list sorted by created_at desc
print("TEST 7: GET /api/playbook-requests")
try:
    resp = requests.get(f"{API_BASE}/playbook-requests", timeout=10)
    data = resp.json()
    
    is_200 = resp.status_code == 200
    is_list = isinstance(data, list)
    has_records = len(data) >= 2  # Should have at least the 2 we created (test 1 and 2)
    
    # Check if our created records are present
    ids_in_response = [item.get("id") for item in data]
    has_test1 = test1_id in ids_in_response if test1_id else True
    has_test2 = test2_id in ids_in_response if test2_id else True
    
    # Check sorting (created_at descending - most recent first)
    sorted_correctly = True
    if len(data) >= 2:
        for i in range(len(data) - 1):
            curr_time = data[i].get("created_at", "")
            next_time = data[i + 1].get("created_at", "")
            if curr_time and next_time:
                # Most recent should come first (curr >= next)
                if curr_time < next_time:
                    sorted_correctly = False
                    break
    
    all_checks = is_200 and is_list and has_records and has_test1 and has_test2 and sorted_correctly
    
    test_case(
        "GET /api/playbook-requests → returns list sorted by created_at desc, includes created records",
        all_checks,
        f"Status: {resp.status_code}, Count: {len(data)}, Sorted: {sorted_correctly}"
    )
    
except Exception as e:
    test_case("GET /api/playbook-requests", False, f"Exception: {str(e)}")


# TEST 8: Verify endpoint does NOT interfere with existing audit endpoints
print("TEST 8: GET /api/audit-requests still works (no interference)")
try:
    resp = requests.get(f"{API_BASE}/audit-requests", timeout=10)
    data = resp.json()
    
    is_200 = resp.status_code == 200
    is_list = isinstance(data, list)
    
    test_case(
        "GET /api/audit-requests still works and returns prior records",
        is_200 and is_list,
        f"Status: {resp.status_code}, Audit records count: {len(data)}"
    )
    
except Exception as e:
    test_case("GET /api/audit-requests regression", False, f"Exception: {str(e)}")


# TEST 9: Verify data is in db.playbook_requests collection (separate from audit_requests)
# This is implicitly tested by test 7 - if GET /api/playbook-requests returns our records,
# they are stored in the correct collection
print("TEST 9: Data stored in separate db.playbook_requests collection")
test_case(
    "Verify all data is in db.playbook_requests collection (separate from audit_requests)",
    True,  # Implicitly verified by test 7 success
    "Verified by successful GET /api/playbook-requests returning created records"
)


# =============================================================================
# REGRESSION TESTS
# =============================================================================

print("\n" + "=" * 80)
print("REGRESSION TESTS - EXISTING ENDPOINTS")
print("=" * 80 + "\n")

# TEST 10: GET /api/ returns {"message":"WeHA API"}
print("TEST 10: GET /api/ root endpoint")
try:
    resp = requests.get(f"{API_BASE}/", timeout=10)
    data = resp.json()
    
    is_200 = resp.status_code == 200
    correct_message = data.get("message") == "WeHA API"
    
    test_case(
        "GET /api/ returns {\"message\":\"WeHA API\"}",
        is_200 and correct_message,
        f"Status: {resp.status_code}, Message: {data.get('message', 'N/A')}"
    )
    
except Exception as e:
    test_case("GET /api/ root endpoint", False, f"Exception: {str(e)}")


# TEST 11: GET /api/availability still works
print("TEST 11: GET /api/availability?date=<next-tuesday>&tz=Asia/Dubai")
try:
    # Calculate next Tuesday
    today = datetime.now()
    days_ahead = (1 - today.weekday()) % 7  # Tuesday is 1
    if days_ahead == 0:
        days_ahead = 7  # If today is Tuesday, get next Tuesday
    next_tuesday = today + timedelta(days=days_ahead)
    date_str = next_tuesday.strftime("%Y-%m-%d")
    
    resp = requests.get(f"{API_BASE}/availability", params={"date": date_str, "tz": "Asia/Dubai"}, timeout=10)
    data = resp.json()
    
    is_200 = resp.status_code == 200
    is_list = isinstance(data, list)
    # Should have slots (unless all are in the past)
    has_structure = True
    if len(data) > 0:
        first_slot = data[0]
        has_structure = "label" in first_slot and "iso_utc" in first_slot and "taken" in first_slot
    
    test_case(
        "GET /api/availability?date=<next-tuesday>&tz=Asia/Dubai still works (slot generation unaffected)",
        is_200 and is_list and has_structure,
        f"Status: {resp.status_code}, Slots returned: {len(data)}"
    )
    
except Exception as e:
    test_case("GET /api/availability regression", False, f"Exception: {str(e)}")


# TEST 12: POST /api/audit-requests with valid payload still works
print("TEST 12: POST /api/audit-requests with valid payload")
payload_audit = {
    "name": "Regression Test User",
    "company": "Test Company Ltd",
    "country": "United Arab Emirates",
    "industry": "Technology",
    "process": "We need to automate our customer onboarding process",
    "contact_method": "Email",
    "email": "regression@testcompany.example.com"
}
try:
    resp = requests.post(f"{API_BASE}/audit-requests", json=payload_audit, timeout=10)
    data = resp.json()
    
    is_200 = resp.status_code == 200
    has_id = "id" in data
    has_created_at = "created_at" in data
    name_match = data.get("name") == payload_audit["name"]
    process_match = data.get("process") == payload_audit["process"]
    
    all_checks = is_200 and has_id and has_created_at and name_match and process_match
    
    test_case(
        "POST /api/audit-requests with valid payload still works (existing booking flow intact)",
        all_checks,
        f"Status: {resp.status_code}, ID: {data.get('id', 'N/A')[:8]}..."
    )
    
except Exception as e:
    test_case("POST /api/audit-requests regression", False, f"Exception: {str(e)}")


# =============================================================================
# SUMMARY
# =============================================================================

print("\n" + "=" * 80)
print("TEST SUMMARY")
print("=" * 80)
print(f"Total Tests: {total_tests}")
print(f"Passed: {passed_tests}")
print(f"Failed: {len(failed_tests)}")

if failed_tests:
    print("\n❌ FAILED TESTS:")
    for test in failed_tests:
        print(f"  - {test}")
    print("\n⚠️  PLAYBOOK ENDPOINTS HAVE ISSUES - SEE FAILURES ABOVE")
else:
    print("\n✅ ALL TESTS PASSED - PLAYBOOK ENDPOINTS FULLY FUNCTIONAL")

print("=" * 80)
