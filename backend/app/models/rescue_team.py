from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class RescueTeam(Base):
    __tablename__ = "rescue_teams"
    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String, nullable=False)
    team_leader = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)
    team_type = Column(String, nullable=False)
    members_count = Column(Integer, default=5)
    assigned_incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    current_location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    vehicle = Column(String, nullable=True)
    boat_available = Column(Boolean, default=False)
    medical_support = Column(Boolean, default=False)
    status = Column(String, default="Available")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
