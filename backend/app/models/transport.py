"""
Transport model — vehicles used for shipping agricultural products.
Driver info stored here (not on shipments) for 3NF compliance.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Transport(Base):
    __tablename__ = "transports"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String(50), unique=True, nullable=False, index=True)
    vehicle_type = Column(String(100), nullable=True)  # e.g., Truck, Van, Reefer
    driver_name = Column(String(255), nullable=True)
    driver_phone = Column(String(20), nullable=True)
    capacity_tons = Column(Float, default=0.0)
    is_refrigerated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    shipments = relationship("Shipment", back_populates="transport")
