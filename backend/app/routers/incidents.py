from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.incident import Incident
from app.schemas.incident import IncidentResponse, IncidentCreate, IncidentUpdate
from app.auth.security import get_current_user, require_roles
from app.services.audit_service import log_action

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    district: Optional[str] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)
    if district:
        query = query.filter(Incident.district.ilike(f"%{district}%"))
    if search:
        query = query.filter((Incident.name.ilike(f"%{search}%")) | (Incident.village.ilike(f"%{search}%")))
    return query.order_by(Incident.id.desc()).all()

@router.post("", response_model=IncidentResponse)
def create_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Admin", "Disaster Management Officer"]))
):
    inc = Incident(**payload.dict())
    if not inc.created_by:
        inc.created_by = current_user.full_name
    db.add(inc)
    db.commit()
    db.refresh(inc)
    log_action(db, user_name=current_user.full_name, action="CREATE", module="Incidents", record_id=inc.id, details=f"Created incident '{inc.name}' in {inc.district}", user_id=current_user.id)
    return inc

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.put("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: int,
    payload: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Admin", "Disaster Management Officer"]))
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(inc, k, v)
    db.commit()
    db.refresh(inc)
    log_action(db, user_name=current_user.full_name, action="UPDATE", module="Incidents", record_id=inc.id, details=f"Updated incident '{inc.name}'", user_id=current_user.id)
    return inc

@router.delete("/{incident_id}")
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Admin"]))
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(inc)
    db.commit()
    log_action(db, user_name=current_user.full_name, action="DELETE", module="Incidents", record_id=incident_id, details=f"Deleted incident '{inc.name}'", user_id=current_user.id)
    return {"message": "Incident deleted successfully"}
