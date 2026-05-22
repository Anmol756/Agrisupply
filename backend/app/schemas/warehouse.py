"""Pydantic schemas for Warehouse CRUD operations."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class WarehouseCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    location: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    capacity_tons: float = Field(0.0, ge=0)
    current_load_tons: float = Field(0.0, ge=0)
    storage_type: str = Field(default="mixed", pattern="^(cold|dry|mixed)$")
    min_temp: Optional[float] = None
    max_temp: Optional[float] = None


class WarehouseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    location: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    capacity_tons: Optional[float] = Field(None, ge=0)
    current_load_tons: Optional[float] = Field(None, ge=0)
    storage_type: Optional[str] = Field(None, pattern="^(cold|dry|mixed)$")
    min_temp: Optional[float] = None
    max_temp: Optional[float] = None


class WarehouseResponse(BaseModel):
    id: int
    name: str
    location: Optional[str]
    city: Optional[str]
    capacity_tons: float
    current_load_tons: float
    storage_type: str
    min_temp: Optional[float]
    max_temp: Optional[float]
    created_at: datetime

    model_config = {"from_attributes": True}
