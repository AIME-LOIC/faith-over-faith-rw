from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Product

PRODUCTS = [
    dict(name="Psalm 23 Graphic Tee", category="T-Shirts", drop_name="DROP 002", price=15000, color="White", image="/images/psalm-tee.jpg", fallback="Psalm 23", description="A graphic tee inspired by Psalm 23. Designed to make your faith part of your everyday uniform."),
    dict(name="Faith Over Fear Tee", category="T-Shirts", drop_name="DROP 002", price=15000, color="Black", image="/images/faith-tee.jpg", fallback="F>F", description="The signature message, printed for everyday wear. Simple, bold, and built around belief."),
    dict(name="Jesus Walks Tee", category="T-Shirts", drop_name="DROP 002", price=18000, color="Black", image="/images/jesus-walks-tee.jpg", fallback="JESUS WALKS", description="A statement graphic from the Faith Over Fear collection."),
    dict(name="Scripture Backprint Tee", category="T-Shirts", drop_name="DROP 001", price=18000, color="Black", image="/images/scripture-tee.jpg", fallback="WALK BY FAITH", description="A bold back-print design inspired by scripture and street culture."),
    dict(name="Color of Grace Tee", category="T-Shirts", drop_name="DROP 002", price=15000, color="White", image="/images/color-grace-tee.jpg", fallback="GRACE", description="A colorful graphic print on a clean white tee."),
    dict(name="Faith Essentials Hoodie", category="Hoodies", drop_name="DROP 001", price=28000, color="Black", image="/images/faith-hoodie.jpg", fallback="F>F HOODIE", description="A relaxed everyday hoodie carrying the F>F identity."),
]


def seed_products(db: Session) -> None:
    if db.scalar(select(Product.id).limit(1)) is not None:
        return
    db.add_all(Product(**p) for p in PRODUCTS)
    db.commit()
