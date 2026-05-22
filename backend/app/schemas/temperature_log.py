"""Pydantic schemas for Temperature Log CRUD operations."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TemperatureLogCreate(BaseModel):
    shipment_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    temperature_celsius: float
    humidity_percent: Optional[float] = Field(None, ge=0, le=100)
    alert_triggered: bool = False


class TemperatureLogUpdate(BaseModel):
    shipment_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    temperature_celsius: Optional[float] = None
    humidity_percent: Optional[float] = Field(None, ge=0, le=100)
    alert_triggered: Optional[bool] = None


class TemperatureLogResponse(BaseModel):
    id: int
    shipment_id: Optional[int]
    warehouse_id: Optional[int]
    temperature_celsius: float
    humidity_percent: Optional[float]
    alert_triggered: bool
    recorded_at: datetime

    model_config = {"from_attributes": True}
