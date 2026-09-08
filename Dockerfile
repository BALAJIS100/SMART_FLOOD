# Stage 1: Build Frontend SPA
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package manifests
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build production SPA assets
RUN npm run build

# Stage 2: Production Python Backend Runtime
FROM python:3.10-slim
WORKDIR /app

# Environment flags for Python in containers
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copy Backend codebase
COPY backend/ ./backend/

# Copy Frontend production build from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Default Port Configuration
ENV PORT=8000
EXPOSE 8000

# Set PYTHONPATH and start Uvicorn
ENV PYTHONPATH=/app/backend
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
