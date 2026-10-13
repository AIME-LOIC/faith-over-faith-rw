from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Subscriber
from ..schemas import NewsletterIn
from ..security import rate_limit

router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])


@router.post("", dependencies=[Depends(rate_limit(max_calls=10, window_seconds=60))])
def subscribe(data: NewsletterIn, db: Session = Depends(get_db)):
    email = data.email.lower()
    # Same response whether or not the email is already subscribed, so the list can't be probed.
    if not db.scalar(select(Subscriber.id).where(Subscriber.email == email)):
        db.add(Subscriber(email=email))
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
    return {"ok": True}
