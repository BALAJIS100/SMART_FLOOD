from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResourceBase(BaseModel):
    resource_name: str
    category: str
    unit: Optional[str] = "Units"
    total_quantity: float = 0.0
    allocated_quantity: Optional[float] = 0.0
    used_quantity: Optional[float] = 0.0
    minimum_required: Optional[float] = 0.0
    location: Optional[str] = None
    supplier: Optional[str] = None

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    resource_name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    total_quantity: Optional[float] = None
    allocated_quantity: Optional[float] = None
    used_quantity: Optional[float] = None
    minimum_required: Optional[float] = None
    location: Optional[str] = None
    supplier: Optional[str] = None

class ResourceResponse(ResourceBase):
    id: int
    available_quantity: float = 0.0
    is_low_stock: bool = False
    last_updated: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
