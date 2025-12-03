# KloudKitchen – 3‑Tier Restaurant App on Google Kubernetes Engine (GKE) | Terraform, CI/CD, Canary Release, and Monitoring | End-to-End Project
<img width="1366" height="720" alt="Screenshot From 2025-11-29 11-07-42" src="https://github.com/user-attachments/assets/88d1388e-b951-44c1-899a-62b17276900f" />


KloudKitchen is a **minimal but realistic cloud‑native project** that shows how a DevOps/Cloud engineer would:

- Design and run a **3‑tier web app** (React frontend, Node/Express backend, Postgres database).
- Package services into **Docker** images.
- Deploy and operate them on **Google Kubernetes Engine (GKE)**.
- Manage infra with **Terraform (Infrastructure as Code, IaC)**.
- Implement **CI/CD** with GitHub Actions.
- Handle secrets using **Sealed Secrets** (kubeseal). [Better GitOps practices]
- Add **Prometheus + Grafana** monitoring.
- Implement a **frontend canary deployment** (v1 + v2) behind a single Service.
- Use a **custom domain** (e.g. `kloudkitchen.immrbhattarai.tech`) with GKE Ingress.

This repository is also a **learning reference**. It is written in simple English and explains:

- Why each design choice was made.
- How the setup can be expanded toward production.
- What difficulties appeared and how they were handled.

You can use this as:

- A **portfolio project** (for Cloud/DevOps engineering roles).
- A **template** to build similar systems.

---

## 1. High‑Level Architecture

**Core components:**

- **Frontend (React + Vite)**  
  Simple restaurant ordering page:
  - Shows a menu of food items.
  - Lets a user submit:
    - Name
    - Delivery address
    - Selected item
    - Quantity
  - Sends orders to the backend via REST API.
<img width="1365" height="194" alt="Screenshot From 2025-11-29 15-34-25" src="https://github.com/user-attachments/assets/b582d72b-d954-45f3-97b4-68cfe33296c4" />

- **Backend (Node.js + Express)**  
  REST API:
  - `GET /api/menu` – returns the menu (10 or 15 items depending on version).
  - `POST /api/orders` – stores orders in Postgres.
  - `GET /api/orders` – optional, for debugging.
  - `GET /health` – health check for Kubernetes probes.

- **Database (PostgreSQL)**  
  Containerized Postgres on Kubernetes:
  - Single instance (one pod) for simplicity.
  - Stores orders (`orders` table).
  - Uses a small PersistentVolumeClaim (PVC) for durability.

**Cloud‑native platform:**

- **Docker**  
  - 2 Build Images uploaded (public)
  - On system (Fedora Linux): using Podman (rootless docker alternative runtime)
<img width="860" height="538" alt="Screenshot From 2025-11-30 19-14-23" src="https://github.com/user-attachments/assets/179e01ac-329b-40df-a7e7-fdeafb26bd42" />


- **GKE (Google Kubernetes Engine)**  
  - 1–2 nodes.
  - Workloads:
    - `restaurant-app` namespace: frontend, backend, postgres.
    - `monitoring` namespace: Prometheus & Grafana.
<img width="851" height="268" alt="Screenshot From 2025-11-30 10-59-29" src="https://github.com/user-attachments/assets/970983eb-6bf0-474d-bf93-f5da00970cf2" />

- **Terraform**  
  - Creates:
    - GKE cluster.
    - Small VPC & subnet.
<img width="728" height="598" alt="Screenshot From 2025-11-29 20-57-44" src="https://github.com/user-attachments/assets/fd285902-504f-44af-9344-554fb9e23911" />
<img width="1366" height="457" alt="Screenshot From 2025-11-29 21-09-15" src="https://github.com/user-attachments/assets/15878f28-e252-4e67-978e-4a21256f3097" />

- **Bash Scripting/Automation**  
  - Rapid secret filling in GitHub Action:
<img width="913" height="484" alt="Screenshot From 2025-12-01 10-59-19" src="https://github.com/user-attachments/assets/9dd1a485-4e4b-420c-81ec-4aa25b28c4d9" />
<img width="1341" height="722" alt="Screenshot From 2025-12-01 10-59-39" src="https://github.com/user-attachments/assets/b84c6a4e-77a8-418b-9baf-2c7ca04a5001" />

- **CI/CD with GitHub Actions**  
  - On push to `main`:
    - Builds frontend & backend Docker images.
    - Pushes images to Docker Hub.
    - Deploys/upgrades K8s resources on GKE.
<img width="1365" height="569" alt="Screenshot From 2025-12-01 14-14-03" src="https://github.com/user-attachments/assets/c9e1595d-c69d-4905-aaee-5987fe82e89d" />

- **Monitoring: Prometheus + Grafana**  
  - Prometheus scrapes Kubernetes metrics.
  - Grafana provides dashboards via Ingress.
<img width="856" height="161" alt="Screenshot From 2025-11-30 23-12-04" src="https://github.com/user-attachments/assets/0c56632a-e70c-4b85-867d-ebd7b2fc08bd" />
<img width="893" height="397" alt="Screenshot From 2025-11-30 23-51-27" src="https://github.com/user-attachments/assets/015ffc60-4aba-4573-8298-0da82f742b46" />


- **Secrets security: Sealed Secrets**  
  - DB credentials (Postgres).
  - Grafana admin credentials.
  - Sealed with `kubeseal`, safe to commit to Git.
<img width="1366" height="300" alt="Screenshot From 2025-11-30 09-45-23" src="https://github.com/user-attachments/assets/48a106b0-f2de-4450-a679-20ef3207e8e1" />
<img width="1365" height="279" alt="Screenshot From 2025-11-30 09-50-51" src="https://github.com/user-attachments/assets/32e75765-2e1e-475c-963f-268ef54f566f" />

