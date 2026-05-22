"""Shipment CRUD API endpoints with status filtering."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.models.shipment import Shipment
from app.schemas.shipment import ShipmentCreate, ShipmentUpdate, ShipmentResponse
from app.services.crud import CRUDService

router = APIRouter(prefix="/api/shipments", tags=["Shipments"])
service = CRUDService(Shipment)


@router.get("/")
async def list_shipments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    warehouse_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    skip = (page - 1) * limit
    filters = {}
    if status:
        filters["status"] = status
    if warehouse_id:
        filters["warehouse_id"] = warehouse_id

    items, total = await service.get_all(
        db, skip=skip, limit=limit, search=search,
        search_fields=["origin", "destination"],
        filters=filters if filters else None,
    )
    return {
        "items": [ShipmentResponse.model_validate(i) for i in items],
        "total": total, "page": page, "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/{shipment_id}", response_model=ShipmentResponse)
async def get_shipment(shipment_id: int, db: AsyncSession = Depends(get_db)):
    item = await service.get_by_id(db, shipment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return ShipmentResponse.model_validate(item)


@router.post("/", response_model=ShipmentResponse, status_code=201)
async def create_shipment(data: ShipmentCreate, db: AsyncSession = Depends(get_db)):
    item = await service.create(db, data.model_dump())
    return ShipmentResponse.model_validate(item)


@router.put("/{shipment_id}", response_model=ShipmentResponse)
async def update_shipment(shipment_id: int, data: ShipmentUpdate, db: AsyncSession = Depends(get_db)):
    item = await service.update(db, shipment_id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return ShipmentResponse.model_validate(item)


@router.delete("/{shipment_id}")
async def delete_shipment(shipment_id: int, db: AsyncSession = Depends(get_db)):
    success = await service.delete(db, shipment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return {"message": "Shipment deleted successfully"}
