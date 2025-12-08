# Testing Python 3.13 Compatibility Fix

## Pre-Testing Checklist

- [ ] Running on macOS with Python 3.13.2
- [ ] Have 5-10 minutes available for installation
- [ ] Internet connection available
- [ ] Docker installed (optional, can test with external PostgreSQL)
- [ ] Terminal access

## Test Scenario 1: Standard Installation with Docker

**Objective**: Verify installer works with Docker database on Python 3.13

### Steps

1. **Start fresh**:
   ```bash
   cd /Users/mandy/Documents/_Proyectos/AbsenceHub
   python3 install.py
   ```

2. **When prompted**:
   - `Select database setup type`: Choose **1** for Docker (easiest)
   - `Database name`: Press Enter for default (absencehub)
   - `Username`: Press Enter for default (postgres)
   - `Password`: Press Enter for default (postgres)
   - `Insert sample data`: Choose **y**

3. **Expected behavior**:
   - Installer shows "Attempting standard installation..."
   - Installation proceeds through requirements
   - **Outcome A** (Best): "Backend dependencies installed" ✓ PASS
   - **Outcome B** (Strategy 2): "trying pre-built wheels only..." then success ✓ PASS
   - **Outcome C** (Strategy 3): "attempting compilation..." then success ✓ PASS
   - **Outcome D** (Strategy 4): macOS ARM64 specific then success ✓ PASS
   - **Outcome E** (Fallback): User guidance prompt, can continue with external DB

4. **If successful**:
   - Docker container should be running: `docker ps | grep postgres`
   - Database should be accessible
   - Sample data inserted (24 records)

5. **Continue with**:
   ```bash
   python3 run.py
   ```
   - Backend starts on port 5000
   - Frontend starts on port 5173
   - Browser opens to http://localhost:5173

### Expected Results
- ✅ Installation completes without psycopg2 build errors
- ✅ Backend and frontend both start successfully
- ✅ Application loads with sample data
- ✅ All 24 absences visible in table

## Test Scenario 2: Installation with External PostgreSQL

**Objective**: Verify installer works with external database as fallback

### Prerequisites
- PostgreSQL 13+ running locally or on another server
- Connection details available

### Steps

1. **Start installer**:
   ```bash
   python3 install.py
   ```

2. **When prompted**:
   - `Select database setup type`: Choose **2** for External Server
   - `PostgreSQL host`: Enter your server (e.g., localhost, 192.168.1.100)
   - `Port`: Press Enter for default (5432)
   - `Database name`: Enter database name (e.g., absencehub)
   - `Username`: Enter user (e.g., postgres)
   - `Password`: Enter password
   - `Insert sample data`: Choose **y**

3. **Expected behavior**:
   - Installer validates connection to PostgreSQL
   - If connection succeeds: "Database connection successful" ✓
   - If connection fails: Error message with helpful guidance
   - Migrations run against external database
   - Sample data inserted

4. **Verify database**:
   ```bash
   # Using psql
   psql -h localhost -U postgres -d absencehub
   # Run query
   SELECT COUNT(*) FROM employee_absences;
   # Should return: 24
   ```

### Expected Results
- ✅ Connection to external PostgreSQL succeeds
- ✅ Database migrations complete
- ✅ 24 sample records inserted
- ✅ Application runs with external database

## Test Scenario 3: Verify Installation Report

**Objective**: Confirm system verification tool works correctly

### Steps

1. **After installation completes**, run verification:
   ```bash
   python3 verify.py
   ```

2. **Check output**:
   ```
   ✓ Python 3.13.2: Found
   ✓ Node.js: Found [version]
   ✓ npm: Found [version]
   ✓ Git: Found [version]
   ✓ Docker: Found [version]
   ✓ Backend directory: Exists
   ✓ Backend requirements: Installed
   ✓ Frontend directory: Exists
   ✓ Frontend dependencies: Installed
   ✓ Database connection: Connected
   ✓ Port 5000: Available
   ✓ Port 5173: Available
   ✓ Frontend build: Success
   ```

3. **Check report file**:
   ```bash
   cat verification_report.json | jq '.'
   ```

   Expected JSON structure:
   ```json
   {
     "system": {
       "os": "Darwin",
       "architecture": "arm64",
       "python_version": "3.13.2"
     },
     "requirements": {
       "python": true,
       "node": true,
       "npm": true,
       "git": true,
       "docker": true
     },
     "backend": {
       "directory": true,
       "requirements_file": true,
       "dependencies": true,        // ← Should be true now
       "main_files": true
     },
     "frontend": {
       "directory": true,
       "package_json": true,
       "dependencies": true,
       "configuration": true,
       "build": true
     },
     "database": {
       "config": true               // ← Should be true if Docker/External setup
     },
     "api": {
       "ports": true                // ← Should be true if running
     }
   }
   ```

### Expected Results
- ✅ All system checks pass
- ✅ Backend dependencies: true (was false before fix)
- ✅ Database config: true
- ✅ Report saved successfully

## Test Scenario 4: Application Functionality

**Objective**: Verify application works end-to-end after Python 3.13 installation

### Steps

1. **Start application**:
   ```bash
   python3 run.py
   ```

