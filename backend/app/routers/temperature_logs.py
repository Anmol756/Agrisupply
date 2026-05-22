"""Temperature Log CRUD API endpoints with alert filtering."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.models.temperature_log import TemperatureLog
from app.schemas.temperature_log import TemperatureLogCreate, TemperatureLogUpdate, TemperatureLogResponse
from app.services.crud import CRUDService

router = APIRouter(prefix="/api/temperature-logs", tags=["Temperature Logs"])
service = CRUDService(TemperatureLog)


@router.get("/")
async def list_temperature_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    warehouse_id: Optional[int] = None,
    shipment_id: Optional[int] = None,
    alert_only: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    skip = (page - 1) * limit
    filters = {}
    if warehouse_id:
        filters["warehouse_id"] = warehouse_id
    if shipment_id:
        filters["shipment_id"] = shipment_id
    if alert_only:
        filters["alert_triggered"] = True

    items, total = await service.get_all(
        db, skip=skip, limit=limit,
        filters=filters if filters else None,
    )
    return {
        "items": [TemperatureLogResponse.model_validate(i) for i in items],
        "total": total, "page": page, "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/{log_id}", response_model=TemperatureLogResponse)
async def get_temperature_log(log_id: int, db: AsyncSession = Depends(get_db)):
    item = await service.get_by_id(db, log_id)
    if not item:
        raise HTTPException(status_code=404, detail="Temperature log not found")
    return TemperatureLogResponse.model_validate(item)


@router.post("/", response_model=TemperatureLogResponse, status_code=201)
async def create_temperature_log(data: TemperatureLogCreate, db: AsyncSession = Depends(get_db)):
    item = await service.create(db, data.model_dump())
    return TemperatureLogResponse.model_validate(item)


@router.put("/{log_id}", response_model=TemperatureLogResponse)
async def update_temperature_log(log_id: int, data: TemperatureLogUpdate, db: AsyncSession = Depends(get_db)):
    item = await service.update(db, log_id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Temperature log not found")
    return TemperatureLogResponse.model_validate(item)


@router.delete("/{log_id}")
async def delete_temperature_log(log_id: int, db: AsyncSession = Depends(get_db)):
    success = await service.delete(db, log_id)
    if not success:
        raise HTTPException(status_code=404, detail="Temperature log not found")
    return {"message": "Temperature log deleted successfully"}
