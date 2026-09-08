from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LocationBase(BaseModel):
    incident_id: int
    state: str = "Tamil Nadu"
    district: str
    taluk: Optional[str] = None
    village: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    population: Optional[int] = 0
    houses_affected: Optional[int] = 0
    roads_damaged: Optional[int] = 0
    bridges_damaged: Optional[int] = 0
    schools_affected: Optional[int] = 0
    hospitals_affected: Optional[int] = 0
    electricity_status: Optional[str] = "Disrupted"
    water_supply_status: Optional[str] = "Disrupted"
    communication_status: Optional[str] = "Partial"
    severity: Optional[str] = "High"
    remarks: Optional[str] = None

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    incident_id: Optional[int] = None
    state: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    population: Optional[int] = None
    houses_affected: Optional[int] = None
    roads_damaged: Optional[int] = None
    bridges_damaged: Optional[int] = None
    schools_affected: Optional[int] = None
    hospitals_affected: Optional[int] = None
    electricity_status: Optional[str] = None
    water_supply_status: Optional[str] = None
    communication_status: Optional[str] = None
    severity: Optional[str] = None
    remarks: Optional[str] = None

class LocationResponse(LocationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
