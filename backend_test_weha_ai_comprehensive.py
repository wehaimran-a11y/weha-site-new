#!/usr/bin/env python3
"""
Comprehensive test suite for WeHA AI chat endpoints + regression tests.
Tests the NEW WeHA AI endpoints and verifies existing endpoints still work.
"""

import requests
import sys
from datetime import datetime, timedelta

# Read backend URL from frontend/.env
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.split('=', 1)[1].strip()
            break

BASE_URL = f"{BACKEND_URL}/api"
print(f"Testing backend at: {BASE_URL}\n")

# Test counters
passed = 0
failed = 0

def test(name, condition, details=""):
    global passed, failed
    if condition:
        print(f"✅ PASS: {name}")
        if details:
            print(f"   {details}")
        passed += 1
    else:
        print(f"❌ FAIL: {name}")
        if details:
            print(f"   {details}")
        failed += 1
    print()

# ============================================================================
# NEW ENDPOINTS - WeHA AI Chat
# ============================================================================

print("=" * 80)
print("TESTING NEW WeHA AI ENDPOINTS")
print("=" * 80)
print()

# Test 1: GET /api/weha-ai/models
print("Test 1: GET /api/weha-ai/models")
print("-" * 40)
try:
    resp = requests.get(f"{BASE_URL}/weha-ai/models", timeout=10)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}")
    
    data = resp.json()
    models = data.get("models", [])
    default = data.get("default", "")
    
    # Verify structure
    has_models = isinstance(models, list) and len(models) > 0
    has_default = default == "openai/gpt-4o-mini"
    has_gpt4o_mini = "openai/gpt-4o-mini" in models
    has_claude = "anthropic/claude-3.5-sonnet" in models
    has_5_models = len(models) == 5
    
    test(
        "GET /api/weha-ai/models returns 200 with correct structure",
        resp.status_code == 200 and has_models and has_default,
        f"Models: {len(models)}, Default: {default}"
    )
    
    test(
        "Models list includes 'openai/gpt-4o-mini'",
        has_gpt4o_mini,
        f"Found in models: {has_gpt4o_mini}"
    )
    
    test(
        "Models list includes 'anthropic/claude-3.5-sonnet'",
        has_claude,
        f"Found in models: {has_claude}"
    )
    
    test(
        "Models list contains exactly 5 models",
        has_5_models,
        f"Count: {len(models)}"
    )
    
except Exception as e:
    print(f"ERROR: {e}")
    test("GET /api/weha-ai/models", False, str(e))

# Test 2: POST /api/weha-ai/chat with valid body
print("Test 2: POST /api/weha-ai/chat with valid body")
print("-" * 40)
try:
    payload = {
        "session_id": "test-sess-1",
        "messages": [
            {"role": "user", "content": "Which workflows should I automate first?"}
        ],
        "model": "openai/gpt-4o-mini"
    }
    resp = requests.post(f"{BASE_URL}/weha-ai/chat", json=payload, timeout=30)
    print(f"Status: {resp.status_code}")
    data = resp.json()
    print(f"Response keys: {list(data.keys())}")
    print(f"Reply length: {len(data.get('reply', ''))}")
    print(f"Model: {data.get('model')}")
    print(f"Mocked: {data.get('mocked')}")
    print(f"Reply preview: {data.get('reply', '')[:100]}...")
    
    has_reply = isinstance(data.get("reply"), str) and len(data.get("reply", "")) > 0
    correct_model = data.get("model") == "openai/gpt-4o-mini"
    is_mocked = data.get("mocked") == True
    
    test(
        "POST /api/weha-ai/chat returns 200 with non-empty reply",
        resp.status_code == 200 and has_reply,
        f"Reply length: {len(data.get('reply', ''))}"
    )
    
    test(
        "Response includes correct model field",
        correct_model,
        f"Model: {data.get('model')}"
    )
    
    test(
        "Response indicates mocked mode (OPENROUTER_API_KEY is blank)",
        is_mocked,
        f"Mocked: {data.get('mocked')}"
    )
    
except Exception as e:
    print(f"ERROR: {e}")
    test("POST /api/weha-ai/chat with valid body", False, str(e))

# Test 3: POST /api/weha-ai/chat with empty messages array
print("Test 3: POST /api/weha-ai/chat with empty messages")
print("-" * 40)
try:
    payload = {
        "session_id": "x",
        "messages": []
    }
    resp = requests.post(f"{BASE_URL}/weha-ai/chat", json=payload, timeout=10)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}")
    
    test(
        "POST /api/weha-ai/chat with empty messages returns 422",
        resp.status_code == 422,
        f"Status: {resp.status_code}, Detail: {resp.json().get('detail')}"
    )
    
