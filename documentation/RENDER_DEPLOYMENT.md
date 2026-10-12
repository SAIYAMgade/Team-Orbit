# Deploying TEAM ORBIT on Render

This guide outlines the deployment of **TEAM ORBIT** on [Render](https://render.com) using the included `render.yaml` Blueprint or manual service setup.

---

## ⚡ Method 1: One-Click Blueprint Deployment (Recommended)

Render Blueprints automatically provision the PostgreSQL database, FastAPI backend, and React frontend with pre-linked environment variables.

### Steps:
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top right and select **Blueprint**.
3. Connect your GitHub account and select your repository: **`SAIYAMgade/team-orbit`**.
4. Render will detect `render.yaml` and display the resources to create:
   - **`team-orbit-db`**: Managed PostgreSQL Database (Free tier)
   - **`team-orbit-backend`**: Dockerized FastAPI Web Service (Free tier)
   - **`team-orbit-frontend`**: Static Site with global CDN (Free tier)
5. Click **Apply**.
6. Render will automatically build the images, spin up the database, and deploy both services!

---

## 🛠️ Method 2: Manual Service Setup on Render

If you prefer to configure each service manually:

### 1. Database (PostgreSQL)
- Click **New +** > **PostgreSQL**.
- **Name**: `team-orbit-db`
- **Database**: `teamorbit`
- **User**: `teamorbit`
- **Plan**: Free
- Click **Create Database**.
- Copy the **Internal Database URL** (e.g., `postgresql://teamorbit:...@.../teamorbit`).

---

### 2. Backend (FastAPI Web Service)
- Click **New +** > **Web Service**.
- Select repository: **`SAIYAMgade/team-orbit`**.
- **Name**: `team-orbit-backend`
- **Root Directory**: `backend`
- **Environment**: **Docker**
- **Plan**: Free
- **Health Check Path**: `/health`
- **Environment Variables**:
  | Key | Value |
  | :--- | :--- |
  | `DATABASE_URL` | *(Paste Internal Database URL from Step 1)* |
  | `SECRET_KEY` | *(Click "Generate" or enter random 32+ char string)* |
  | `JWT_SECRET_KEY` | *(Click "Generate" or enter random 32+ char string)* |
  | `APP_NAME` | `TEAM ORBIT` |
  | `APP_ENV` | `production` |
  | `DEBUG` | `false` |
  | `CORS_ORIGINS` | `*` |
  | `RATE_LIMIT_ENABLED` | `false` |
- Click **Create Web Service**.
- Once deployed, copy your backend URL (e.g. `https://team-orbit-backend.onrender.com`).

---

### 3. Frontend (React + Vite Static Site)
- Click **New +** > **Static Site**.
- Select repository: **`SAIYAMgade/team-orbit`**.
- **Name**: `team-orbit-frontend`
- **Root Directory**: `frontend`
- **Build Command**: `npm install --legacy-peer-deps && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  | Key | Value |
  | :--- | :--- |
  | `VITE_API_URL` | `https://team-orbit-backend.onrender.com` *(Your Backend URL)* |
  | `VITE_SOCKET_URL` | `https://team-orbit-backend.onrender.com` *(Your Backend URL)* |
- **Redirects/Rewrites**:
  - Add Rule: `/*` -> `/index.html` (Rewrite, Status 200)
- Click **Create Static Site**.

---

## 🔍 Verification

Once deployment completes:
1. Open your frontend URL: `https://team-orbit-frontend.onrender.com`
2. You will see the **TEAM ORBIT** pitch-black landing page.
3. Click **Admin Dashboard** or **Developer Dashboard** to access the workspaces.
4. Verify backend health by visiting: `https://team-orbit-backend.onrender.com/health` (returns `{"status":"healthy"}`).
