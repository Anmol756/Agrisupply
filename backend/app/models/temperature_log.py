"""
Temperature Log model — records temperature/humidity readings
for cold chain monitoring in warehouses and during shipments.
Alert is triggered when temperature falls outside acceptable range.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class TemperatureLog(Base):
    __tablename__ = "temperature_logs"

    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    temperature_celsius = Column(Float, nullable=False)
    humidity_percent = Column(Float, nullable=True)
    alert_triggered = Column(Boolean, default=False)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    shipment = relationship("Shipment", back_populates="temperature_logs")
    warehouse = relationship("Warehouse", back_populates="temperature_logs")
