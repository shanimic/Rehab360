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

The `init.sql` file contains `CREATE DATABASE` and `USE` statements (lines 1–2) and `DROP TABLE` statements (lines 3–15) that are incompatible with cPanel's database naming. Always skip them on import:

```bash
tail -n +16 ~/Rehab360/db/init.sql | mysql -u shanimi2_u1 -p shanimi2_rehab360_db
```

### Verify tables

```bash
mysql -u shanimi2_u1 -p shanimi2_rehab360_db -e "SHOW TABLES;"
```

Expected tables: `content`, `exercise_completion`, `exercises`, `plan_exercises`, `plans`, `queries`, `saved_content`, `registered_users`, `sessions`, `url_verifications`, `weekly_plans`

---

## Environment Variables

The `.env` file holds all secrets and environment-specific config. It is intentionally excluded from version control (`.gitignore`) so credentials are never committed. After every fresh clone or full redeployment, recreate it manually:

```bash
nano ~/Rehab360/server/.env
```

```env
DB_HOST=localhost
DB_USER=shanimi2_u1
DB_PASSWORD=
DB_NAME=shanimi2_rehab360_db
GEMINI_API_KEY=
```

| Variable | Purpose |
|---|---|
| `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL connection — the backend uses these to connect to the cPanel database. |
| `GEMINI_API_KEY` | Google Gemini API key — required for the AI-powered search feature (Process 2). Without it, all `/api/ai-search` endpoints will fail. Obtain a key from [Google AI Studio](https://aistudio.google.com/app/apikey). |

---

## Backend

The backend is a FastAPI app running via uvicorn on port 8000, behind a reverse proxy at `/api`.

### Virtual environment

```bash
cd ~/Rehab360/server
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Start the backend (background)

The `--root-path /api` flag is required so FastAPI generates correct OpenAPI URLs behind the reverse proxy.

```bash
cd ~/Rehab360/server
source .venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --root-path /api > uvicorn.log 2>&1 &
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

The site is served over **HTTPS**. The API base URL must use `https://` — using `http://` causes browsers to block requests (Mixed Content policy).

Use `sed` to update the URL on the server after cloning (no editor needed):

```bash
sed -i "s|http://localhost:8000|https://shanimi2.mtacloud.co.il/api|g" ~/Rehab360/client/src/lib/apiClient.ts
```

Verify:
```bash
cat ~/Rehab360/client/src/lib/apiClient.ts
```

API docs on the live server: `https://shanimi2.mtacloud.co.il/api/docs`

### .htaccess

The `public_html/.htaccess` must contain both the reverse proxy rules **and** the SPA fallback rule. Without the SPA fallback, hard-refreshing any route returns a 404.

```apache
RewriteEngine On
RewriteRule ^api$ http://localhost:8000/ [P,L]
RewriteRule ^api/(.*) http://localhost:8000/$1 [P,L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]

# php -- BEGIN cPanel-generated handler, do not edit
# Set the "ea-php74" package as the default "PHP" programming language.
<IfModule mime_module>
  AddHandler application/x-httpd-ea-php74 .php .php7 .phtml
</IfModule>
# php -- END cPanel-generated handler, do not edit
```

### Build and deploy

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
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
tail -n +16 ~/Rehab360/db/init.sql | mysql -u shanimi2_u1 -p shanimi2_rehab360_db
```

### 7 — Restore the `.env` file

```bash
nano ~/Rehab360/server/.env
```

### 8 — Point the frontend at the production server

```bash
sed -i "s|http://localhost:8000|https://shanimi2.mtacloud.co.il/api|g" ~/Rehab360/client/src/lib/apiClient.ts
```

### 9 — Set up the backend

```bash
cd ~/Rehab360/server
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --root-path /api > uvicorn.log 2>&1 &
echo $! > uvicorn.pid
```

### 10 — Build and deploy the frontend

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

# Restore production URL (overwritten by git pull)
sed -i "s|http://localhost:8000|https://shanimi2.mtacloud.co.il/api|g" ~/Rehab360/client/src/lib/apiClient.ts

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
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --root-path /api > uvicorn.log 2>&1 &
echo $! > uvicorn.pid
```
