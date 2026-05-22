"""
Generic async CRUD service class.
Parameterized by SQLAlchemy model — avoids repeating boilerplate
for each entity. Supports pagination, search, and filtering.
"""

from typing import TypeVar, Generic, Type, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, String
from sqlalchemy.orm import InspectionAttr
from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class CRUDService(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get_all(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        search_fields: Optional[List[str]] = None,
        filters: Optional[dict] = None,
    ) -> tuple[List[ModelType], int]:
        """
        Get paginated list of records with optional search and filters.
        Returns (items, total_count) tuple for pagination metadata.
        """
        query = select(self.model)
        count_query = select(func.count()).select_from(self.model)

        # Apply search across specified string columns
        if search and search_fields:
            conditions = []
            for field_name in search_fields:
                field = getattr(self.model, field_name, None)
                if field is not None:
                    conditions.append(field.ilike(f"%{search}%"))
            if conditions:
                query = query.where(or_(*conditions))
                count_query = count_query.where(or_(*conditions))

        # Apply exact-match filters
        if filters:
            for key, value in filters.items():
                if value is not None:
                    field = getattr(self.model, key, None)
                    if field is not None:
                        query = query.where(field == value)
                        count_query = count_query.where(field == value)

        # Get total count for pagination
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination and ordering (newest first)
        query = query.order_by(self.model.id.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, db: AsyncSession, item_id: int) -> Optional[ModelType]:
        """Get a single record by primary key."""
        result = await db.execute(
            select(self.model).where(self.model.id == item_id)
        )
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: dict) -> ModelType:
        """Create a new record from dictionary data."""
        instance = self.model(**data)
        db.add(instance)
        await db.flush()  # Flush to get the generated ID
        await db.refresh(instance)
        return instance

    async def update(
        self, db: AsyncSession, item_id: int, data: dict
    ) -> Optional[ModelType]:
        """
        Update an existing record. Only updates fields that are
        explicitly provided (not None) to support partial updates.
        """
        instance = await self.get_by_id(db, item_id)
        if not instance:
            return None

        for key, value in data.items():
            setattr(instance, key, value)

        await db.flush()
        await db.refresh(instance)
        return instance

    async def delete(self, db: AsyncSession, item_id: int) -> bool:
        """Delete a record by ID. Returns True if found and deleted."""
        instance = await self.get_by_id(db, item_id)
        if not instance:
            return False

        await db.delete(instance)
        await db.flush()
        return True

    async def count(self, db: AsyncSession) -> int:
        """Get total count of records."""
        result = await db.execute(
            select(func.count()).select_from(self.model)
        )
        return result.scalar() or 0
