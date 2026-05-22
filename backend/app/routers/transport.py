"""Transport CRUD API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.models.transport import Transport
from app.schemas.transport import TransportCreate, TransportUpdate, TransportResponse
from app.services.crud import CRUDService

router = APIRouter(prefix="/api/transport", tags=["Transport"])
service = CRUDService(Transport)


@router.get("/")
async def list_transports(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_refrigerated: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    skip = (page - 1) * limit
    filters = {}
    if is_refrigerated is not None:
        filters["is_refrigerated"] = is_refrigerated

    items, total = await service.get_all(
        db, skip=skip, limit=limit, search=search,
        search_fields=["vehicle_number", "driver_name", "vehicle_type"],
        filters=filters if filters else None,
    )
    return {
        "items": [TransportResponse.model_validate(i) for i in items],
        "total": total, "page": page, "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/{transport_id}", response_model=TransportResponse)
async def get_transport(transport_id: int, db: AsyncSession = Depends(get_db)):
    item = await service.get_by_id(db, transport_id)
    if not item:
        raise HTTPException(status_code=404, detail="Transport not found")
    return TransportResponse.model_validate(item)


@router.post("/", response_model=TransportResponse, status_code=201)
async def create_transport(data: TransportCreate, db: AsyncSession = Depends(get_db)):
    item = await service.create(db, data.model_dump())
    return TransportResponse.model_validate(item)


@router.put("/{transport_id}", response_model=TransportResponse)
async def update_transport(transport_id: int, data: TransportUpdate, db: AsyncSession = Depends(get_db)):
    item = await service.update(db, transport_id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Transport not found")
    return TransportResponse.model_validate(item)


@router.delete("/{transport_id}")
async def delete_transport(transport_id: int, db: AsyncSession = Depends(get_db)):
    success = await service.delete(db, transport_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transport not found")
    return {"message": "Transport deleted successfully"}
