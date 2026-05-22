"""
Warehouse model — storage facilities for agricultural products.
Supports cold, dry, and mixed storage types with temperature ranges.
"""

import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base


class StorageType(str, enum.Enum):
    cold = "cold"
    dry = "dry"
    mixed = "mixed"


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    location = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    capacity_tons = Column(Float, default=0.0)
    current_load_tons = Column(Float, default=0.0)
    storage_type = Column(Enum(StorageType), default=StorageType.mixed)
    min_temp = Column(Float, nullable=True)  # Min acceptable temp (°C)
    max_temp = Column(Float, nullable=True)  # Max acceptable temp (°C)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    inventory_items = relationship("Inventory", back_populates="warehouse", cascade="all, delete-orphan")
    shipments = relationship("Shipment", back_populates="warehouse")
    temperature_logs = relationship("TemperatureLog", back_populates="warehouse")
