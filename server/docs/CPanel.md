# CPanel.md

This file documents the cPanel server setup and all deployment procedures for Rehab360.

---

## Server Details

| Property | Value |
|---|---|
| **User** | `shanimi2` |
| **Home directory** | `/home/shanimi2/` |
| **Project directory** | `/home/shanimi2/Rehab360/` |
| **Public web root** | `/home/shanimi2/public_html/` |
| **Python version** | 3.12.13 (via `/usr/bin/python3.12`) |
| **Node version** | v24.15.0 (via NVM) |
| **Backend port** | 8000 |

---

## Database

| Property | Value |
|---|---|
| **Host** | `localhost` |
| **Database name** | `shanimi2_rehab360_db` |
| **User** | `shanimi2_u1` |
| **Schema file** | `~/Rehab360/db/init.sql` |

### Import the schema

The `init.sql` file contains `CREATE DATABASE` and `USE` statements (lines 1–2) and `DROP TABLE` statements (lines 3–13) that are incompatible with cPanel's database naming. Always skip them on import:

```bash
tail -n +14 ~/Rehab360/db/init.sql | mysql -u shanimi2_u1 -p shanimi2_rehab360_db
```

### Verify tables

```bash
mysql -u shanimi2_u1 -p shanimi2_rehab360_db -e "SHOW TABLES;"
```

Expected tables: `content`, `exercise_completion`, `exercises`, `plan_exercises`, `plans`, `queries`, `saved_content`, `registered_users`, `sessions`, `weekly_plans`

---

## Environment Variables

The `.env` file is not in version control. After every fresh clone, recreate it manually:

```bash
nano ~/Rehab360/server/.env
```

```env
DB_HOST=localhost
DB_USER=shanimi2_u1
DB_PASSWORD=
DB_NAME=shanimi2_rehab360_db
```

---

## Backend

The backend is a FastAPI app running via uvicorn on port 8000.

### Virtual environment

```bash
cd ~/Rehab360/server
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Start the backend (background)

```bash
cd ~/Rehab360/server
source .venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > uvicorn.log 2>&1 &
echo $! > uvicorn.pid
```

### Stop the backend

```bash
kill $(cat ~/Rehab360/server/uvicorn.pid)
```

### Check if running

```bash
ps aux | grep uvicorn
```

### View logs

```bash
tail -f ~/Rehab360/server/uvicorn.log
```

---

## Frontend

The frontend is a React/Vite SPA. The production build is served statically from `public_html/`.

### API Base URL

The frontend communicates with the backend via `apiClient.ts`. Before building for cPanel, make sure the base URL is set to the production URL — **not localhost**:

```typescript
// client/src/lib/apiClient.ts
baseURL: 'http://shanimi2.mtacloud.co.il:8000'
```

> ⚠️ During local development this points to `localhost`. Remember to update it before every cPanel deployment, and revert it after.

API docs on the live server will be available at `http://shanimi2.mtacloud.co.il:8000/docs`.

### Build and deploy

```bash
cd ~/Rehab360/client
npm install
npm run build
cp -r dist/* ~/public_html/
```

### NVM (Node Version Manager)

NVM is installed at `~/.nvm`. It is not loaded automatically in non-interactive shells. Always load it before running `node` or `npm`:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

---

## Full Redeployment Procedure

Follow these steps **in order** when redeploying from scratch.

### 1 — Stop the backend

```bash
pkill -f uvicorn
```

### 2 — Delete the project

```bash
rm -rf ~/Rehab360
```

### 3 — Drop the database

```bash
mysql -u shanimi2_u1 -p -e "DROP DATABASE shanimi2_rehab360_db;"
```

### 4 — Clone the project

```bash
cd ~
git clone https://github.com/shanimic/Rehab360
```

### 5 — Recreate the database

```bash
mysql -u shanimi2_u1 -p -e "CREATE DATABASE shanimi2_rehab360_db;"
```

### 6 — Import the schema

```bash
tail -n +14 ~/Rehab360/db/init.sql | mysql -u shanimi2_u1 -p shanimi2_rehab360_db
```

### 7 — Restore the `.env` file

```bash
nano ~/Rehab360/server/.env
```

### 8 — Set up the backend

```bash
cd ~/Rehab360/server
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > uvicorn.log 2>&1 &
echo $! > uvicorn.pid
```

### 9 — Build and deploy the frontend

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd ~/Rehab360/client
npm install
npm run build
cp -r dist/* ~/public_html/
```

---

## Quick Redeploy (bug fix / code update only)

When only redeploying code changes without touching the database:

```bash
# Pull latest
cd ~/Rehab360
git pull origin main

# Rebuild frontend
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd client
npm install
npm run build
cp -r dist/* ~/public_html/

# Restart backend
cd ../server
source .venv/bin/activate
pip install -r requirements.txt
kill $(cat uvicorn.pid)
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > uvicorn.log 2>&1 &
echo $! > uvicorn.pid
```
