from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.affected_location import AffectedLocation
from app.models.incident import Incident
from app.schemas.affected_location import LocationResponse, LocationCreate, LocationUpdate
from app.auth.security import get_current_user, require_roles
from app.services.audit_service import log_action

router = APIRouter(prefix="/locations", tags=["Affected Locations"])

class LocationDetailResponse(LocationResponse):
    incident_name: Optional[str] = "N/A"

@router.get("", response_model=List[LocationDetailResponse])
def get_locations(
    db: Session = Depends(get_db),
    incident_id: Optional[int] = None,
    district: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    query = db.query(AffectedLocation)
    if incident_id:
        query = query.filter(AffectedLocation.incident_id == incident_id)
    if district:
        query = query.filter(AffectedLocation.district.ilike(f"%{district}%"))
    if severity:
        query = query.filter(AffectedLocation.severity == severity)
    if search:
        query = query.filter((AffectedLocation.village.ilike(f"%{search}%")) | (AffectedLocation.taluk.ilike(f"%{search}%")))
        
    locs = query.order_by(AffectedLocation.id.desc()).all()
    incidents_map = {inc.id: inc.name for inc in db.query(Incident).all()}
    
    res = []
    for l in locs:
        l_dict = LocationDetailResponse.from_orm(l).dict()
        l_dict["incident_name"] = incidents_map.get(l.incident_id, "N/A")
        res.append(l_dict)
    return res

@router.post("", response_model=LocationDetailResponse)
def create_location(
    payload: LocationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Admin", "Disaster Management Officer", "Rescue Team Leader"]))
):
    loc = AffectedLocation(**payload.dict())
    db.add(loc)
    db.commit()
    db.refresh(loc)
    
    inc = db.query(Incident).filter(Incident.id == loc.incident_id).first()
    log_action(db, user_name=current_user.full_name, action="CREATE", module="Affected Locations", record_id=loc.id, details=f"Added affected location '{loc.village}' in {loc.district}", user_id=current_user.id)
    
    res_dict = LocationDetailResponse.from_orm(loc).dict()
    res_dict["incident_name"] = inc.name if inc else "N/A"
    return res_dict

@router.get("/{loc_id}", response_model=LocationDetailResponse)
def get_location(
    loc_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    loc = db.query(AffectedLocation).filter(AffectedLocation.id == loc_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    inc = db.query(Incident).filter(Incident.id == loc.incident_id).first()
    res_dict = LocationDetailResponse.from_orm(loc).dict()
    res_dict["incident_name"] = inc.name if inc else "N/A"
    return res_dict

@router.put("/{loc_id}", response_model=LocationDetailResponse)
def update_location(
    loc_id: int,
    payload: LocationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Admin", "Disaster Management Officer", "Rescue Team Leader"]))
):
    loc = db.query(AffectedLocation).filter(AffectedLocation.id == loc_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
        
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(loc, k, v)
        
    db.commit()
    db.refresh(loc)
    
    inc = db.query(Incident).filter(Incident.id == loc.incident_id).first()
    log_action(db, user_name=current_user.full_name, action="UPDATE", module="Affected Locations", record_id=loc.id, details=f"Updated location '{loc.village}'", user_id=current_user.id)
    
    res_dict = LocationDetailResponse.from_orm(loc).dict()
    res_dict["incident_name"] = inc.name if inc else "N/A"
    return res_dict

@router.delete("/{loc_id}")
def delete_location(
    loc_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Admin", "Disaster Management Officer"]))
):
    loc = db.query(AffectedLocation).filter(AffectedLocation.id == loc_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(loc)
    db.commit()
    log_action(db, user_name=current_user.full_name, action="DELETE", module="Affected Locations", record_id=loc_id, details=f"Deleted location '{loc.village}'", user_id=current_user.id)
    return {"message": "Location deleted successfully"}