2. **Wait for startup** (30-60 seconds):
   - Backend Flask server starts
   - Frontend Vite dev server starts
   - Browser opens to http://localhost:5173

3. **Test CRUD operations**:
   - [ ] View sample data (24 absences visible)
   - [ ] Create new absence (click "Add Absence")
   - [ ] Edit existing absence (click Edit on any record)
   - [ ] Delete absence (click Delete with confirmation)
   - [ ] Filter by employee (enter service account)
   - [ ] Filter by type (select from dropdown)
   - [ ] Check statistics (total count at top)

4. **Test API directly**:
   ```bash
   # Get all absences
   curl http://localhost:5000/api/absences

   # Should return JSON array with 24+ records
   # Each record should have: id, service_account, absence_type, start_date, end_date, created_at, updated_at
   ```

5. **Test filtering**:
   ```bash
   # Filter by service account
   curl "http://localhost:5000/api/absences?service_account=s.john.doe"

   # Filter by type
   curl "http://localhost:5000/api/absences?absence_type=Urlaub"
   ```

6. **Test statistics**:
   ```bash
   curl http://localhost:5000/api/statistics

   # Should return:
   # {"total_absences": 24, "unique_employees": 8, "by_type": {...}}
   ```

### Expected Results
- ✅ Application loads without errors
- ✅ Sample data displays (24 records)
- ✅ CRUD operations work
- ✅ Filtering works
- ✅ API endpoints respond correctly
- ✅ Statistics accurate
- ✅ No psycopg2 related errors

## Test Scenario 5: Alternative Python Versions (Optional)

**Objective**: Verify installer still works with Python 3.11/3.12

### Steps

1. **Check available Python versions**:
   ```bash
   python3.11 --version 2>/dev/null || echo "Python 3.11 not found"
   python3.12 --version 2>/dev/null || echo "Python 3.12 not found"
   python3.13 --version
   ```

2. **Install with Python 3.12** (if available):
   ```bash
   python3.12 install.py
   ```

3. **Verify same results as Python 3.13**

### Expected Results
- ✅ Python 3.11 works
- ✅ Python 3.12 works (likely faster)
- ✅ Python 3.13 works (with new multi-strategy approach)

## Debugging Failed Installation

If installation fails at any strategy:

### 1. Check Error Output
```bash
# Re-run installer with verbose output
python3 install.py 2>&1 | tee install.log
```

### 2. Review Verification Report
```bash
python3 verify.py --full
cat verification_report.json
```

### 3. Check psycopg2 Compatibility
```bash
python3 -c "import psycopg2; print(psycopg2.__version__)"
# If error, psycopg2 not installed
```

### 4. Try Manual Installation
```bash
cd backend
python3 -m pip install psycopg2-binary --verbose
# Shows detailed compilation output
```

### 5. Check Xcode Tools (macOS)
```bash
xcode-select -p
# Should return /Applications/Xcode.app/Contents/Developer
# If error, run: xcode-select --install
```

### 6. Check Homebrew (macOS)
```bash
brew --version
brew list | grep postgresql
```

## Performance Metrics

Record these metrics during testing:

| Metric | Expected | Actual |
|--------|----------|--------|
| Installation time (Strategy 1 success) | < 2 minutes | |
| Installation time (Strategy 3-4 fallback) | 3-5 minutes | |
| Database connection time | < 1 second | |
| Verification script time | < 30 seconds | |
| Application startup time | < 60 seconds | |
| API response time (GET /api/absences) | < 200ms | |
| Frontend load time (first paint) | < 2 seconds | |

## Test Results Template

```
Date: _______________
OS: macOS _______________
Python: 3.13.2
Architecture: arm64 (M1/M2)
Docker: [Yes/No]
PostgreSQL: [Docker/External/None]

Installation Strategy Used: _______________
Installation Time: _______________

TEST RESULTS:
Scenario 1 (Docker): [ ] PASS [ ] FAIL [ ] SKIPPED
Scenario 2 (External): [ ] PASS [ ] FAIL [ ] SKIPPED
Scenario 3 (Verify): [ ] PASS [ ] FAIL [ ] SKIPPED
Scenario 4 (Functionality): [ ] PASS [ ] FAIL [ ] SKIPPED
Scenario 5 (Alt Python): [ ] PASS [ ] FAIL [ ] SKIPPED

Overall Result: [ ] ALL PASS [ ] PARTIAL PASS [ ] FAILED

Issues Found:
_________________________________
_________________________________

Notes:
_________________________________
_________________________________
```

## Success Criteria

✅ **Installation must succeed** with one of 5 strategies on Python 3.13
✅ **No psycopg2 build errors** during installation
✅ **Verification report** shows all dependencies: true
✅ **Application runs** without database connection errors
✅ **Sample data loads** (24 records visible)
✅ **CRUD operations work** (create, read, update, delete)
✅ **API endpoints respond** correctly and quickly
✅ **Frontend loads** in under 2 seconds
✅ **No errors in browser console**

---

**Test Version:** 1.0
**Compatible With:** AbsenceHub installer v1.0 with Python 3.13 fix
**Last Updated:** December 2025
