from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class AffectedLocation(Base):
    __tablename__ = "affected_locations"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    state = Column(String, nullable=False, default="Tamil Nadu")
    district = Column(String, nullable=False)
    taluk = Column(String, nullable=True)
    village = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    population = Column(Integer, default=0)
    houses_affected = Column(Integer, default=0)
    roads_damaged = Column(Integer, default=0)
    bridges_damaged = Column(Integer, default=0)
    schools_affected = Column(Integer, default=0)
    hospitals_affected = Column(Integer, default=0)
    electricity_status = Column(String, default="Disrupted")
    water_supply_status = Column(String, default="Disrupted")
    communication_status = Column(String, default="Partial")
    severity = Column(String, default="High")
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
