"""
User model for authentication and role-based access control.
Roles: admin, farmer, transporter
"""

import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Enum
from app.core.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    farmer = "farmer"
    transporter = "transporter"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.farmer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