- **Canary deployment (frontend)**  
  - `frontend-v1` (stable version, image `:v1`).
  - `frontend-v2` (canary version, image `:latest`).
  - Single `frontend` Service sending traffic to both based on replica counts.
<img width="1366" height="723" alt="Screenshot From 2025-12-01 14-54-01" src="https://github.com/user-attachments/assets/166dba01-b15e-440e-abfe-ef153c453bbc" />
<img width="1366" height="313" alt="Screenshot From 2025-12-01 15-09-42" src="https://github.com/user-attachments/assets/715c1c57-d9c5-4787-831a-38b214e94476" />
<img width="895" height="158" alt="Screenshot From 2025-12-01 17-15-02" src="https://github.com/user-attachments/assets/9f4aca19-23b5-41c4-8648-81a075d44ade" />
[25% controlled traffic towards Fronend V2 and 75% towards Frontend V1, we will gradually rollout 100% of traffice towards V2, by taking down pods running v1.]

- **Custom domain**  
  - GKE Ingress with host rules.
  - External DNS record (e.g., `kloudkitchen.immrbhattarai.tech`) pointing to Ingress IP.
<img width="857" height="147" alt="Screenshot From 2025-12-01 14-51-11" src="https://github.com/user-attachments/assets/6bef8498-f259-47cd-b4f6-68e801ef2df7" />
<img width="712" height="283" alt="Screenshot From 2025-12-01 14-49-42" src="https://github.com/user-attachments/assets/be4a5d86-2fee-4aa5-9c9a-7396ffacb970" />

---

## 2. Repository Structure

```text
.
├─ backend/                 # Node.js + Express API
│  ├─ src/
│  │  ├─ index.js           # Express app, routes, health check
│  │  └─ db.js              # Postgres connection & queries
│  ├─ package.json
│  └─ Dockerfile
│
├─ frontend/                # React app (Vite)
│  ├─ src/
│  │  ├─ main.jsx           # React entry point
│  │  └─ App.jsx            # Simple restaurant UI
│  ├─ package.json
│  └─ Dockerfile            # Multi‑stage Node build + nginx runtime
│
├─ k8s/
│  ├─ namespace.yaml
│  ├─ postgres-deployment.yaml
│  ├─ postgres-service.yaml
│  ├─ backend-deployment.yaml
│  ├─ frontend-service.yaml         # Service only, selects both v1 + v2
│  ├─ frontend-v1-deployment.yaml   # Stable frontend (v1)
│  ├─ frontend-v2-deployment.yaml   # Canary frontend (v2)
│  ├─ ingress.yaml                  # App Ingress (custom domain)
│  └─ sealedsecret-postgres-credentials.yaml
│
├─ monitoring/
│  ├─ prometheus-values.yaml
│  ├─ grafana-values.yaml
│  └─ sealedsecret-grafana-admin.yaml
│
├─ infra/
│  ├─ provider.tf
│  ├─ variables.tf
│  ├─ networking.tf
│  ├─ gke.tf
│  ├─ outputs.tf
│  └─ terraform.tfvars          # Project‑specific (not for public commit)
│
├─ .github/
│  └─ workflows/
│     └─ ci-cd.yaml             # Build, push, deploy pipeline
│
├─ docker-compose.yml           # Local dev: frontend + backend + postgres
└─ README.md
```
<img width="694" height="137" alt="Screenshot From 2025-11-30 22-18-51" src="https://github.com/user-attachments/assets/9f755d33-3511-4d28-b488-96a52d19a3ab" />

---

## 3. End‑to‑End Story: From 0 → Working System

This project is designed in **stages** so a beginner can follow, and a hiring manager can understand the system thinking behind each reasoning:

### Stage 0 – Local 3‑Tier App (no containers, no cloud)

**Goal:** Prove the app logic is correct before touching Docker or Kubernetes.

Steps:

1. **Backend: Node.js + Express**
   - Initialize a Node project in `backend/`.
   - Endpoints:
     - `GET /api/menu` – initially returns 10 hard‑coded menu items.
     - `POST /api/orders` – stores orders in memory (array) as a first step.
     - `GET /api/orders` – list orders.
     - `GET /health` – returns `{"status": "ok"}` (very useful later for Kubernetes probes).
   - Why?
     - Start simple: in‑memory storage and hard‑coded menu reduce early complexity.
     - Health endpoint is an industry best practice.

2. **Frontend: React + Vite**  
   - `frontend/` uses Vite to scaffold a minimal app.
   - Single page:
     - Shows the menu (fetched from backend via `GET /api/menu`).
     - Simple form: name, address, item, quantity.
     - On submit → `POST /api/orders`.
   - Why Vite?
     - Fast dev server.
     - Simple setup.
     - Common in modern teams.

3. **Local connection (no Docker yet)**  
   - Run backend: `npm run dev` in `backend/` (uses `nodemon`).
   - Run frontend: `npm run dev` in `frontend/`.
   - Configure CORS in backend so frontend at one port can call backend at another.
   - Test in browser and via curl.

**Lessons / Difficulties:**

- Keep the app logic very simple to avoid getting stuck on React/Node issues during infrastructure work.
- Use basic logging (`console.log`) and clear error messages to understand the flow.

**How this scales to production:**

- The same REST contract (`/api/menu`, `/api/orders`, `/health`) can be used:
  - Behind API gateways.
  - With more complex authentication.
  - With real load balancers.
- The express health check can be wired into sophisticated readiness/liveness probes and monitoring systems.

---

### Stage 1 – Add Postgres + Docker for Local Containers

**Goal:** Run the full stack locally as containers, close to how it will run in Kubernetes.