except Exception as e:
    print(f"ERROR: {e}")
    test("POST /api/weha-ai/chat with empty messages", False, str(e))

# Test 4: POST /api/weha-ai/chat with invalid/unknown model
print("Test 4: POST /api/weha-ai/chat with unknown model (fallback test)")
print("-" * 40)
try:
    payload = {
        "session_id": "test-sess-2",
        "messages": [
            {"role": "user", "content": "hi"}
        ],
        "model": "some/nonexistent-model"
    }
    resp = requests.post(f"{BASE_URL}/weha-ai/chat", json=payload, timeout=30)
    print(f"Status: {resp.status_code}")
    data = resp.json()
    print(f"Response model: {data.get('model')}")
    print(f"Mocked: {data.get('mocked')}")
    
    falls_back = data.get("model") == "openai/gpt-4o-mini"
    
    test(
        "POST /api/weha-ai/chat with unknown model returns 200",
        resp.status_code == 200,
        f"Status: {resp.status_code}"
    )
    
    test(
        "Unknown model falls back to default 'openai/gpt-4o-mini'",
        falls_back,
        f"Returned model: {data.get('model')}"
    )
    
except Exception as e:
    print(f"ERROR: {e}")
    test("POST /api/weha-ai/chat with unknown model", False, str(e))

# Test 5: Multi-turn conversation with same session_id
print("Test 5: Multi-turn conversation (same session_id)")
print("-" * 40)
try:
    session_id = "test-sess-3"
    
    # First turn
    payload1 = {
        "session_id": session_id,
        "messages": [
            {"role": "user", "content": "What is AI automation?"}
        ],
        "model": "openai/gpt-4o-mini"
    }
    resp1 = requests.post(f"{BASE_URL}/weha-ai/chat", json=payload1, timeout=30)
    print(f"Turn 1 - Status: {resp1.status_code}")
    data1 = resp1.json()
    reply1 = data1.get("reply", "")
    print(f"Turn 1 - Reply length: {len(reply1)}")
    
    # Second turn with message history
    payload2 = {
        "session_id": session_id,
        "messages": [
            {"role": "user", "content": "What is AI automation?"},
            {"role": "assistant", "content": reply1},
            {"role": "user", "content": "Can you give me an example?"}
        ],
        "model": "openai/gpt-4o-mini"
    }
    resp2 = requests.post(f"{BASE_URL}/weha-ai/chat", json=payload2, timeout=30)
    print(f"Turn 2 - Status: {resp2.status_code}")
    data2 = resp2.json()
    reply2 = data2.get("reply", "")
    print(f"Turn 2 - Reply length: {len(reply2)}")
    
    turn1_ok = resp1.status_code == 200 and len(reply1) > 0
    turn2_ok = resp2.status_code == 200 and len(reply2) > 0
    
    test(
        "Multi-turn conversation - Turn 1 returns 200 with reply",
        turn1_ok,
        f"Status: {resp1.status_code}, Reply length: {len(reply1)}"
    )
    
    test(
        "Multi-turn conversation - Turn 2 returns 200 with reply",
        turn2_ok,
        f"Status: {resp2.status_code}, Reply length: {len(reply2)}"
    )
    
except Exception as e:
    print(f"ERROR: {e}")
    test("Multi-turn conversation", False, str(e))

# ============================================================================
# REGRESSION TESTS - Existing Endpoints
# ============================================================================

print("=" * 80)
print("REGRESSION TESTS - EXISTING ENDPOINTS")
print("=" * 80)
print()

# Test 6: GET /api/ root endpoint
print("Test 6: GET /api/ (root endpoint)")
print("-" * 40)
try:
    resp = requests.get(f"{BASE_URL}/", timeout=10)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}")
    
    data = resp.json()
    correct_message = data.get("message") == "WeHA API"
    
    test(
        "GET /api/ returns 200 with {message: 'WeHA API'}",
        resp.status_code == 200 and correct_message,
        f"Message: {data.get('message')}"
    )
    
except Exception as e:
    print(f"ERROR: {e}")
    test("GET /api/", False, str(e))

