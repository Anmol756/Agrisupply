"""Pydantic schemas for Transport CRUD operations."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TransportCreate(BaseModel):
    vehicle_number: str = Field(..., min_length=2, max_length=50)
    vehicle_type: Optional[str] = Field(None, max_length=100)
    driver_name: Optional[str] = Field(None, max_length=255)
    driver_phone: Optional[str] = Field(None, max_length=20)
    capacity_tons: float = Field(0.0, ge=0)
    is_refrigerated: bool = False


class TransportUpdate(BaseModel):
    vehicle_number: Optional[str] = Field(None, min_length=2, max_length=50)
    vehicle_type: Optional[str] = Field(None, max_length=100)
    driver_name: Optional[str] = Field(None, max_length=255)
    driver_phone: Optional[str] = Field(None, max_length=20)
    capacity_tons: Optional[float] = Field(None, ge=0)
    is_refrigerated: Optional[bool] = None


class TransportResponse(BaseModel):
    id: int
    vehicle_number: str
    vehicle_type: Optional[str]
    driver_name: Optional[str]
    driver_phone: Optional[str]
    capacity_tons: float
    is_refrigerated: bool
    created_at: datetime

    model_config = {"from_attributes": True}
