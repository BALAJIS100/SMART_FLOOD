from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IncidentBase(BaseModel):
    name: str
    type: str = "Flash Flood"
    description: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    status: str = "Active"
    severity: str = "High"
    state: str = "Tamil Nadu"
    district: str
    taluk: Optional[str] = None
    village: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    water_level: Optional[float] = 0.0
    population_affected: Optional[int] = 0
    infrastructure_damage: Optional[str] = None
    livestock_affected: Optional[int] = 0

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None
    severity: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    water_level: Optional[float] = None
    population_affected: Optional[int] = None
    infrastructure_damage: Optional[str] = None
    livestock_affected: Optional[int] = None

class IncidentResponse(IncidentBase):
    id: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
