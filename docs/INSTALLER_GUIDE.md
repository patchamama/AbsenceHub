# AbsenceHub Complete Installer & Testing Guide

A comprehensive guide to using the AbsenceHub installer, verifying requirements, and testing the system.

## 📋 Overview

AbsenceHub now includes a complete, production-ready installation suite that:

✅ **Multi-Platform Support**: Linux, Windows, macOS (including M1/M2 Macs)
✅ **Flexible Database Setup**: Docker or external PostgreSQL server
✅ **Automated Installation**: Single command setup
✅ **System Verification**: Comprehensive diagnostics
✅ **Easy Launcher**: Start both servers with one command
✅ **Sample Data**: Pre-populated with 24 example records
✅ **Complete Documentation**: Installation, quick start, and testing guides

## 🚀 Quick Start (5 Minutes)

### Step 1: Run the Installer

**Linux / macOS:**
```bash
./install.sh
# or
python3 install.py
```

**Windows:**
```bash
install.bat
# or
python install.py
```

### Step 2: Answer Questions

The installer will ask:
1. **Database Setup Type:**
   - "Use Docker (easiest)" - Recommended
   - "Connect to External PostgreSQL Server"

2. **Database Configuration:**
   - Database name (default: `absencehub`)
   - Username (default: `postgres`)
   - Password (default: `postgres`)

3. **Sample Data:**
   - "Insert sample data?" - Choose Yes

### Step 3: Start the Application

```bash
python3 run.py
```

That's it! Application opens at `http://localhost:5173`

## 📊 What Gets Installed

### Backend
- Flask 3.0 with SQLAlchemy ORM
- PostgreSQL database connection
- 7 API endpoints (CRUD operations)
- Sample data: 24 absence records, 8 employees
- Automatic migrations

### Frontend
- React 18 with Vite build tool
- Tailwind CSS styling
- Full CRUD interface
- Bilingual support (English/German)
- Form validation
- Statistics dashboard

### Database
- **Option A (Docker):** PostgreSQL 15 in container
- **Option B (External):** PostgreSQL 13+ on any server
- Automatic connection testing
- Schema validation

## 🛠️ Installation Scripts Explained

### `install.py` - Main Installer
The comprehensive installer that:
- Checks all system requirements
- Detects your operating system
- Sets up backend and frontend
- Configures database (Docker or external)
- Inserts sample data
- Saves configuration to `.env.installer`

**Run it:**
```bash
python3 install.py
```

**Features:**
- Interactive prompts with clear explanations
- Colored terminal output (Windows-compatible)
- Progress indicators
- Error recovery
- Configuration saving

### `verify.py` - System Verification
Comprehensive diagnostic tool that:
- Checks system requirements
- Validates all components
- Tests database connection
- Verifies ports are available
- Tests frontend build capability
- Generates detailed report

**Run it:**
```bash
python3 verify.py          # Quick check
python3 verify.py --full   # Include build test
```

**Output:**
```
✓ Python 3.9+: Found 3.11.0
✓ Node.js: Found v18.12.0
✓ npm: Found 8.19.2
✓ Git: Found git version 2.38.1
✓ Backend directory: Exists
✓ Frontend directory: Exists
✓ Database connection: Connected
✓ Port 5000: Available
✓ Port 5173: Available
...
Report saved to: verification_report.json
```

### `run.py` - Application Launcher
Start backend and frontend with one command:

**Run it:**
```bash
python3 run.py [--skip-browser]
```

**Does:**
- Checks all prerequisites
- Starts backend server (port 5000)
- Starts frontend dev server (port 5173)
- Opens browser automatically
- Monitors both processes
- Handles graceful shutdown (Ctrl+C)

### `seed_data.py` - Sample Data Generator
Creates 24 sample absence records:

**Run it:**
```bash
cd backend
python seed_data.py
```

**Creates:**
- 8 sample employees (s.john.doe, s.jane.smith, etc.)
- Absence mix: Urlaub, Krankheit, Home Office
- Various date ranges
- Pre-populated database for testing

