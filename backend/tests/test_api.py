import os
import tempfile

_tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp.name}"
os.environ["SECRET_KEY"] = "test-secret-key-test-secret-key-1234"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


def auth_header(client, email="a@example.com"):
    r = client.post("/api/auth/register", json={"email": email, "name": "Aime", "password": "correct-horse"})
    assert r.status_code == 201, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_everything():
    with TestClient(app) as client:
        # products are seeded and shaped the way the frontend expects
        products = client.get("/api/products").json()
        assert len(products) == 6 and products[0]["drop"] == "DROP 002" and products[0]["fallback"]

        # auth
        headers = auth_header(client)
        assert client.get("/api/auth/me", headers=headers).json()["email"] == "a@example.com"
        assert client.post("/api/auth/register", json={"email": "A@example.com", "name": "x", "password": "correct-horse"}).status_code == 409
        assert client.post("/api/auth/login", json={"email": "a@example.com", "password": "wrong-password"}).status_code == 401
        assert client.post("/api/auth/login", json={"email": "a@example.com", "password": "correct-horse"}).status_code == 200
        assert client.get("/api/auth/me").status_code == 401
        assert client.get("/api/auth/me", headers={"Authorization": "Bearer junk"}).status_code == 401
        assert client.post("/api/auth/register", json={"email": "b@example.com", "name": "x", "password": "short"}).status_code == 422

        # orders: total is computed server-side; client-sent prices are ignored
        body = {"phone": "0788 123 456", "address": "KG 11 Ave, Kigali",
                "items": [{"product_id": 1, "size": "L", "quantity": 2, "price": 1}, {"product_id": 6, "size": "M", "quantity": 1}]}
        r = client.post("/api/orders", json=body, headers=headers)
        assert r.status_code == 201, r.text
        assert r.json()["total"] == 15000 * 2 + 28000 and r.json()["status"] == "pending"
        assert client.post("/api/orders", json=body).status_code == 401
        assert client.post("/api/orders", json={**body, "items": [{"product_id": 999, "size": "M", "quantity": 1}]}, headers=headers).status_code == 422
        assert client.post("/api/orders", json={**body, "items": [{"product_id": 1, "size": "XXXL", "quantity": 1}]}, headers=headers).status_code == 422
        assert client.post("/api/orders", json={**body, "phone": "abc"}, headers=headers).status_code == 422
        assert len(client.get("/api/orders", headers=headers).json()) == 1

        # users can't read each other's orders
        other = auth_header(client, "c@example.com")
        oid = r.json()["id"]
        assert client.get(f"/api/orders/{oid}", headers=other).status_code == 404
        assert client.get(f"/api/orders/{oid}", headers=headers).status_code == 200

        # newsletter is idempotent
        assert client.post("/api/newsletter", json={"email": "n@example.com"}).json() == {"ok": True}
        assert client.post("/api/newsletter", json={"email": "N@example.com"}).json() == {"ok": True}
