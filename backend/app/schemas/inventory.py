"""Pydantic schemas for Inventory CRUD operations."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class InventoryCreate(BaseModel):
    warehouse_id: int
    product_id: int
    quantity_kg: float = Field(0.0, ge=0)


class InventoryUpdate(BaseModel):
    warehouse_id: Optional[int] = None
    product_id: Optional[int] = None
    quantity_kg: Optional[float] = Field(None, ge=0)


class InventoryResponse(BaseModel):
    id: int
    warehouse_id: int
    product_id: int
    quantity_kg: float
    stored_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
