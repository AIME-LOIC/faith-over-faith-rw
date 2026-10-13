import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .config import SECRET_KEY, TOKEN_TTL_HOURS
from .database import get_db
from .models import User

ALGORITHM = "HS256"
bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


# Used to burn the same CPU time when an email doesn't exist (blunts timing-based user enumeration).
DUMMY_HASH = hash_password("not-a-real-password")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except ValueError:
        return False


def create_token(user_id: int) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS)
    return jwt.encode({"sub": str(user_id), "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> User:
    unauthorized = HTTPException(status_code=401, detail="Please sign in to continue.", headers={"WWW-Authenticate": "Bearer"})
    if not creds:
        raise unauthorized
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise unauthorized
    user = db.get(User, user_id)
    if not user:
        raise unauthorized
    return user


def rate_limit(max_calls: int, window_seconds: int):
    """Tiny in-memory per-IP limiter. Fine for one process; use Redis (or your host's WAF) if you scale out.
    Behind a reverse proxy, run uvicorn with --proxy-headers so request.client is the real client IP."""
    hits: dict[str, deque] = defaultdict(deque)

    def dependency(request: Request):
        key = request.client.host if request.client else "unknown"
        now = time.monotonic()
        q = hits[key]
        while q and now - q[0] > window_seconds:
            q.popleft()
        if len(q) >= max_calls:
            raise HTTPException(status_code=429, detail="Too many attempts. Please wait a minute and try again.")
        q.append(now)

    return dependency
