from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: str
    action: str
    module: str
    record_id: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime
    ip_address: Optional[str] = None

    class Config:
        from_attributes = True