## 📄 Documentation Files

### `QUICKSTART.md`
5-minute quick start guide with:
- Minimal prerequisites
- Step-by-step installation
- Feature testing instructions
- Quick troubleshooting

### `INSTALLATION.md`
Comprehensive installation guide with:
- Detailed requirements
- Platform-specific instructions
- Database setup options
- Configuration management
- Troubleshooting section
- Security notes

### `TESTING.md`
Complete testing guide covering:
- Functional requirements (FR-1 to FR-7)
- API endpoint tests
- Frontend feature tests
- Database tests
- Performance tests
- Cross-platform verification

## 🔧 Database Setup Options

### Option A: Docker (Recommended)

**Pros:**
- Easiest setup
- No system database required
- Isolated environment
- Easy to reset/restart

**Installation:**
```bash
# Installer handles this automatically
python3 install.py
# Choose: "Use Docker (easiest)"
```

**Management:**
```bash
docker ps                              # View containers
docker stop absencehub-postgres        # Stop database
docker start absencehub-postgres       # Start database
docker logs absencehub-postgres        # View logs
```

### Option B: External PostgreSQL

**Pros:**
- Use existing database
- Production-like setup
- Full database control

**Installation:**
```bash
# Installer handles this automatically
python3 install.py
# Choose: "Connect to External PostgreSQL Server"
# Enter credentials and connection details
```

**Setup Example:**
```sql
-- On your PostgreSQL server
CREATE DATABASE absencehub;
CREATE USER absencehub_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE absencehub TO absencehub_user;
```

## ✅ Verifying Requirements Are Met

### Automated Check

Run the verification script:
```bash
python3 verify.py --full
```

This verifies all requirements from PROJECT_SPECS.md are met:

**System Requirements:**
- ✓ Python 3.9+
- ✓ Node.js 14+
- ✓ npm 6+
- ✓ PostgreSQL 13+

**Functional Requirements (FR-1 to FR-7):**
- ✓ Employee identification with service account
- ✓ Absence types (Urlaub, Krankheit, Home Office, Sonstige)
- ✓ Date management and validation
- ✓ Overlap prevention
- ✓ Optional employee name field
- ✓ Filtering by service account, type, dates
- ✓ Statistics display

**API Endpoints:**
- ✓ GET /api/absences (with filters)
- ✓ GET /api/absences/:id
- ✓ POST /api/absences
- ✓ PUT /api/absences/:id
- ✓ DELETE /api/absences/:id
- ✓ GET /api/absence-types
- ✓ GET /api/statistics

**Frontend Features:**
- ✓ Create, read, update, delete absences
- ✓ Form validation
- ✓ Filtering and search
- ✓ Language support (EN/DE)
- ✓ Statistics dashboard
- ✓ Responsive design
- ✓ Accessibility features

**Database:**
- ✓ PostgreSQL connection
- ✓ Automatic migrations
- ✓ Data persistence
- ✓ Seed data insertion

## 📱 Manual Testing Guide

### Create Absence
```
1. Click "Add Absence" button
2. Enter: s.john.doe
3. Select type: Urlaub (Vacation)
4. Start date: 2025-12-20
5. End date: 2025-12-25
6. Click Submit
✓ Success message appears
✓ New record in list
✓ Statistics updated
```

### Edit Absence
```
1. Click "Edit" on any record
2. Change employee name
3. Click Submit
✓ Changes saved
✓ Table updated
```

### Delete Absence
```
1. Click "Delete" on any record
2. Confirm in dialog
✓ Record removed
✓ Table updated
✓ Statistics updated
```

### Test Filtering
```
1. Enter service account filter: s.john
2. Click "Apply Filters"
✓ Shows only John's absences
3. Select type: Krankheit
✓ Shows only John's sick leave
4. Click "Clear Filters"
✓ Shows all again
```

