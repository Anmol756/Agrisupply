"""
Product model — agricultural products harvested by farmers.
Links to farmer via FK for 3NF compliance.
"""

from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=True)  # e.g., Vegetables, Fruits, Grains
    quantity_kg = Column(Float, default=0.0)
    price_per_kg = Column(Float, default=0.0)
    harvest_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    farmer = relationship("Farmer", back_populates="products")
    inventory_items = relationship("Inventory", back_populates="product", cascade="all, delete-orphan")
    shipments = relationship("Shipment", back_populates="product")
