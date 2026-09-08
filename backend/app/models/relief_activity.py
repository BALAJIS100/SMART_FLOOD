from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class ReliefActivity(Base):
    __tablename__ = "relief_activities"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    activity_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=False)
    date = Column(String, nullable=False)
    responsible_org = Column(String, nullable=False)
    team_id = Column(Integer, ForeignKey("rescue_teams.id"), nullable=True)
    people_served = Column(Integer, default=0)
    resources_used = Column(Text, nullable=True)
    status = Column(String, default="In Progress")
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