# Test 7: POST /api/audit-requests with valid payload
print("Test 7: POST /api/audit-requests with valid payload")
print("-" * 40)
try:
    payload = {
        "name": "Sarah Chen",
        "company": "TechFlow Solutions",
        "country": "Singapore",
        "industry": "Technology",
        "process": "Lead qualification and follow-up automation",
        "contact_method": "Email",
        "email": "sarah.chen@techflow.sg"
    }
    resp = requests.post(f"{BASE_URL}/audit-requests", json=payload, timeout=10)
    print(f"Status: {resp.status_code}")
    data = resp.json()
    print(f"Response keys: {list(data.keys())}")
    print(f"ID: {data.get('id')}")
    print(f"Name: {data.get('name')}")
    print(f"Created at: {data.get('created_at')}")
    
    has_id = isinstance(data.get("id"), str) and len(data.get("id", "")) > 0
    has_created_at = data.get("created_at") is not None
    correct_name = data.get("name") == "Sarah Chen"
    
    test(
        "POST /api/audit-requests returns 200 with id and created_at",
        resp.status_code == 200 and has_id and has_created_at,
        f"ID: {data.get('id')[:8]}..., Created: {data.get('created_at')}"
    )
    
except Exception as e:
    print(f"ERROR: {e}")
    test("POST /api/audit-requests", False, str(e))

# Test 8: GET /api/availability with future weekday
print("Test 8: GET /api/availability with future weekday")
print("-" * 40)
try:
    # Calculate next Monday (or today if Monday and future)
    today = datetime.now()
    days_ahead = (0 - today.weekday()) % 7  # 0 = Monday
    if days_ahead == 0:
        days_ahead = 7  # If today is Monday, get next Monday
    next_monday = today + timedelta(days=days_ahead)
    date_str = next_monday.strftime("%Y-%m-%d")
    
    resp = requests.get(
        f"{BASE_URL}/availability",
        params={"date": date_str, "tz": "Asia/Dubai"},
        timeout=10
    )
    print(f"Status: {resp.status_code}")
    print(f"Date tested: {date_str}")
    data = resp.json()
    print(f"Number of slots: {len(data)}")
    if len(data) > 0:
        print(f"First slot: {data[0]}")
        print(f"Last slot: {data[-1]}")
    
    has_slots = isinstance(data, list) and len(data) > 0
    correct_structure = False
    if has_slots:
        first_slot = data[0]
        correct_structure = (
            "label" in first_slot and
            "iso_utc" in first_slot and
            "taken" in first_slot
        )
    
    test(
        "GET /api/availability returns 200 with list of slots",
        resp.status_code == 200 and has_slots,
        f"Slots returned: {len(data)}"
    )
    
    test(
        "Availability slots have correct structure (label, iso_utc, taken)",
        correct_structure,
        f"First slot keys: {list(data[0].keys()) if has_slots else 'N/A'}"
    )
    
except Exception as e:
    print(f"ERROR: {e}")
    test("GET /api/availability", False, str(e))

# Test 9: POST /api/playbook-requests with valid payload
print("Test 9: POST /api/playbook-requests with valid payload")
print("-" * 40)
try:
    payload = {
        "name": "Michael Rodriguez",
        "company": "AutomateNow Consulting",
        "email": "michael@automatenow.com.au"
    }
    resp = requests.post(f"{BASE_URL}/playbook-requests", json=payload, timeout=10)
    print(f"Status: {resp.status_code}")
    data = resp.json()
    print(f"Response keys: {list(data.keys())}")
    print(f"ID: {data.get('id')}")
    print(f"Name: {data.get('name')}")
    print(f"Created at: {data.get('created_at')}")
    
    has_id = isinstance(data.get("id"), str) and len(data.get("id", "")) > 0
    has_created_at = data.get("created_at") is not None
    correct_name = data.get("name") == "Michael Rodriguez"
    
    test(
        "POST /api/playbook-requests returns 200 with id and created_at",
        resp.status_code == 200 and has_id and has_created_at,
        f"ID: {data.get('id')[:8]}..., Created: {data.get('created_at')}"
    )
    
except Exception as e:
    print(f"ERROR: {e}")
    test("POST /api/playbook-requests", False, str(e))

# ============================================================================
# SUMMARY
# ============================================================================

print("=" * 80)
print("TEST SUMMARY")
print("=" * 80)
print(f"✅ PASSED: {passed}")
print(f"❌ FAILED: {failed}")
print(f"TOTAL: {passed + failed}")
print()

if failed == 0:
    print("🎉 ALL TESTS PASSED!")
    sys.exit(0)
else:
    print(f"⚠️  {failed} TEST(S) FAILED")
    sys.exit(1)
