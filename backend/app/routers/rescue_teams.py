from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.rescue_team import RescueTeam
from app.models.incident import Incident
from app.schemas.rescue_team import RescueTeamResponse, RescueTeamCreate, RescueTeamUpdate
from app.auth.security import get_current_user, require_roles
from app.services.audit_service import log_action

router = APIRouter(prefix='/rescue-teams', tags=['Rescue Teams'])

class RescueTeamDetailResponse(RescueTeamResponse):
    assigned_incident_name: Optional[str] = 'N/A'

@router.get('', response_model=List[RescueTeamDetailResponse])
def get_rescue_teams(
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    team_type: Optional[str] = None,
    incident_id: Optional[int] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    query = db.query(RescueTeam)
    if status:
        query = query.filter(RescueTeam.status == status)
    if team_type:
        query = query.filter(RescueTeam.team_type == team_type)
    if incident_id:
        query = query.filter(RescueTeam.assigned_incident_id == incident_id)
    if search:
        query = query.filter((RescueTeam.team_name.ilike(f'%{search}%')) | (RescueTeam.team_leader.ilike(f'%{search}%')))
        
    teams = query.order_by(RescueTeam.id.desc()).all()
    incidents_map = {inc.id: inc.name for inc in db.query(Incident).all()}
    
    res = []
    for t in teams:
        t_dict = RescueTeamDetailResponse.from_orm(t).dict()
        t_dict['assigned_incident_name'] = incidents_map.get(t.assigned_incident_id, 'N/A') if t.assigned_incident_id else 'Unassigned'
        res.append(t_dict)
    return res

@router.post('', response_model=RescueTeamDetailResponse)
def create_rescue_team(
    payload: RescueTeamCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer']))
):
    team = RescueTeam(**payload.dict())
    db.add(team)
    db.commit()
    db.refresh(team)
    
    log_action(db, user_name=current_user.full_name, action='CREATE', module='Rescue Teams', record_id=team.id, details=f'Registered rescue team {team.team_name} ({team.team_type})', user_id=current_user.id)
    
    inc = db.query(Incident).filter(Incident.id == team.assigned_incident_id).first() if team.assigned_incident_id else None
    t_dict = RescueTeamDetailResponse.from_orm(team).dict()
    t_dict['assigned_incident_name'] = inc.name if inc else 'Unassigned'
    return t_dict

@router.get('/{team_id}', response_model=RescueTeamDetailResponse)
def get_rescue_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    team = db.query(RescueTeam).filter(RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail='Rescue team not found')
        
    inc = db.query(Incident).filter(Incident.id == team.assigned_incident_id).first() if team.assigned_incident_id else None
    t_dict = RescueTeamDetailResponse.from_orm(team).dict()
    t_dict['assigned_incident_name'] = inc.name if inc else 'Unassigned'
    return t_dict

@router.put('/{team_id}', response_model=RescueTeamDetailResponse)
def update_rescue_team(
    team_id: int,
    payload: RescueTeamUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']))
):
    team = db.query(RescueTeam).filter(RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail='Rescue team not found')
        
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(team, k, v)
        
    db.commit()
    db.refresh(team)
    
    log_action(db, user_name=current_user.full_name, action='UPDATE', module='Rescue Teams', record_id=team.id, details=f'Updated rescue team {team.team_name}', user_id=current_user.id)
    
    inc = db.query(Incident).filter(Incident.id == team.assigned_incident_id).first() if team.assigned_incident_id else None
    t_dict = RescueTeamDetailResponse.from_orm(team).dict()
    t_dict['assigned_incident_name'] = inc.name if inc else 'Unassigned'
    return t_dict

@router.delete('/{team_id}')
def delete_rescue_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer']))
):
    team = db.query(RescueTeam).filter(RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail='Rescue team not found')
    db.delete(team)
    db.commit()
    log_action(db, user_name=current_user.full_name, action='DELETE', module='Rescue Teams', record_id=team_id, details=f'Deregistered rescue team {team.team_name}', user_id=current_user.id)
    return {'message': 'Rescue team deleted successfully'}
