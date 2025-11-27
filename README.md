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

## 🚀 Quick Start

### Prerequisites

- **Minikube** installed and running
- **kubectl** configured
- **Docker** installed
- **Git** installed
- **Helm** installed (for monitoring stack)

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/abdo308/Todo-web-app.git
   cd Todo-web-app
   ```

2. **Configure Google Calendar (Optional)**

   To enable Google Calendar sync:

   a. Create a Google Cloud Project at [console.cloud.google.com](https://console.cloud.google.com/)

   b. Enable Google Calendar API:

   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API" and enable it

   c. Create OAuth 2.0 Credentials:

   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/google-calendar/callback`
     - `http://localhost:5173/google-calendar/callback`
   - Copy your Client ID and Client Secret

   d. Configure the secret:

   ```bash
   cp k8s/backend/backend-secret.yaml.example k8s/backend/backend-secret.yaml
   ```

   Edit `k8s/backend/backend-secret.yaml` and replace:

   - `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID
   - `YOUR_GOOGLE_CLIENT_SECRET_HERE` with your actual Client Secret

3. **Start the application**

   ```bash
   chmod +x start.sh
   ./start.sh
   ```

   The script will:

   - Deploy PostgreSQL database
   - Deploy backend (FastAPI) and frontend (React)
   - Deploy Nginx reverse proxy
   - Set up port forwarding to `localhost:3000`

4. **Access the application**

   Open your browser at: **http://localhost:3000**

5. **Using Google Calendar Sync**
   - Create an account and login
   - Click the calendar button (📅) in the top right corner
   - Authorize the app to access your Google Calendar
   - Your tasks will be synced with their respective dates/times
   - Tasks without dates are scheduled for the next day at 9 AM

---

## 📊 Monitoring Setup (Optional)

To enable Prometheus and Grafana monitoring:

1. **Install Helm** (if not already installed)

   ```bash
   # On Linux
   snap install helm --classic

   # Or download from https://helm.sh/docs/intro/install/
   ```

2. **Install Prometheus Stack**

   ```bash
   # Add Prometheus community charts
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm repo update

   # Install kube-prometheus-stack
   helm install monitoring prometheus-community/kube-prometheus-stack \
     --namespace monitoring --create-namespace
   ```

3. **Start Monitoring Port Forwards**

   ```bash
   # Grafana (port 3001)
   chmod +x grafana.sh
   ./grafana.sh

   # Prometheus (port 9092)
   chmod +x prometheus.sh
   ./prometheus.sh
   ```

4. **Access Monitoring Tools**

   **Grafana Dashboard:**

   - URL: http://localhost:3001
   - Get admin password:
     ```bash
     kubectl get secret -n monitoring monitoring-grafana \
       -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
     ```
   - Login with username: `admin` and the password from above

   **Prometheus:**

   - URL: http://localhost:9092

5. **Import Dashboard**

   In Grafana:

   - Go to Dashboards → Import
   - Click "Upload JSON file"
   - Select `k8s/monitoring/todo-dashboard.json`
   - Choose the Prometheus data source
   - Click Import

   The dashboard includes:

   - HTTP Request Rate by endpoint
   - Request Duration (Latency) - 95th and 50th percentile
   - HTTP Status Codes distribution
   - Success Rate percentage
   - Total Request count

6. **Generate Test Traffic** (Optional)

   To see live metrics on the dashboard:

   ```bash
   # Run continuous load test
   python3 load_test.py

   # Press Ctrl+C to stop
   ```

   The load test will send requests continuously and you'll see real-time metrics in Grafana.

---

## 🧪 Testing the Application

### Manual Testing

1. Register a new account
2. Login with your credentials
3. Create, edit, and delete tasks
4. Upload task images
5. Test Google Calendar sync (if configured)
6. Test priority levels and due dates

### Load Testing

```bash
# Install dependencies if needed
pip3 install requests

# Run load test (sends 100 requests)
python3 load_test.py

# Or run continuous load test (until stopped)
# Edit load_test.py and set NUM_REQUESTS = None
python3 load_test.py
```

---

## 🛑 Stopping the Application

```bash
# Stop port forwarding
pkill -f "kubectl port-forward"

# Delete all Kubernetes resources
chmod +x delete.sh
./delete.sh

# Or manually
kubectl delete -f k8s/backend/
kubectl delete -f k8s/frontend/
kubectl delete -f k8s/postgres/
kubectl delete -f k8s/nginx/
```

To also remove monitoring stack:

```bash
helm uninstall monitoring -n monitoring
kubectl delete namespace monitoring
```

---

## 🐳 Docker Compose (Alternative)

For local development without Kubernetes:

```bash
# Configure environment
cp .env.example .env
# Edit .env with your Google credentials

# Start with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

---

## Google Calendar Setup Details

The application automatically detects the correct OAuth redirect URI based on how you access it (localhost, Minikube IP, or custom domain). This means:

- ✅ Works out of the box with `localhost:3000` after running `k8s/start.sh`
- ✅ No need to configure multiple redirect URIs for different environments
- ✅ Automatically handles port forwarding in Kubernetes

**Important:** Google OAuth does not work with private IP addresses (like `192.168.x.x`). Always access the app via `localhost` when using Kubernetes with the provided start script.

---

## Note

Note: Deployed in http://16.171.23.59/
