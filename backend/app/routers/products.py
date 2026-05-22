"""Product CRUD API endpoints with search and pagination."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.crud import CRUDService

router = APIRouter(prefix="/api/products", tags=["Products"])
service = CRUDService(Product)


@router.get("/")
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[str] = None,
    farmer_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    skip = (page - 1) * limit
    filters = {}
    if category:
        filters["category"] = category
    if farmer_id:
        filters["farmer_id"] = farmer_id

    items, total = await service.get_all(
        db, skip=skip, limit=limit, search=search,
        search_fields=["name", "category"],
        filters=filters if filters else None,
    )
    return {
        "items": [ProductResponse.model_validate(i) for i in items],
        "total": total, "page": page, "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    item = await service.get_by_id(db, product_id)
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.model_validate(item)


@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_db)):
    item = await service.create(db, data.model_dump())
    return ProductResponse.model_validate(item)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, data: ProductUpdate, db: AsyncSession = Depends(get_db)):
    item = await service.update(db, product_id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.model_validate(item)


@router.delete("/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    success = await service.delete(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}
