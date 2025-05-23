# Agentic_Worker

A full-stack application consisting of three services:

1. **Frontend** (JavaScript/Node)  
2. **Backend** (Go)  
3. **Python Server** (FastAPI)

---

## Prerequisites

- **Node.js** (v14+) & **npm**  
- **Go** (v1.16+)  
- **Python** (v3.7+)  
---

## Project Structure

```
├── frontend/          
│   ├── package.json
├── backend/          
│   ├── go.mod
│   ├── main.go
├── python-server/   
│   ├── python_service.py 
└── README.md
```
## Installation & Running

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Runs at: `http://localhost:5173`

---

### Backend

```bash
cd backend
go mod tidy
go run main.go
```

- Listens on: `http://localhost:8080`

---

### Python Server

1. **(Optional)** Create & activate a virtual environment:
   ```bash
   cd python-server
   python3 -m venv venv
   # Linux/macOS:
   source venv/bin/activate
   # Windows:
   venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run with Uvicorn**:
   ```bash
   uvicorn python_service:app \
     --host 0.0.0.0 \
     --port 8000 \
     --reload
   ```

- Serves on: `http://localhost:8000`

---

