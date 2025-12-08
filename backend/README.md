# AbsenceHub Backend

Flask-based REST API for Employee Absence Management.

## Prerequisites

- Python 3.9+
- PostgreSQL 13+ (or SQLite for development)
- pip

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Initialize Database

```bash
# Using Docker Compose (recommended)
docker-compose up -d postgres

# Wait for PostgreSQL to be healthy, then:
flask db upgrade
flask seed-db
```

Or for local PostgreSQL:

```bash
createdb absencehub_dev
flask db upgrade
flask seed-db
```

## Running the Application

```bash
flask run
# Server will be available at http://localhost:5000
```

## Running Tests

```bash
# Run all tests
pytest -v

# Run specific test file
pytest tests/test_validators.py -v

# Run with coverage report
pytest --cov=app --cov-report=html
```

## Code Quality

### Format Code with Black

```bash
black app/ config.py run.py
```

### Check Code Style with Flake8

```bash
flake8 app/ config.py run.py
```

### Run All Quality Checks

```bash
bash run_tests.sh
```

## Project Structure

```
backend/
├── app/
│   ├── models/              # Database models
│   │   └── absence.py      # EmployeeAbsence model
│   ├── routes/             # API blueprints
│   │   ├── absence_routes.py
│   │   └── health_routes.py
│   ├── services/           # Business logic
│   │   └── absence_service.py
│   ├── validators/         # Input validation
│   │   └── absence_validators.py
│   ├── utils/              # Utilities
│   │   └── seed_data.py
│   └── __init__.py         # App factory
├── tests/                  # Test suite
│   ├── test_validators.py
│   ├── test_models.py
│   ├── test_services.py
│   └── test_routes.py
├── migrations/             # Database migrations
├── config.py               # Configuration
├── run.py                  # Entry point
├── requirements.txt        # Dependencies
├── pytest.ini              # Pytest config
├── .flake8                 # Flake8 config
├── .env.example            # Environment template
└── Dockerfile              # Docker configuration
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Absences (CRUD)
```
GET    /api/absences                    # List all absences
GET    /api/absences?filters            # List with filters
GET    /api/absences/<id>               # Get single absence
POST   /api/absences                    # Create absence
PUT    /api/absences/<id>               # Update absence
DELETE /api/absences/<id>               # Delete absence
```

### Metadata
```
GET /api/absence-types                  # Get valid absence types
GET /api/statistics                     # Get statistics
```

## Database Models

### EmployeeAbsence
- `id`: Integer (Primary Key)
- `service_account`: String (Required, Indexed)
- `employee_fullname`: String (Optional)
- `absence_type`: String (Required, Indexed)
- `start_date`: Date (Required, Indexed)
- `end_date`: Date (Required, Indexed)
- `created_at`: DateTime (Auto-set)
- `updated_at`: DateTime (Auto-update)

## Validation Rules

### Service Account
- Must start with `s.` prefix
- Format: `s.firstname.lastname`
- Example: `s.john.doe`

### Date Range
- End date must be >= start date
- Same-day absences are allowed

### Absence Type
- Must be one of: `Urlaub`, `Krankheit`, `Home Office`, `Sonstige`

### Overlap Prevention
- Prevents overlapping periods for the same absence type and employee
- Different types can overlap for the same employee
- Different employees can have overlapping absences

## CLI Commands

```bash
# Initialize database tables
flask init-db

# Seed database with sample data
flask seed-db

# Drop all tables (use with caution)
flask drop-db
```

## Environment Variables

```
FLASK_APP              = run.py
FLASK_ENV              = development|testing|production
SECRET_KEY             = Your secret key here
DATABASE_URL           = PostgreSQL connection string
TEST_DATABASE_URL      = Test database connection
CORS_ORIGINS           = Comma-separated list of allowed origins
```

## Testing

### Test Coverage

Target coverage: **> 80%**

Current areas covered:
- Input validation (validators)
- Database model operations (models)
- Business logic (services)
- API endpoints (routes)

### Running Tests

```bash
# Run all tests with verbose output
pytest -v

# Run specific test class
pytest tests/test_validators.py::TestServiceAccountValidation -v

# Run specific test
pytest tests/test_validators.py::TestServiceAccountValidation::test_valid_service_account -v

# Run with coverage
pytest --cov=app --cov-report=html --cov-report=term
```

## Security

- SQL injection prevention via SQLAlchemy ORM
- Input validation on all endpoints
- CORS properly configured
- Environment variables for secrets
- No sensitive data in logs
- Type validation on all inputs

## Docker

Build Docker image:
```bash
docker build -t absencehub-backend .
```

Run with Docker Compose:
```bash
docker-compose up -d
```

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql -U absencehub -d absencehub_dev

# Reset migrations
rm -rf migrations/
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### Import Errors
```bash
# Make sure you're in the correct directory
cd backend
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Tests Failing
```bash
# Run with verbose output
pytest -vv --tb=long

# Check database is clean
flask drop-db
flask db upgrade
```

## Development Workflow

1. **Red Phase**: Write failing tests
   ```bash
   pytest -v
   ```

2. **Green Phase**: Implement code to pass tests
   ```bash
   # Edit code...
   pytest -v
   ```

3. **Refactor Phase**: Improve code quality
   ```bash
   black app/ config.py run.py
   flake8 app/ config.py run.py
   pytest -v
   ```

## Contributing

- Follow PEP 8 style guide (enforced by Black and Flake8)
- Write tests for all new functionality
- Ensure test coverage > 80%
- Use meaningful commit messages
- No hardcoded secrets or credentials

## License

MIT