1. **Add Postgres with `pg` client**

   - Install `pg` and `dotenv` in backend.
   - Create `backend/src/db.js`:
     - Uses a `Pool` from `pg`.
     - Defines:
       - `initDb()` – creates `orders` table with `CREATE TABLE IF NOT EXISTS`.
       - `createOrder()` – inserts a row and returns it.
       - `getAllOrders()` – reads all orders.
     - Reads DB connection info from environment:

       ```js
       const {
         DB_HOST = "localhost",
         DB_PORT = 5432,
         DB_USER = "restaurant_user",
         DB_PASSWORD = "restaurant_password",
         DB_NAME = "restaurant_db",
       } = process.env;
       ```

   - Update `index.js` so:
     - On startup, it calls `initDb()` and only starts listening if DB initialization succeeds.
     - `POST /api/orders` now writes to Postgres, not an in‑memory array.

   **Why this way?**

   - `CREATE TABLE IF NOT EXISTS` acts as a tiny, built‑in migration for this demo.
   - Starting the server only after DB is ready is robust behavior—common in real services.

2. **Backend Dockerfile**

   - Multi‑step, but still simple:

     ```dockerfile
     FROM node:20-alpine AS base
     WORKDIR /app
     COPY package*.json ./
     RUN npm install --only=production
     COPY src ./src
     EXPOSE 4000
     CMD ["node", "src/index.js"]
     ```

   **Why this design?**

   - Using a small base image (`node:20-alpine`) keeps image size low.
   - Install only production dependencies for runtime images (standard practice).

3. **Frontend Dockerfile (multi‑stage)**

   ```dockerfile
   FROM node:20-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:1.27-alpine
   RUN rm -rf /usr/share/nginx/html/*
   COPY --from=build /app/dist /usr/share/nginx/html
   EXPOSE 80
   ```

   **Why?**

   - First stage compiles the React app.
   - Second stage serves static files via nginx—common pattern in production React deployments.
   - Keeps runtime image tiny and fast.

4. **docker‑compose for local full stack**

   - `docker-compose.yml` runs three services:
     - `db` – Postgres container.
     - `backend` – Node/Express API, connecting to `db`.
     - `frontend` – nginx serving built React app, calling backend via `http://localhost:4000` or relative `/api` paths.

   - Example:

     ```yaml
     services:
       db:
         image: postgres:15-alpine
         environment:
           POSTGRES_USER: restaurant_user
           POSTGRES_PASSWORD: restaurant_password
           POSTGRES_DB: restaurant_db
         ports:
           - "5432:5432"
         volumes:
           - postgres_data:/var/lib/postgresql/data
         healthcheck:
           test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
           interval: 5s
           timeout: 5s
           retries: 5

       backend:
         build:
           context: ./backend
           dockerfile: Dockerfile
         environment:
           DB_HOST: db
           DB_PORT: 5432
           DB_USER: restaurant_user
           DB_PASSWORD: restaurant_password
           DB_NAME: restaurant_db
           PORT: 4000
         depends_on:
           db:
             condition: service_healthy
         ports:
           - "4000:4000"

       frontend:
         build:
           context: ./frontend
           dockerfile: Dockerfile
         depends_on:
           - backend
         ports:
           - "3000:80"

     volumes:
       postgres_data:
     ```

   - Run all with:
     ```bash
     docker-compose up --build
     ```

**Difficulties & how we solved them:**

- **Database connection timing** – if backend starts before Postgres is ready:
  - We used `depends_on` + healthcheck for local docker‑compose.
  - In Kubernetes we re‑use the idea by waiting for DB init before starting app.

- **Local vs container networking** – `localhost` vs service names:
  - Inside containers, backend uses `DB_HOST=db` (Docker DNS), not `localhost`.

**Production thought:**

- In real environments, DB migrations would be handled by tools like Flyway, Liquibase, Prisma, or Knex migrations.
- This project keeps a simple approach but with a structure that can evolve.

---

### Stage 2 – Kubernetes Manifests for the 3‑Tier App

**Goal:** Deploy the same 3‑tier app to any Kubernetes cluster, eventually GKE.

1. **Namespace**

   - `k8s/namespace.yaml` groups all app resources:

     ```yaml
     apiVersion: v1
     kind: Namespace
     metadata:
       name: restaurant-app
     ```

   **Why namespaces?**

   - Clear separation between:
     - app workloads,
     - monitoring (`monitoring`),
     - system (`kube-system`).
   - Easy cleanup: `kubectl delete ns restaurant-app`.

2. **Postgres on Kubernetes**

   - `postgres-deployment.yaml` + `postgres-service.yaml`:

     - Deployment:
       - Single replica.
       - Uses `postgres:15-alpine`.
       - Small resources (fit in tiny GKE node):
         ```yaml
         resources:
           requests:
             cpu: "100m"
             memory: "256Mi"
           limits:
             cpu: "300m"
             memory: "512Mi"
         ```
       - Mounts a PVC of only `2Gi`:
         ```yaml
         resources:
           requests:
             storage: 2Gi
         ```
     - Service:
       - `ClusterIP` called `postgres`.
       - Accessible inside cluster at `postgres.restaurant-app.svc.cluster.local:5432`.
         
<img width="1060" height="633" alt="Screenshot From 2025-11-30 13-14-42" src="https://github.com/user-attachments/assets/97c5976b-5876-4aa4-8bf5-41d8f87273dc" />

   **Lessons learned:**

   - Large default PVC sizes (e.g., 100Gi) can quickly hit GCP disk quotas, especially with multiple nodes. We reduced to **2Gi** for this demo.
   - Node type (e.g., `e2-small`) and pod resource requests must be aligned, because GKE system pods also consume CPU/RAM.

