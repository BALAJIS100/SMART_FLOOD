# 🌊 Flood Rescue Data Management & Dynamic Reporting System

> **Safer People • Stronger Communities**  
> *Prepare • Respond • Recover*

A full-stack, enterprise-grade web application designed for state disaster management authorities, NDRF/SDRF rescue teams, medical coordinators, NGOs, and citizens to collect, manage, analyze, visualize, and report flood rescue operations in real time.

---

## 🎨 Official System Logo

![Flood Rescue Management System Logo](frontend/public/logo.jpg)

---

## 🚀 Tech Stack & Architecture

| Tier | Technologies | Highlights |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Recharts, Lucide Icons | Modern, responsive SPA with real-time alert banners, 6 visual charts, and dark command center styling. |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 | High-performance asynchronous RESTful API framework with interactive OpenAPI Swagger documentation. |
| **Database** | PostgreSQL & SQLAlchemy 2.0 ORM | Production PostgreSQL database (`smart_flood`) with automatic local SQLite failover (`flood_rescue_db.sqlite`). |
| **Authentication** | JWT, Password Hashing (Bcrypt), Gmail SMTP OTP | Role-enforced authentication with password security & 6-digit live email OTP passcodes. |
| **Reporting & Exports** | ReportLab & openpyxl | Automated dynamic PDF report generator & multi-tab Excel spreadsheet exporter. |

---

## 🛡️ Role-Based Access Control & User Provisioning

| User Category | Allowed Roles | Signup Method | Allowed Login Methods |
| :--- | :--- | :--- | :--- |
| **Common Public Citizen** | **Viewer** | Self-Registration (`/signup`) | **Email & Password ONLY** |
| **State Director** | **Admin** | Admin Provisioned (`/dashboard/users`) | **Email & Password** OR **Gmail SMTP OTP** |
| **Disaster Relief Officer** | **Disaster Management Officer** | Admin Provisioned (`/dashboard/users`) | **Email & Password** OR **Gmail SMTP OTP** |
| **Field Rescue Commander** | **Rescue Team Leader** | Admin Provisioned (`/dashboard/users`) | **Email & Password** OR **Gmail SMTP OTP** |
| **Medical Representative** | **Medical Team Representative** | Admin Provisioned (`/dashboard/users`) | **Email & Password** OR **Gmail SMTP OTP** |

### 🔒 Security Policy Highlights
- **Public Signup Restrictions**: Self-registration at `/signup` is strictly forced to the **Viewer / Common Public** role. Public users cannot grant themselves official or officer privileges.
- **OTP Privacy**: OTP codes are **never** displayed on screen, pre-filled in forms, or returned in HTTP responses. Passcodes are delivered strictly to the user's Gmail inbox for manual entry.
- **OTP Role Control**: Attempting OTP request/login on Common Public accounts returns **HTTP 403 Forbidden**, enforcing Password login for public users.

---

## 📦 Disaster Management Modules Implemented

1. **Live Command Center Dashboard (`/dashboard`)**:
   - 10 Key KPI cards (Active Incidents, Total Rescued, Missing Persons, Affected Population, Active Shelters, Occupancy Rate, Active Teams, Critical Medical Cases, Low Stock Resources, Operational Readiness).
   - Real-Time Emergency Alert Banners for rising water levels and camp capacities.
   - District Inundation Radar with location statistics.
2. **6 Visual Analytics Charts (Recharts)**:
   - **Rescue Status Distribution** (Donut Chart)
   - **Affected Population by District** (Bar Chart)
   - **Rescue Velocity Trend** (Line Chart)
   - **Shelter Capacity vs Occupancy** (Dual Bar Chart)
   - **Resource Allocation Breakdown** (Stacked Bar Chart)
   - **Incident Severity Distribution** (Pie Chart)
3. **11 CRUD Operations & Management Modules**:
   - **Flood Incident Management**: Track water levels, severity, and start/end dates.
   - **Affected Location Management**: Damage to houses, roads, bridges, electricity, and clean water.
   - **Rescued Person Registry**: Age, gender, rescue date, team assignment, and automatic shelter occupancy updates.
   - **Missing Person Management**: Reporter contact details, search notes, and tracing status.
   - **Relief Shelter Management**: Camp capacities, facilities checklist, and coordinator contacts.
   - **Rescue Team Management**: NDRF/SDRF/Coast Guard unit specs, rescue boat availability, and dispatch.
   - **Resource Inventory**: Live stock availability calculation (`total - allocated - used`) and low-stock highlights.
   - **Medical Requirements & Triage**: Patient condition, required drugs, doctor assignments, and hospital referrals.
   - **Relief Activities Log**: Food/water distribution, dewatering pumps, and citizens served metrics.
   - **User Management**: Admin user provisioning with role assignments.
   - **System Audit Logs**: Immutable activity logging with timestamp, IP, and detailed operation summary.
4. **Dynamic Report Generator & One-Click Exporters**:
   - Dynamic report viewer with data-driven strategic recommendations.
   - **1-Click Download PDF Report**: Styled ReportLab document with key metrics table, incident summary, and shelter breakdown.
   - **1-Click Download Excel Sheet**: Styled openpyxl workbook with worksheets for Executive Summary, Incidents, Shelters, and Inventory.

---

## ⚙️ Environment Configuration (`.env`)

Backend configuration file located at `backend/.env`:

```env
# General System Settings
PROJECT_NAME="Flood Rescue Data Management & Dynamic Reporting System"
VERSION="1.0.0"
API_V1_STR="/api"
SECRET_KEY="FLOOD_RESCUE_SUPER_SECRET_JWT_KEY_2026"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# PostgreSQL Connection String (smart_flood DB)
DATABASE_URL="postgresql://postgres:Kavi100%40@localhost:5432/smart_flood"

# OTP Expiration (Minutes)
OTP_EXPIRE_MINUTES=5

# Gmail SMTP Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USE_TLS=True
SMTP_USER="digitalalchemists00@gmail.com"
SMTP_PASSWORD="wrrn psnl emjg bvae"
DEFAULT_FROM_EMAIL="digitalalchemists00@gmail.com"
```

---

## 🛠️ Step-by-Step Setup & Running Guide

### 1. Prerequisites
- **Python** 3.10 or higher
- **Node.js** v18 or higher
- **PostgreSQL** Server (running on `localhost:5432` with database `smart_flood`)

### 2. Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Create and activate virtual environment (Optional but recommended)
python -m venv venv
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Seed PostgreSQL Database with initial schema & demo data
python seed.py

# Start FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive OpenAPI Swagger documentation: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```powershell
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
cmd /c npm run dev
```
- Web Application URL: `http://localhost:3000`

---

## 🧪 Verification & Testing

### Run Backend Integration Test Suite
```powershell
cd backend
python test_e2e.py
```
*Verifies PostgreSQL connection, User signup, Admin user creation, OTP restriction checks, Gmail SMTP email sending, and ReportLab/openpyxl exporters.*

### Build Frontend for Production
```powershell
cd frontend
cmd /c npm run build
```
*Compiles single-page application and assets cleanly into `frontend/dist/`.*

---

## 📄 License & Attribution

Developed for **State Disaster Relief Network & Flood Rescue Command Operations**.  
*Safer People • Stronger Communities* &copy; 2026.
