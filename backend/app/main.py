"""
AgriSupply — FastAPI Application Entry Point
Configures CORS, includes all routers, and creates tables on startup.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.database import engine, Base

# Import all models so they are registered with SQLAlchemy
from app.models import (
    User, Farmer, Product, Warehouse,
    Inventory, Transport, Shipment, TemperatureLog,
)

# Import routers
from app.routers import (
    auth, farmers, products, warehouses,
    inventory, shipments, transport,
    temperature_logs, dashboard,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan — creates database tables on startup.
    In production, replace with Alembic migrations.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f"[OK] {settings.APP_NAME} v{settings.APP_VERSION} -- Database tables ready")
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Smart Agricultural Supply Chain & Cold Chain Management System",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API routers
app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(products.router)
app.include_router(warehouses.router)
app.include_router(inventory.router)
app.include_router(shipments.router)
app.include_router(transport.router)
app.include_router(temperature_logs.router)
app.include_router(dashboard.router)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "status": "running",
    }
