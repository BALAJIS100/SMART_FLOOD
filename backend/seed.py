import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models.role import Role
from app.models.user import User
from app.models.incident import Incident
from app.models.affected_location import AffectedLocation
from app.models.rescued_person import RescuedPerson
from app.models.missing_person import MissingPerson
from app.models.shelter import Shelter
from app.models.rescue_team import RescueTeam
from app.models.resource import Resource
from app.models.medical_requirement import MedicalRequirement
from app.models.relief_activity import ReliefActivity
from app.models.audit_log import AuditLog
from app.auth.security import get_password_hash
from datetime import datetime, timedelta

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 1. Seed Roles
        roles_data = [
            ("Admin", "Full administrative access to system parameters, user management, and disaster logs."),
            ("Disaster Management Officer", "Authorized to create incidents, manage affected areas, shelters, and resource allocations."),
            ("Rescue Team Leader", "Manages field rescue operations, rescued person registration, and team dispatch."),
            ("Medical Team Representative", "Logs medical requirements, triage conditions, and doctor deployments."),
            ("Viewer", "Read-only access to real-time dashboards and published disaster reports.")
        ]
        
        roles_map = {}
        for name, desc in roles_data:
            role = db.query(Role).filter(Role.name == name).first()
            if not role:
                role = Role(name=name, description=desc)
                db.add(role)
                db.commit()
                db.refresh(role)
            roles_map[name] = role.id
            
        print("Roles seeded successfully.")
        
        # 2. Seed Demo Users
        users_data = [
            ("balajisara100@gmail.com", "admin123", "Balaji Sara (Railway State Admin)", "+91 98765 43299", roles_map["Admin"]),
            ("admin@floodrescue.com", "admin123", "Dr. Rajesh Kumar (State Director)", "+91 98765 43210", roles_map["Admin"]),
            ("officer@floodrescue.com", "officer123", "Anitha Sundaram (Disaster Relief Officer)", "+91 98765 43211", roles_map["Disaster Management Officer"]),
            ("rescue@floodrescue.com", "rescue123", "Cmdr. Vikram Singh (NDRF Battalion 4)", "+91 98765 43212", roles_map["Rescue Team Leader"]),
            ("medical@floodrescue.com", "medical123", "Dr. Priya Venkatesh (Chief Medical Coordinator)", "+91 98765 43213", roles_map["Medical Team Representative"]),
            ("viewer@floodrescue.com", "viewer123", "Karthik Subramanian (Public Auditor)", "+91 98765 43214", roles_map["Viewer"])
        ]
        
        for email, password, full_name, phone, role_id in users_data:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    hashed_password=get_password_hash(password),
                    full_name=full_name,
                    phone=phone,
                    role_id=role_id,
                    is_active=True
                )
                db.add(user)
        db.commit()
        print("Demo users seeded successfully.")
        
        # 3. Seed Incidents
        if db.query(Incident).count() == 0:
            incidents = [
                Incident(
                    name="Cyclone Michaung Severe Inundation",
                    type="Cyclone / Flash Flood",
                    description="Continuous torrential rainfall causing extreme urban flooding across Chennai Metropolitan Region.",
                    start_date="2026-09-01",
                    status="Active",
                    severity="Critical",
                    state="Tamil Nadu",
                    district="Chennai",
                    taluk="Velachery",
                    village="Velachery Main & Tambaram",
                    latitude=12.9780,
                    longitude=80.2180,
                    water_level=2.8,
                    population_affected=125000,
                    infrastructure_damage="Heavy damage to arterial roads, power substations submerged, metro feeder bridge collapsed.",
                    livestock_affected=450,
                    created_by="Dr. Rajesh Kumar (State Director)"
                ),
                Incident(
                    name="Kaveri Basin Delta Overflow",
                    type="Riverine Flood",
                    description="Breach of river embankments along Kaveri tributaries submerging agricultural tracts.",
                    start_date="2026-09-02",
                    status="Active",
                    severity="High",
                    state="Tamil Nadu",
                    district="Cuddalore",
                    taluk="Chidambaram",
                    village="Bhuvanagiri & Annamalai Nagar",
                    latitude=11.3992,
                    longitude=79.6934,
                    water_level=2.1,
                    population_affected=85000,
                    infrastructure_damage="5 village access roads submerged, 12 paddy storage facilities inundated.",
                    livestock_affected=1200,
                    created_by="Anitha Sundaram (Disaster Relief Officer)"
                ),
                Incident(
                    name="Thiruvallur Lake Breach Flood",
                    type="Flash Flood",
                    description="Pundi reservoir discharge exceeding 35,000 cusecs causing downstream village flooding.",
                    start_date="2026-09-03",
                    status="Active",
                    severity="High",
                    state="Tamil Nadu",
                    district="Thiruvallur",
                    taluk="Ponneri",
                    village="Minjur & Pulicat",
                    latitude=13.2544,
                    longitude=80.1983,
                    water_level=1.9,
                    population_affected=62000,
                    infrastructure_damage="Low-lying bridges cut off, coastal fishing hamlets inundated.",
                    livestock_affected=310,
                    created_by="Anitha Sundaram (Disaster Relief Officer)"
                ),
                Incident(
                    name="Kanyakumari Heavy Spate Surge",
                    type="Coastal Inundation",
                    description="High tidal surge coupled with Western Ghats runoff flooding low hamlets.",
                    start_date="2026-08-28",
                    status="Under Control",
                    severity="Moderate",
                    state="Tamil Nadu",
                    district="Kanyakumari",
                    taluk="Nagercoil",
                    village="Suchindram",
                    latitude=8.1558,
                    longitude=77.4660,
                    water_level=1.1,
                    population_affected=24000,
                    infrastructure_damage="Minor road erosion and localized drainage blockage.",
                    livestock_affected=85,
                    created_by="Dr. Rajesh Kumar (State Director)"
                ),
                Incident(
                    name="Madurai Vaigai River Surge",
                    type="Riverine Flood",
                    description="Excess dam release from Vaigai dam causing urban riverbank flooding.",
                    start_date="2026-08-30",
                    status="Resolved",
                    severity="Low",
                    state="Tamil Nadu",
                    district="Madurai",
                    taluk="Madurai South",
                    village="Sellur",
                    latitude=9.9252,
                    longitude=78.1198,
                    water_level=0.5,
                    population_affected=15000,
                    infrastructure_damage="Desalting required, minor silt accumulation on causeways.",
                    livestock_affected=20,
                    created_by="Anitha Sundaram (Disaster Relief Officer)"
                )
            ]
            db.add_all(incidents)
            db.commit()
            print("Incidents seeded successfully.")
            
        # 4. Seed Affected Locations
        inc1 = db.query(Incident).filter(Incident.name.ilike("%Michaung%")).first()
        inc2 = db.query(Incident).filter(Incident.name.ilike("%Kaveri%")).first()
        inc3 = db.query(Incident).filter(Incident.name.ilike("%Thiruvallur%")).first()
        
        inc1_id = inc1.id if inc1 else 1
        inc2_id = inc2.id if inc2 else 2
        inc3_id = inc3.id if inc3 else 3

        if db.query(AffectedLocation).count() == 0:
            locations = [
                AffectedLocation(incident_id=inc1_id, state="Tamil Nadu", district="Chennai", taluk="Velachery", village="Velachery West", population=35000, houses_affected=4200, roads_damaged=14, bridges_damaged=1, schools_affected=5, hospitals_affected=2, electricity_status="Disrupted", water_supply_status="Disrupted", communication_status="Partial", severity="Critical", remarks="Boat evacuation actively running."),
                AffectedLocation(incident_id=inc1_id, state="Tamil Nadu", district="Chennai", taluk="Tambaram", village="Mudichur", population=28000, houses_affected=3100, roads_damaged=10, bridges_damaged=0, schools_affected=4, hospitals_affected=1, electricity_status="Disrupted", water_supply_status="Disrupted", communication_status="Disrupted", severity="Critical", remarks="Severe water logging up to 5 feet."),
                AffectedLocation(incident_id=inc1_id, state="Tamil Nadu", district="Chennai", taluk="Perambur", village="Vyasarpadi", population=22000, houses_affected=2500, roads_damaged=8, bridges_damaged=1, schools_affected=3, hospitals_affected=1, electricity_status="Partial", water_supply_status="Disrupted", communication_status="Functional", severity="High", remarks="Subway completely submerged."),
                AffectedLocation(incident_id=inc2_id, state="Tamil Nadu", district="Cuddalore", taluk="Chidambaram", village="Bhuvanagiri", population=19000, houses_affected=1800, roads_damaged=6, bridges_damaged=2, schools_affected=2, hospitals_affected=0, electricity_status="Disrupted", water_supply_status="Disrupted", communication_status="Partial", severity="High", remarks="Paddy fields submerged under Kaveri overflow."),
                AffectedLocation(incident_id=inc2_id, state="Tamil Nadu", district="Cuddalore", taluk="Kurinjipadi", village="Vadalur Outer", population=15000, houses_affected=1200, roads_damaged=4, bridges_damaged=0, schools_affected=2, hospitals_affected=0, electricity_status="Functional", water_supply_status="Partial", communication_status="Functional", severity="Moderate", remarks="Relief kits distributed by local Tahsildar."),
                AffectedLocation(incident_id=inc3_id, state="Tamil Nadu", district="Thiruvallur", taluk="Ponneri", village="Minjur", population=24000, houses_affected=2900, roads_damaged=7, bridges_damaged=1, schools_affected=3, hospitals_affected=1, electricity_status="Disrupted", water_supply_status="Disrupted", communication_status="Partial", severity="High", remarks="Coastal inundation near salt pans."),
                AffectedLocation(incident_id=inc3_id, state="Tamil Nadu", district="Thiruvallur", taluk="Gummidipoondi", village="Pulicat", population=14000, houses_affected=1500, roads_damaged=5, bridges_damaged=0, schools_affected=2, hospitals_affected=0, electricity_status="Disrupted", water_supply_status="Disrupted", communication_status="Disrupted", severity="High", remarks="Fishing community isolated."),
                AffectedLocation(incident_id=inc1_id, state="Tamil Nadu", district="Chennai", taluk="Sholinganallur", village="Perungudi", population=31000, houses_affected=3800, roads_damaged=9, bridges_damaged=0, schools_affected=4, hospitals_affected=2, electricity_status="Partial", water_supply_status="Partial", communication_status="Functional", severity="Moderate", remarks="IT corridor flooded, pumping stations operational."),
                AffectedLocation(incident_id=inc2_id, state="Tamil Nadu", district="Cuddalore", taluk="Kattumannarkoil", village="Lalpet", population=12000, houses_affected=950, roads_damaged=3, bridges_damaged=0, schools_affected=1, hospitals_affected=0, electricity_status="Functional", water_supply_status="Functional", communication_status="Functional", severity="Low", remarks="Veeranam lake runoff strictly monitored."),
                AffectedLocation(incident_id=inc3_id, state="Tamil Nadu", district="Thiruvallur", taluk="Avadi", village="Pattabiram", population=18000, houses_affected=1600, roads_damaged=4, bridges_damaged=0, schools_affected=2, hospitals_affected=1, electricity_status="Functional", water_supply_status="Partial", communication_status="Functional", severity="Low", remarks="Water receding steadily.")
            ]
            db.add_all(locations)
            db.commit()
            print("Affected locations seeded successfully.")
            
        # 5. Seed Shelters
        if db.query(Shelter).count() == 0:
            shelters = [
                Shelter(shelter_name="Velachery Government Higher Sec School Relief Camp", location="Velachery Main Road", district="Chennai", address="100 Feet Bypass Road, Velachery, Chennai - 600042", capacity=600, current_occupancy=480, male_count=180, female_count=210, children_count=70, elderly_count=20, disabled_count=5, medical_facility=True, food_available=True, water_available=True, electricity_available=True, contact_person="R. Senthil", contact_number="+91 94441 12345", status="Available"),
                Shelter(shelter_name="Mudichur Community Hall Relief Shelter", location="Mudichur Road", district="Chennai", address="Near Bus Stand, Mudichur, Tambaram - 600048", capacity=400, current_occupancy=380, male_count=140, female_count=160, children_count=60, elderly_count=20, disabled_count=3, medical_facility=True, food_available=True, water_available=True, electricity_available=False, contact_person="M. Dhanasekar", contact_number="+91 94442 23456", status="Full"),
                Shelter(shelter_name="Chidambaram Annamalai University Gymnasium Camp", location="University Campus", district="Cuddalore", address="Annamalai Nagar, Chidambaram - 608002", capacity=800, current_occupancy=520, male_count=200, female_count=220, children_count=80, elderly_count=20, disabled_count=8, medical_facility=True, food_available=True, water_available=True, electricity_available=True, contact_person="Dr. G. Natarajan", contact_number="+91 94443 34567", status="Available"),
                Shelter(shelter_name="Ponneri Boys High School Shelter", location="High School Ground", district="Thiruvallur", address="Ponneri Town, Thiruvallur - 601204", capacity=350, current_occupancy=290, male_count=110, female_count=120, children_count=50, elderly_count=10, disabled_count=2, medical_facility=True, food_available=True, water_available=True, electricity_available=True, contact_person="K. Balaji", contact_number="+91 94444 45678", status="Available"),
                Shelter(shelter_name="Vyasarpadi Community Marriage Hall", location="MKB Nagar", district="Chennai", address="MKB Nagar 4th Main Rd, Vyasarpadi - 600039", capacity=300, current_occupancy=260, male_count=95, female_count=115, children_count=40, elderly_count=10, disabled_count=4, medical_facility=False, food_available=True, water_available=True, electricity_available=True, contact_person="S. Murugan", contact_number="+91 94445 56789", status="Available"),
                Shelter(shelter_name="Minjur Town Panchayat Indoor Stadium", location="Station Road", district="Thiruvallur", address="Near Railway Station, Minjur - 601203", capacity=500, current_occupancy=410, male_count=150, female_count=180, children_count=65, elderly_count=15, disabled_count=6, medical_facility=True, food_available=True, water_available=True, electricity_available=True, contact_person="P. Arumugam", contact_number="+91 94446 67890", status="Available"),
                Shelter(shelter_name="Suchindram Temple Kalyana Mandapam", location="Car Street", district="Kanyakumari", address="South Car Street, Suchindram - 629704", capacity=250, current_occupancy=90, male_count=35, female_count=40, children_count=10, elderly_count=5, disabled_count=1, medical_facility=True, food_available=True, water_available=True, electricity_available=True, contact_person="N. Ramakrishnan", contact_number="+91 94447 78901", status="Available"),
                Shelter(shelter_name="Sellur Municipal School Shelter", location="Riverbank Road", district="Madurai", address="Sellur Main Road, Madurai - 625002", capacity=200, current_occupancy=45, male_count=18, female_count=20, children_count=5, elderly_count=2, disabled_count=0, medical_facility=True, food_available=True, water_available=True, electricity_available=True, contact_person="V. Meenakshi", contact_number="+91 94448 89012", status="Available")
            ]
            db.add_all(shelters)
            db.commit()
            print("Shelters seeded successfully.")
            
        # 6. Seed Rescue Teams
        if db.query(RescueTeam).count() == 0:
            teams = [
                RescueTeam(team_name="NDRF Battalion 4 - Alpha Team", team_leader="Inspector Vijay Kumar", contact_number="+91 98111 22334", team_type="NDRF", members_count=18, assigned_incident_id=inc1_id, current_location="Velachery Main Bridge", vehicle="Inflatable Motor Boat & Heavy Rescue Truck", boat_available=True, medical_support=True, status="Deployed"),
                RescueTeam(team_name="NDRF Battalion 4 - Bravo Team", team_leader="Sub-Inspector Manoj Sharma", contact_number="+91 98111 22335", team_type="NDRF", members_count=16, assigned_incident_id=inc1_id, current_location="Mudichur Lake Side", vehicle="Rigid Inflatable Boat", boat_available=True, medical_support=True, status="Deployed"),
                RescueTeam(team_name="SDRF Tamil Nadu Unit 1", team_leader="Superintendent S. Alagarsamy", contact_number="+91 94422 33445", team_type="SDRF", members_count=25, assigned_incident_id=inc2_id, current_location="Chidambaram Bus Stand", vehicle="Flood Rescue Amphibious Vehicle", boat_available=True, medical_support=False, status="Deployed"),
                RescueTeam(team_name="Indian Coast Guard Helicopter Rescue Unit", team_leader="Commandant A. K. Tyagi", contact_number="+91 98700 11223", team_type="Coast Guard", members_count=8, assigned_incident_id=inc1_id, current_location="INS Adyar Base", vehicle="ALH Dhruv Helicopter", boat_available=False, medical_support=True, status="On Mission"),
                RescueTeam(team_name="Fire & Rescue Services Chennai Metro", team_leader="Station Officer P. Elangovan", contact_number="+91 94450 00101", team_type="Fire & Rescue", members_count=20, assigned_incident_id=inc1_id, current_location="Vyasarpadi Subway", vehicle="High-Capacity Dewatering Truck & Dinghy", boat_available=True, medical_support=False, status="Deployed"),
                RescueTeam(team_name="SDRF Thiruvallur Rapid Action Team", team_leader="Inspector R. Saravanan", contact_number="+91 94422 33446", team_type="SDRF", members_count=15, assigned_incident_id=inc3_id, current_location="Ponneri Town Hall", vehicle="Rescue Truck & 2 Power Boats", boat_available=True, medical_support=True, status="Deployed"),
                RescueTeam(team_name="Indian Red Cross Volunteer Corps", team_leader="Dr. S. Sundari", contact_number="+91 98400 55667", team_type="NGO Volunteer", members_count=30, assigned_incident_id=inc1_id, current_location="Velachery Shelter", vehicle="Ambulance & Mobile Kitchen Bus", boat_available=False, medical_support=True, status="Available"),
                RescueTeam(team_name="Fishermen Emergency Rescue Brigade - Pulicat", team_leader="Captain N. Kasi", contact_number="+91 98410 99887", team_type="Local Fishermen Brigade", members_count=40, assigned_incident_id=inc3_id, current_location="Pulicat Estuary", vehicle="12 Motorized Mechanized Trawlers", boat_available=True, medical_support=False, status="Deployed"),
                RescueTeam(team_name="Home Guard Emergency Battalion", team_leader="Commander T. Mohan", contact_number="+91 94433 11224", team_type="Home Guard", members_count=22, assigned_incident_id=inc2_id, current_location="Bhuvanagiri Main Road", vehicle="Personnel Carrier Trucks", boat_available=False, medical_support=False, status="Available"),
                RescueTeam(team_name="Medical Corps Rapid Mobile Unit", team_leader="Dr. A. Anand", contact_number="+91 98402 33445", team_type="Medical Response", members_count=10, assigned_incident_id=inc1_id, current_location="Perungudi Sector", vehicle="2 Advanced Life Support Ambulances", boat_available=False, medical_support=True, status="Available")
            ]
            db.add_all(teams)
            db.commit()
            print("Rescue teams seeded successfully.")
            
        # Get IDs for relationships
        team1 = db.query(RescueTeam).filter(RescueTeam.team_name.ilike("%Alpha%")).first()
        shelter1 = db.query(Shelter).filter(Shelter.shelter_name.ilike("%Velachery%")).first()
        team1_id = team1.id if team1 else 1
        shelter1_id = shelter1.id if shelter1 else 1

        # 7. Seed Rescued Persons (30 records)
        if db.query(RescuedPerson).count() == 0:
            rescued_list = []
            names = [
                ("K. Subramani", 54, "Male", "Tambaram", "Stable", "Identified"),
                ("Lakshmi Ammal", 68, "Female", "Velachery", "Needs Medication", "Identified"),
                ("S. Karthik", 12, "Male", "Mudichur", "Stable", "Identified"),
                ("Meena Kumari", 29, "Female", "Vyasarpadi", "Hypothermia", "Identified"),
                ("R. Pandian", 41, "Male", "Bhuvanagiri", "Minor Injuries", "Identified"),
                ("Unknown Male Child", 7, "Male", "Velachery Waterways", "Dehydrated", "Unidentified"),
                ("A. Doss", 62, "Male", "Ponneri", "Stable", "Identified"),
                ("Gowri Shankar", 35, "Male", "Minjur", "Stable", "Identified"),
                ("Saraswathi N.", 74, "Female", "Mudichur", "Critical - Asthma", "Identified"),
                ("V. Anand", 22, "Male", "Velachery", "Stable", "Identified"),
                ("J. Mary", 31, "Female", "Vyasarpadi", "Pregnant - Stable", "Identified"),
                ("T. Selvam", 47, "Male", "Bhuvanagiri", "Stable", "Identified"),
                ("Deepa R.", 19, "Female", "Perungudi", "Stable", "Identified"),
                ("Unknown Elderly Female", 71, "Female", "Mudichur Suburb", "Disoriented", "Unidentified"),
                ("K. Srinivasan", 50, "Male", "Velachery", "Fracture Arm", "Identified"),
                ("B. Revathi", 38, "Female", "Pulicat", "Stable", "Identified"),
                ("M. Praveen", 14, "Male", "Ponneri", "Stable", "Identified"),
                ("S. Jayanthi", 45, "Female", "Bhuvanagiri", "Stable", "Identified"),
                ("G. Raghu", 28, "Male", "Perungudi", "Minor Cut Wounds", "Identified"),
                ("V. Vimala", 58, "Female", "Mudichur", "Diabetes Emergency", "Identified"),
                ("R. Loganathan", 63, "Male", "Vyasarpadi", "Stable", "Identified"),
                ("N. Bharathi", 27, "Female", "Velachery", "Stable", "Identified"),
                ("D. Dinesh", 9, "Male", "Bhuvanagiri", "Stable", "Identified"),
                ("P. Suganya", 33, "Female", "Minjur", "Stable", "Identified"),
                ("C. Ganesan", 52, "Male", "Pulicat", "Stable", "Identified"),
                ("S. Uma", 40, "Female", "Velachery", "Stable", "Identified"),
                ("K. Murali", 36, "Male", "Tambaram", "Stable", "Identified"),
                ("A. Kamala", 66, "Female", "Suchindram", "Stable", "Identified"),
                ("M. Durai", 49, "Male", "Sellur", "Stable", "Identified"),
                ("T. Kavittha", 25, "Female", "Perungudi", "Stable", "Identified")
            ]
            
            for idx, (pname, age, gender, loc, cond, ident) in enumerate(names):
                r_person = RescuedPerson(
                    incident_id=inc1_id if idx % 2 == 0 else inc2_id,
                    person_name=pname,
                    age=age,
                    gender=gender,
                    phone=f"+91 9840{idx:05d}",
                    address=f"Door {idx+12}, {loc}, Tamil Nadu",
                    location=loc,
                    rescue_date=f"2026-09-0{(idx%4)+1}",
                    rescue_time=f"{8+(idx%10):02d}:30 AM",
                    rescue_team_id=team1_id,
                    current_status="In Shelter" if idx % 3 == 0 else "Rescued",
                    medical_condition=cond,
                    shelter_id=shelter1_id,
                    identification_status=ident,
                    remarks="Evacuated safely via motorboat."
                )
                rescued_list.append(r_person)
            db.add_all(rescued_list)
            db.commit()
            print("Rescued persons seeded successfully.")
            
        # 8. Seed Missing Persons (15 records)
        if db.query(MissingPerson).count() == 0:
            missing_data = [
                ("R. Manikandan", 42, "Male", "Velachery Main Market", "2026-09-01", "K. Banumathi (Wife)", "+91 98401 99112", "Missing", "Swept by sudden undercurrent near lake outlet."),
                ("S. Divya", 17, "Female", "Mudichur Bus Stop", "2026-09-01", "S. Ramesh (Father)", "+91 98401 99113", "Missing", "Was returning from college before flood waters surged."),
                ("V. Murugesan", 65, "Male", "Bhuvanagiri Causeway", "2026-09-02", "M. Velu (Son)", "+91 98401 99114", "Search In Progress", "Last seen sitting near farm shelter."),
                ("A. Farooq", 28, "Male", "Vyasarpadi Subway", "2026-09-01", "F. Yasmin (Sister)", "+91 98401 99115", "Missing", "Car got stalled in submerged subway."),
                ("P. Kowsalya", 23, "Female", "Perungudi Toll Plaza", "2026-09-02", "P. Sitaraman (Father)", "+91 98401 99116", "Traced Safe", "Found at local relative home in Thoraipakkam."),
                ("K. Palani", 58, "Male", "Minjur Salt Pans", "2026-09-03", "P. Guna (Son)", "+91 98401 99117", "Missing", "Guard duty at salt storehouse during embankment breach."),
                ("G. Baskar", 39, "Male", "Pulicat Jetty", "2026-09-03", "B. Janaki (Wife)", "+91 98401 99118", "Search In Progress", "Boat drifted into bay area."),
                ("T. Nithya", 31, "Female", "Velachery 100ft Road", "2026-09-01", "T. Rajesh (Husband)", "+91 98401 99119", "Missing", "Evacuating home with family, slipped into channel."),
                ("M. Mohan", 11, "Male", "Tambaram Park", "2026-09-01", "M. Sundari (Mother)", "+91 98401 99120", "Traced Safe", "Rescued by NDRF and admitted to Tambaram GH."),
                ("S. Kumar", 50, "Male", "Chidambaram Bypass", "2026-09-02", "K. Radha (Wife)", "+91 98401 99121", "Missing", "Tractor washed away by Kaveri flood spill."),
                ("D. Arul", 45, "Male", "Vyasarpadi Market", "2026-09-01", "A. Mary (Wife)", "+91 98401 99122", "Missing", "Attempted to move shop inventory."),
                ("B. Lavanya", 20, "Female", "Ponneri Station", "2026-09-03", "B. Chellappan (Father)", "+91 98401 99123", "Search In Progress", "NDRF team searching canal banks."),
                ("C. Swaminathan", 72, "Male", "Mudichur Temple", "2026-09-01", "S. Ganesh (Son)", "+91 98401 99124", "Missing", "Suffering from dementia, walked out during storm."),
                ("K. Preeti", 26, "Female", "Perungudi Canal", "2026-09-02", "K. Ashok (Brother)", "+91 98401 99125", "Missing", "Scooter swept into storm drain."),
                ("J. Solomon", 34, "Male", "Minjur High Road", "2026-09-03", "J. Esther (Wife)", "+91 98401 99126", "Missing", "Volunteering for relief kit distribution.")
            ]
            
            for pname, age, gender, loc, ldate, rname, rphone, st, notes in missing_data:
                m_person = MissingPerson(
                    person_name=pname,
                    age=age,
                    gender=gender,
                    phone=f"+91 9790{age:05d}",
                    address=f"Near {loc}, Tamil Nadu",
                    last_seen_location=loc,
                    last_seen_date=ldate,
                    incident_id=inc1_id if "Velachery" in loc or "Mudichur" in loc or "Tambaram" in loc else inc2_id,
                    reporter_name=rname,
                    reporter_phone=rphone,
                    status=st,
                    search_notes=notes,
                    assigned_team_id=team1_id
                )
                db.add(m_person)
            db.commit()
            print("Missing persons seeded successfully.")
            
        # 9. Seed Resources
        if db.query(Resource).count() == 0:
            resources = [
                Resource(resource_name="Drinking Water 20L Cans", category="Water & Sanitation", unit="Cans", total_quantity=5000, allocated_quantity=3200, used_quantity=1100, minimum_required=1500, location="Central Relief Godown, Chennai", supplier="Tamil Nadu Water Supply Board"),
                Resource(resource_name="Ready-to-Eat Food Packets", category="Food Rations", unit="Packets", total_quantity=15000, allocated_quantity=11000, used_quantity=3500, minimum_required=3000, location="Tambaram Relief Depot", supplier="Akshaya Patra Foundation"),
                Resource(resource_name="Inflatable Motor Rescue Boats", category="Rescue Equipment", unit="Boats", total_quantity=45, allocated_quantity=38, used_quantity=0, minimum_required=10, location="NDRF Arakkonam Base Depot", supplier="L&T Shipbuilding Division"),
                Resource(resource_name="Life Jackets (ISO Certified)", category="Safety Gear", unit="Pieces", total_quantity=2500, allocated_quantity=1800, used_quantity=400, minimum_required=500, location="SDRF Central Store", supplier="Usha Fire Safety Equipments"),
                Resource(resource_name="Emergency Milk Powder Pouches", category="Infant Nutrition", unit="Kg", total_quantity=800, allocated_quantity=650, used_quantity=100, minimum_required=300, location="Velachery Relief Center", supplier="Aavin Milk Co-operative"),
                Resource(resource_name="Heavy-Duty Submersible Dewatering Pumps", category="Infrastructure Machinery", unit="Pumps", total_quantity=60, allocated_quantity=52, used_quantity=0, minimum_required=15, location="GCC Engineering Store", supplier="Kirloskar Brothers Ltd"),
                Resource(resource_name="Tarpaulins & Rain Shelters (12x18 ft)", category="Shelter Materials", unit="Sheets", total_quantity=3500, allocated_quantity=2800, used_quantity=500, minimum_required=800, location="Cuddalore Collectorate Yard", supplier="Co-optex Relief Wing"),
                Resource(resource_name="First Aid & Trauma Kits", category="Medical Supplies", unit="Kits", total_quantity=1200, allocated_quantity=950, used_quantity=200, minimum_required=400, location="State Medical Depot, Guindy", supplier="Tamil Nadu Medical Services Corp"),
                Resource(resource_name="Emergency Diesel Generators (15 kVA)", category="Power & Lighting", unit="Generators", total_quantity=35, allocated_quantity=31, used_quantity=0, minimum_required=10, location="GCC Electricity Wing", supplier="Ashok Leyland Power Solutions"),
                Resource(resource_name="Blankets & Bedding Sets", category="Comfort & Clothing", unit="Sets", total_quantity=6000, allocated_quantity=4500, used_quantity=1000, minimum_required=1200, location="Thiruvallur Relief Depot", supplier="Co-optex Relief Wing"),
                Resource(resource_name="Sanitary & Hygiene Kits for Women", category="Sanitation & Hygiene", unit="Kits", total_quantity=4000, allocated_quantity=2900, used_quantity=800, minimum_required=1000, location="Velachery Shelter", supplier="UNICEF India Relief"),
                Resource(resource_name="Bleaching Powder & Disinfectant Bags", category="Public Health", unit="Bags (25kg)", total_quantity=1000, allocated_quantity=750, used_quantity=200, minimum_required=300, location="Cuddalore Health Office", supplier="TN Health Department"),
                Resource(resource_name="High-Intensity Search Lights", category="Safety Gear", unit="Units", total_quantity=200, allocated_quantity=160, used_quantity=0, minimum_required=50, location="NDRF Camp", supplier="Philips Lighting India"),
                Resource(resource_name="ORS & Electrolyte Packets", category="Medical Supplies", unit="Box (100 pkts)", total_quantity=1500, allocated_quantity=1100, used_quantity=300, minimum_required=500, location="State Medical Depot", supplier="CIPLA Pharmaceuticals"),
                Resource(resource_name="Submersible High-Flow Water Purifiers", category="Water & Sanitation", unit="Units", total_quantity=25, allocated_quantity=20, used_quantity=0, minimum_required=8, location="Thiruvallur Collectorate", supplier="Eureka Forbes Industrial")
            ]
            db.add_all(resources)
            db.commit()
            print("Resources seeded successfully.")
            
        # 10. Seed Medical Requirements (15 records)
        if db.query(MedicalRequirement).count() == 0:
            meds = [
                MedicalRequirement(incident_id=inc1_id, location="Velachery Relief Camp", patient_name="Saraswathi N.", age=74, gender="Female", medical_condition="Severe Bronchial Asthma & Oxygen Dip", severity="Critical", medicine_required="Nebulizer Machine & Salbutamol Inhaler, Oxygen Cylinder", quantity=2, doctor_team="Dr. Priya Venkatesh (Mobile Unit 1)", hospital="KMC General Hospital", status="In Progress", remarks="Patient stabilized with emergency oxygen."),
                MedicalRequirement(incident_id=inc1_id, location="Mudichur Community Shelter", patient_name="V. Vimala", age=58, gender="Female", medical_condition="Uncontrolled Type-2 Diabetes Hypoglycemia", severity="Critical", medicine_required="Human Insulin Injection & 25% Dextrose IV", quantity=5, doctor_team="Dr. A. Anand (Medical Corps)", hospital="Tambaram GH", status="Pending", remarks="Urgent insulin supply needed."),
                MedicalRequirement(incident_id=inc1_id, location="Vyasarpadi Camp", patient_name="J. Mary", age=31, gender="Female", medical_condition="Full-Term Pregnancy Contractions", severity="Critical", medicine_required="Obstetric Emergency Kit & Ambulance Evacuation", quantity=1, doctor_team="108 Ambulance Medical Team", hospital="ISO Maternity Hospital Egmore", status="Resolved", remarks="Safely transferred to Egmore Maternity Hospital."),
                MedicalRequirement(incident_id=inc2_id, location="Annamalai University Camp", patient_name="R. Pandian", age=41, gender="Male", medical_condition="Deep Laceration Wound on Right Foot", severity="High", medicine_required="Tetanus Toxoid Injection & Suturing Kit, Amoxicillin 500mg", quantity=10, doctor_team="Dr. G. Natarajan (Chidambaram Medical Officer)", hospital="Rajah Muthiah Medical College", status="Resolved", remarks="Wound sutured and dressed."),
                MedicalRequirement(incident_id=inc1_id, location="Velachery West", patient_name="K. Srinivasan", age=50, gender="Male", medical_condition="Fractured Forearm due to Debris Collapse", severity="High", medicine_required="Crepe Bandage, Arm Sling Splint, Paracetamol 650mg", quantity=3, doctor_team="Dr. Priya Venkatesh Unit", hospital="Royapettah GH", status="In Progress", remarks="Arm immobilized with splint."),
                MedicalRequirement(incident_id=inc3_id, location="Minjur Camp", patient_name="Group of 12 Children", age=8, gender="Mixed", medical_condition="Acute Waterborne Gastroenteritis", severity="High", medicine_required="ORS Soluble Packets, Zinc Tablets, Metronidazole Syrup", quantity=50, doctor_team="Thiruvallur Mobile Health Van", hospital="Ponneri GH", status="In Progress", remarks="ORS distribution started."),
                MedicalRequirement(incident_id=inc2_id, location="Bhuvanagiri Village", patient_name="General Community", age=35, gender="Mixed", medical_condition="Skin Fungal Rash due to Flood Contact", severity="Moderate", medicine_required="Clotrimazole Ointment & Antihistamine Cetirizine 10mg", quantity=100, doctor_team="Cuddalore District Health Wing", hospital="Chidambaram GH", status="Pending", remarks="Bulk ointment delivery dispatched."),
                MedicalRequirement(incident_id=inc1_id, location="Mudichur Shelter", patient_name="R. Senthil", age=49, gender="Male", medical_condition="High Fever & Chills (Suspected Leptospirosis)", severity="High", medicine_required="Doxycycline 100mg Capsules & Paracetamol", quantity=40, doctor_team="Dr. A. Anand", hospital="Tambaram GH", status="Pending", remarks="Prophylactic doxycycline started."),
                MedicalRequirement(incident_id=inc3_id, location="Pulicat Fishing Hamlet", patient_name="Elderly Villagers", age=65, gender="Mixed", medical_condition="Hypertension Medication Exhaustion", severity="Moderate", medicine_required="Amlodipine 5mg & Telmisartan 40mg Tablets", quantity=200, doctor_team="Red Cross Mobile Doctor", hospital="Ponneri GH", status="Pending", remarks="Refill needed for regular heart patients."),
                MedicalRequirement(incident_id=inc1_id, location="Perungudi Sector", patient_name="G. Raghu", age=28, gender="Male", medical_condition="Infected Cut Wounds", severity="Moderate", medicine_required="Antiseptic Betadine Ointment & Bandages", quantity=15, doctor_team="Volunteer Medical Corp", hospital="Adyar Medical Center", status="Resolved", remarks="Dressed and given antibiotics."),
                MedicalRequirement(incident_id=inc2_id, location="Lalpet Center", patient_name="Infants in Camp", age=1, gender="Mixed", medical_condition="Infant Diarrhea & Dehydration", severity="High", medicine_required="Pediatric Electrolyte & Zinc Drops", quantity=30, doctor_team="District Child Specialist", hospital="Cuddalore GH", status="Resolved", remarks="Dehydration reversed."),
                MedicalRequirement(incident_id=inc1_id, location="Vyasarpadi Shelter", patient_name="R. Loganathan", age=63, gender="Male", medical_condition="Coronary Artery Disease Angina Mild Pain", severity="High", medicine_required="Sorbitrate 5mg & Aspirin 75mg Emergency Dose", quantity=5, doctor_team="108 Cardiac Unit", hospital="Stanley Medical College", status="Resolved", remarks="ECG taken, stable under observation."),
                MedicalRequirement(incident_id=inc3_id, location="Ponneri Shelter", patient_name="Community Camp", age=25, gender="Mixed", medical_condition="Eye Conjunctivitis Infection Spread", severity="Moderate", medicine_required="Ciprofloxacin Eye Drops 0.3%", quantity=60, doctor_team="Ponneri Primary Health Center", hospital="Ponneri GH", status="Pending", remarks="Eye drops required to prevent camp outbreak."),
                MedicalRequirement(incident_id=inc1_id, location="Velachery Shelter", patient_name="Meena Kumari", age=29, gender="Female", medical_condition="Hypothermia Recovery", severity="Moderate", medicine_required="Warm IV Fluids & Thermal Blanket", quantity=2, doctor_team="Dr. Priya Venkatesh", hospital="KMC General Hospital", status="Resolved", remarks="Body temperature restored."),
                MedicalRequirement(incident_id=inc2_id, location="Vadalur Outer", patient_name="Local Field Workers", age=40, gender="Male", medical_condition="Leech and Insect Bites", severity="Low", medicine_required="Calamine Lotion & Antiseptic Cream", quantity=25, doctor_team="Mobile Health Van", hospital="Vadalur PHC", status="Resolved", remarks="Treated on spot.")
            ]
            db.add_all(meds)
            db.commit()
            print("Medical requirements seeded successfully.")
            
        # 11. Seed Relief Activities (10 records)
        if db.query(ReliefActivity).count() == 0:
            reliefs = [
                ReliefActivity(incident_id=inc1_id, activity_type="Food & Water Distribution", description="Airdrop and boat distribution of 5,000 cooked food packets and drinking water.", location="Velachery West & Inner Streets", date="2026-09-02", responsible_org="GCC & NDRF Joint Task Force", team_id=team1_id, people_served=4500, resources_used="5000 Food Packets, 1000 Water Cans", status="Completed", remarks="Covered all cut-off apartment complexes."),
                ReliefActivity(incident_id=inc1_id, activity_type="Boat Evacuation Operation", description="Rescuing stranded families from second-floor balconies using motorized inflatable boats.", location="Mudichur Lake Avenue", date="2026-09-02", responsible_org="NDRF Battalion 4", team_id=team1_id, people_served=1200, resources_used="6 Inflatable Motor Boats", status="Completed", remarks="Evacuated 380 senior citizens and children."),
                ReliefActivity(incident_id=inc2_id, activity_type="Medical Health Camp", description="Setting up free emergency health triage camp with doctors and free medicine distribution.", location="Annamalai University Gym Camp", date="2026-09-03", responsible_org="Tamil Nadu Health Department", team_id=None, people_served=850, resources_used="Medical Kits, ORS, Antibiotics", status="Completed", remarks="Treated skin infections and gastroenteritis."),
                ReliefActivity(incident_id=inc1_id, activity_type="Dewatering Pumping Operation", description="Deploying 100 HP heavy submersibles to clear water from flooded electrical substations.", location="Velachery Main Substation", date="2026-09-03", responsible_org="TANGEDCO & GCC Engineering", team_id=None, people_served=35000, resources_used="6 Heavy Submersible Dewatering Pumps", status="In Progress", remarks="Water level reduced by 1.5 feet."),
                ReliefActivity(incident_id=inc3_id, activity_type="Dry Ration Kit Distribution", description="Distributing 15-day family survival kits (Rice, Dal, Oil, Spices, Candles).", location="Minjur Town Hall Shelter", date="2026-09-03", responsible_org="Indian Red Cross Society", team_id=None, people_served=2200, resources_used="800 Dry Ration Family Kits", status="Completed", remarks="Organized orderly token distribution."),
                ReliefActivity(incident_id=inc1_id, activity_type="Helicopter Search & Rescue", description="Airdropping life jackets and winching elderly patients stranded on terrace tops.", location="Perungudi IT Corridor Sector", date="2026-09-02", responsible_org="Indian Coast Guard Air Squadron", team_id=None, people_served=45, resources_used="1 Helicopter, 50 Life Jackets", status="Completed", remarks="Air-lifted 4 critical dialysis patients."),
                ReliefActivity(incident_id=inc2_id, activity_type="Cattle & Livestock Rescue", description="Moving cattle herds to elevated bunds and providing fodder green grass.", location="Bhuvanagiri Rural Tracts", date="2026-09-03", responsible_org="Veterinary Department Cuddalore", team_id=None, people_served=300, resources_used="5 Tons Cattle Feed Fodder", status="In Progress", remarks="Rescued 420 cows and buffaloes."),
                ReliefActivity(incident_id=inc3_id, activity_type="Coastal Fishermen Escort Service", description="Deploying mechanized trawlers to navigate flooded estuaries and bring emergency supplies.", location="Pulicat Lagoon", date="2026-09-03", responsible_org="Pulicat Fishermen Brigade", team_id=None, people_served=1800, resources_used="12 Trawlers, Fuel Subsidies", status="Completed", remarks="Supplied 3 villages across lagoon."),
                ReliefActivity(incident_id=inc1_id, activity_type="Sanitation & Bleaching Spray", description="Disinfecting flood-receding streets with bleaching powder to prevent cholera/typhoid.", location="Vyasarpadi Market & MKB Nagar", date="2026-09-04", responsible_org="GCC Public Health Department", team_id=None, people_served=15000, resources_used="150 Bags Bleaching Powder", status="In Progress", remarks="Sanitation drive actively running."),
                ReliefActivity(incident_id=inc1_id, activity_type="Mobile Charging & Solar Lamp Drive", description="Deploying mobile generator vans for public mobile phone charging and solar lamp distribution.", location="Tambaram Bus Terminus Camp", date="2026-09-03", responsible_org="Disaster Volunteer Forum", team_id=None, people_served=3000, resources_used="2 Mobile Generators, 300 Solar Lamps", status="Completed", remarks="Restored communication for 3,000 citizens.")
            ]
            db.add_all(reliefs)
            db.commit()
            print("Relief activities seeded successfully.")
            
        # 12. Seed Audit Logs (10 records)
        if db.query(AuditLog).count() == 0:
            logs = [
                AuditLog(user_name="System Initializer", action="SYSTEM_INIT", module="System", record_id="0", details="Database schema initialized and seed data populated successfully.", ip_address="127.0.0.1"),
                AuditLog(user_name="Dr. Rajesh Kumar (State Director)", action="CREATE", module="Incidents", record_id="1", details="Created incident 'Cyclone Michaung Severe Inundation' in Chennai", ip_address="192.168.1.10"),
                AuditLog(user_name="Anitha Sundaram (Disaster Relief Officer)", action="CREATE", module="Incidents", record_id="2", details="Created incident 'Kaveri Basin Delta Overflow' in Cuddalore", ip_address="192.168.1.15"),
                AuditLog(user_name="Anitha Sundaram (Disaster Relief Officer)", action="CREATE", module="Shelters", record_id="1", details="Opened relief shelter 'Velachery Government Higher Sec School Relief Camp'", ip_address="192.168.1.15"),
                AuditLog(user_name="Cmdr. Vikram Singh (NDRF Battalion 4)", action="CREATE", module="Rescue Teams", record_id="1", details="Registered NDRF Battalion 4 - Alpha Team for emergency deployment", ip_address="192.168.1.20"),
                AuditLog(user_name="Cmdr. Vikram Singh (NDRF Battalion 4)", action="CREATE", module="Rescued Persons", record_id="1", details="Registered rescued person 'K. Subramani' into Velachery Shelter", ip_address="192.168.1.20"),
                AuditLog(user_name="Dr. Priya Venkatesh (Chief Medical Coordinator)", action="CREATE", module="Medical Requirements", record_id="1", details="Logged emergency asthma request for Saraswathi N.", ip_address="192.168.1.25"),
                AuditLog(user_name="Anitha Sundaram (Disaster Relief Officer)", action="CREATE", module="Resources", record_id="1", details="Allocated 3,200 drinking water cans to Chennai shelters", ip_address="192.168.1.15"),
                AuditLog(user_name="Cmdr. Vikram Singh (NDRF Battalion 4)", action="CREATE", module="Relief Activities", record_id="1", details="Completed food & water distribution in Velachery West", ip_address="192.168.1.20"),
                AuditLog(user_name="Dr. Rajesh Kumar (State Director)", action="GENERATE_REPORT", module="Reports", record_id="SUMMARY-01", details="Generated State Executive Disaster Summary PDF", ip_address="192.168.1.10")
            ]
            db.add_all(logs)
            db.commit()
            print("Audit logs seeded successfully.")
            
        print("DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
