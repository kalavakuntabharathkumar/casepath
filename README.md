# AI-Assisted Histopathology Case Management Platform

A portfolio-ready full-stack case management platform for histopathology workflows.

## Stack
- React + TypeScript + Vite
- Node.js + Express
- PostgreSQL
- AWS S3-compatible object storage
- Docker / Docker Compose
- GitHub Actions
- REST API
- JWT + RBAC

## Features
- Case creation and status management
- Histopathology slide/image upload flow
- S3-compatible object storage abstraction
- JWT authentication
- Role-based access control
- Model inference REST integration
- Automatic classification tags and confidence scores
- Audit log
- React dashboard
- Dockerized local development
- CI pipeline

## Demo credentials
- Admin: `admin@pathcase.local` / `Admin123!`
- Pathologist: `pathologist@pathcase.local` / `Path123!`
- Technician: `tech@pathcase.local` / `Tech123!`

These are local-demo credentials only.

## Run
```bash
docker compose up --build
```

Frontend: http://localhost:5173  
API: http://localhost:4000

For local development without Docker:
```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

The included classifier service is a deterministic demo adapter. It is intentionally separated behind a REST interface so a real pretrained model endpoint can be plugged in later.
