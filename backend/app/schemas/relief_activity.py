from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReliefBase(BaseModel):
    incident_id: int
    activity_type: str
    description: Optional[str] = None
    location: str
    date: str
    responsible_org: str
    team_id: Optional[int] = None
    people_served: Optional[int] = 0
    resources_used: Optional[str] = None
    status: Optional[str] = "In Progress"
    remarks: Optional[str] = None

class ReliefCreate(ReliefBase):
    pass

class ReliefUpdate(BaseModel):
    incident_id: Optional[int] = None
    activity_type: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    responsible_org: Optional[str] = None
    team_id: Optional[int] = None
    people_served: Optional[int] = None
    resources_used: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None

class ReliefResponse(ReliefBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
