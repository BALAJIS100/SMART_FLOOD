from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RescueTeamBase(BaseModel):
    team_name: str
    team_leader: str
    contact_number: str
    team_type: str
    members_count: Optional[int] = 5
    assigned_incident_id: Optional[int] = None
    current_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    vehicle: Optional[str] = None
    boat_available: Optional[bool] = False
    medical_support: Optional[bool] = False
    status: Optional[str] = "Available"

class RescueTeamCreate(RescueTeamBase):
    pass

class RescueTeamUpdate(BaseModel):
    team_name: Optional[str] = None
    team_leader: Optional[str] = None
    contact_number: Optional[str] = None
    team_type: Optional[str] = None
    members_count: Optional[int] = None
    assigned_incident_id: Optional[int] = None
    current_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    vehicle: Optional[str] = None
    boat_available: Optional[bool] = None
    medical_support: Optional[bool] = None
    status: Optional[str] = None

class RescueTeamResponse(RescueTeamBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
