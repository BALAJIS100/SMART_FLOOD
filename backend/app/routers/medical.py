from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.medical_requirement import MedicalRequirement
from app.models.incident import Incident
from app.schemas.medical_requirement import MedicalResponse, MedicalCreate, MedicalUpdate
from app.auth.security import get_current_user, require_roles
from app.services.audit_service import log_action

router = APIRouter(prefix='/medical', tags=['Medical Requirements'])

class MedicalDetailResponse(MedicalResponse):
    incident_name: Optional[str] = 'N/A'

@router.get('', response_model=List[MedicalDetailResponse])
def get_medical_requirements(
    db: Session = Depends(get_db),
    incident_id: Optional[int] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    query = db.query(MedicalRequirement)
    if incident_id:
        query = query.filter(MedicalRequirement.incident_id == incident_id)
    if status:
        query = query.filter(MedicalRequirement.status == status)
    if severity:
        query = query.filter(MedicalRequirement.severity == severity)
    if search:
        query = query.filter((MedicalRequirement.medicine_required.ilike(f'%{search}%')) | (MedicalRequirement.patient_name.ilike(f'%{search}%')) | (MedicalRequirement.location.ilike(f'%{search}%')))
        
    items = query.order_by(MedicalRequirement.id.desc()).all()
    incidents_map = {inc.id: inc.name for inc in db.query(Incident).all()}
    
    res = []
    for m in items:
        m_dict = MedicalDetailResponse.from_orm(m).dict()
        m_dict['incident_name'] = incidents_map.get(m.incident_id, 'N/A')
        res.append(m_dict)
    return res

@router.post('', response_model=MedicalDetailResponse)
def create_medical_requirement(
    payload: MedicalCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer', 'Medical Team Representative', 'Rescue Team Leader']))
):
    med = MedicalRequirement(**payload.dict())
    db.add(med)
    db.commit()
    db.refresh(med)
    
    log_action(db, user_name=current_user.full_name, action='CREATE', module='Medical Requirements', record_id=med.id, details=f'Logged medical request: {med.medicine_required} for {med.patient_name or med.location}', user_id=current_user.id)
    
    inc = db.query(Incident).filter(Incident.id == med.incident_id).first()
    m_dict = MedicalDetailResponse.from_orm(med).dict()
    m_dict['incident_name'] = inc.name if inc else 'N/A'
    return m_dict

@router.get('/{med_id}', response_model=MedicalDetailResponse)
def get_medical_requirement(
    med_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    med = db.query(MedicalRequirement).filter(MedicalRequirement.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail='Medical requirement not found')
        
    inc = db.query(Incident).filter(Incident.id == med.incident_id).first()
    m_dict = MedicalDetailResponse.from_orm(med).dict()
    m_dict['incident_name'] = inc.name if inc else 'N/A'
    return m_dict

@router.put('/{med_id}', response_model=MedicalDetailResponse)
def update_medical_requirement(
    med_id: int,
    payload: MedicalUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer', 'Medical Team Representative']))
):
    med = db.query(MedicalRequirement).filter(MedicalRequirement.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail='Medical requirement not found')
        
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(med, k, v)
        
    db.commit()
    db.refresh(med)
    
    log_action(db, user_name=current_user.full_name, action='UPDATE', module='Medical Requirements', record_id=med.id, details=f'Updated medical request status to {med.status}', user_id=current_user.id)
    
    inc = db.query(Incident).filter(Incident.id == med.incident_id).first()
    m_dict = MedicalDetailResponse.from_orm(med).dict()
    m_dict['incident_name'] = inc.name if inc else 'N/A'
    return m_dict

@router.delete('/{med_id}')
def delete_medical_requirement(
    med_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer', 'Medical Team Representative']))
):
    med = db.query(MedicalRequirement).filter(MedicalRequirement.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail='Medical requirement not found')
    db.delete(med)
    db.commit()
    log_action(db, user_name=current_user.full_name, action='DELETE', module='Medical Requirements', record_id=med_id, details=f'Deleted medical request for {med.medicine_required}', user_id=current_user.id)
    return {'message': 'Medical requirement deleted successfully'}
