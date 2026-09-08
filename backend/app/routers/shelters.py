from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.shelter import Shelter
from app.schemas.shelter import ShelterResponse, ShelterCreate, ShelterUpdate
from app.auth.security import get_current_user, require_roles
from app.services.audit_service import log_action

router = APIRouter(prefix='/shelters', tags=['Relief Shelters'])

class ShelterDetailResponse(ShelterResponse):
    available_capacity: int = 0
    occupancy_percentage: float = 0.0

def enrich_shelter(shelter: Shelter) -> dict:
    s_dict = ShelterResponse.from_orm(shelter).dict()
    cap = shelter.capacity if shelter.capacity > 0 else 1
    occ = shelter.current_occupancy or 0
    s_dict['available_capacity'] = max(0, cap - occ)
    s_dict['occupancy_percentage'] = round((occ / cap) * 100.0, 1)
    return s_dict

@router.get('', response_model=List[ShelterDetailResponse])
def get_shelters(
    db: Session = Depends(get_db),
    district: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    query = db.query(Shelter)
    if district:
        query = query.filter(Shelter.district.ilike(f'%{district}%'))
    if status:
        query = query.filter(Shelter.status == status)
    if search:
        query = query.filter((Shelter.shelter_name.ilike(f'%{search}%')) | (Shelter.location.ilike(f'%{search}%')))
        
    shelters = query.order_by(Shelter.id.desc()).all()
    return [enrich_shelter(s) for s in shelters]

@router.post('', response_model=ShelterDetailResponse)
def create_shelter(
    payload: ShelterCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer']))
):
    shelter = Shelter(**payload.dict())
    db.add(shelter)
    db.commit()
    db.refresh(shelter)
    
    log_action(db, user_name=current_user.full_name, action='CREATE', module='Shelters', record_id=shelter.id, details=f'Opened relief shelter {shelter.shelter_name} in {shelter.district}', user_id=current_user.id)
    return enrich_shelter(shelter)

@router.get('/{shelter_id}', response_model=ShelterDetailResponse)
def get_shelter(
    shelter_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail='Shelter not found')
    return enrich_shelter(shelter)

@router.put('/{shelter_id}', response_model=ShelterDetailResponse)
def update_shelter(
    shelter_id: int,
    payload: ShelterUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']))
):
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail='Shelter not found')
        
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(shelter, k, v)
        
    db.commit()
    db.refresh(shelter)
    
    log_action(db, user_name=current_user.full_name, action='UPDATE', module='Shelters', record_id=shelter.id, details=f'Updated shelter details for {shelter.shelter_name}', user_id=current_user.id)
    return enrich_shelter(shelter)

@router.delete('/{shelter_id}')
def delete_shelter(
    shelter_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer']))
):
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail='Shelter not found')
    db.delete(shelter)
    db.commit()
    log_action(db, user_name=current_user.full_name, action='DELETE', module='Shelters', record_id=shelter_id, details=f'Closed shelter {shelter.shelter_name}', user_id=current_user.id)
    return {'message': 'Shelter deleted successfully'}
