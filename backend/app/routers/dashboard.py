from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.incident import Incident
from app.models.affected_location import AffectedLocation
from app.models.rescued_person import RescuedPerson
from app.models.missing_person import MissingPerson
from app.models.shelter import Shelter
from app.models.rescue_team import RescueTeam
from app.models.resource import Resource
from app.models.medical_requirement import MedicalRequirement
from app.models.relief_activity import ReliefActivity
from app.auth.security import get_current_user
from datetime import datetime

router = APIRouter(prefix='/dashboard', tags=['Dashboard'])

@router.get('/kpi')
def get_dashboard_kpis(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total_incidents = db.query(Incident).count()
    active_incidents = db.query(Incident).filter(Incident.status == 'Active').count()
    
    pop_sum = db.query(func.sum(AffectedLocation.population)).scalar() or 0
    pop_inc_sum = db.query(func.sum(Incident.population_affected)).scalar() or 0
    total_affected_pop = max(pop_sum, pop_inc_sum)
    
    total_rescued = db.query(RescuedPerson).count()
    total_missing = db.query(MissingPerson).filter(MissingPerson.status == 'Missing').count()
    
    total_shelters = db.query(Shelter).count()
    active_shelters = db.query(Shelter).filter(Shelter.status != 'Closed').count()
    shelter_cap = db.query(func.sum(Shelter.capacity)).scalar() or 0
    shelter_occ = db.query(func.sum(Shelter.current_occupancy)).scalar() or 0
    
    total_teams = db.query(RescueTeam).count()
    active_teams = db.query(RescueTeam).filter(RescueTeam.status.in_(['Available', 'Deployed', 'On Mission'])).count()
    
    critical_medical = db.query(MedicalRequirement).filter(
        MedicalRequirement.severity == 'Critical',
        MedicalRequirement.status.in_(['Pending', 'In Progress'])
    ).count()
    
    resources = db.query(Resource).all()
    low_stock_count = 0
    for r in resources:
        avail = max(0.0, (r.total_quantity or 0.0) - (r.allocated_quantity or 0.0) - (r.used_quantity or 0.0))
        if avail < (r.minimum_required or 0.0):
            low_stock_count += 1
            
    alerts = []
    
    critical_incidents = db.query(Incident).filter(Incident.severity == 'Critical', Incident.status == 'Active').all()
    for inc in critical_incidents:
        village_str = inc.village if inc.village else 'Multiple Areas'
        alerts.append({
            'id': f'inc-{inc.id}',
            'type': 'Incident',
            'severity': 'Critical',
            'title': f'CRITICAL FLOOD: {inc.name}',
            'message': f'Severe flooding in {inc.district} ({village_str}). Water level: {inc.water_level}m. Immediate assistance required.',
            'timestamp': inc.created_at.strftime('%Y-%m-%d %H:%M:%S') if inc.created_at else str(datetime.utcnow())
        })
        
    overcrowded = db.query(Shelter).all()
    for s in overcrowded:
        if s.capacity > 0 and (s.current_occupancy / s.capacity) >= 0.85:
            percent = round((s.current_occupancy / s.capacity) * 100)
            sev = 'Critical' if (s.current_occupancy / s.capacity) >= 1.0 else 'High'
            alerts.append({
                'id': f'shelter-{s.id}',
                'type': 'Shelter',
                'severity': sev,
                'title': f'SHELTER OCCUPANCY ALERT: {s.shelter_name}',
                'message': f'{s.shelter_name} ({s.district}) is at {percent}% capacity ({s.current_occupancy}/{s.capacity}).',
                'timestamp': str(datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'))
            })
            
    crit_meds = db.query(MedicalRequirement).filter(MedicalRequirement.severity == 'Critical', MedicalRequirement.status == 'Pending').all()
    for m in crit_meds:
        pname = m.patient_name if m.patient_name else 'N/A'
        alerts.append({
            'id': f'med-{m.id}',
            'type': 'Medical',
            'severity': 'Critical',
            'title': f'URGENT MEDICAL REQUEST: {m.medicine_required}',
            'message': f'Location: {m.location}. Patient: {pname}. Condition: {m.medical_condition}.',
            'timestamp': m.created_at.strftime('%Y-%m-%d %H:%M:%S') if m.created_at else str(datetime.utcnow())
        })
        
    return {
        'kpis': {
            'total_incidents': total_incidents,
            'active_incidents': active_incidents,
            'total_affected_population': total_affected_pop,
            'total_rescued_persons': total_rescued,
            'total_missing_persons': total_missing,
            'total_shelters': total_shelters,
            'active_shelters': active_shelters,
            'shelter_total_capacity': shelter_cap,
            'shelter_total_occupancy': shelter_occ,
            'total_rescue_teams': total_teams,
            'active_rescue_teams': active_teams,
            'critical_medical_cases': critical_medical,
            'low_stock_resources_count': low_stock_count
        },
        'alerts': alerts
    }

@router.get('/charts')
def get_dashboard_charts(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    status_counts = db.query(RescuedPerson.current_status, func.count(RescuedPerson.id)).group_by(RescuedPerson.current_status).all()
    rescue_status_chart = [{'name': status or 'Rescued', 'value': count} for status, count in status_counts]
    if not rescue_status_chart:
        rescue_status_chart = [
            {'name': 'Rescued', 'value': 45},
            {'name': 'Evacuated', 'value': 30},
            {'name': 'In Shelter', 'value': 20},
            {'name': 'In Hospital', 'value': 5}
        ]
        
    dist_pops = db.query(AffectedLocation.district, func.sum(AffectedLocation.population)).group_by(AffectedLocation.district).all()
    affected_pop_chart = [{'district': dist or 'Unknown', 'population': int(pop or 0)} for dist, pop in dist_pops]
    if not affected_pop_chart:
        inc_dist = db.query(Incident.district, func.sum(Incident.population_affected)).group_by(Incident.district).all()
        affected_pop_chart = [{'district': dist or 'Unknown', 'population': int(pop or 0)} for dist, pop in inc_dist]
        
    trend_data = db.query(RescuedPerson.rescue_date, func.count(RescuedPerson.id)).group_by(RescuedPerson.rescue_date).order_by(RescuedPerson.rescue_date).all()
    rescue_trend_chart = [{'date': d or '2026-09-01', 'rescued': count} for d, count in trend_data]
    
    shelters = db.query(Shelter).limit(10).all()
    shelter_occ_chart = [{
        'name': s.shelter_name,
        'capacity': s.capacity,
        'occupancy': s.current_occupancy,
        'available': max(0, s.capacity - s.current_occupancy)
    } for s in shelters]
    
    resources = db.query(Resource).all()
    resource_chart = [{
        'name': r.resource_name,
        'category': r.category,
        'unit': r.unit,
        'total': r.total_quantity,
        'allocated': r.allocated_quantity,
        'used': r.used_quantity,
        'available': max(0.0, (r.total_quantity or 0.0) - (r.allocated_quantity or 0.0) - (r.used_quantity or 0.0)),
        'minimum_required': r.minimum_required
    } for r in resources]
    
    sev_counts = db.query(Incident.severity, func.count(Incident.id)).group_by(Incident.severity).all()
    incident_sev_chart = [{'name': sev or 'Moderate', 'value': count} for sev, count in sev_counts]
    
    return {
        'rescue_status': rescue_status_chart,
        'affected_population': affected_pop_chart,
        'rescue_trend': rescue_trend_chart,
        'shelter_occupancy': shelter_occ_chart,
        'resource_requirement': resource_chart,
        'incident_severity': incident_sev_chart
    }
