# 🚀 Complete Railway.app Deployment Guide

This guide provides step-by-step instructions for deploying the **Flood Rescue Data Management & Dynamic Reporting System** on [Railway.app](https://railway.app/).

---

## 📋 Overview of Deployment Methods

This repository has been configured to support **two deployment strategies** on Railway:

| Deployment Strategy | Description | Recommended For |
| :--- | :--- | :--- |
| **Option 1: Unified Single Service (Recommended)** | FastAPI serves both the REST API (`/api`) and the React SPA (`frontend/dist`) from a single Railway service. | Simple 1-click deployment, zero CORS configuration, single public URL. |
| **Option 2: Two Separate Services** | Service 1: FastAPI Backend + PostgreSQL DB.<br>Service 2: React Frontend (Vite static site). | Scalable microservice setups, custom frontend domains. |

---

## 🌟 Option 1: Unified Single Service (Recommended)

### Step 1: Create a Railway Project
1. Log in to [Railway.app](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your `SMART_FLOODS` repository.

### Step 2: Add Railway PostgreSQL Database
1. Inside your Railway Project Canvas, click **+ New** (or press `Ctrl+K`).
2. Select **Database** -> **Add PostgreSQL**.
3. Railway will provision a PostgreSQL instance in seconds.

### Step 3: Configure Environment Variables
Click on your main Web Service in Railway, go to the **Variables** tab, and add:

| Environment Variable | Value / Reference | Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` | `${{ Postgres.DATABASE_URL }}` | Select *Add Reference* -> pick your Postgres `DATABASE_URL`. |
| `SECRET_KEY` | `FLOOD_RESCUE_SUPER_SECRET_JWT_KEY_2026_RAILWAY` | Set any secure random string for JWT tokens. |
| `PROJECT_NAME` | `Flood Rescue Data Management & Dynamic Reporting System` | System title. |
| `ALGORITHM` | `HS256` | JWT algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token expiration (24 hours). |
| `CORS_ORIGINS` | `*` | Allowed CORS origins. |

> ℹ️ **Gmail SMTP Variables (Optional - for Email OTP Passcodes)**:
> - `SMTP_HOST`: `smtp.gmail.com`
> - `SMTP_PORT`: `587`
> - `SMTP_USE_TLS`: `True`
> - `SMTP_USER`: `your-email@gmail.com`
> - `SMTP_PASSWORD`: `your-gmail-app-password`
> - `DEFAULT_FROM_EMAIL`: `your-email@gmail.com`

### Step 4: Expose Public Domain
1. In your Web Service, navigate to **Settings** -> **Networking** -> **Public Networking**.
2. Click **Generate Domain** (e.g., `smart-floods-production.up.railway.app`).

### Step 5: Deploy & Verify
Railway will automatically trigger Nixpacks build:
1. It installs Python dependencies (`backend/requirements.txt`).
2. It builds the React Frontend (`npm run build` in `frontend/`).
3. It launches FastAPI with Uvicorn on `$PORT`.
4. It auto-seeds the PostgreSQL database with roles and default demo accounts!

Open your generated Railway domain in the browser to access the full application!

---

## ⚙️ Option 2: Separate Backend & Frontend Services

If you want to host Frontend and Backend as two separate services on Railway:

### Backend Service Setup:
1. In Railway, create a new service linked to your repository.
2. In **Settings** -> **Root Directory**, set to `backend`.
3. Link the **PostgreSQL** database variable (`DATABASE_URL`).
4. Generate a public domain (e.g., `https://api-smartfloods.up.railway.app`).

### Frontend Service Setup:
1. Create a second service linked to the same repository.
2. In **Settings** -> **Root Directory**, set to `frontend`.
3. Set **Build Command**: `npm run build`.
4. Set **Start Command**: `npx serve -s dist -l $PORT`.
5. Add Environment Variable:
   - `VITE_API_URL`: `https://api-smartfloods.up.railway.app/api` (your backend URL).
6. Generate a public domain for the frontend.

---

## 🔑 Default Login Credentials

Upon successful boot, the system automatically initializes the PostgreSQL database and seeds default accounts:

| User Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **Railway Admin (Primary)** | `balajisara100@gmail.com` | `admin123` | Full System & Railway Admin Rights |
| **State Director (Admin)** | `admin@floodrescue.com` | `admin123` | Full Administrative Rights |
| **Disaster Relief Officer** | `officer@floodrescue.com` | `officer123` | Incident & Location Management |
| **Rescue Team Leader** | `rescue@floodrescue.com` | `rescue123` | Rescue Teams & Operations |
| **Medical Representative** | `medical@floodrescue.com` | `medical123` | Medical Requirements & Triage |
| **Viewer (Public)** | `viewer@floodrescue.com` | `viewer123` | Dashboard & Reports Read-Only |

---

## 🔍 Verification & Health Checks

- **Health Check Endpoint**: `https://<YOUR_RAILWAY_URL>/api/health`
- **Interactive OpenAPI Docs**: `https://<YOUR_RAILWAY_URL>/docs`
- **Root Web Application**: `https://<YOUR_RAILWAY_URL>/`

---

## 🛠️ Troubleshooting

### 1. `postgres://` Scheme Error in SQLAlchemy
* **Resolution**: Already handled in `backend/app/config.py` & `backend/app/database.py`. The code automatically converts `postgres://` to `postgresql://` required by SQLAlchemy 2.0.

### 2. Static Assets Not Loading
* **Resolution**: Ensure `npm --prefix frontend run build` ran successfully. FastAPI automatically checks for `frontend/dist/assets` and mounts it to `/assets`.

### 3. Database Connection Issues
* **Resolution**: Make sure Railway PostgreSQL plugin is linked and `DATABASE_URL` references `${{ Postgres.DATABASE_URL }}` in Railway variables.
