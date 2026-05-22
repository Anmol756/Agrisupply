"""
Dashboard analytics router — aggregated statistics for the overview dashboard.
Provides counts, recent activity, and chart-ready data.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.farmer import Farmer
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.shipment import Shipment
from app.models.temperature_log import TemperatureLog
from app.models.inventory import Inventory
from app.models.transport import Transport

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Get aggregate statistics for the main dashboard cards."""
    farmers_count = (await db.execute(select(func.count()).select_from(Farmer))).scalar() or 0
    products_count = (await db.execute(select(func.count()).select_from(Product))).scalar() or 0
    warehouses_count = (await db.execute(select(func.count()).select_from(Warehouse))).scalar() or 0
    shipments_count = (await db.execute(select(func.count()).select_from(Shipment))).scalar() or 0
    transports_count = (await db.execute(select(func.count()).select_from(Transport))).scalar() or 0
    alerts_count = (await db.execute(
        select(func.count()).select_from(TemperatureLog).where(TemperatureLog.alert_triggered == True)
    )).scalar() or 0

    # Shipments by status
    pending = (await db.execute(
        select(func.count()).select_from(Shipment).where(Shipment.status == "pending")
    )).scalar() or 0
    in_transit = (await db.execute(
        select(func.count()).select_from(Shipment).where(Shipment.status == "in_transit")
    )).scalar() or 0
    delivered = (await db.execute(
        select(func.count()).select_from(Shipment).where(Shipment.status == "delivered")
    )).scalar() or 0

    # Total warehouse capacity and load
    capacity = (await db.execute(select(func.sum(Warehouse.capacity_tons)))).scalar() or 0
    load = (await db.execute(select(func.sum(Warehouse.current_load_tons)))).scalar() or 0

    return {
        "farmers": farmers_count,
        "products": products_count,
        "warehouses": warehouses_count,
        "shipments": shipments_count,
        "transports": transports_count,
        "alerts": alerts_count,
        "shipment_status": {
            "pending": pending,
            "in_transit": in_transit,
            "delivered": delivered,
        },
        "warehouse_utilization": {
            "total_capacity_tons": round(capacity, 2),
            "total_load_tons": round(load, 2),
            "utilization_percent": round((load / capacity * 100) if capacity > 0 else 0, 1),
        },
    }


@router.get("/product-categories")
async def get_product_categories(db: AsyncSession = Depends(get_db)):
    """Get product counts grouped by category for pie chart."""
    result = await db.execute(
        select(Product.category, func.count(Product.id))
        .group_by(Product.category)
    )
    return [{"category": row[0] or "Uncategorized", "count": row[1]} for row in result.all()]


@router.get("/warehouse-utilization")
async def get_warehouse_utilization(db: AsyncSession = Depends(get_db)):
    """Get per-warehouse capacity vs load for bar chart."""
    result = await db.execute(
        select(Warehouse.name, Warehouse.capacity_tons, Warehouse.current_load_tons, Warehouse.storage_type)
    )
    return [
        {
            "name": row[0],
            "capacity": row[1],
            "load": row[2],
            "type": row[3],
            "utilization": round((row[2] / row[1] * 100) if row[1] > 0 else 0, 1),
        }
        for row in result.all()
    ]


@router.get("/recent-shipments")
async def get_recent_shipments(db: AsyncSession = Depends(get_db)):
    """Get 10 most recent shipments for activity table."""
    result = await db.execute(
        select(Shipment).order_by(Shipment.id.desc()).limit(10)
    )
    shipments = result.scalars().all()
    return [
        {
            "id": s.id,
            "origin": s.origin,
            "destination": s.destination,
            "status": s.status.value if hasattr(s.status, 'value') else s.status,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in shipments
    ]


@router.get("/temperature-trends")
async def get_temperature_trends(db: AsyncSession = Depends(get_db)):
    """Get recent temperature logs for line chart (last 50 readings)."""
    result = await db.execute(
        select(TemperatureLog)
        .order_by(TemperatureLog.recorded_at.desc())
        .limit(50)
    )
    logs = list(result.scalars().all())
    logs.reverse()  # Chronological order for chart
    return [
        {
            "id": log.id,
            "temperature": log.temperature_celsius,
            "humidity": log.humidity_percent,
            "alert": log.alert_triggered,
            "warehouse_id": log.warehouse_id,
            "recorded_at": log.recorded_at.isoformat() if log.recorded_at else None,
        }
        for log in logs
    ]
