from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models  # noqa: F401  (registers tables)
from .config import CORS_ORIGINS, ENV
from .database import Base, SessionLocal, engine
from .routers import auth, newsletter, orders, products
from .seed import seed_products


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_products(db)
    yield


app = FastAPI(
    title="Faith Over Fear RW API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if ENV == "production" else "/docs",
    redoc_url=None,
    openapi_url=None if ENV == "production" else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

for r in (products.router, auth.router, orders.router, newsletter.router):
    app.include_router(r)


@app.get("/api/health", tags=["meta"])
def health():
    return {"status": "ok"}
