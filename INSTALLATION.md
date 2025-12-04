# AbsenceHub Installation Guide

Complete installation and setup instructions for AbsenceHub on Linux, Windows, and macOS.

## Table of Contents

- [Quick Start](#quick-start)
- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## Quick Start

For the fastest setup, use the automated installer:

```bash
python3 install.py
```

This will guide you through:
1. System requirement checks
2. Database configuration (Docker or external)
3. Backend and frontend setup
4. Sample data insertion

## System Requirements

### Minimum Requirements

- **Python**: 3.9 or higher
- **Node.js**: 14.0 or higher
- **npm**: 6.0 or higher
- **Git**: Any recent version
- **Operating System**: Linux, macOS, or Windows

### Optional Requirements

- **Docker**: For containerized PostgreSQL database (recommended for quick setup)
- **PostgreSQL**: 13+ (if using external database)

### Supported Platforms

- ✅ **Linux** (Ubuntu 20.04+, CentOS 8+, Debian 10+)
- ✅ **macOS** (10.15 Catalina or newer)
- ✅ **Windows** (10 or 11 with PowerShell or CMD)

## Installation Steps

### Step 1: Clone or Extract the Project

```bash
# If cloning from Git
git clone https://github.com/patchamama/AbsenceHub.git
cd AbsenceHub
```

### Step 2: Verify System Requirements

Run the verification script to ensure your system meets all requirements:

```bash
python3 verify.py
```

This will check for:
- Python version
- Node.js and npm
- Git
- Docker (optional)
- Project structure
- Port availability

### Step 3: Run the Installer

Execute the automated installer:

```bash
python3 install.py
```

The installer will:
1. Check all system requirements
2. Prompt you to choose database setup method
3. Install Python and npm dependencies
4. Set up the database
5. Insert sample data
6. Save configuration

### Step 4: Configure Database

During installation, you'll be asked to choose:

#### Option A: Docker Database (Recommended)

```
How would you like to set up the database?
1. Use Docker (easiest)
2. Connect to External PostgreSQL Server
```

**Choose 1** for automatic Docker setup:
- Database name: `absencehub` (default)
- Username: `postgres` (default)
- Password: `postgres` (default)

Docker will handle the rest automatically.

#### Option B: External PostgreSQL Server

**Choose 2** and provide:
- Database host (e.g., `localhost`, `192.168.1.100`)
- Port (default: `5432`)
- Username
- Password
- Database name

The installer will:
1. Test the connection
2. Create the database if it doesn't exist
3. Run migrations

### Step 5: Complete Installation

After installation completes, you'll see:

```
============================================================
                Installation Complete!
============================================================

To start the application:

  1. Start the Backend:
     cd backend
     python run.py

  2. Start the Frontend (in a new terminal):
     cd frontend
     npm run dev

  3. Open your browser:
     http://localhost:5173
```

## Database Setup

### Docker Setup

The installer automatically creates a PostgreSQL container. To manage it:

**Start the container:**
```bash
docker start absencehub-postgres
```

**Stop the container:**
```bash
docker stop absencehub-postgres
```

**View logs:**
```bash
docker logs absencehub-postgres
```

**Remove the container:**
```bash
docker rm absencehub-postgres
```

### External PostgreSQL Setup

For an existing PostgreSQL server:

1. **Create database:**
```sql
CREATE DATABASE absencehub;
```

2. **Create user:**
```sql
CREATE USER absencehub_user WITH PASSWORD 'your_password';
ALTER ROLE absencehub_user SET client_encoding TO 'utf8';
ALTER ROLE absencehub_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE absencehub_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE absencehub TO absencehub_user;
```

3. **Configure in installer** with these credentials

## Running the Application

### Automatic Launch (Recommended)

Run both backend and frontend with a single command:

```bash
python3 run.py
```

This will:
1. Verify all prerequisites
2. Start the backend server (port 5000)
3. Start the frontend dev server (port 5173)
4. Open your default browser at http://localhost:5173

### Manual Launch

**Terminal 1 - Backend:**
```bash
cd backend
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

## Sample Data

### Insert Sample Data

To populate the database with sample absence records:

```bash
cd backend
python seed_data.py
```

This creates:
- 8 sample employees
- 24 sample absence records
- Mix of vacation, sick leave, and home office entries

### Skip During Installation

If you skip sample data during installation, insert later:

```bash
python3 install.py  # Run installer again
# When prompted: "Insert sample data?" → Choose Yes
```

## Verification

### Run Full System Verification

```bash
# Quick verification (basic checks)
python3 verify.py

# Full verification (includes build test)
python3 verify.py --full
```

This checks:
- System information
- All requirements
- Backend setup
- Frontend setup
- Database setup
- Port availability
- Frontend build capability

Generates `verification_report.json` with detailed results.

### Manual Testing

#### Test Backend API

```bash
# Get all absences
curl http://localhost:5000/api/absences

# Get statistics
curl http://localhost:5000/api/statistics

# Create absence
curl -X POST http://localhost:5000/api/absences \
  -H "Content-Type: application/json" \
  -d '{
    "service_account": "s.test.user",
    "absence_type": "Urlaub",
    "start_date": "2025-12-15",
    "end_date": "2025-12-20"
  }'
