from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class MissingPerson(Base):
    __tablename__ = "missing_persons"
    id = Column(Integer, primary_key=True, index=True)
    person_name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    last_seen_location = Column(String, nullable=False)
    last_seen_date = Column(String, nullable=False)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    reporter_name = Column(String, nullable=False)
    reporter_phone = Column(String, nullable=False)
    status = Column(String, default="Missing")
    search_notes = Column(Text, nullable=True)
    assigned_team_id = Column(Integer, ForeignKey("rescue_teams.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