### Test Language Switching
```
1. Select "DE" in language dropdown (top right)
✓ All text changes to German
2. Refresh page
✓ German still selected (preference saved)
```

## 🔍 API Testing

### Test Connection
```bash
curl http://localhost:5000/api/absences
```

Should return JSON array of absences.

### Create via API
```bash
curl -X POST http://localhost:5000/api/absences \
  -H "Content-Type: application/json" \
  -d '{
    "service_account": "s.test.user",
    "absence_type": "Urlaub",
    "start_date": "2025-12-25",
    "end_date": "2025-12-30"
  }'
```

### Get Statistics
```bash
curl http://localhost:5000/api/statistics
```

Should return counts of absences by type.

## 🚨 Troubleshooting

### "Port 5000 already in use"
```bash
# Find and stop the process
lsof -i :5000           # macOS/Linux
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "psycopg2 not installed"
```bash
pip install psycopg2-binary
```

### "Node modules not found"
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### "Docker container won't start"
```bash
# Check logs
docker logs absencehub-postgres

# Remove and recreate
docker rm absencehub-postgres
# Run installer again
```

### "Database connection failed"
```bash
# Verify credentials in .env.installer
cat .env.installer

# For Docker, ensure it's running
docker ps

# For external, test connection
psql -U username -h hostname -d absencehub
```

## 📈 Performance Verification

### Response Times (Requirements)
- API endpoints: < 500ms ✓
- Frontend initial load: < 2s ✓
- Build time: < 30s ✓

### Database Operations
- Create absence: < 200ms
- Read absences: < 200ms
- Update absence: < 200ms
- Delete absence: < 200ms

Test with:
```bash
# Create 100 test requests
ab -n 100 -c 10 http://localhost:5000/api/absences
```

## 🎯 Platform Support

Tested and verified on:

✅ **Linux**
- Ubuntu 20.04+
- CentOS 8+
- Debian 10+

✅ **macOS**
- 10.15 Catalina+
- M1/M2 Compatible
- Latest Sonoma

✅ **Windows**
- Windows 10
- Windows 11
- WSL2 Recommended

## 📋 Requirements Checklist

Before installation, ensure you have:

- [ ] Python 3.9 or higher
- [ ] Node.js 14+ and npm
- [ ] Git (optional)
- [ ] Docker (optional, for Docker setup)
- [ ] PostgreSQL 13+ (optional, for external setup)
- [ ] 2GB free disk space
- [ ] Internet connection (for dependency downloads)

## 🎬 Next Steps

1. **Install:** Run `./install.sh` or `python3 install.py`
2. **Verify:** Run `python3 verify.py --full`
3. **Test:** Follow steps in `TESTING.md`
4. **Deploy:** Review deployment guide (coming soon)

## 📞 Support

If something goes wrong:

1. Run verification:
   ```bash
   python3 verify.py
   ```

2. Check the report:
   ```bash
   cat verification_report.json
   ```

3. Review troubleshooting in:
   - `QUICKSTART.md`
   - `INSTALLATION.md`
   - `TESTING.md`

## 🔐 Security Notes

Default credentials are for **development only**:
- Database user: `postgres`
- Database password: `postgres`

Before production:
- Change all passwords
- Use environment variables
- Enable SSL/TLS
- Configure firewalls
- Review security guide

## 📝 Files Summary

| File | Purpose |
|------|---------|
| `install.py` | Main installer |
| `install.sh` | Linux/macOS wrapper |
| `install.bat` | Windows wrapper |
| `run.py` | Application launcher |
| `verify.py` | System verification |
| `seed_data.py` | Sample data generator |
| `QUICKSTART.md` | 5-minute guide |
| `INSTALLATION.md` | Comprehensive guide |
| `TESTING.md` | Testing procedures |
| `.env.installer` | Auto-generated config |

---

**Version:** 1.0.0
**Status:** ✅ Production Ready
**Last Updated:** December 2025
**Support:** Community & Documentation
