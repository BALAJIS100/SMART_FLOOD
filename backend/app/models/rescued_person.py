from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class RescuedPerson(Base):
    __tablename__ = "rescued_persons"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    person_name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    location = Column(String, nullable=False)
    rescue_date = Column(String, nullable=False)
    rescue_time = Column(String, nullable=True)
    rescue_team_id = Column(Integer, ForeignKey("rescue_teams.id"), nullable=True)
    current_status = Column(String, default="Rescued")
    medical_condition = Column(String, default="Stable")
    shelter_id = Column(Integer, ForeignKey("shelters.id"), nullable=True)
    identification_status = Column(String, default="Identified")
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
