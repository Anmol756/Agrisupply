"""Pydantic schemas for Product CRUD operations."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class ProductCreate(BaseModel):
    farmer_id: int
    name: str = Field(..., min_length=2, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    quantity_kg: float = Field(0.0, ge=0)
    price_per_kg: float = Field(0.0, ge=0)
    harvest_date: Optional[date] = None
    expiry_date: Optional[date] = None


class ProductUpdate(BaseModel):
    farmer_id: Optional[int] = None
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    quantity_kg: Optional[float] = Field(None, ge=0)
    price_per_kg: Optional[float] = Field(None, ge=0)
    harvest_date: Optional[date] = None
    expiry_date: Optional[date] = None


class ProductResponse(BaseModel):
    id: int
    farmer_id: int
    name: str
    category: Optional[str]
    quantity_kg: float
    price_per_kg: float
    harvest_date: Optional[date]
    expiry_date: Optional[date]
    created_at: datetime

    model_config = {"from_attributes": True}
