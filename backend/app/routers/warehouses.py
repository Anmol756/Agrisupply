"""Warehouse CRUD API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.models.warehouse import Warehouse
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseResponse
from app.services.crud import CRUDService

router = APIRouter(prefix="/api/warehouses", tags=["Warehouses"])
service = CRUDService(Warehouse)


@router.get("/")
async def list_warehouses(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    storage_type: Optional[str] = None,
    city: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    skip = (page - 1) * limit
    filters = {}
    if storage_type:
        filters["storage_type"] = storage_type
    if city:
        filters["city"] = city

    items, total = await service.get_all(
        db, skip=skip, limit=limit, search=search,
        search_fields=["name", "location", "city"],
        filters=filters if filters else None,
    )
    return {
        "items": [WarehouseResponse.model_validate(i) for i in items],
        "total": total, "page": page, "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/{warehouse_id}", response_model=WarehouseResponse)
async def get_warehouse(warehouse_id: int, db: AsyncSession = Depends(get_db)):
    item = await service.get_by_id(db, warehouse_id)
    if not item:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return WarehouseResponse.model_validate(item)


@router.post("/", response_model=WarehouseResponse, status_code=201)
async def create_warehouse(data: WarehouseCreate, db: AsyncSession = Depends(get_db)):
    item = await service.create(db, data.model_dump())
    return WarehouseResponse.model_validate(item)


@router.put("/{warehouse_id}", response_model=WarehouseResponse)
async def update_warehouse(warehouse_id: int, data: WarehouseUpdate, db: AsyncSession = Depends(get_db)):
    item = await service.update(db, warehouse_id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return WarehouseResponse.model_validate(item)


@router.delete("/{warehouse_id}")
async def delete_warehouse(warehouse_id: int, db: AsyncSession = Depends(get_db)):
    success = await service.delete(db, warehouse_id)
    if not success:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return {"message": "Warehouse deleted successfully"}
