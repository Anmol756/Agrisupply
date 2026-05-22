"""Inventory CRUD API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.models.inventory import Inventory
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryResponse
from app.services.crud import CRUDService

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])
service = CRUDService(Inventory)


@router.get("/")
async def list_inventory(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    warehouse_id: Optional[int] = None,
    product_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    skip = (page - 1) * limit
    filters = {}
    if warehouse_id:
        filters["warehouse_id"] = warehouse_id
    if product_id:
        filters["product_id"] = product_id

    items, total = await service.get_all(
        db, skip=skip, limit=limit,
        filters=filters if filters else None,
    )
    return {
        "items": [InventoryResponse.model_validate(i) for i in items],
        "total": total, "page": page, "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/{item_id}", response_model=InventoryResponse)
async def get_inventory(item_id: int, db: AsyncSession = Depends(get_db)):
    item = await service.get_by_id(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    return InventoryResponse.model_validate(item)


@router.post("/", response_model=InventoryResponse, status_code=201)
async def create_inventory(data: InventoryCreate, db: AsyncSession = Depends(get_db)):
    item = await service.create(db, data.model_dump())
    return InventoryResponse.model_validate(item)


@router.put("/{item_id}", response_model=InventoryResponse)
async def update_inventory(item_id: int, data: InventoryUpdate, db: AsyncSession = Depends(get_db)):
    item = await service.update(db, item_id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    return InventoryResponse.model_validate(item)


@router.delete("/{item_id}")
async def delete_inventory(item_id: int, db: AsyncSession = Depends(get_db)):
    success = await service.delete(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    return {"message": "Inventory record deleted successfully"}
