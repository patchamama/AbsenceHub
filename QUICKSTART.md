# AbsenceHub Quick Start Guide

Get AbsenceHub running in 5 minutes!

## Prerequisites Check

Make sure you have installed:
- ✅ Python 3.9 or higher
- ✅ Node.js 14+ and npm
- ✅ Git (optional, if cloning)
- ✅ Docker (optional, but recommended)

## Installation (Choose your OS)

### Linux / macOS

```bash
# Make the installer executable
chmod +x install.sh

# Run the installer
./install.sh

# Or directly
python3 install.py
```

### Windows (PowerShell or CMD)

```bash
# Option 1: Run batch file
install.bat

# Option 2: Direct Python command
python install.py
```

## What the Installer Does

1. **Checks** your system for requirements
2. **Installs** Python and npm dependencies
3. **Sets up** database (Docker or external)
4. **Runs** migrations
5. **Inserts** sample data

The entire process takes about 5-10 minutes.

## Start the Application

### Automatic (Easiest)

```bash
python3 run.py
```

This starts both backend and frontend automatically and opens your browser.

### Manual (Two Terminals)

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

Then open: http://localhost:5173

## Test the Installation

Verify everything is working:

```bash
python3 verify.py
```

This generates a detailed report in `verification_report.json`.

## Try These Features

1. **Create Absence**
   - Click "Add Absence" button
   - Fill in employee service account (e.g., `s.john.doe`)
   - Select dates and type
   - Click Submit

2. **View Sample Data**
   - App loads with 24 sample absences
   - Browse the list
   - See statistics (Total, Unique Employees, By Type)

3. **Filter & Search**
   - Filter by service account or type
   - Apply filters and see results update
   - Clear filters to reset

4. **Edit/Delete**
   - Click Edit to modify an absence
   - Click Delete to remove (with confirmation)

5. **Change Language**
   - Switch between English and German
   - Preference is saved

## Database Management

### With Docker

```bash
# View the database container
docker ps | grep postgres

# Stop database
docker stop absencehub-postgres

# Start database
docker start absencehub-postgres

# View logs
docker logs absencehub-postgres
```

### With External PostgreSQL

Update credentials in `.env.installer` and restart backend.

## Troubleshooting

### "Port 5000 already in use"

```bash
# macOS/Linux - Find and kill the process
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "Cannot find Node.js"

Reinstall Node.js from https://nodejs.org/

### "psycopg2 not installed"

Install from PyPI:
```bash
pip install psycopg2-binary
```

### "npm modules not found"

Reinstall node modules:
```bash
cd frontend
rm -rf node_modules
npm install
```

## File Locations

- **Backend**: `./backend/`
- **Frontend**: `./frontend/`
- **Configuration**: `./.env.installer`
- **Sample Data**: `./backend/seed_data.py`
- **Installation Guide**: `./INSTALLATION.md`

## API Endpoints

Once running, you can test the API:

```bash
# Get all absences
curl http://localhost:5000/api/absences

# Create absence
curl -X POST http://localhost:5000/api/absences \
  -H "Content-Type: application/json" \
  -d '{
    "service_account": "s.test.user",
    "absence_type": "Urlaub",
    "start_date": "2025-12-20",
    "end_date": "2025-12-25"
  }'

# Get statistics
curl http://localhost:5000/api/statistics
```

## Next Steps

1. ✅ Complete installation
2. ✅ Start application
3. ✅ Test features
4. 📖 Read full [INSTALLATION.md](INSTALLATION.md)
5. 📖 Review [README.md](README.md)
6. 🚀 Deploy to production (see deployment guide)

## Getting Help

- Run `python3 verify.py` for detailed diagnostics
- Check `verification_report.json`
- Review error messages in terminal
- Consult `INSTALLATION.md` troubleshooting section

---

**Total Time:** ~5 minutes
**Difficulty:** Easy
**Status:** ✅ Ready to use!
