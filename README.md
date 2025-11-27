# 📝 Todo Application

![Todo App Preview](./frontend/pages/assets/photo.png)

## Team Members

- **Abdalrhman Magdy**
- **Mohamed Ezzat**
- **Safiya Mahmoud**
- **Mahmoud Hanafy**
- **Ahmed Tarek**

---

## Project Overview

A production-ready Todo application built to demonstrate enterprise DevOps practices. Features FastAPI backend with PostgreSQL database, containerized deployment, and comprehensive monitoring stack.

---

## Stakeholder Analysis

- **End Users:** Individuals who want to manage their personal or work-related tasks efficiently.
- **DevOps Engineers:** Responsible for deploying, monitoring, and maintaining the application in production.
- **Developers:** Maintain and extend the backend, frontend, and infrastructure code.

---

## Project Objectives

- **Kubernetes Orchestration**: Container management with auto-scaling
- **CI/CD Pipeline**: Automated build, test, and deployment
- **Monitoring & Observability**: Prometheus metrics and Grafana dashboards
- **Infrastructure as Code**: Version-controlled infrastructure management

---

## Technologies Used

- **Kubernetes** (K8s) — Orchestration and deployment
- **Docker** — Containerization for backend, frontend, and database
- **Jenkins** — CI/CD pipeline automation
- **FastAPI** — Python backend web framework
- **React** (with Vite) — Frontend single-page application
- **PostgreSQL** — Relational database
- **Nginx** — Reverse proxy and static file serving
- **Prometheus & Grafana** — Monitoring and observability (planned/mentioned)
- **Google Calendar API** — Task synchronization to Google Calendar

Other tools: docker-compose (local dev), GitHub Actions (mentioned), and standard DevOps/infra-as-code practices.

---

## Project Scope

- FastAPI backend with PostgreSQL
- Docker containerization with multi-stage builds
- Kubernetes deployment with health checks
- GitHub Actions CI/CD pipeline
- Prometheus and Grafana monitoring stack
- Security scanning and testing automation

---

## Project Plan

### 🎯 **Core Implementation (Essential)**

#### Week 1: Foundation

- Making the backend structure (Abdalrhman Magdy)
- Making dockerfile and docker compose (Abdalrhman Magdy)
- Kubernetes manifests creation (Ahmed Sakr, Mahmoud Hanafy)
- CI/CD pipeline setup (Mohamed Ezzat, Safiya)
- Security scanning integration (Abdalrhman Magdy)

#### Week 2: Monitoring Implementation

- Prometheus metrics collection
- Grafana dashboard creation
- Alert management system
- Performance testing integration

#### Week 3: Production Deployment

- Cloud deployment (AWS/Azure)
- Load balancing setup
- Environment management
- Documentation and testing

### 🚀 **Advanced Features (Bonus)**

#### Bonus Week 1: Infrastructure Enhancement

- Helm Charts - Kubernetes package management
- Infrastructure as Code - Terraform for cloud resources
- Secrets Management - HashiCorp Vault integration

#### Bonus Week 2: Service Mesh & Networking

- Service Mesh - Istio for advanced networking
- Network policies and security
- Traffic management and routing

#### Bonus Week 3: Observability & Performance

- Distributed Tracing - Jaeger or Zipkin
- Log Aggregation - ELK Stack (Elasticsearch, Logstash, Kibana)
- APM Integration - Application Performance Monitoring

#### Bonus Week 4: Automation & GitOps

- GitOps - ArgoCD for declarative deployments
- Auto-scaling - KEDA for event-driven scaling
- Chatbot Integration - Slack/Teams deployment notifications

---

## Database Design

- **User Table:**
  - id (PK), username, email, password_hash, created_at, etc.
- **Todo Table:**
  - id (PK), user_id (FK), title, description, status, priority, due_date, created_at, image_filename, etc.
- **Relationships:**
  - One user can have many todos (one-to-many)
  - Each todo references its owner via user_id (foreign key)
    > See the 'Database Elements' section below for more details.

---

## UI/UX Design

