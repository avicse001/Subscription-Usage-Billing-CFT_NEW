"""Backend API tests for Subscription Usage & Billing System."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or os.environ.get("BACKEND_URL")
if not BASE_URL:
    # fallback: read frontend .env
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.strip().split("=", 1)[1].strip('"').strip("'")
                    break
BASE_URL = (BASE_URL or "").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def seeded(client):
    r = client.post(f"{API}/seed")
    assert r.status_code == 200, r.text
    data = r.json()
    # get final users/plans regardless of seeded state
    users = client.get(f"{API}/users").json()
    plans = client.get(f"{API}/plans").json()
    return {"users": users, "plans": plans, "seed_response": data}


# ---------- Seed ----------
class TestSeed:
    def test_seed_creates_or_returns_existing(self, client):
        r = client.post(f"{API}/seed")
        assert r.status_code == 200
        data = r.json()
        assert "users" in data
        assert "plans" in data
        # user names
        names = [u["name"] for u in data["users"]]
        assert "Alice" in names and "Bob" in names
        # plans
        plan_names = [p["name"] for p in data["plans"]]
        for n in ["Basic", "Pro", "Enterprise"]:
            assert n in plan_names

    def test_seed_idempotent(self, client):
        # calling seed again shouldn't duplicate users
        r1 = client.post(f"{API}/seed")
        assert r1.status_code == 200
        users_after_1 = client.get(f"{API}/users").json()
        r2 = client.post(f"{API}/seed")
        assert r2.status_code == 200
        users_after_2 = client.get(f"{API}/users").json()
        assert len(users_after_1) == len(users_after_2)
        assert r2.json().get("seeded") is False


# ---------- Usage ----------
class TestUsage:
    def test_record_usage_success(self, client, seeded):
        alice = next(u for u in seeded["users"] if u["name"] == "Alice")
        r = client.post(
            f"{API}/usage",
            json={"userId": alice["id"], "action": "api_call", "usedUnits": 5},
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["userId"] == alice["id"]
        assert body["usedUnits"] == 5
        assert body["action"] == "api_call"
        assert "id" in body
        assert "createdAt" in body

    def test_record_usage_zero_units_rejected(self, client, seeded):
        alice = next(u for u in seeded["users"] if u["name"] == "Alice")
        r = client.post(
            f"{API}/usage",
            json={"userId": alice["id"], "action": "api_call", "usedUnits": 0},
        )
        assert r.status_code == 400

    def test_record_usage_negative_rejected(self, client, seeded):
        alice = next(u for u in seeded["users"] if u["name"] == "Alice")
        r = client.post(
            f"{API}/usage",
            json={"userId": alice["id"], "action": "api_call", "usedUnits": -3},
        )
        assert r.status_code == 400

    def test_record_usage_unknown_user(self, client):
        r = client.post(
            f"{API}/usage",
            json={"userId": "nonexistent-user-id-xyz", "action": "x", "usedUnits": 1},
        )
        assert r.status_code == 404


# ---------- Current Usage ----------
class TestCurrentUsage:
    def test_current_usage_reflects_records(self, client, seeded):
        bob = next(u for u in seeded["users"] if u["name"] == "Bob")
        # Log 20 units
        r1 = client.post(
            f"{API}/usage",
            json={"userId": bob["id"], "action": "api_call", "usedUnits": 20},
        )
        assert r1.status_code == 200
        # Get current usage
        r = client.get(f"{API}/users/{bob['id']}/current-usage")
        assert r.status_code == 200
        data = r.json()
        assert data["userId"] == bob["id"]
        assert data["totalUsed"] >= 20
        assert data["activePlan"] is not None
        assert data["activePlan"]["name"] == "Pro"
        # remainingUnits should be max(quota - total, 0)
        quota = data["activePlan"]["monthlyQuota"]
        assert data["remainingUnits"] == max(quota - data["totalUsed"], 0)

    def test_current_usage_unknown_user(self, client):
        r = client.get(f"{API}/users/nonexistent-abc/current-usage")
        assert r.status_code == 404


# ---------- Billing Summary ----------
class TestBillingSummary:
    def test_billing_summary_under_quota(self, client, seeded):
        bob = next(u for u in seeded["users"] if u["name"] == "Bob")
        r = client.get(f"{API}/users/{bob['id']}/billing-summary")
        assert r.status_code == 200
        data = r.json()
        # Bob is on Pro (500 quota). We've logged small amounts.
        if data["totalUsage"] <= data["planQuota"]:
            assert data["extraUnits"] == 0
            assert data["extraCharges"] == 0.0 or data["extraCharges"] == 0

    def test_billing_summary_over_quota(self, client, seeded):
        # Alice is on Basic plan (100 quota, 0.5/unit extra).
        alice = next(u for u in seeded["users"] if u["name"] == "Alice")

        # Ensure enough usage to exceed 100 quota
        # Currently we've logged 5 (from TestUsage). Add 120 more -> total 125
        r_add = client.post(
            f"{API}/usage",
            json={"userId": alice["id"], "action": "bulk", "usedUnits": 120},
        )
        assert r_add.status_code == 200

        r = client.get(f"{API}/users/{alice['id']}/billing-summary")
        assert r.status_code == 200
        data = r.json()
        assert data["activePlan"]["name"] == "Basic"
        assert data["planQuota"] == 100
        total = data["totalUsage"]
        expected_extra_units = max(total - 100, 0)
        expected_extra_charges = round(expected_extra_units * 0.5, 2)
        assert data["extraUnits"] == expected_extra_units
        assert data["extraCharges"] == expected_extra_charges
        # verify > 0 since we've logged >= 125
        assert data["extraUnits"] > 0
        assert data["extraCharges"] > 0

    def test_billing_summary_rounding_to_2_decimals(self, client, seeded):
        # Create a temp user + plan with unit rate 0.333 => rounding matters
        # Create user
        u_r = client.post(f"{API}/users", json={"name": "TEST_RoundUser"})
        assert u_r.status_code == 200
        user = u_r.json()
        # Create plan
        p_r = client.post(
            f"{API}/plans",
            json={"name": "TEST_RoundPlan", "monthlyQuota": 10, "extraChargePerUnit": 0.333},
        )
        assert p_r.status_code == 200
        plan = p_r.json()
        # Subscribe
        s_r = client.post(
            f"{API}/subscriptions",
            json={"userId": user["id"], "planId": plan["id"], "isActive": True},
        )
        assert s_r.status_code == 200
        # Add usage of 13 units -> extra 3 -> 3*0.333 = 0.999 -> 1.00 rounded
        client.post(
            f"{API}/usage",
            json={"userId": user["id"], "action": "x", "usedUnits": 13},
        )
        r = client.get(f"{API}/users/{user['id']}/billing-summary")
        assert r.status_code == 200
        data = r.json()
        assert data["extraUnits"] == 3
        # Check that value is 2-decimal rounded
        assert data["extraCharges"] == 1.00
        # ensure numeric type
        s = str(data["extraCharges"])
        # allow "1.0" or "1.00" numeric representation
        assert float(s) == 1.00

    def test_billing_summary_unknown_user(self, client):
        r = client.get(f"{API}/users/nonexistent-xyz/billing-summary")
        assert r.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
