import os
import secrets
import sys

from dotenv import load_dotenv

load_dotenv()

ENV = os.getenv("ENV", "development").lower()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./faith_over_fear.db")
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if o.strip()]
TOKEN_TTL_HOURS = int(os.getenv("TOKEN_TTL_HOURS", "168"))

SECRET_KEY = os.getenv("SECRET_KEY", "")
if not SECRET_KEY:
    if ENV == "production":
        sys.exit("SECRET_KEY is required when ENV=production.")
    # Dev only: random per process, so logins reset on every restart.
    SECRET_KEY = secrets.token_urlsafe(48)
    print("WARNING: SECRET_KEY not set; using a temporary one. Sessions reset on restart.", file=sys.stderr)
