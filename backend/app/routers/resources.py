from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.resource import Resource
from app.schemas.resource import ResourceResponse, ResourceCreate, ResourceUpdate
from app.auth.security import get_current_user, require_roles
from app.services.audit_service import log_action

router = APIRouter(prefix='/resources', tags=['Resource Management'])

def enrich_resource(res: Resource) -> dict:
    r_dict = ResourceResponse.from_orm(res).dict()
    total = res.total_quantity or 0.0
    alloc = res.allocated_quantity or 0.0
    used = res.used_quantity or 0.0
    min_req = res.minimum_required or 0.0
    
    avail = max(0.0, total - alloc - used)
    r_dict['available_quantity'] = avail
    r_dict['is_low_stock'] = avail < min_req
    return r_dict

@router.get('', response_model=List[ResourceResponse])
def get_resources(
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    low_stock_only: Optional[bool] = False,
    search: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    query = db.query(Resource)
    if category:
        query = query.filter(Resource.category == category)
    if search:
        query = query.filter((Resource.resource_name.ilike(f'%{search}%')) | (Resource.location.ilike(f'%{search}%')))
        
    items = query.order_by(Resource.id.desc()).all()
    res_list = [enrich_resource(r) for r in items]
    if low_stock_only:
        res_list = [r for r in res_list if r['is_low_stock']]
    return res_list

@router.post('', response_model=ResourceResponse)
def create_resource(
    payload: ResourceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer']))
):
    res = Resource(**payload.dict())
    db.add(res)
    db.commit()
    db.refresh(res)
    
    log_action(db, user_name=current_user.full_name, action='CREATE', module='Resources', record_id=res.id, details=f'Added resource {res.resource_name} ({res.total_quantity} {res.unit})', user_id=current_user.id)
    return enrich_resource(res)

@router.get('/{resource_id}', response_model=ResourceResponse)
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail='Resource not found')
    return enrich_resource(res)

@router.put('/{resource_id}', response_model=ResourceResponse)
def update_resource(
    resource_id: int,
    payload: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer', 'Rescue Team Leader']))
):
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail='Resource not found')
        
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(res, k, v)
        
    db.commit()
    db.refresh(res)
    
    log_action(db, user_name=current_user.full_name, action='UPDATE', module='Resources', record_id=res.id, details=f'Updated resource stock for {res.resource_name}', user_id=current_user.id)
    return enrich_resource(res)

@router.delete('/{resource_id}')
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(['Admin', 'Disaster Management Officer']))
):
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail='Resource not found')
    db.delete(res)
    db.commit()
    log_action(db, user_name=current_user.full_name, action='DELETE', module='Resources', record_id=resource_id, details=f'Removed resource {res.resource_name}', user_id=current_user.id)
    return {'message': 'Resource deleted successfully'}
