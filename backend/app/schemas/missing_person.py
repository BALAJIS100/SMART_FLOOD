from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MissingBase(BaseModel):
    person_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    last_seen_location: str
    last_seen_date: str
    incident_id: int
    reporter_name: str
    reporter_phone: str
    status: Optional[str] = "Missing"
    search_notes: Optional[str] = None
    assigned_team_id: Optional[int] = None

class MissingCreate(MissingBase):
    pass

class MissingUpdate(BaseModel):
    person_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    last_seen_location: Optional[str] = None
    last_seen_date: Optional[str] = None
    incident_id: Optional[int] = None
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    status: Optional[str] = None
    search_notes: Optional[str] = None
    assigned_team_id: Optional[int] = None

class MissingResponse(MissingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
