from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime
from app.database import Base

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False, default="Flash Flood")
    description = Column(Text, nullable=True)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Active")
    severity = Column(String, nullable=False, default="High")
    state = Column(String, nullable=False, default="Tamil Nadu")
    district = Column(String, nullable=False)
    taluk = Column(String, nullable=True)
    village = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    water_level = Column(Float, default=0.0)
    population_affected = Column(Integer, default=0)
    infrastructure_damage = Column(Text, nullable=True)
    livestock_affected = Column(Integer, default=0)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
