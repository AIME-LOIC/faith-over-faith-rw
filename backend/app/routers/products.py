from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product
from ..schemas import ProductOut

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def list_products(category: str | None = Query(None), db: Session = Depends(get_db)):
    stmt = select(Product).where(Product.active.is_(True)).order_by(Product.id)
    if category:
        stmt = stmt.where(Product.category == category)
    return db.scalars(stmt).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product or not product.active:
        raise HTTPException(404, "Product not found.")
    return product