3. **Backend Deployment + Service**

   - `backend-deployment.yaml`:

     - Image: `docker.io/<user>/restaurant-backend:latest`.
     - Env vars from K8s Secret for DB credentials.
     - Resource requests/limits are small (e.g., 30m CPU, 64Mi RAM).
     - `readinessProbe` and `livenessProbe` both call `/health`.

   - Service `backend`:

     - Type `ClusterIP`.
     - Port 4000 → Pod 4000.

   **Why this setup?**

   - Using probes is considered best practice:
     - Readiness: don’t send traffic until app is ready.
     - Liveness: restart container if it stops responding.
   - Keeps backend internal and only accessible via Service / Ingress path `/api`.

4. **Frontend Deployment + Service**

   - Initial simple Deployment (`frontend`) and Service.
   - Uses `docker.io/<user>/restaurant-frontend:latest`.
   - Resources are small.
   - Service exposes port 80 as `ClusterIP`.

   Later, this becomes:
   - `frontend-v1` + `frontend-v2` Deployments.
   - `frontend` Service selecting `app=frontend`.

5. **Ingress for the App**

   - `k8s/ingress.yaml`:

     ```yaml
     apiVersion: networking.k8s.io/v1
     kind: Ingress
     metadata:
       name: restaurant-ingress
       namespace: restaurant-app
       annotations:
         kubernetes.io/ingress.class: "gce"
     spec:
       rules:
         - host: kloudkitchen.immrbhattarai.tech
           http:
             paths:
               - path: /
                 pathType: Prefix
                 backend:
                   service:
                     name: frontend
                     port:
                       number: 80
               - path: /api/
                 pathType: Prefix
                 backend:
                   service:
                     name: backend
                     port:
                       number: 4000
     ```

   **What this does:**

   - Creates a GCP HTTP(S) Load Balancer.
   - Routes:
     - `/` → React frontend Service.
     - `/api/...` → backend Service.
   - Ties into your custom domain via a DNS A record pointing to the Ingress IP.

**Production considerations:**

- In production, you would:
  - Add HTTPS (TLS) via cert‑manager and Let’s Encrypt.
  - Configure WAF, rate limiting, and maybe Identity‑Aware Proxy / OAuth for admin endpoints.

---

### Stage 3 – Secure Secret Management with Sealed Secrets

**Goal:** Store **no plaintext secrets** in Git, while still Git‑driving K8s configuration.

Tools:

