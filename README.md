# AbsenceHub - Employee Absence Management System

A comprehensive Employee Absence Management System built with Flask, React, and PostgreSQL. Track and manage employee absences with support for multiple absence types, data validation, and internationalization (English & German).

## Features

- ✅ Complete CRUD operations for employee absences
- ✅ Real-time validation with clear error messages
- ✅ Prevention of overlapping absences for the same type
- ✅ Advanced filtering by employee, type, and date range
- ✅ Internationalization support (English & German)
- ✅ WCAG AA accessibility compliance
- ✅ Comprehensive test coverage (>80% backend, >70% frontend)
- ✅ RESTful API with proper error handling
- ✅ Responsive design for desktop, tablet, and mobile

## Tech Stack

### Backend
- **Framework**: Flask 3.0 (Python 3.9+)
- **Database**: PostgreSQL 13+
- **ORM**: SQLAlchemy
- **Testing**: pytest + pytest-flask + pytest-cov
- **Code Quality**: Black (formatter) + Flake8 (linter)

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite 5+
- **Styling**: Tailwind CSS
- **State Management**: React useState/useContext
- **API Client**: Axios
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier

## Prerequisites

- Python 3.9+ (for backend)
  - **Python 3.13 support**: Fully supported with optimized installation strategy (see [PYTHON313_FIX.md](PYTHON313_FIX.md) for details)
  - **Recommended**: Python 3.11 or 3.12 for fastest installation
- Node.js 18+ (for frontend)
- PostgreSQL 13+ (or Docker for containerized setup)
- Git

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/patchamama/AbsenceHub.git
cd AbsenceHub

# Copy environment variables
cp .env.example .env

# Start PostgreSQL
docker-compose up -d postgres

# Wait for PostgreSQL to be healthy, then setup backend
```

### Manual Setup

#### Backend Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip3 install -r requirements.txt

# Create .env file
cp .env.example .env

# Initialize database
flask db init
flask db migrate -m "create employee_absences table"
flask db upgrade

# (Optional) Seed database with example data
flask seed-db

# Run backend server
flask run
# Backend will be available at http://localhost:5000
```

#### Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev
# Frontend will be available at http://localhost:5173
```

### Port Configuration

#### Backend Port Configuration

The backend automatically detects and uses available ports:

- **Default Port**: `5000` (configurable via `FLASK_PORT` in `.env`)
- **Automatic Fallback**: If port 5000 is in use, the backend will automatically try ports 5001, 5002, etc.
- **Port Discovery File**: The backend writes its active port to `.backend-port` file for frontend discovery

**Example: Configure custom default port**
```bash
# backend/.env
FLASK_PORT=5001  # Use port 5001 as the default
```

When you start the backend, you'll see:
```bash
✓ Flask backend running on http://localhost:5000
✓ API endpoints available at http://localhost:5000/api
```

Or if port 5000 is occupied:
```bash
⚠  Port 5000 is in use. Using port 5001 instead.
✓ Flask backend running on http://localhost:5001
✓ API endpoints available at http://localhost:5001/api
```

#### Frontend Backend Discovery

The frontend automatically discovers the backend through multiple strategies:

1. **Auto-Detection**: Reads `.backend-port` file to find the active backend port
2. **localStorage Cache**: Remembers the last working backend URL
3. **Fallback Ports**: Tries ports 5000, 5001, 5002 if configured URL fails
4. **Manual Configuration**: Set `VITE_API_URL` in `.env` for custom backend URL

**Example: Configure frontend for different environments**
```bash
# frontend/.env

# Development (local)
VITE_API_URL=http://localhost:5000/api

# Development (different machine)
VITE_API_URL=http://192.168.1.100:5000/api

# Production
VITE_API_URL=https://api.example.com/api

# Fallback ports (comma-separated)
VITE_FALLBACK_PORTS=5000,5001,5002
```

**How it works**:
- The frontend first tries the URL from `VITE_API_URL`
- If that fails, it reads `.backend-port` file to auto-detect the backend
- If that fails, it tries the last working URL from localStorage
- Finally, it tries each fallback port sequentially
- The working URL is saved to localStorage for faster future connections

## Development Workflow

### Running Tests

**Backend Tests**:
```bash
cd backend
pytest -v                    # Run all tests
pytest --cov=app           # Run with coverage report
pytest tests/test_validators.py -v  # Run specific test file
```

**Frontend Tests**:
```bash
cd frontend
npm test                     # Run all tests
npm run test:ui            # Run tests with UI
npm run test:coverage      # Generate coverage report
```

### Code Formatting

**Backend**:
```bash
cd backend
black app/ tests/           # Format code
flake8 app/ tests/          # Check linting
```

**Frontend**:
```bash
cd frontend
npm run lint                # Check linting
npm run lint:fix            # Auto-fix linting issues
npx prettier --write src/   # Format code
```

## Project Structure

```
AbsenceHub/
├── backend/                 # Flask backend application
│   ├── app/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── validators/     # Input validation
│   │   └── utils/          # Utilities
│   ├── tests/              # Test suite
│   ├── migrations/         # Database migrations
│   ├── config.py           # Configuration
│   ├── run.py             # Entry point
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API integration
│   │   ├── utils/         # Utilities
│   │   ├── i18n/          # Translations
│   │   └── App.jsx        # Main component
│   ├── public/            # Static assets
│   ├── vite.config.js     # Vite configuration
│   ├── package.json       # Node dependencies
│   └── vitest.config.js   # Test configuration
│
├── docker-compose.yml     # Docker services
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
├── CLAUDE.md            # Development guide
└── PROJECT_SPECS.md     # Specifications & requirements
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### List Absences
```
GET /absences?service_account=s.john.doe&absence_type=Urlaub&start_date=2025-01-01&end_date=2025-12-31
```

