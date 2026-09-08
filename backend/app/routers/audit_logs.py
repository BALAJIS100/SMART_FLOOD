from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogResponse
from app.auth.security import get_current_user, require_roles

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    module: Optional[str] = None,
    action: Optional[str] = None,
    user_name: Optional[str] = None,
    search: Optional[str] = None,
    limit: Optional[int] = 100,
    current_user = Depends(require_roles(["Admin", "Disaster Management Officer"]))
):
    query = db.query(AuditLog)
    if module:
        query = query.filter(AuditLog.module == module)
    if action:
        query = query.filter(AuditLog.action == action)
    if user_name:
        query = query.filter(AuditLog.user_name.ilike(f"%{user_name}%"))
    if search:
        query = query.filter((AuditLog.details.ilike(f"%{search}%")) | (AuditLog.module.ilike(f"%{search}%")))
        
    return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