- [Bitnami Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- `kubeseal` CLI

1. **Sealed Secrets controller**

   - Installed in `sealed-secrets` namespace.
   - Has its own private key.
   - Can decrypt SealedSecret resources into regular K8s Secrets.

2. **Creating a DB credential secret**

   Steps:

   - Create a plain Secret manifest **locally** (not applied yet, not committed):

     ```bash
     kubectl create secret generic postgres-credentials \
       --namespace restaurant-app \
       --from-literal=DB_USER=restaurant_user \
       --from-literal=DB_PASSWORD=restaurant_password \
       --from-literal=DB_NAME=restaurant_db \
       --dry-run=client -o yaml > k8s/secret-db-plain.yaml
     ```

   - Seal it:

     ```bash
     kubeseal \
       --format=yaml \
       --namespace=restaurant-app \
       < k8s/secret-db-plain.yaml \
       > k8s/sealedsecret-postgres-credentials.yaml
```
 <img width="853" height="201" alt="Screenshot From 2025-11-30 18-14-22" src="https://github.com/user-attachments/assets/535b65c0-140a-40ee-9375-09d5d5072b2b" />

   - Delete the plain YAML:

     ```bash
     rm k8s/secret-db-plain.yaml
     echo "k8s/secret-db-plain.yaml" >> .gitignore
     ```

   - Commit only `sealedsecret-postgres-credentials.yaml`.

   - Apply the SealedSecret:

     ```bash
     kubectl apply -f k8s/sealedsecret-postgres-credentials.yaml
     ```

   - The controller creates the real K8s Secret `postgres-credentials`.

3. **Using the secret in deployments**

   In `postgres-deployment.yaml`:

   ```yaml
   env:
     - name: POSTGRES_USER
       valueFrom:
         secretKeyRef:
           name: postgres-credentials
           key: DB_USER
     - name: POSTGRES_PASSWORD
       valueFrom:
         secretKeyRef:
           name: postgres-credentials
           key: DB_PASSWORD
     - name: POSTGRES_DB
       valueFrom:
         secretKeyRef:
           name: DB_NAME
   ```

   In `backend-deployment.yaml`:

   ```yaml
   env:
     - name: DB_USER
       valueFrom:
         secretKeyRef:
           name: postgres-credentials
           key: DB_USER
     - name: DB_PASSWORD
       valueFrom:
         secretKeyRef:
           name: postgres-credentials
           key: DB_PASSWORD
     - name: DB_NAME
       valueFrom:
         secretKeyRef:
           name: postgres-credentials
           key: DB_NAME
   ```

**Security best practices:**

- Plain secrets never committed.
- Encrypt at rest in Git via SealedSecrets.
- The cluster controls decryption; even the GitHub repository does not contain usable secrets.
- This pattern easily extends to:
  - API keys
  - JWT signing keys
  - Grafana admin credentials
  - etc.

**Difficulty & resolution:**

- It’s easy to accidentally commit plaintext YAMLs. That’s why a dedicated `*-plain.yaml` is created and removed immediately, and `.gitignore` is updated.

---

### Stage 4 – Terraform GKE Cluster (Minimal but Real)

**Goal:** Create the GKE infrastructure in a repeatable, IaC‑driven way.

1. **Provider configuration**

   - `infra/provider.tf` uses the official Google provider.
   - Project, region, and zone are set via variables and `terraform.tfvars`.

2. **Network**

   - `infra/networking.tf`:

     ```hcl
     resource "google_compute_network" "vpc" {
       name                    = "restaurant-vpc"
       auto_create_subnetworks = false
     }

     resource "google_compute_subnetwork" "subnet" {
       name          = "restaurant-subnet"
       ip_cidr_range = "10.10.0.0/16"
       region        = var.region
       network       = google_compute_network.vpc.id
     }
     ```

   **Why not use the default network?**

   - Using a dedicated VPC gives more control and is closer to real production setups.
   - Still small and cheap.

3. **GKE cluster & node pool**

   - `infra/gke.tf`:

     - Cluster:
       - `remove_default_node_pool = true` → we manage node pool separately.
     - Node pool:
       - 1 node, type `e2-small` (2 vCPU, 2GB RAM).
       - `disk_size_gb = 20`.
       - No autoscaling (for cost control).

   **Difficulties & learnings:**

   - Initial attempts with very tiny node types (like `e2-micro`) + too large pod requests caused scheduling failures (`Insufficient cpu/memory`).
   - Disk sizes–if left at defaults–can allocate 100Gi per node, exhausting disk quota quickly, especially when also using PVCs.

   **Resolution:**

   - Choose `e2-small` and carefully tune pod resources and PVCs.
   - Keep PVC at `2Gi`.
   - Keep Prometheus/Grafana small.

4. **Apply and connect**

   ```bash
   cd infra
   terraform init
   terraform apply

   gcloud container clusters get-credentials gke-restaurant-demo \
     --zone us-central1-a \
     --project YOUR_GCP_PROJECT_ID
   ```

   Then:

   ```bash
   kubectl get nodes
   ```

   You should see your single (or two) nodes.
<img width="817" height="300" alt="Screenshot From 2025-11-30 11-03-35" src="https://github.com/user-attachments/assets/37eac76b-5390-42d3-92f0-1aafb378cf6f" />


**Production path:**

- Add:
  - Autoscaling node pools.
  - Private clusters.
  - Workload identity instead of service account keys.
  - Multiple node pools (e.g., for system vs app workloads).

---

### Stage 5 – CI/CD with GitHub Actions (Build → Push → Deploy)

**Goal:** Fully automate builds and deployment to GKE.

1. **Docker Hub as image registry**

   - Public repos:
     - `docker.io/<your_dockerhub_username>/restaurant-backend`
     - `docker.io/<your_dockerhub_username>/restaurant-frontend`
   - CI pushes:
     - `:latest`
     - `:<commit_sha>`

2. **GitHub Secrets**

   In repo settings → Secrets and variables → Actions:

   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN` (access token or password)
   - `GCP_PROJECT_ID`
   - `GKE_CLUSTER_NAME`
   - `GKE_CLUSTER_ZONE`
   - `GCP_SA_KEY` (JSON, for GKE access via `gcloud`)

3. **Workflow: `.github/workflows/ci-cd.yaml`**

   Key steps:

   - **Checkout code**

     ```yaml
     - uses: actions/checkout@v4
     ```

   - **Set up gcloud & kubectl**

     ```yaml
     - uses: google-github-actions/setup-gcloud@v2
       with:
         project_id: ${{ env.GCP_PROJECT_ID }}
         service_account_key: ${{ secrets.GCP_SA_KEY }}
         export_default_credentials: true

     - name: Configure kubectl
       run: |
         gcloud container clusters get-credentials "$GKE_CLUSTER_NAME" \
           --zone "$GKE_CLUSTER_ZONE" \
           --project "$GCP_PROJECT_ID"
     ```

   - **Docker Hub login**

     ```yaml
     - uses: docker/login-action@v3
       with:
         username: ${{ secrets.DOCKERHUB_USERNAME }}
         password: ${{ secrets.DOCKERHUB_TOKEN }}
     ```

   - **Build & push backend**

     ```yaml
     - uses: docker/build-push-action@v6
       with:
         context: ./backend
         file: ./backend/Dockerfile
         push: true
         tags: |
           docker.io/${{ secrets.DOCKERHUB_USERNAME }}/restaurant-backend:latest
           docker.io/${{ secrets.DOCKERHUB_USERNAME }}/restaurant-backend:${{ github.sha }}
     ```

   - **Build & push frontend**

     ```yaml
     - uses: docker/build-push-action@v6
       with:
         context: ./frontend
         file: ./frontend/Dockerfile
         push: true
         tags: |
           docker.io/${{ secrets.DOCKERHUB_USERNAME }}/restaurant-frontend:latest
           docker.io/${{ secrets.DOCKERHUB_USERNAME }}/restaurant-frontend:${{ github.sha }}
     ```

   - **Deploy to GKE**

     ```yaml
     - name: Deploy manifests
       run: |
         kubectl apply -f k8s/namespace.yaml
         kubectl apply -f k8s/sealedsecret-postgres-credentials.yaml

         kubectl apply -f k8s/postgres-deployment.yaml
         kubectl apply -f k8s/postgres-service.yaml

         kubectl apply -f k8s/backend-deployment.yaml

         # Frontend split into v1 and v2 + service
         kubectl apply -f k8s/frontend-service.yaml
         kubectl apply -f k8s/frontend-v1-deployment.yaml
         kubectl apply -f k8s/frontend-v2-deployment.yaml

         kubectl apply -f k8s/ingress.yaml

         kubectl rollout status deployment/backend -n restaurant-app --timeout=120s
         kubectl rollout status deployment/frontend-v2 -n restaurant-app --timeout=120s
 ```

 <img width="1150" height="390" alt="Screenshot From 2025-12-01 23-18-36" src="https://github.com/user-attachments/assets/e10d5620-2c37-470c-b7db-1317b460b1a7" />

**Benefits:**

- No manual build & push from laptop needed.
- Changes to code automatically go through a consistent build pipeline.
- K8s manifests are the single source of truth for desired state.

**Production extension:**

- Add:
  - Automated tests.
  - Canary analysis gates.
  - Manual approvals on production environments.

---

---

### Stage 6 – Monitoring with Prometheus & Grafana

**Goal:** Add **observability** to the cluster, so we can see resource usage and cluster health in a professional way.

We focus on:

- Installing **Prometheus** to collect metrics.
- Installing **Grafana** to visualize metrics.
- Keeping everything:
  - Low resource usage.
  - Secure regarding secrets.
  - Affordable (no extra load balancers unless necessary).

> You can insert screenshots here:
<img width="1366" height="768" alt="Screenshot From 2025-12-01 00-58-08" src="https://github.com/user-attachments/assets/9f6c5f4e-a182-4963-9a9e-a7d8f644df4d" />
<img width="1366" height="727" alt="Screenshot From 2025-12-01 09-46-34" src="https://github.com/user-attachments/assets/4feb7611-e1e1-45be-81e5-5079647b9b96" />
<img width="1366" height="731" alt="Screenshot From 2025-12-01 09-55-49" src="https://github.com/user-attachments/assets/bd939e94-4c40-4585-9de0-d3b2fa071335" />


#### 6.1. Monitoring namespace

We keep monitoring resources separate:

```bash
kubectl create namespace monitoring
```

This is a good habit in production to isolate observability tools.

#### 6.2. Install Prometheus with Helm

Prometheus is installed from the `prometheus-community` chart.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

Configuration file: `monitoring/prometheus-values.yaml`

Key options:

```yaml
alertmanager:
  enabled: false  # not needed for this demo

pushgateway:
  enabled: false

server:
  resources:
    requests:
      cpu: "100m"
      memory: "128Mi"
    limits:
      cpu: "300m"
      memory: "256Mi"

service:
  type: ClusterIP   # no external LB

kubeStateMetrics:
  enabled: true

nodeExporter:
  enabled: true
```

**Design choices:**

- **Alertmanager disabled**: to stay minimal. In production, it would be used for alerting via email, Slack, etc.
- **ClusterIP service**: no extra load balancer. Prometheus is for internal use only.
- **Small resource requests**: fits comfortably on a small node.

Install:

```bash
helm install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  -f monitoring/prometheus-values.yaml
```

Verify:

```bash
kubectl get pods -n monitoring
```

You should see:

- `prometheus-server`
- `prometheus-kube-state-metrics`
- `prometheus-node-exporter` pods.

#### 6.3. Install Grafana with Helm (secured via Sealed Secret)
<img width="1360" height="442" alt="Screenshot From 2025-11-30 22-43-53" src="https://github.com/user-attachments/assets/67c1d63f-4f8e-4843-b6b7-5e6700ed6458" />

Grafana will:

- Be accessed via **Ingress** (no port‑forwarding).
- Use an **admin user/password** stored via SealedSecret.
- Optionally allow **anonymous viewer** access for simple demo viewing.

**Create admin credentials as a Sealed Secret:**

1. Create a plain Secret **locally**:

   ```bash
   kubectl create secret generic grafana-admin-credentials \
     --namespace monitoring \
     --from-literal=admin-user=admin \
     --from-literal=admin-password=GrafanaDemo!123 \
     --dry-run=client -o yaml > monitoring/grafana-admin-secret-plain.yaml
   ```

2. Seal it:

   ```bash
   kubeseal \
     --format=yaml \
     --namespace=monitoring \
     < monitoring/grafana-admin-secret-plain.yaml \
     > monitoring/sealedsecret-grafana-admin.yaml
   ```

3. Delete the plain secret file and ignore it in git:

   ```bash
   rm monitoring/grafana-admin-secret-plain.yaml
   echo "monitoring/grafana-admin-secret-plain.yaml" >> .gitignore
   ```

4. Apply the SealedSecret:

   ```bash
   kubectl apply -f monitoring/sealedsecret-grafana-admin.yaml
   kubectl get secret -n monitoring
   # ensure grafana-admin-credentials exists
   ```
<img width="856" height="161" alt="Screenshot From 2025-11-30 23-12-04" src="https://github.com/user-attachments/assets/f5a6edae-9d99-4bd0-abda-edfbf8f690a4" />

**Grafana values: `monitoring/grafana-values.yaml`**

```yaml
admin:
  existingSecret: grafana-admin-credentials
  userKey: admin-user
  passwordKey: admin-password

service:
  type: ClusterIP
  port: 80

resources:
  requests:
    cpu: "50m"
    memory: "64Mi"
  limits:
    cpu: "150m"
    memory: "128Mi"

persistence:
  enabled: false  # demo only

ingress:
  enabled: true
  ingressClassName: gce
  annotations:
    kubernetes.io/ingress.class: "gce"
  hosts:
    - grafana.demo.local    # or your chosen Grafana hostname
  paths:
    - path: /
      pathType: Prefix

grafana.ini:
  auth.anonymous:
    enabled: true
    org_role: Viewer
```

**Notes:**

- `existingSecret` makes Grafana read admin credentials from the sealed secret.
- `auth.anonymous.enabled: true` allows viewer‑only access with no login. This is **not recommended for real production** without restricting IPs or network access, but works for a demo cluster.
- Service is `ClusterIP`; Ingress provides the external access.

Install:

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm install grafana grafana/grafana \
  --namespace monitoring \
  -f monitoring/grafana-values.yaml
```

Check:

```bash
kubectl get pods -n monitoring
kubectl get ingress -n monitoring
```
<img width="895" height="397" alt="Screenshot From 2025-11-30 23-48-45" src="https://github.com/user-attachments/assets/29343bce-31b6-4a26-a68d-37abd826a0de" />

After a few minutes, the Grafana Ingress gets an external IP. You can point a DNS name (e.g., `grafana.YOURDOMAIN`) to that IP or use `/etc/hosts` for local testing.
<img width="1343" height="576" alt="Screenshot From 2025-12-01 10-00-33" src="https://github.com/user-attachments/assets/0a808113-209b-4ca7-80ce-19f6e54fec03" />
<img width="1343" height="576" alt="Screenshot From 2025-12-01 10-00-09" src="https://github.com/user-attachments/assets/5e122d64-94b7-44f7-a6c1-e04337902c65" />
<img width="1366" height="731" alt="Screenshot From 2025-12-01 09-58-59" src="https://github.com/user-attachments/assets/5a65dc99-4f74-48cc-be9c-6932bfd428ba" />

#### 6.4. Connect Grafana to Prometheus

In the Grafana UI:

1. Go to **Configuration → Data sources → Add data source**.
2. Choose **Prometheus**.
3. Set URL, for example:

   ```text
   http://prometheus-server.monitoring.svc.cluster.local:80
   ```
<img width="1366" height="727" alt="Screenshot From 2025-12-01 09-46-34" src="https://github.com/user-attachments/assets/226e43b9-0978-4f5e-9a94-153b7bf55a5a" />

4. Click “Save & Test”.

Import a Kubernetes dashboard (e.g. ID 315) and confirm:

- Nodes CPU/memory.
- Pod resource usage.
- Overall cluster health.
<img width="1366" height="731" alt="Screenshot From 2025-12-01 09-47-54" src="https://github.com/user-attachments/assets/62bbd43f-565a-4b75-ae64-effc3a039b1a" />

**Production extension:**

- Add:
  - Log aggregation (e.g., Loki, Elasticsearch).
  - Tracing (Jaeger, Tempo, etc.).
  - Alerting via Alertmanager integrated with Slack/MS Teams.

---

### Stage 7 – Frontend Canary Deployment (v1 + v2)

**Goal:** Show a **safe rollout strategy** for UI changes using Kubernetes only (no service mesh).

Design:

- Backend:
  - Single version (v2) with 15 items.
- Frontend:
  - v1 Deployment using `:v1` image.
  - v2 Deployment using `:latest` image.
- Service:
  - One `frontend` Service that selects pods from both Deployments.
- Traffic split:
  - Controlled by **replica counts**.

#### 7.1. Two frontend Deployments

**frontend-v1 (stable baseline)** – `k8s/frontend-v1-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-v1
  namespace: restaurant-app
  labels:
    app: frontend
    version: v1
spec:
  replicas: 3  # majority of traffic
  selector:
    matchLabels:
      app: frontend
      version: v1
  template:
    metadata:
      labels:
        app: frontend
        version: v1
    spec:
      containers:
        - name: frontend
          image: docker.io/YOUR_DOCKERHUB_USERNAME/restaurant-frontend:v1
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80
              name: http
          resources:
            requests:
              cpu: "20m"
              memory: "32Mi"
            limits:
              cpu: "100m"
              memory: "64Mi"
```

**frontend-v2 (canary)** – `k8s/frontend-v2-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-v2
  namespace: restaurant-app
  labels:
    app: frontend
    version: v2
spec:
  replicas: 1  # small percentage of traffic
  selector:
    matchLabels:
      app: frontend
      version: v2
  template:
    metadata:
      labels:
        app: frontend
        version: v2
    spec:
      containers:
        - name: frontend
          image: docker.io/YOUR_DOCKERHUB_USERNAME/restaurant-frontend:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80
              name: http
          resources:
            requests:
              cpu: "20m"
              memory: "32Mi"
            limits:
              cpu: "100m"
              memory: "64Mi"
```

#### 7.2. Shared frontend Service

`k8s/frontend-service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: restaurant-app
  labels:
    app: frontend
spec:
  type: ClusterIP
  selector:
    app: frontend   # selects both v1 and v2 pods
  ports:
    - name: http
      port: 80
      targetPort: 80
```

**Key idea:**

- Both Deployments use `app: frontend`.
- The Service selects on `app: frontend`.
- K8s load balances across all matching pods.
- With replicas 3 (v1) and 1 (v2), approximately 25% of traffic hits v2, 75% v1.

#### 7.3. CI/CD interaction

Your CI pipeline:

- Builds and pushes `restaurant-frontend:latest` (v2).
- Applies:
  - `frontend-service.yaml`
  - `frontend-v1-deployment.yaml`
  - `frontend-v2-deployment.yaml`

`frontend-v1` Deployment:

- Uses the fixed `:v1` tag → stable baseline.

`frontend-v2` Deployment:

- Uses `:latest` tag → updated on every new commit to `main`.

This keeps canary behavior consistent: v1 remains unchanged, v2 is updated.

#### 7.4. Adjusting canary weights

To increase traffic to v2 (if canary looks good):

```bash
kubectl scale deployment frontend-v1 -n restaurant-app --replicas=2
kubectl scale deployment frontend-v2 -n restaurant-app --replicas=2
```

Now traffic is roughly 50/50.

To fully roll out v2:

```bash
kubectl scale deployment frontend-v1 -n restaurant-app --replicas=0
kubectl scale deployment frontend-v2 -n restaurant-app --replicas=4
```

To roll back v2 (if issues appear):

```bash
kubectl scale deployment frontend-v2 -n restaurant-app --replicas=0
kubectl scale deployment frontend-v1 -n restaurant-app --replicas=4
```

**Production extension:**

- Integrate with:
  - Service mesh (Istio, Linkerd) for precise traffic weights.
  - Progressive delivery tools (Argo Rollouts, Flagger) with automated metrics analysis.
- But the **core canary idea remains**: two versions live at the same time, fronted by a single stable endpoint.

---

### Stage 8 – Custom Domain and Final System View

**Goal:** Present the application under a realistic, human‑friendly domain and summarize the full design.

#### 8.1. Custom domain (high‑level)

(You already completed DNS steps; this is just conceptual.)

- Ingress for app:
  - `host: kloudkitchen.immrbhattarai.tech`
- External DNS:
  - `A` record:
    - `kloudkitchen.immrbhattarai.tech` → Ingress IP from `kubectl get ingress`.
- Browser:
  - User visits `https://kloudkitchen.immrbhattarai.tech`.
  - GCP Load Balancer (Ingress) routes:
    - `/` → frontend Service → a mix of `frontend-v1` and `frontend-v2` pods.
    - `/api/...` → backend Service → backend pod(s) → Postgres.

Production expansion:

- Add TLS certificates (Let’s Encrypt via cert‑manager).
- Consider multiple domains per environment (dev/stage/prod).
- Add path‑based or host‑based routing for more services.

---

## 4. Security, Cost, and Production Considerations

### 4.1. Security Highlights

- **Secrets never in Git in plaintext**:
  - Postgres credentials via SealedSecrets.
  - Grafana admin password via SealedSecrets.
- **Kubernetes scopes**:
  - Secrets only in the namespaces where needed.
- **Images**:
  - Based on minimal distributions (Alpine variants where reasonable).
- **Ingress**:
  - Single external entry point for app.
  - Monitoring (Grafana) can be on a separate hostname with viewer-only or protected access.

Production upgrades:

- Use **Workload Identity** instead of long‑lived service account keys.
- Restrict Grafana access behind VPN, IP allowlist, or SSO.
- Add network policies to limit pod‑to‑pod communications.
- Use private GKE clusters and private Artifact Registry.

### 4.2. Cost Control Techniques

- Single small node pool (`e2-small`).
- Small resource requests and limits:
  - Frontend: 20m CPU, 32Mi RAM.
  - Backend: 30m CPU, 64Mi RAM.
  - Postgres: 100m CPU, 256Mi RAM.
  - Prometheus and Grafana: similarly tiny.
- Small PVC (2Gi) for Postgres.
- One HTTP(S) Load Balancer for app; Grafana can share or be separate based on needs.

Further cost reduction:

- Turn off or destroy cluster when not in use (`terraform destroy`).
- In a real environment, use autoscaling to reduce resources under low load.

---

## 5. How to Run This Project Yourself (Step‑by‑Step Summary)

Below is a short operational summary. Use previous sections for detailed explanations.

### 5.1. Prerequisites

On your machine:

- `git`
- `node`, `npm`
- `docker` or `podman` (for local testing)
- `kubectl`
- `gcloud` CLI
- `terraform`
- `helm`
- `kubeseal`

GCP:

- Project with billing enabled.
- GKE and Artifact/Container Registry APIs enabled.

GitHub:

- Repository fork or clone of this project.
- GitHub Actions enabled.

Docker Hub:

- Account and public repositories (or use private with imagePullSecrets).

### 5.2. Local Development (optional but recommended)

1. Run backend locally:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Run frontend locally:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Test app at `http://localhost:<vite-port>`.

### 5.3. Local Containers with docker‑compose

```bash
docker-compose up --build
```

Test:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000/api/menu`, `/api/orders`.

### 5.4. Provision GKE with Terraform

```bash
cd infra
terraform init
terraform apply
```

Then connect:

```bash
gcloud container clusters get-credentials gke-restaurant-demo \
  --zone YOUR_ZONE \
  --project YOUR_PROJECT_ID
```

### 5.5. Install Sealed Secrets controller

```bash
kubectl create namespace sealed-secrets

kubectl apply -n sealed-secrets \
  -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.27.0/controller.yaml
```

### 5.6. Seal and apply secrets

- DB credentials: `k8s/sealedsecret-postgres-credentials.yaml`  
- Grafana admin: `monitoring/sealedsecret-grafana-admin.yaml`

Apply:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/sealedsecret-postgres-credentials.yaml
kubectl apply -f monitoring/sealedsecret-grafana-admin.yaml
```

### 5.7. Deploy app and monitoring

```bash
# App
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/frontend-v1-deployment.yaml
kubectl apply -f k8s/frontend-v2-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Monitoring
helm install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  -f monitoring/prometheus-values.yaml

helm install grafana grafana/grafana \
  --namespace monitoring \
  -f monitoring/grafana-values.yaml
```

### 5.8. Configure CI/CD

- Set GitHub Secrets:
  - `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`
  - `GCP_PROJECT_ID`, `GKE_CLUSTER_NAME`, `GKE_CLUSTER_ZONE`, `GCP_SA_KEY`
- On push to `main`, CI:
  - Builds and pushes images.
  - Applies manifests.
  - Rolls out changes.

---

## 6. Conclusion

This project demonstrates:

- Full lifecycle from **local dev** → **containers** → **Kubernetes** → **GKE**.
- Infrastructure as Code with **Terraform**.
- Secure secret management with **Sealed Secrets**.
- Observability with **Prometheus & Grafana**.
- Modern **CI/CD** on GitHub Actions.
- A practical **canary deployment** model using Kubernetes Deployments and Services.
- A **custom domain** fronting a real cloud load balancer.

It is intentionally **simple** in business logic but **rich** in cloud/DevOps patterns, making it:

- A strong demonstration project for Cloud / DevOps engineering roles.
- A reusable template for similar production‑like systems.

You can extend it further with:

- Multi‑env setups (dev / stage / prod).
- Advanced deployment strategies (blue‑green, progressive delivery).
- Service mesh, zero‑trust networking, and automated security scanning.

Happy experimenting with KloudKitchen!



---
License: GNU GPLv3
