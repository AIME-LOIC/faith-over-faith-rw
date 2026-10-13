import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

Size = Literal["S", "M", "L", "XL", "XXL"]


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    id: int
    name: str
    category: str
    drop: str = Field(validation_alias="drop_name")
    price: int
    color: str
    image: str
    fallback: str
    description: str


class RegisterIn(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("name")
    @classmethod
    def _strip_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        return v

    @field_validator("password")
    @classmethod
    def _bcrypt_limit(cls, v: str) -> str:
        if len(v.encode()) > 72:
            raise ValueError("Password is too long (72 bytes max)")
        return v


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    name: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class OrderItemIn(BaseModel):
    product_id: int
    size: Size = "M"
    quantity: int = Field(ge=1, le=20)


class OrderIn(BaseModel):
    phone: str
    address: str = Field(min_length=5, max_length=300)
    notes: str = Field(default="", max_length=500)
    items: list[OrderItemIn] = Field(min_length=1, max_length=30)

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-()]", "", v)
        if not re.fullmatch(r"\+?\d{9,15}", cleaned):
            raise ValueError("Enter a valid phone number, e.g. 0788123456")
        return cleaned


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    product_id: int
    name: str
    size: str
    unit_price: int
    quantity: int


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    total: int
    phone: str
    address: str
    notes: str
    created_at: datetime
    items: list[OrderItemOut]


class NewsletterIn(BaseModel):
    email: EmailStr
