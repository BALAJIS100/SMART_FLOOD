from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MedicalBase(BaseModel):
    incident_id: int
    location: str
    patient_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    medical_condition: str
    severity: Optional[str] = "Moderate"
    medicine_required: str
    quantity: Optional[int] = 1
    doctor_team: Optional[str] = None
    hospital: Optional[str] = None
    status: Optional[str] = "Pending"
    remarks: Optional[str] = None

class MedicalCreate(MedicalBase):
    pass

class MedicalUpdate(BaseModel):
    incident_id: Optional[int] = None
    location: Optional[str] = None
    patient_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    medical_condition: Optional[str] = None
    severity: Optional[str] = None
    medicine_required: Optional[str] = None
    quantity: Optional[int] = None
    doctor_team: Optional[str] = None
    hospital: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None

class MedicalResponse(MedicalBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
