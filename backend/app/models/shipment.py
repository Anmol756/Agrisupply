"""
Shipment model — tracks product shipments through the supply chain.
Status flow: pending → in_transit → delivered (or cancelled)
"""

import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ShipmentStatus(str, enum.Enum):
    pending = "pending"
    in_transit = "in_transit"
    delivered = "delivered"
    cancelled = "cancelled"


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    transport_id = Column(Integer, ForeignKey("transports.id"), nullable=True)
    origin = Column(String(255), nullable=True)
    destination = Column(String(255), nullable=True)
    status = Column(Enum(ShipmentStatus), default=ShipmentStatus.pending, index=True)
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    product = relationship("Product", back_populates="shipments")
    warehouse = relationship("Warehouse", back_populates="shipments")
    transport = relationship("Transport", back_populates="shipments")
    temperature_logs = relationship("TemperatureLog", back_populates="shipment")
