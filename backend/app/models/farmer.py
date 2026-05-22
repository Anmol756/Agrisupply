"""
Farmer model — represents agricultural producers in the supply chain.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=False)
    email = Column(String(255), nullable=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    land_area_acres = Column(Float, default=0.0)
    registered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    products = relationship("Product", back_populates="farmer", cascade="all, delete-orphan")
