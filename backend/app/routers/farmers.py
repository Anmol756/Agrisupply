"""Farmer CRUD API endpoints with search and pagination."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from typing import Optional
from app.core.database import get_db
from app.models.farmer import Farmer
from app.schemas.farmer import FarmerCreate, FarmerUpdate, FarmerResponse
from app.services.crud import CRUDService

router = APIRouter(prefix="/api/farmers", tags=["Farmers"])
service = CRUDService(Farmer)


@router.get("/")
async def list_farmers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List all farmers with pagination, search, and filtering."""
    skip = (page - 1) * limit
    filters = {}
    if city:
        filters["city"] = city
    if state:
        filters["state"] = state

    items, total = await service.get_all(
        db, skip=skip, limit=limit, search=search,
        search_fields=["name", "phone", "city", "state"],
        filters=filters if filters else None,
    )
    return {
        "items": [FarmerResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/{farmer_id}", response_model=FarmerResponse)
async def get_farmer(farmer_id: int, db: AsyncSession = Depends(get_db)):
    item = await service.get_by_id(db, farmer_id)
    if not item:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return FarmerResponse.model_validate(item)


@router.post("/", response_model=FarmerResponse, status_code=201)
async def create_farmer(data: FarmerCreate, db: AsyncSession = Depends(get_db)):
    try:
        item = await service.create(db, data.model_dump())
        return FarmerResponse.model_validate(item)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail="A farmer with this phone number already exists."
        )


@router.put("/{farmer_id}", response_model=FarmerResponse)
async def update_farmer(farmer_id: int, data: FarmerUpdate, db: AsyncSession = Depends(get_db)):
    try:
        item = await service.update(db, farmer_id, data.model_dump(exclude_unset=True))
        if not item:
            raise HTTPException(status_code=404, detail="Farmer not found")
        return FarmerResponse.model_validate(item)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail="A farmer with this phone number already exists."
        )


@router.delete("/{farmer_id}")
async def delete_farmer(farmer_id: int, db: AsyncSession = Depends(get_db)):
    success = await service.delete(db, farmer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return {"message": "Farmer deleted successfully"}
