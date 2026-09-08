from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RescuedBase(BaseModel):
    incident_id: int
    person_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    location: str
    rescue_date: str
    rescue_time: Optional[str] = None
    rescue_team_id: Optional[int] = None
    current_status: Optional[str] = "Rescued"
    medical_condition: Optional[str] = "Stable"
    shelter_id: Optional[int] = None
    identification_status: Optional[str] = "Identified"
    remarks: Optional[str] = None

class RescuedCreate(RescuedBase):
    pass

class RescuedUpdate(BaseModel):
    incident_id: Optional[int] = None
    person_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    location: Optional[str] = None
    rescue_date: Optional[str] = None
    rescue_time: Optional[str] = None
    rescue_team_id: Optional[int] = None
    current_status: Optional[str] = None
    medical_condition: Optional[str] = None
    shelter_id: Optional[int] = None
    identification_status: Optional[str] = None
    remarks: Optional[str] = None

class RescuedResponse(RescuedBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