- The UI/UX for this application is based on a Figma design.
- The design emphasizes clarity, ease of use, and a modern look for both desktop and mobile users.
- Key features:
  - Sidebar navigation for quick access to Dashboard, Vital Tasks, My Tasks, and Profile
  - Responsive layout for all devices
  - Modal dialogs for editing, adding, and deleting tasks
  - Visual feedback for actions (e.g., success messages, error notifications)
  - Consistent color palette and typography
  - [Figma Design](https://www.figma.com/design/UMVJ76GUV2N0TzZwLfEHw1/Task-Manager-webDesign--Community-?m=auto&t=LnZhDKu5Waao2cSF-6)

---

## Database Elements

The application uses a PostgreSQL database to store user accounts, todo tasks, and related data. The main elements are:

- **User Table**
  - Stores user account information (username, email, password hash, etc.)
  - Each user can have multiple todo tasks
- **Todo Table**
  - Stores individual todo tasks
  - Fields include: title, description, status, priority, due date, creation date, image filename, etc.
  - Each todo is linked to a user (owner)
- **Authentication & Security**
  - Passwords are securely hashed (bcrypt)
  - JWT tokens are used for authentication
- **Other Elements**
  - Uploaded images are stored on disk (not in the database), with the database storing the filename/path
    **Relationships:**
- One-to-many: One user can have many todos
- Each todo references its owner via a foreign key

---

## Kubernetes Deployment Flow

When you launch the application on Kubernetes, the following flow occurs:

1. **PostgreSQL Deployment**
   - A Postgres pod is created to provide the database for the app.
   - A PersistentVolumeClaim (PVC) ensures database data persists across pod restarts.
2. **Backend Deployment (FastAPI)**
   - The backend pod runs the FastAPI app, connecting to Postgres.
   - A PVC is mounted at `/app/uploads` to persist uploaded files (images).
   - The backend exposes API endpoints for authentication, todos, and file uploads.
3. **Frontend Deployment (React/Vite)**
   - The frontend pod serves the React single-page app (SPA) using a static server.
   - The frontend communicates with the backend via internal cluster networking (service names).
4. **Nginx Reverse Proxy**
   - The Nginx pod acts as a reverse proxy for all external traffic.
   - Nginx routes:
     - `/auth/`, `/todos/`, `/uploads/` → backend service
     - All other paths → frontend service
   - Nginx is exposed via a NodePort or LoadBalancer, making the app accessible outside the cluster.
5. **Service Discovery & Networking**
   - Each component (frontend, backend, nginx, postgres) is exposed as a Kubernetes Service.
   - Internal DNS allows pods to communicate using service names (e.g., `api`, `frontend`, `postgres`).
6. **Persistence**
   - Database data and uploaded files are stored on PVCs, so data survives pod restarts or rescheduling.
7. **Scaling & Health**
   - Deployments can be scaled (replica count) for frontend and backend.
   - Readiness/liveness probes ensure only healthy pods receive traffic.
8. **Access Flow**
   - User accesses the app via the Nginx external URL (NodePort/LoadBalancer IP).
   - Nginx proxies API and upload requests to the backend, and serves the frontend SPA for all other routes.
   - The frontend app makes API calls to the backend through the same Nginx endpoint (same-origin).

---

## Backend API Endpoints

Below are the main API endpoints exposed by the FastAPI backend:

- **Authentication**

  - `POST /auth/signup` — Register a new user
  - `POST /auth/login` — Authenticate and receive JWT token
  - `GET /auth/me` — Get current user info (requires JWT)
  - `POST /auth/change-password` — Change user password (requires JWT)

- **Todos**

  - `GET /todos` — List all todos for the authenticated user
  - `POST /todos` — Create a new todo
  - `GET /todos/{id}` — Get a specific todo by ID
  - `PUT /todos/{id}` — Update a todo by ID
  - `DELETE /todos/{id}` — Delete a todo by ID

- **Uploads**

  - `POST /todos` (with image) — Upload an image as part of todo creation
  - `GET /uploads/{filename}` — Retrieve uploaded image by filename

- **Google Calendar Integration**
  - `GET /google-calendar/auth` — Initiate Google OAuth flow
  - `GET /google-calendar/callback` — Handle Google OAuth callback
  - `POST /google-calendar/sync` — Sync all tasks to Google Calendar
  - `GET /google-calendar/status` — Check if Google Calendar is connected
  - `DELETE /google-calendar/disconnect` — Disconnect Google Calendar

---

## Google Calendar Setup

To enable Google Calendar synchronization:

1. **Create Google Cloud Project**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google Calendar API**

   - In the Google Cloud Console, go to "APIs & Services" → "Library"
   - Search for "Google Calendar API" and enable it

3. **Create OAuth 2.0 Credentials**

   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For local development: `http://localhost:8000/google-calendar/callback`
     - For production: `https://your-domain.com/google-calendar/callback`
   - Click "Create" and copy your Client ID and Client Secret

4. **Configure Environment Variables**

   - Copy `.env.example` to `.env`
   - Add your Google credentials:
     ```bash
     GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-client-secret
     GOOGLE_REDIRECT_URI=http://localhost:8000/google-calendar/callback
     ```

5. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

6. **Database Migration**

   - The `google_calendar_token` column will be automatically added to the users table
   - If using an existing database, you may need to run migrations

7. **Using the Feature**
   - Click the calendar button (📅) in the top right corner of the dashboard
   - Authorize the app to access your Google Calendar
   - All your tasks will be synced with their respective dates/times
   - Tasks without dates will be scheduled for the next day at 9 AM

---

## Note

Note: Deployed in http://16.171.23.59/
