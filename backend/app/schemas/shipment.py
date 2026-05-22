"""Pydantic schemas for Shipment CRUD operations."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ShipmentCreate(BaseModel):
    product_id: int
    warehouse_id: int
    transport_id: Optional[int] = None
    origin: Optional[str] = Field(None, max_length=255)
    destination: Optional[str] = Field(None, max_length=255)
    status: str = Field(default="pending", pattern="^(pending|in_transit|delivered|cancelled)$")
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None


class ShipmentUpdate(BaseModel):
    product_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    transport_id: Optional[int] = None
    origin: Optional[str] = Field(None, max_length=255)
    destination: Optional[str] = Field(None, max_length=255)
    status: Optional[str] = Field(None, pattern="^(pending|in_transit|delivered|cancelled)$")
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None


class ShipmentResponse(BaseModel):
    id: int
    product_id: int
    warehouse_id: int
    transport_id: Optional[int]
    origin: Optional[str]
    destination: Optional[str]
    status: str
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}
