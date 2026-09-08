from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.models.incident import Incident
from app.models.affected_location import AffectedLocation
from app.models.rescued_person import RescuedPerson
from app.models.missing_person import MissingPerson
from app.models.shelter import Shelter
from app.models.rescue_team import RescueTeam
from app.models.resource import Resource
from app.models.medical_requirement import MedicalRequirement
from app.models.relief_activity import ReliefActivity

def generate_report_data(
    db: Session,
    report_type: str = 'summary',
    incident_id: int = None,
    district: str = None,
    start_date: str = None,
    end_date: str = None,
    status: str = None,
    user_name: str = 'Administrator'
) -> dict:
    now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    inc_query = db.query(Incident)
    if incident_id:
        inc_query = inc_query.filter(Incident.id == incident_id)
    if district:
        inc_query = inc_query.filter(Incident.district.ilike(f'%{district}%'))
    if status:
        inc_query = inc_query.filter(Incident.status == status)
    incidents = inc_query.all()
    
    loc_query = db.query(AffectedLocation)
    if district:
        loc_query = loc_query.filter(AffectedLocation.district.ilike(f'%{district}%'))
    locations = loc_query.all()
    
    rescued_query = db.query(RescuedPerson)
    if incident_id:
        rescued_query = rescued_query.filter(RescuedPerson.incident_id == incident_id)
    rescued_persons = rescued_query.all()
    
    missing_query = db.query(MissingPerson)
    if incident_id:
        missing_query = missing_query.filter(MissingPerson.incident_id == incident_id)
    missing_persons = missing_query.all()
    
    shelter_query = db.query(Shelter)
    if district:
        shelter_query = shelter_query.filter(Shelter.district.ilike(f'%{district}%'))
    shelters = shelter_query.all()
    
    resources = db.query(Resource).all()
    medical_reqs = db.query(MedicalRequirement).all()
    relief_acts = db.query(ReliefActivity).all()
    
    total_affected_pop = sum(l.population for l in locations) if locations else sum(i.population_affected for i in incidents)
    total_rescued = len(rescued_persons)
    total_missing = len([m for m in missing_persons if m.status == 'Missing'])
    total_traced = len([m for m in missing_persons if m.status != 'Missing'])
    
    total_shelters = len(shelters)
    shelter_capacity = sum(s.capacity for s in shelters)
    shelter_occupancy = sum(s.current_occupancy for s in shelters)
    
    critical_meds = len([m for m in medical_reqs if m.severity == 'Critical' and m.status != 'Resolved'])
    low_stock_items = []
    for r in resources:
        avail = max(0.0, (r.total_quantity or 0.0) - (r.allocated_quantity or 0.0) - (r.used_quantity or 0.0))
        if avail < (r.minimum_required or 0.0):
            low_stock_items.append(r.resource_name)
            
    metrics = {
        'report_title': f'FLOOD RESCUE & RELIEF EXECUTIVE REPORT ({report_type.upper()})',
        'generated_at': now_str,
        'generated_by': user_name,
        'total_incidents': len(incidents),
        'active_incidents': len([i for i in incidents if i.status == 'Active']),
        'total_affected_population': total_affected_pop,
        'total_rescued_persons': total_rescued,
        'total_missing_persons': total_missing,
        'total_traced_persons': total_traced,
        'total_shelters': total_shelters,
        'shelter_total_capacity': shelter_capacity,
        'shelter_total_occupancy': shelter_occupancy,
        'shelter_occupancy_percentage': round((shelter_occupancy / shelter_capacity * 100), 1) if shelter_capacity > 0 else 0.0,
        'critical_medical_cases': critical_meds,
        'low_stock_resources_count': len(low_stock_items)
    }
    
    incident_summary = []
    for i in incidents:
        incident_summary.append({
            'id': i.id,
            'name': i.name,
            'type': i.type,
            'district': i.district,
            'severity': i.severity,
            'status': i.status,
            'water_level': f'{i.water_level}m' if i.water_level else '0m',
            'population_affected': i.population_affected or 0,
            'start_date': i.start_date
        })
        
    dist_map = {}
    for l in locations:
        d = l.district
        if d not in dist_map:
            dist_map[d] = {'district': d, 'population': 0, 'houses_affected': 0, 'roads_damaged': 0, 'bridges_damaged': 0}
        dist_map[d]['population'] += l.population or 0
        dist_map[d]['houses_affected'] += l.houses_affected or 0
        dist_map[d]['roads_damaged'] += l.roads_damaged or 0
        dist_map[d]['bridges_damaged'] += l.bridges_damaged or 0
    district_summary = list(dist_map.values())
    
    shelter_summary = []
    for s in shelters:
        cap = s.capacity if s.capacity > 0 else 1
        occ = s.current_occupancy or 0
        pct = round((occ / cap) * 100, 1)
        shelter_summary.append({
            'name': s.shelter_name,
            'district': s.district,
            'capacity': s.capacity,
            'occupancy': s.current_occupancy,
            'occupancy_pct': f'{pct}%',
            'status': s.status,
            'contact': s.contact_person or 'N/A'
        })
        
    resource_summary = []
    for r in resources:
        avail = max(0.0, (r.total_quantity or 0.0) - (r.allocated_quantity or 0.0) - (r.used_quantity or 0.0))
        is_low = avail < (r.minimum_required or 0.0)
        resource_summary.append({
            'name': r.resource_name,
            'category': r.category,
            'unit': r.unit,
            'total': r.total_quantity,
            'allocated': r.allocated_quantity,
            'available': avail,
            'minimum_required': r.minimum_required,
            'status': 'CRITICAL LOW' if is_low else 'Adequate'
        })
        
    recommendations = []
    if shelter_occupancy > (shelter_capacity * 0.8):
        recommendations.append('URGENT: Overall shelter capacity has exceeded 80%. Prepare secondary relief camps.')
    if low_stock_items:
        items_str = ', '.join(low_stock_items[:3])
        recommendations.append(f'RESOURCE ALERT: Stock levels for [{items_str}] are below emergency thresholds.')
    if critical_meds > 0:
        recommendations.append(f'MEDICAL PRIORITY: {critical_meds} critical medical cases require immediate doctor team deployment.')
    if total_missing > 0:
        recommendations.append(f'RESCUE OPERATION: {total_missing} persons are registered missing. Deploy NDRF search units.')
    if not recommendations:
        recommendations.append('All rescue and relief operations are operating within normal protocols.')

    return {
        'metrics': metrics,
        'incident_summary': incident_summary,
        'district_summary': district_summary,
        'shelter_summary': shelter_summary,
        'resource_summary': resource_summary,
        'recommendations': recommendations
    }
