import json, os

data = {}
if os.path.exists("files_data.json"):
    try:
        data = json.load(open("files_data.json", encoding="utf-8"))
    except Exception:
        data = {}

def add(p, c):
    data[p] = c.strip()

add("backend/app/schemas/auth.py", """from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    user_name: str
    email: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True
""")

add("backend/app/schemas/user.py", """from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    full_name: str
    phone: Optional[str] = None
    role_id: int
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optionalbool] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    role_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
""")

add("backend/app/schemas/incident.py", """from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IncidentBase(BaseModel):
    name: str
    type: str = "Flash Flood"
    description: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    status: str = "Active"
    severity: str = "High"
    state: str = "Tamil Nadu"
    district: str
    taluk: Optional[str] = None
    village: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    water_level: Optional[float] = 0.0
    population_affected: Optional[int] = 0
    infrastructure_damage: Optional[str] = None
    livestock_affected: Optional[int] = 0
    created_by: Optional[str] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None
    severity: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    water_level: Optional[float] = None
    population_affected: Optional[int] = None
    infrastructure_damage: Optional[str] = None
    livestock_affected: Optional[int] = None

class IncidentOut(IncidentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
""")

add("backend/app/schemas/affected_location.py", """from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LocationBase(BaseModel):
    incident_id: int
    state: str = "Tamil Nadu"
    district: str
    taluk: Optional[str] = None
    village: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    population: Optional[int] = 0
    houses_affected: Optional[int] = 0
    roads_damaged: Optional[int] = 0
    bridges_damaged: Optional[int] = 0
    schools_affected: Optional[int] = 0
    hospitals_affected: Optional[int] = 0
    electricity_status: Optional[str] = "Disrupted"
    water_supply_status: Optional[str] = "Disrupted"
    communication_status: Optional[str] = "Partial"
    severity: Optional[str] = "High"
    remarks: Optional[str] = None

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    incident_id: Optional[int] = None
    state: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    population: Optional[int] = None
    houses_affected: Optional[int] = None
    roads_damaged: Optional[int] = None
    bridges_damaged: Optional[int] = None
    schools_affected: Optional[int] = None
    hospitals_affected: Optional[int] = None
    electricity_status: Optional[str] = None
    water_supply_status: Optional[str] = None
    communication_status: Optional[str] = None
    severity: Optional[str] = None
    remarks: Optional[str] = None

class LocationOut(LocationBase):
    id: int
    incident_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
(ÄÄÄÅç±ÖÕÃÅΩπô•úË(ÄÄÄÄÄÄÄÅô…Ωµ}Ö——…•â’—ïÃÄÙÅQ…’î(ààà§()›•—†ÅΩ¡ï∏†âô•±ïÕ}ëÖ—Ñπ©ÕΩ∏à∞Äâ‹à∞ÅïπçΩë•πúÙâ’—ò¥‡à§ÅÖÃÅòË(ÄÄÄÅ©ÕΩ∏πë’µ¿°ëÖ—Ñ∞Åò∞Å•πëïπ–Ù»§()¡…•π–†âç…ïÖ—ï}©ÕΩπ}¡Ö…–ƒÅçΩµ¡±ï—ïêÑà§(