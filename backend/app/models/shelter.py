from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from datetime import datetime
from app.database import Base

class Shelter(Base):
    __tablename__ = "shelters"
    id = Column(Integer, primary_key=True, index=True)
    shelter_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    district = Column(String, nullable=False)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    capacity = Column(Integer, nullable=False, default=100)
    current_occupancy = Column(Integer, nullable=False, default=0)
    male_count = Column(Integer, default=0)
    female_count = Column(Integer, default=0)
    children_count = Column(Integer, default=0)
    elderly_count = Column(Integer, default=0)
    disabled_count = Column(Integer, default=0)
    medical_facility = Column(Boolean, default=True)
    food_available = Column(Boolean, default=True)
    water_available = Column(Boolean, default=True)
    electricity_available = Column(Boolean, default=True)
    contact_person = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    status = Column(String, default="Available")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