#### Get Single Absence
```
GET /absences/:id
```

#### Create Absence
```
POST /absences
Content-Type: application/json

{
  "service_account": "s.john.doe",
  "employee_fullname": "John Doe",
  "absence_type": "Urlaub",
  "start_date": "2025-01-15",
  "end_date": "2025-01-20"
}
```

#### Update Absence
```
PUT /absences/:id
Content-Type: application/json

{
  "absence_type": "Krankheit",
  "employee_fullname": "John Doe",
  "start_date": "2025-01-15",
  "end_date": "2025-01-20"
}
```

#### Delete Absence
```
DELETE /absences/:id
```

#### Get Absence Types
```
GET /absence-types
```

#### Get Statistics
```
GET /statistics
```

## Absence Types

- **Urlaub** (Vacation) - Planned time off
- **Krankheit** (Sick Leave) - Medical-related absences
- **Home Office** - Remote work days
- **Sonstige** (Other) - Miscellaneous absences

## Validation Rules

### Service Account Format
- Must start with `s.` prefix
- Format: `s.firstname.lastname`
- Example: `s.john.doe`

### Date Range
- End date must be >= start date
- Same-day absences are allowed

### Overlapping Absences
- Prevents overlapping periods for the same absence type
- Different types can overlap for the same employee
- Different employees can have overlapping absences

## Database Schema

### EmployeeAbsence Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| service_account | VARCHAR(100) | NOT NULL, INDEX |
| employee_fullname | VARCHAR(200) | NULLABLE |
| absence_type | VARCHAR(50) | NOT NULL, INDEX |
| start_date | DATE | NOT NULL, INDEX |
| end_date | DATE | NOT NULL, INDEX |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

## Internationalization

The application supports English and German. Language preference is saved to localStorage and persists across sessions.

**Supported Languages**:
- English (en) - Default
- German (de)

## Accessibility

The application is designed to be accessible according to WCAG 2.1 AA standards:
- Keyboard navigation support
- Semantic HTML structure
- Proper form labels
- Color contrast compliance
- Screen reader compatibility
- Focus indicators

## Security

- SQL injection prevention via SQLAlchemy ORM
- Input validation on all fields
- CORS properly configured
- Environment variables for secrets
- No sensitive data in logs
- Password not stored (uses service accounts)

## Contributing

Please follow the TDD workflow described in CLAUDE.md:

1. **Red Phase**: Write failing tests
2. **Green Phase**: Implement minimum code to pass tests
3. **Refactor Phase**: Improve code quality without changing behavior

## Development Commands

```bash
# Backend
cd backend
flask run              # Start development server
flask db migrate -m "message"  # Create migration
flask db upgrade      # Apply migrations
pytest -v            # Run tests
black app/ tests/    # Format code
flake8 app/ tests/   # Check linting

# Frontend
cd frontend
npm run dev          # Start dev server
npm test             # Run tests
npm run lint:fix     # Fix linting issues
npm run build        # Build for production
```

## Performance Targets

- API response time: < 500ms
- Frontend initial load: < 2 seconds
- Filter results: < 100ms
- Support for 10,000+ records

## Troubleshooting

### Python 3.13 Installation Issues

If you encounter `psycopg2-binary` build errors during installation:

1. **First, try the installer again** - It uses 5 different strategies:
   ```bash
   python3 install.py
   ```

2. **For macOS M1/M2**, install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   python3 install.py
   ```

3. **Use external PostgreSQL** - In installer, select "Connect to External PostgreSQL Server"

4. **Switch to Python 3.12** - More compatibility:
   ```bash
   python3.12 install.py
   ```

For detailed information, see [PYTHON313_FIX.md](PYTHON313_FIX.md).

### Database Connection Issues
```bash
# Check if PostgreSQL is running
psql -U absencehub -d absencehub_dev

# Reset database
flask db downgrade
flask db upgrade
```

### Frontend Not Loading
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm run build -- --emptyOutDir
```

### Tests Failing
```bash
# Run tests with verbose output
pytest -vv --tb=short

# Run specific test
pytest tests/test_validators.py::test_valid_service_account -v
```

## License

MIT License - See LICENSE file for details

## Author

Created with TDD methodology and clean code principles.

---

**Version**: 1.0.0
**Last Updated**: December 2025
**Status**: Development
