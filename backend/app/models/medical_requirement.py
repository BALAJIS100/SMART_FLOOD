from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class MedicalRequirement(Base):
    __tablename__ = "medical_requirements"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    location = Column(String, nullable=False)
    patient_name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    medical_condition = Column(String, nullable=False)
    severity = Column(String, default="Moderate")
    medicine_required = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    doctor_team = Column(String, nullable=True)
    hospital = Column(String, nullable=True)
    status = Column(String, default="Pending")
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
