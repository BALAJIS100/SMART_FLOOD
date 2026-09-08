from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database import Base

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    resource_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    unit = Column(String, nullable=False, default="Units")
    total_quantity = Column(Float, default=0.0)
    allocated_quantity = Column(Float, default=0.0)
    used_quantity = Column(Float, default=0.0)
    minimum_required = Column(Float, default=0.0)
    location = Column(String, nullable=True)
    supplier = Column(String, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
