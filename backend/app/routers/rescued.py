from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.rescued_person import RescuedPerson
from app.models.incident import Incident
from app.models.rescue_team import RescueTeam
from app.models.shelter import Shelter
from app.schemas.rescued_person import RescuedResponse, RescuedCreate, RescuedUpdate
from app.auth.security import get_current_user, require_roles
from app.services.audit_service import log_action

router = APIRouter(prefix='/rescued', tags=['Rescued Persons'])

class RescuedDetailResponse(RescuedResponse):
    incident_name: Optional[str] = 'N/A'
    rescue_team_name: Optional[str] = 'N/A'
    shelter_name: Optional[str] = 'N/A'

@router.get('', response_model=List[RescuedDetailResponse])
def get_rescued_persons(
    db: Session = Depends(get_db),
    incident_id: Optional[int] = None,
    status: Optional[str] = None,
    medical_condition: Optional[str] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    query = db.query(RescuedPerson)
    if incident_id:
        query = query.filter(RescuedPerson.incident_id == incident_id)
    if status:
        query = query.filter(RescuedPerson.current_status == status)
    if medical_condition:
        query = query.filter(RescuedPerson.medical_condition == medical_condition)
    if search:
        query = query.filter((RescuedPerson.person_name.ilike(f'%{search}%')) | (RescuedPerson.location.ilike(f'%{search}%')))
        
    persons = query.order_by(RescuedPerson.id.desc()).all()
    incidents_map = {inc.id: inc.name for inc in db.query(Incident).all()}
    teams_map = {t.id: t.team_name for t in db.query(RescueTeam).all()}
    shelters_map = {s.id: s.shelter_name for s in db.query(Shelter).all()}
    
    res = []
    for p in persons:
        p_dict = RescuedDetailResponse.from_orm(p).dict()
        p_dict['incident_name'] = incidents_map.get(p.incident_id, 'N/A')
        p_dict['rescue_team_name'] = teams_map.get(p.rescue_team_id, 'N/A') if p.rescue_team_id else 'N/A'
        p_dict['shelter_name'] = shelters_map.get(p.shelter_id, 'N/A') if p.shelter_id else 'N/A'
        res.append(p_dict)
    return res

@router.post('', response_model=RescuedDetailResponse)
def create_rescued_person(
    payload: RescuedCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer', 'Rescue Team Leader', 'Medical Team Representative']))
):
    p = RescuedPerson(**payload.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    
    if p.shelter_id:
        shelter = db.query(Shelter).filter(Shelter.id == p.shelter_id).first()
        if shelter:
            shelter.current_occupancy += 1
            if p.gender and p.gender.lower() == 'male':
                shelter.male_count += 1
            elif p.gender and p.gender.lower() == 'female':
                shelter.female_count += 1
            if p.age and p.age < 18:
                shelter.children_count += 1
            elif p.age and p.age >= 60:
                shelter.elderly_count += 1
            db.commit()
            
    log_action(db, user_name=current_user.full_name, action='CREATE', module='Rescued Persons', record_id=p.id, details=f'Registered rescued person {p.person_name}', user_id=current_user.id)
    
    inc = db.query(Incident).filter(Incident.id == p.incident_id).first()
    team = db.query(RescueTeam).filter(RescueTeam.id == p.rescue_team_id).first() if p.rescue_team_id else None
    shelter = db.query(Shelter).filter(Shelter.id == p.shelter_id).first() if p.shelter_id else None
    
    res_dict = RescuedDetailResponse.from_orm(p).dict()
    res_dict['incident_name'] = inc.name if inc else 'N/A'
    res_dict['rescue_team_name'] = team.team_name if team else 'N/A'
    res_dict['shelter_name'] = shelter.shelter_name if shelter else 'N/A'
    return res_dict

@router.get('/{person_id}', response_model=RescuedDetailResponse)
def get_rescued_person(
    person_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    p = db.query(RescuedPerson).filter(RescuedPerson.id == person_id).first()
    if not p:
        raise HTTPException(status_code=404, detail='Rescued person not found')
        
    inc = db.query(Incident).filter(Incident.id == p.incident_id).first()
    team = db.query(RescueTeam).filter(RescueTeam.id == p.rescue_team_id).first() if p.rescue_team_id else None
    shelter = db.query(Shelter).filter(Shelter.id == p.shelter_id).first() if p.shelter_id else None
    
    res_dict = RescuedDetailResponse.from_orm(p).dict()
    res_dict['incident_name'] = inc.name if inc else 'N/A'
    res_dict['rescue_team_name'] = team.team_name if team else 'N/A'
    res_dict['shelter_name'] = shelter.shelter_name if shelter else 'N/A'
    return res_dict

@router.put('/{person_id}', response_model=RescuedDetailResponse)
def update_rescued_person(
    person_id: int,
    payload: RescuedUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer', 'Rescue Team Leader', 'Medical Team Representative']))
):
    p = db.query(RescuedPerson).filter(RescuedPerson.id == person_id).first()
    if not p:
        raise HTTPException(status_code=404, detail='Rescued person not found')
        
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(p, k, v)
        
    db.commit()
    db.refresh(p)
    
    log_action(db, user_name=current_user.full_name, action='UPDATE', module='Rescued Persons', record_id=p.id, details=f'Updated rescued person record {p.person_name}', user_id=current_user.id)
    
    inc = db.query(Incident).filter(Incident.id == p.incident_id).first()
    team = db.query(RescueTeam).filter(RescueTeam.id == p.rescue_team_id).first() if p.rescue_team_id else None
    shelter = db.query(Shelter).filter(Shelter.id == p.shelter_id).first() if p.shelter_id else None
    
    res_dict = RescuedDetailResponse.from_orm(p).dict()
    res_dict['incident_name'] = inc.name if inc else 'N/A'
    res_dict['rescue_team_name'] = team.team_name if team else 'N/A'
    res_dict['shelter_name'] = shelter.shelter_name if shelter else 'N/A'
    return res_dict

@router.delete('/{person_id}')
def delete_rescued_person(
    person_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer']))
):
    p = db.query(RescuedPerson).filter(RescuedPerson.id == person_id).first()
    if not p:
        raise HTTPException(status_code=404, detail='Rescued person not found')
    db.delete(p)
    db.commit()
    log_action(db, user_name=current_user.full_name, action='DELETE', module='Rescued Persons', record_id=person_id, details=f'Deleted rescued person record {p.person_name}', user_id=current_user.id)
    return {'message': 'Rescued person record deleted successfully'}
