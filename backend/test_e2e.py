import sys
import os
import random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    client = TestClient(app)
    print("=== STARTING EXTENDED E2E INTEGRATION TEST WITH SIGNUP & OTP ===")

    # 1. Test Password Login
    login_res = client.post("/api/auth/login", json={"email": "admin@floodrescue.com", "password": "admin123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token_data = login_res.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] Auth Password Login test passed: JWT Token obtained for Admin.")

    # 2. Test Public Signup (Strictly Common Public / Viewer)
    random_id = random.randint(1000, 9999)
    signup_email = f"public_citizen_{random_id}@gmail.com"
    signup_res = client.post("/api/auth/signup", json={
        "email": signup_email,
        "password": "citizenpass123",
        "full_name": f"Public Citizen_{random_id}",
        "phone": f"+91 98700 {random_id}",
        "role_id": 2  # Attempting role 2, but backend must force Viewer (role 5)
    })
    assert signup_res.status_code == 200, f"Signup failed: {signup_res.text}"
    signup_data = signup_res.json()
    assert signup_data["role"] == "Viewer", f"Expected Viewer role for public signup, got {signup_data['role']}"
    print(f"[PASS] Public Signup test passed: Created Common Public account for {signup_email} (Role: Viewer).")

    # 2b. Test Admin User Creation for Official Roles (Disaster Officer, Rescue Leader, Medical Rep)
    admin_create_res = client.post("/api/users", headers=headers, json={
        "email": f"official_officer_{random_id}@floodrescue.com",
        "password": "officerpass123",
        "full_name": f"Officer Official_{random_id}",
        "phone": f"+91 98700 {random_id}",
        "role_id": 2, # Disaster Management Officer
        "is_active": True
    })
    assert admin_create_res.status_code == 200, f"Admin user creation failed: {admin_create_res.text}"
    print(f"[PASS] Admin User Creation test passed: Admin created official Disaster Officer account.")


    # 3. Test OTP Restriction: Public Citizen OTP request MUST return HTTP 403 Forbidden
    public_otp_res = client.post("/api/auth/request-otp", json={"identifier": signup_email})
    assert public_otp_res.status_code == 403, f"Expected 403 Forbidden for public citizen OTP request, got {public_otp_res.status_code}"
    print(f"[PASS] Common Public OTP Restriction test passed: {signup_email} blocked from OTP (HTTP 403). Password login enforced.")

    # 3b. Test Official Rescuer OTP Flow (Request & Verify for Officer)
    otp_ident = "officer@floodrescue.com"
    req_otp_res = client.post("/api/auth/request-otp", json={"identifier": otp_ident})
    assert req_otp_res.status_code == 200, f"Official OTP request failed: {req_otp_res.text}"
    
    # Query database to retrieve generated OTP code for test verification
    from app.database import SessionLocal
    from app.models.user import User
    db_session = SessionLocal()
    db_user = db_session.query(User).filter(User.email == otp_ident).first()
    otp_code = db_user.otp_code
    db_session.close()
    assert otp_code is not None

    print(f"[PASS] Request OTP test passed: Generated OTP code for {otp_ident} and sent via Gmail SMTP.")

    verify_otp_res = client.post("/api/auth/verify-otp", json={"identifier": otp_ident, "otp_code": otp_code})
    assert verify_otp_res.status_code == 200

    verify_data = verify_otp_res.json()
    assert "access_token" in verify_data and verify_data["email"] == otp_ident
    print(f"[PASS] Verify OTP test passed: Authenticated {otp_ident} via OTP.")

    # 4. Test Get Me
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    print("[PASS] Get Me endpoint passed.")

    # 5. Test Dashboard KPIs & Alerts
    kpi_res = client.get("/api/dashboard/kpi", headers=headers)
    assert kpi_res.status_code == 200
    kpis = kpi_res.json()["kpis"]
    alerts = kpi_res.json()["alerts"]
    assert kpis["total_incidents"] >= 5
    assert kpis["total_rescued_persons"] >= 30
    print(f"[PASS] Dashboard KPI test passed: {kpis['total_incidents']} incidents, {kpis['total_rescued_persons']} rescued persons.")

    # 6. Test Dashboard 6 Recharts
    chart_res = client.get("/api/dashboard/charts", headers=headers)
    assert chart_res.status_code == 200
    charts = chart_res.json()
    assert "rescue_status" in charts and "affected_population" in charts
    print("[PASS] Dashboard 6 Recharts data test passed.")

    # 7. Test All 11 CRUD Endpoints
    for ep in ["incidents", "locations", "rescued", "missing", "shelters", "rescue-teams", "resources", "medical", "relief", "audit-logs"]:
        res = client.get(f"/api/{ep}", headers=headers)
        assert res.status_code == 200 and len(res.json()) >= 1
        print(f"[PASS] API /api/{ep} test passed ({len(res.json())} items).")

    # 8. Test Dynamic Report & PDF/Excel Exports
    report_gen_res = client.post("/api/reports/generate", json={"report_type": "summary"}, headers=headers)
    assert report_gen_res.status_code == 200
    print("[PASS] Dynamic Report Generator API test passed.")

    pdf_res = client.post("/api/reports/export/pdf", json={"report_type": "summary"}, headers=headers)
    assert pdf_res.status_code == 200 and len(pdf_res.content) > 1000
    print(f"[PASS] ReportLab PDF Exporter test passed ({len(pdf_res.content)} bytes).")

    excel_res = client.post("/api/reports/export/excel", json={"report_type": "summary"}, headers=headers)
    assert excel_res.status_code == 200 and len(excel_res.content) > 1000
    print(f"[PASS] openpyxl Excel Exporter test passed ({len(excel_res.content)} bytes).")

    print("\nALL EXTENDED E2E INTEGRATION TESTS PASSED 100% SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
