# Rehab360 Project Initialization Guide

This guide explains how to clone, initialize, and run the Rehab360 project for development on macOS/Linux and Windows.

## 1) Prerequisites

- Python 3.11+ installed
- Git installed
- `pip` available
- Recommended: Use a virtual environment

## 2) Clone the repository

```bash
# From any shell (bash/pwsh/cmd as appropriate)
git clone <your-repo-url>
cd Rehab360/Rehab360
```

## 3) Set up the Python backend environment

### macOS / Linux (bash/zsh)
```bash
cd server
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Windows (PowerShell)
```powershell
cd server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Windows (cmd)
```cmd
cd server
python -m venv .venv
.\.venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 4) Create local environment config

TBD

## 5) Run the backend server

### macOS / Linux
```bash
cd server
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Windows (PowerShell)
```powershell
cd server
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Windows (cmd)
```cmd
cd server
.\.venv\Scripts\activate.bat
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 6) Verify the service is running

Open in browser or use curl:

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status":"healthy"}
```

## 7) Common workflow

1. Activate venv
2. Install new dependencies: `pip install <pkg>` and `pip freeze > requirements.txt`
3. Run backend: Navigate to server directory and run `uvicorn app.main:app --reload`
4. Open API docs: `http://localhost:8000/docs`

## 8) Quick troubleshooting

- If `uvicorn` not found, ensure venv is activated and dependencies installed.
- If port 8000 is busy, run `uvicorn app.main:app --reload --port 8001`.
- If environment variables are missing, verify `server/.env` exists.

## 9) Notes for frontend

The `client/` folder is currently empty in this branch. If frontend code is added later, follow the new front-end README for install and run steps.

---

If your team wants a one-liner to start after setup (macOS/Linux):
```bash
cd Rehab360/Rehab360/server && source .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

For Windows PowerShell:
```powershell
cd Rehab360\Rehab360\server; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
