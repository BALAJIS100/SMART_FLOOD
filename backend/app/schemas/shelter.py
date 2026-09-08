from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ShelterBase(BaseModel):
    shelter_name: str
    location: str
    district: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: int = 100
    current_occupancy: Optional[int] = 0
    male_count: Optional[int] = 0
    female_count: Optional[int] = 0
    children_count: Optional[int] = 0
    elderly_count: Optional[int] = 0
    disabled_count: Optional[int] = 0
    medical_facility: Optional[bool] = True
    food_available: Optional[bool] = True
    water_available: Optional[bool] = True
    electricity_available: Optional[bool] = True
    contact_person: Optional[str] = None
    contact_number: Optional[str] = None
    status: Optional[str] = "Available"

class ShelterCreate(ShelterBase):
    pass

class ShelterUpdate(BaseModel):
    shelter_name: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[int] = None
    current_occupancy: Optional[int] = None
    male_count: Optional[int] = None
    female_count: Optional[int] = None
    children_count: Optional[int] = None
    elderly_count: Optional[int] = None
    disabled_count: Optional[int] = None
    medical_facility: Optional[bool] = None
    food_available: Optional[bool] = None
    water_available: Optional[bool] = None
    electricity_available: Optional[bool] = None
    contact_person: Optional[str] = None
    contact_number: Optional[str] = None
    status: Optional[str] = None

class ShelterResponse(ShelterBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
