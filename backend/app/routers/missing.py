from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.missing_person import MissingPerson
from app.models.incident import Incident
from app.models.rescue_team import RescueTeam
from app.schemas.missing_person import MissingResponse, MissingCreate, MissingUpdate
from app.auth.security import get_current_user, require_roles
from app.services.audit_service import log_action

router = APIRouter(prefix='/missing', tags=['Missing Persons'])

class MissingDetailResponse(MissingResponse):
    incident_name: Optional[str] = 'N/A'
    assigned_team_name: Optional[str] = 'N/A'

@router.get('', response_model=List[MissingDetailResponse])
def get_missing_persons(
    db: Session = Depends(get_db),
    incident_id: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    query = db.query(MissingPerson)
    if incident_id:
        query = query.filter(MissingPerson.incident_id == incident_id)
    if status:
        query = query.filter(MissingPerson.status == status)
    if search:
        query = query.filter((MissingPerson.person_name.ilike(f'%{search}%')) | (MissingPerson.last_seen_location.ilike(f'%{search}%')))
        
    persons = query.order_by(MissingPerson.id.desc()).all()
    incidents_map = {inc.id: inc.name for inc in db.query(Incident).all()}
    teams_map = {t.id: t.team_name for t in db.query(RescueTeam).all()}
    
    res = []
    for p in persons:
        p_dict = MissingDetailResponse.from_orm(p).dict()
        p_dict['incident_name'] = incidents_map.get(p.incident_id, 'N/A')
        p_dict['assigned_team_name'] = teams_map.get(p.assigned_team_id, 'N/A') if p.assigned_team_id else 'N/A'
        res.append(p_dict)
    return res

@router.post('', response_model=MissingDetailResponse)
def create_missing_person(
    payload: MissingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    p = MissingPerson(**payload.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    
    log_action(db, user_name=current_user.full_name, action='CREATE', module='Missing Persons', record_id=p.id, details=f'Filed missing report for {p.person_name}', user_id=current_user.id)
    
    inc = db.query(Incident).filter(Incident.id == p.incident_id).first()
    team = db.query(RescueTeam).filter(RescueTeam.id == p.assigned_team_id).first() if p.assigned_team_id else None
    
    res_dict = MissingDetailResponse.from_orm(p).dict()
    res_dict['incident_name'] = inc.name if inc else 'N/A'
    res_dict['assigned_team_name'] = team.team_name if team else 'N/A'
    return res_dict

@router.get('/{person_id}', response_model=MissingDetailResponse)
def get_missing_person(
    person_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    p = db.query(MissingPerson).filter(MissingPerson.id == person_id).first()
    if not p:
        raise HTTPException(status_code=404, detail='Missing person record not found')
        
    inc = db.query(Incident).filter(Incident.id == p.incident_id).first()
    team = db.query(RescueTeam).filter(RescueTeam.id == p.assigned_team_id).first() if p.assigned_team_id else None
    
    res_dict = MissingDetailResponse.from_orm(p).dict()
    res_dict['incident_name'] = inc.name if inc else 'N/A'
    res_dict['assigned_team_name'] = team.team_name if team else 'N/A'
    return res_dict

@router.put('/{person_id}', response_model=MissingDetailResponse)
def update_missing_person(
    person_id: int,
    payload: MissingUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']))
):
    p = db.query(MissingPerson).filter(MissingPerson.id == person_id).first()
    if not p:
        raise HTTPException(status_code=404, detail='Missing person record not found')
        
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(p, k, v)
        
    db.commit()
    db.refresh(p)
    
    log_action(db, user_name=current_user.full_name, action='UPDATE', module='Missing Persons', record_id=p.id, details=f'Updated missing person status to {p.status} for {p.person_name}', user_id=current_user.id)
    
    inc = db.query(Incident).filter(Incident.id == p.incident_id).first()
    team = db.query(RescueTeam).filter(RescueTeam.id == p.assigned_team_id).first() if p.assigned_team_id else None
    
    res_dict = MissingDetailResponse.from_orm(p).dict()
    res_dict['incident_name'] = inc.name if inc else 'N/A'
    res_dict['assigned_team_name'] = team.team_name if team else 'N/A'
    return res_dict

@router.delete('/{person_id}')
def delete_missing_person(
    person_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer']))
):
    p = db.query(MissingPerson).filter(MissingPerson.id == person_id).first()
    if not p:
        raise HTTPException(status_code=404, detail='Missing person record not found')
    db.delete(p)
    db.commit()
    log_action(db, user_name=current_user.full_name, action='DELETE', module='Missing Persons', record_id=person_id, details=f'Deleted missing person record for {p.person_name}', user_id=current_user.id)
    return {'message': 'Missing person record deleted successfully'}
