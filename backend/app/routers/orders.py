from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..models import Order, OrderItem, Product, User
from ..schemas import OrderIn, OrderOut
from ..security import get_current_user

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
def create_order(data: OrderIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ids = {i.product_id for i in data.items}
    products = {p.id: p for p in db.scalars(select(Product).where(Product.id.in_(ids), Product.active.is_(True)))}
    missing = ids - products.keys()
    if missing:
        raise HTTPException(422, "One or more items are no longer available. Please refresh your bag.")

    # Prices come from the database, never from the client.
    items = [
        OrderItem(product_id=i.product_id, name=products[i.product_id].name, size=i.size,
                  unit_price=products[i.product_id].price, quantity=i.quantity)
        for i in data.items
    ]
    order = Order(user_id=user.id, status="pending", total=sum(i.unit_price * i.quantity for i in items),
                  phone=data.phone, address=data.address.strip(), notes=data.notes.strip(), items=items)
    db.add(order)
    db.commit()
    return order


@router.get("", response_model=list[OrderOut])
def my_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = select(Order).where(Order.user_id == user.id).options(selectinload(Order.items)).order_by(Order.id.desc())
    return db.scalars(stmt).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.scalar(select(Order).where(Order.id == order_id, Order.user_id == user.id).options(selectinload(Order.items)))
    if not order:
        raise HTTPException(404, "Order not found.")
    return order
