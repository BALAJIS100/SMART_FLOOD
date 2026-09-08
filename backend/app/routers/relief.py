from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.relief_activity import ReliefActivity
from app.models.incident import Incident
from app.models.rescue_team import RescueTeam
from app.schemas.relief_activity import ReliefResponse, ReliefCreate, ReliefUpdate
from app.auth.security import get_current_user, require_roles
from app.services.audit_service import log_action

router = APIRouter(prefix='/relief', tags=['Relief Activities'])

class ReliefDetailResponse(ReliefResponse):
    incident_name: Optional[str] = 'N/A'
    team_name: Optional[str] = 'N/A'

@router.get('', response_model=List[ReliefDetailResponse])
def get_relief_activities(
    db: Session = Depends(get_db),
    incident_id: Optional[int] = None,
    activity_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    query = db.query(ReliefActivity)
    if incident_id:
        query = query.filter(ReliefActivity.incident_id == incident_id)
    if activity_type:
        query = query.filter(ReliefActivity.activity_type == activity_type)
    if status:
        query = query.filter(ReliefActivity.status == status)
    if search:
        query = query.filter((ReliefActivity.location.ilike(f'%{search}%')) | (ReliefActivity.responsible_org.ilike(f'%{search}%')))
        
    activities = query.order_by(ReliefActivity.id.desc()).all()
    incidents_map = {inc.id: inc.name for inc in db.query(Incident).all()}
    teams_map = {t.id: t.team_name for t in db.query(RescueTeam).all()}
    
    res = []
    for r in activities:
        r_dict = ReliefDetailResponse.from_orm(r).dict()
        r_dict['incident_name'] = incidents_map.get(r.incident_id, 'N/A')
        r_dict['team_name'] = teams_map.get(r.team_id, 'N/A') if r.team_id else 'N/A'
        res.append(r_dict)
    return res

@router.post('', response_model=ReliefDetailResponse)
def create_relief_activity(
    payload: ReliefCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']))
):
    act = ReliefActivity(**payload.dict())
    db.add(act)
    db.commit()
    db.refresh(act)
    
    log_action(db, user_name=current_user.full_name, action='CREATE', module='Relief Activities', record_id=act.id, details=f'Recorded relief activity {act.activity_type} at {act.location}', user_id=current_user.id)
    
    inc = db.query(Incident).filter(Incident.id == act.incident_id).first()
    team = db.query(RescueTeam).filter(RescueTeam.id == act.team_id).first() if act.team_id else None
    r_dict = ReliefDetailResponse.from_orm(act).dict()
    r_dict['incident_name'] = inc.name if inc else 'N/A'
    r_dict['team_name'] = team.team_name if team else 'N/A'
    return r_dict

@router.get('/{act_id}', response_model=ReliefDetailResponse)
def get_relief_activity(
    act_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    act = db.query(ReliefActivity).filter(ReliefActivity.id == act_id).first()
    if not act:
        raise HTTPException(status_code=404, detail='Relief activity not found')
        
    inc = db.query(Incident).filter(Incident.id == act.incident_id).first()
    team = db.query(RescueTeam).filter(RescueTeam.id == act.team_id).first() if act.team_id else None
    r_dict = ReliefDetailResponse.from_orm(act).dict()
    r_dict['incident_name'] = inc.name if inc else 'N/A'
    r_dict['team_name'] = team.team_name if team else 'N/A'
    return r_dict

@router.put('/{act_id}', response_model=ReliefDetailResponse)
def update_relief_activity(
    act_id: int,
    payload: ReliefUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']))
):
    act = db.query(ReliefActivity).filter(ReliefActivity.id == act_id).first()
    if not act:
        raise HTTPException(status_code=404, detail='Relief activity not found')
        
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(act, k, v)
        
    db.commit()
    db.refresh(act)
    
    log_action(db, user_name=current_user.full_name, action='UPDATE', module='Relief Activities', record_id=act.id, details=f'Updated relief activity {act.activity_type} at {act.location}', user_id=current_user.id)
    
    inc = db.query(Incident).filter(Incident.id == act.incident_id).first()
    team = db.query(RescueTeam).filter(RescueTeam.id == act.team_id).first() if act.team_id else None
    r_dict = ReliefDetailResponse.from_orm(act).dict()
    r_dict['incident_name'] = inc.name if inc else 'N/A'
    r_dict['team_name'] = team.team_name if team else 'N/A'
    return r_dict

@router.delete('/{act_id}')
def delete_relief_activity(
    act_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer']))
):
    act = db.query(ReliefActivity).filter(ReliefActivity.id == act_id).first()
    if not act:
        raise HTTPException(status_code=404, detail='Relief activity not found')
    db.delete(act)
    db.commit()
    log_action(db, user_name=current_user.full_name, action='DELETE', module='Relief Activities', record_id=act_id, details=f'Deleted relief activity {act.activity_type}', user_id=current_user.id)
    return {'message': 'Relief activity deleted successfully'}
