import os

def w(path, code):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(code.strip() + '\n')
    print('Created:', path)

# 1. MODELS
w('backend/app/models/role.py', '''from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Role(Base):
    __tablename__ =  roles
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)

    users = relationship(User, back_populates=role)
''')

w('backend/app/models/user.py', '''from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = users
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role_id = Column(Integer, ForeignKey(roles.id), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    role = relationship(Role, back_populates=users)
''')

w('backend/app/models/incident.py', '''from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime
from app.database import Base

class Incident(Base):
    __tablename__ = incidents
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False, default=Flash Flood)
    description = Column(Text, nullable=True)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=True)
    status = Column(String, nullable=False, default=Active)
    severity = Column(String, nullable=False, default=High)
    state = Column(String, nullable=False, default=Tamil Nadu)
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
''')

w('backend/app/models/affected_location.py', '''from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class AffectedLocation(Base):
    __tablename__ = affected_locations
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey(incidents.id), nullable=False)
    state = Column(String, nullable=False, default=Tamil Nadu)
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
    electricity_status = Column(String, default=Disrupted)
    water_supply_status = Column(String, default=Disrupted)
    communication_status = Column(String, default=Partial)
    severity = Column(String, default=High)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
''')

w('backend/app/models/rescued_person.py', '''from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class RescuedPerson(Base):
    __tablename__ = rescued_persons
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey(incidents.id), nullable=False)
    person_name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    location = Column(String, nullable=False)
    rescue_date = Column(String, nullable=False)
    rescue_time = Column(String, nullable=True)
    rescue_team_id = Column(Integer, ForeignKey(rescue_teams.id), nullable=True)
    current_status = Column(String, default=Rescued)
    medical_condition = Column(String, default=Stable)
    shelter_id = Column(Integer, ForeignKey(shelters.id), nullable=True)
    identification_status = Column(String, default=Identified)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
''')

w('backend/app/models/missing_person.py', '''from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class MissingPerson(Base):
    __tablename__ = missing_persons
    id = Column(Integer, primary_key=True, index=True)
    person_name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    last_seen_location = Column(String, nullable=False)
    last_seen_date = Column(String, nullable=False)
    incident_id = Column(Integer, ForeignKey(incidents.id), nullable=False)
    reporter_name = Column(String, nullable=False)
    reporter_phone = Column(String, nullable=False)
    status = Column(String, default=Missing)
    search_notes = Column(Text, nullable=True)
    assigned_team_id = Column(Integer, ForeignKey(rescue_teams.id), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
''')

w('backend/app/models/shelter.py', '''from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from datetime import datetime
from app.database import Base

class Shelter(Base):
    __tablename__ = shelters
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
    status = Column(String, default=Available)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
''')

w('backend/app/models/rescue_team.py', '''from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class RescueTeam(Base):
    __tablename__ = rescue_teams
    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String, nullable=False)
    team_leader = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)
    team_type = Column(String, nullable=False)
    members_count = Column(Integer, default=5)
    assigned_incident_id = Column(Integer, ForeignKey(incidents.id), nullable=True)
    current_location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Float, nullable=True)
    vehicle = Column(String, nullable=True)
    boat_available = Column(Boolean, default=False)
    medical_support = Column(Boolean, default=False)
    status = Column(String, default=Available)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
''')

w('backend/app/models/resource.py', '''from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database import Base

class Resource(Base):
    __tablename__ = resources
    id = Column(Integer, primary_key=True, index=True)
    resource_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    unit = Column(String, nullable=False, default=Units)
    total_quantity = Column(Float, default=0.0)
    allocated_quantity = Column(Float, default=0.0)
    used_quantity = Column(Float, default=0.0)
    minimum_required = Column(Float, default=0.0)
    location = Column(String, nullable=True)
    supplier = Column(String, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
''')

w('backend/app/models/medical_requirement.py', '''from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class MedicalRequirement(Base):
    __tablename__ = medical_requirements
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey(incidents.id), nullable=False)
    location = Column(String, nullable=False)
    patient_name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    medical_condition = Column(String, nullable=False)
    severity = Column(String, default=Moderate)
    medicine_required = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    doctor_team = Column(String, nullable=True)
    hospital = Column(String, nullable=True)
    status = Column(String, default=Pending)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
''')

w('backend/app/models/relief_activity.py', '''from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class ReliefActivity(Base):
    __tablename__ = relief_activities
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey(incidents.id), nullable=False)
    activity_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=False)
    date = Column(String, nullable=False)
    responsible_org = Column(String, nullable=False)
    team_id = Column(Integer, ForeignKey(rescue_teams.id), nullable=True)
    people_served = Column(Integer, default=0)
    resources_used = Column(Text, nullable=True)
    status = Column(String, default=In Progress)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
''')

w('backend/app/models/audit_log.py', '''from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

class AuditLog(Base):
    __tablename__ = audit_logs
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_name = Column(String, nullable=False)
    action = Column(String, nullable=False)
    module = Column(String, nullable=False)
    record_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String, nullable=True)
''')

w('backend/app/models/__init__.py', '''from app.database import Base
from app.models.role import Role
from app.models.user import User
from app.models.incident import Incident
from app.models.affected_location import AffectedLocation
from app.models.rescued_person import RescuedPerson
from app.models.missing_person import MissingPerson
from app.models.shelter import Shelter
from app.models.rescue_team import RescueTeam
from app.models.resource import Resource
from app.models.medical_requirement import MedicalRequirement
from app.models.relief_activity import ReliefActivity
from app.models.audit_log import AuditLog
''')

print('Models part 1 written!')
