"""Pydantic schemas for Farmer CRUD operations."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FarmerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    land_area_acres: Optional[float] = Field(0.0, ge=0)


class FarmerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    land_area_acres: Optional[float] = Field(None, ge=0)


class FarmerResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    land_area_acres: float
    registered_at: datetime

    model_config = {"from_attributes": True}
