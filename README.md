# Post Board + Subscription Usage & Billing

A full-stack application built with:

- Frontend: React + Redux Toolkit
- Backend: FastAPI
- Database: MongoDB

## Prerequisites

Install the following:

- Python 3.10+
- Node.js 18+ (or 20 LTS)
- Yarn
- Docker Desktop (or MongoDB Community)
- Git

Verify installation:

```bash
python --version
node -v
yarn -v
docker --version
```

---

## Clone Project

```bash
git clone <repository-url>
cd Billing-Dashboard-main
```

---

## Start MongoDB

Using Docker:

```bash
docker run -d --name mongo -p 27017:27017 -v mongo-data:/data/db mongo:6.0
```

If the container already exists:

```bash
docker start mongo
```

Check status:

```bash
docker ps
```

---

## Backend Setup

Navigate to backend:

```bash
cd backend
```

Create virtual environment:

### Windows

```bash
python -m venv .venv
.\.venv\Scripts\activate
```

### Linux/macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=post_board
CORS_ORIGINS=http://localhost:3000
```

Start backend:

```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Backend URLs:

- API: http://localhost:8001/api/
- Swagger: http://localhost:8001/docs

---

## Frontend Setup

Open another terminal.

```bash
cd frontend
```

Install packages:

```bash
yarn install
```

Create a `.env` file inside the frontend folder:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=0
```

Start frontend:

```bash
yarn start
```

Open:

```
http://localhost:3000
```

---

## Project Structure

```
Billing-Dashboard-main/
│
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── package.json
│   ├── src/
│   └── .env
│
└── README.md
```

---

## API Endpoints

| Method | Endpoint |
|---------|----------|
| GET | /api/ |
| GET | /api/users |
| POST | /api/users |
| GET | /api/plans |
| POST | /api/plans |
| GET | /api/subscriptions |
| POST | /api/subscriptions |
| POST | /api/usage |
| GET | /api/users/{userId}/current-usage |
| GET | /api/users/{userId}/billing-summary |

---

## Troubleshooting

### MongoDB not running

```bash
docker start mongo
```

### Backend dependency issues

```bash
pip install -r requirements.txt
```

### Frontend dependency issues

```bash
rm -rf node_modules
yarn install
```

### Port already in use

Backend:

```bash
uvicorn server:app --port 8002
```

Frontend:

```bash
PORT=3001 yarn start
```

---

## Tech Stack

- React
- Redux Toolkit
- FastAPI
- MongoDB
- Docker
- Yarn
- Python
