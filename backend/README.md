# Faith Over Fear RW — API (FastAPI)

## Run
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env     # set SECRET_KEY (python -c "import secrets; print(secrets.token_urlsafe(48))")
uvicorn app.main:app --reload --port 8000
```
Docs: http://127.0.0.1:8000/docs (off when `ENV=production`). Tests: `pytest`.

## Endpoints
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | /api/health | – | liveness |
| GET | /api/products[?category=] , /api/products/{id} | – | catalog (seeded on first start) |
| POST | /api/auth/register, /api/auth/login | – | returns `{access_token, user}` |
| GET | /api/auth/me | Bearer | current user |
| POST | /api/orders | Bearer | body: `{phone, address, notes?, items:[{product_id,size,quantity}]}` |
| GET | /api/orders, /api/orders/{id} | Bearer | own orders only |
| POST | /api/newsletter | – | `{email}` |

Send the token as `Authorization: Bearer <token>`. Prices and totals are computed server-side. Orders are saved as `pending`; MTN MoMo is not integrated.

## Frontend wiring
Dev: add `server: { proxy: { '/api': 'http://127.0.0.1:8000' } }` to `vite.config.js`.
Prod: put the site's origin in `CORS_ORIGINS` and call the API host directly.

## Before production
- Set `ENV=production` and a real `SECRET_KEY` (the app refuses to start without one).
- Netlify hosts only the static site; deploy this API elsewhere (Render, Railway, Fly.io, VPS) and use Postgres via `DATABASE_URL`, not SQLite on an ephemeral disk.
- The rate limiter is in-memory per process; run uvicorn with `--proxy-headers` behind a proxy.
- No admin UI, payment, or email yet.