```

#### Test Frontend

1. Open http://localhost:5173
2. Test features:
   - Create new absence
   - Edit absence
   - Delete absence
   - Filter by service account and type
   - Switch language (EN/DE)
   - View statistics

## Troubleshooting

### Port Already in Use

**Problem:** Port 5000 (backend) or 5173 (frontend) already in use

**Solution:**
```bash
# Linux/macOS - Find process using port 5000
lsof -i :5000
kill -9 <PID>

# Windows - Find process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Failed

**Problem:** Cannot connect to database

**Solution:**
1. Verify database is running:
   ```bash
   docker ps | grep absencehub-postgres  # For Docker
   ```
2. Check database credentials in `.env.installer`
3. Run verification:
   ```bash
   python3 verify.py
   ```

### Node Modules Not Found

**Problem:** `npm ERR! Cannot find module`

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Python Dependency Issues

**Problem:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
cd backend
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
```

### Docker Not Found

**Problem:** `docker: command not found`

**Solution:**
1. Install Docker from https://www.docker.com/get-started
2. After installation, restart terminal
3. Verify: `docker --version`

### Frontend Build Fails

**Problem:** `npm ERR! code ELIFECYCLE` during build

**Solution:**
```bash
cd frontend
npm run lint:fix
npm run format
npm run build
```

### macOS Specific Issues

**M1/M2 Chip:** Some Node packages may need ARM64 build:
```bash
# Use nvm to ensure correct Node architecture
nvm install 18
nvm use 18
npm install
```

### Windows Specific Issues

**PowerShell Execution Policy:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**WSL2 Recommended:**
For best experience on Windows, use Windows Subsystem for Linux 2 (WSL2)

## Configuration Files

### `.env.installer`
Automatically created by `install.py` with database configuration:
```json
{
  "type": "docker",
  "host": "localhost",
  "port": 5432,
  "user": "postgres",
  "password": "postgres",
  "database": "absencehub"
}
```

### Backend `.env`
Create `backend/.env`:
```
FLASK_APP=run.py
FLASK_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/absencehub
SECRET_KEY=your-secret-key-here
```

### Frontend `.env`
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

## Next Steps

After successful installation:

1. **Review Documentation**: Read `README.md` for project overview
2. **Test Features**: Create, edit, and delete sample absences
3. **Customize**: Modify styles in `frontend/src/App.css`
4. **Deploy**: Follow deployment guide for production setup

## Support

For issues or questions:
1. Check `verification_report.json` for detailed diagnostics
2. Review `Troubleshooting` section above
3. Check application logs in the running terminal
4. Open an issue on GitHub

## Security Notes

### Development Only

These default credentials are for development only:
```
Database: postgres / postgres
```

### Before Production

1. Change all default passwords
2. Use environment variables for secrets
3. Enable HTTPS/SSL
4. Set up proper authentication
5. Configure firewall rules
6. Review security best practices in `SECURITY.md`

---

**Version:** 1.0.0
**Last Updated:** December 2025
**Status:** ✅ Ready for Installation
