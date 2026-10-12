# TEAM ORBIT

> **One Workspace. Every Team. Moving Together.**  
> Enterprise-grade, multi-tenant collaboration platform consolidating real-time communication, Figma-like multiplayer whiteboarding, project management, and developer orchestration.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-green)](docker-compose.yml)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-brightgreen.svg)](https://python.org)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-emerald.svg)](https://fastapi.tiangolo.com/)

---

## 🌟 Key Features

### 1. 🎨 Multiplayer Live Board (Figma-Style Collaborative Canvas)
- **Real-Time Stroke Streaming**: Freehand drawing and shape creation stream incrementally across all active participants in real-time.
- **Continuous Pointer Tracking**: High-performance, throttled remote cursors with user identity badges, colors, and presence indicators.
- **Multi-Tenant Board Isolation**: Company boundaries enforced at WebSocket handshake, preventing cross-organization data leakage.
- **State Synchronization & Resiliency**: Reconnect handshake with immediate canvas state hydration and robust conflict handling.
- **Vector Tools**: Freehand brush, rectangles, circles, diamonds, arrows, lines, text objects, selection, resize, and undo/redo.

### 2. 👥 Dual-Role Dashboards (Admin vs Developer)
- **Admin Command Center**: Company workspace overview, user management, license tiers, role assignments, audit logs, and company-wide deadlines.
- **Developer Art Lab**: Real-time service latencies, active token consumption, live telemetry, WebSocket stats, and multi-tenant health metrics.
- **Multi-Tenant Architecture**: Strict row-level isolation where all data, channels, tasks, and boards are bounded by company ID.

### 3. 💬 Real-Time Communications & Chat
- Channel-based discussions, direct messages, and thread support.
- File attachment handling via S3/MinIO-compatible object storage.
- Real-time online presence and typing indicators.

### 4. 📋 Project & Task Management
- Kanban boards with drag-and-drop workflow stages.
- Sprint planning, deadline tracking, and task status assignments.
- Automated audit trails for task completions and updates.

---

## 🏗️ Technical Architecture & Tech Stack

```
                                  [ Browser Client ]
                                           │
                         ┌─────────────────┴─────────────────┐
                         │                                   │
                    (HTTP/HTTPS)                        (WebSockets)
                         │                                   │
                         ▼                                   ▼
                [ Nginx Reverse Proxy ]              [ Socket.IO Layer ]
                         │                                   │
        ┌────────────────┴────────────────┐                  │
        ▼                                 ▼                  ▼
[ Vite / React Frontend ]        [ FastAPI Core Service ] ◄──┘
   • React 18, TypeScript           • Python 3.11+
   • Tailwind CSS (Pitch Black)     • SQLAlchemy Async
   • HTML5 Canvas Engine            • Celery Background Workers
        │                                 │
        │                        ┌────────┴────────┐
        │                        ▼                 ▼
        │               [ PostgreSQL 15 ]    [ Redis 7 ]
        │                 (Multi-tenant)      (Pub/Sub, Cache)
        ▼                                          │
 [ MinIO Object Storage ] ◄────────────────────────┘
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons, HTML5 Canvas API |
| **Backend API** | FastAPI, Python 3.11, Pydantic v2, SQLAlchemy (asyncio) |
| **Realtime Engine**| Socket.IO, WebSockets, Redis Pub/Sub |
| **Database** | PostgreSQL 15 with asyncpg driver |
| **Cache & Queue**| Redis 7, Celery + Celery Beat |
| **Object Storage**| RustFS / MinIO (S3-compatible) |
| **Orchestration**| Docker & Docker Compose |

---

## 📁 Repository Structure & Segregation

The repository is cleanly segregated into modular functional domains:

```
team-orbit/
├── frontend/               # React 18 SPA + Vite client
│   ├── src/
│   │   ├── components/     # UI components & Live Board canvas
│   │   ├── pages/          # Admin, Developer, Auth & Landing views
│   │   ├── services/       # REST API & Socket.IO client connections
│   │   └── types/          # TypeScript domain interfaces
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite build configuration
│
├── backend/                # FastAPI application & realtime server
│   ├── app/
│   │   ├── api/            # REST API endpoints & route handlers
│   │   ├── core/           # Configuration, security & database sessions
│   │   ├── models/         # SQLAlchemy multi-tenant ORM models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── sockets/        # Socket.IO event handlers & multiplayer rooms
│   │   └── tasks/          # Celery background jobs & schedulers
│   ├── alembic/            # Database schema migrations
│   ├── requirements.txt    # Python service dependencies
│   └── Dockerfile          # Backend container specification
│
├── docker/                 # Container configs & environment templates
│   ├── nginx/              # Reverse proxy routing rules
│   └── postgres/           # Database initialization scripts
│
├── documentation/          # System guides & operational runbooks
│
├── docker-compose.yml      # Multi-container service orchestration
├── .env.example            # Environment variables template
└── README.md               # Main project documentation
```

---

## 🚀 Quickstart & Setup

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 24.0+
- [Docker Compose](https://docs.docker.com/compose/) v2.20+
- [Node.js](https://nodejs.org/) 18+ (for local frontend development)
- [Python](https://www.python.org/) 3.11+ (for local backend development)

### Running with Docker Compose (Recommended)

1. Clone or enter the repository:
   ```bash
   cd team-orbit
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Launch all services:
   ```bash
   docker compose up -d
   ```

4. Access the platform:
   - **Frontend Application**: `http://localhost:3000`
   - **Backend API Docs**: `http://localhost:8001/docs`
   - **MinIO Console**: `http://localhost:9001`
   - **Redis Commander**: `http://localhost:8081`

---

## 🔒 Multi-Tenant Security & Isolation

- **Company Boundary Enforcement**: Every database query is scoped by `company_id`.
- **WebSocket Room Partitioning**: Real-time canvas strokes and chat messages are partitioned into isolated rooms keyed by `company_id:board_id`.
- **RBAC**: Distinct permission sets for Admin and Developer personas.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
