# CLAUDE.md - Enhanced Development Guide

## Project Context

**@PROJECT_SPECS.md** contains all user stories and requirements

---

## Architecture: Scope Rule

### Global vs Local Components

**Global Components** (Used by 2+ features):
- Place in `app/shared/` or `src/shared/`
- Examples: Database models, common validators, API client, i18n

**Local Components** (Used by 1 feature only):
- Place in feature directory
- Examples: Feature-specific forms, feature-specific hooks

---

## Tech Stack

### Backend (Flask + PostgreSQL)
- **Framework**: Flask 3.0 (Python 3.9+)
- **Database**: PostgreSQL 13+ with SQLAlchemy ORM
- **Testing**: pytest + pytest-flask + pytest-cov
- **Code Quality**: Black (formatter) + Flake8 (linter)
- **API Design**: RESTful JSON API with Flask-RESTX (optional)
- **Migrations**: Flask-Migrate (Alembic)
- **Validation**: Custom validators + Marshmallow schemas

### Frontend (React + Vite)
- **Framework**: React 18+ with JavaScript/JSX
- **Build Tool**: Vite 5+
- **State Management**: React useState/useContext (Zustand for complex state)
- **Server State**: Axios for API calls (React Query for caching)
- **Styling**: Tailwind CSS or modern CSS
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier (auto-applied)

---

## TDD Development Workflow

### Phase 1: Architecture & Planning

**Step 1: Design Structure**
```bash
# Before writing any code, plan the architecture

1. Read user story from PROJECT_SPECS.md
2. Identify if components are global or local
3. Design database schema if needed
4. Design API endpoints
5. Plan component hierarchy
6. Document in architecture notes
```

**Backend Architecture Planning**:
```python
# Example: Planning absence feature
"""
Feature: Absence Management

Models:
  - EmployeeAbsence (app/models/absence.py)
  
Validators:
  - validate_service_account (app/validators/absence_validators.py)
  - validate_date_range (app/validators/absence_validators.py)
  
Routes:
  - GET /api/absences (app/routes/absence_routes.py)
  - POST /api/absences (app/routes/absence_routes.py)
  
Services (if needed):
  - AbsenceService (app/services/absence_service.py)
"""
```

**Frontend Architecture Planning**:
```javascript
/*
Feature: Absence Form

Components:
  - AbsenceForm.jsx (src/components/AbsenceForm.jsx) - Local
  - FormInput.jsx (src/shared/components/FormInput.jsx) - Global
  
Services:
  - absenceApi.js (src/services/absenceApi.js) - Global
  
Hooks (if needed):
  - useAbsenceForm.js (src/features/absences/hooks/)
*/
```

**Git Commit**:
```bash
git add .
git commit -m "docs: add absence management architecture"
```

---

### Phase 2: Test-Driven Development (RED Phase)

**Step 2: Write Failing Tests First**

#### Backend Tests (pytest)

```python
# backend/tests/test_absence_validators.py
"""
Test file for absence validators.
Write tests BEFORE implementing functionality.
"""
import pytest
from datetime import date, timedelta
from app.validators.absence_validators import (
    validate_service_account,
    validate_date_range,
    ValidationError
)

class TestServiceAccountValidation:
    """Test suite for service account validation."""
    
    def test_valid_service_account(self):
        """Test that valid service account passes validation."""
        # Arrange
        account = "s.john.doe"
        
        # Act & Assert
        validate_service_account(account)  # Should not raise
    
    def test_invalid_service_account_without_prefix(self):
        """Test that service account without 's.' prefix fails."""
        # Arrange
        account = "john.doe"
        
        # Act & Assert
        with pytest.raises(ValidationError, match="must start with 's.'"):
            validate_service_account(account)
    
    def test_empty_service_account(self):
        """Test that empty service account fails."""
        # Arrange
        account = ""
        
        # Act & Assert
        with pytest.raises(ValidationError, match="required"):
            validate_service_account(account)

class TestDateRangeValidation:
    """Test suite for date range validation."""
    
    def test_valid_date_range(self):
        """Test that valid date range passes."""
        # Arrange
        start = date.today()
        end = date.today() + timedelta(days=5)
        
        # Act & Assert
        validate_date_range(start, end)  # Should not raise
    
    def test_end_before_start_fails(self):
        """Test that end date before start date fails."""
        # Arrange
        start = date.today()
        end = date.today() - timedelta(days=1)
        
        # Act & Assert
        with pytest.raises(ValidationError, match="cannot be before"):
            validate_date_range(start, end)
```

#### Frontend Tests (Vitest)

```javascript
// frontend/src/components/__tests__/AbsenceForm.test.jsx
/**
 * Test file for AbsenceForm component.
 * Write tests BEFORE implementing component.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AbsenceForm from '../AbsenceForm';

describe('AbsenceForm', () => {
  it('renders all required fields', () => {
    // Arrange & Act
    render(<AbsenceForm onSubmit={vi.fn()} />);
    
    // Assert
    expect(screen.getByLabelText(/service account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/absence type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });
  
  it('shows error when service account is invalid', async () => {
    // Arrange
    const onSubmit = vi.fn();
    render(<AbsenceForm onSubmit={onSubmit} />);
    
    // Act
    const serviceAccountInput = screen.getByLabelText(/service account/i);
    fireEvent.change(serviceAccountInput, { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText(/submit/i));
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText(/must start with 's.'/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

**Run Tests (They Should FAIL - RED Phase)**:
```bash
# Backend
cd backend
pytest -v
# Tests should FAIL because implementation doesn't exist yet

# Frontend
cd frontend
npm test
# Tests should FAIL because component doesn't exist yet
```

**Git Commit (RED Phase)**:
```bash
git add tests/
git commit -m "test: add absence validation tests (RED)"
```

---

### Phase 3: Implementation (GREEN Phase)

**Step 3: Implement Minimum Code to Pass Tests**

#### Backend Implementation

```python
# backend/app/validators/absence_validators.py
"""
Validators for absence data.
Implement ONLY what's needed to pass tests.
"""

class ValidationError(Exception):
    """Custom validation error exception."""
    pass


def validate_service_account(service_account):
    """
    Validate service account format.
    
    Args:
        service_account (str): Service account to validate
        
    Raises:
        ValidationError: If validation fails
    """
    # Check if empty
    if not service_account:
        raise ValidationError("Service account is required")
    
    # Check format
    if not service_account.startswith('s.'):
        raise ValidationError("Service account must start with 's.'")
    
    # Check minimum structure
    parts = service_account.split('.')
    if len(parts) < 3:
        raise ValidationError(
            "Service account must follow format: s.firstname.lastname"
        )


def validate_date_range(start_date, end_date):
    """
    Validate that end date is not before start date.
    
    Args:
        start_date (date): Start date
        end_date (date): End date
        
    Raises:
        ValidationError: If end date is before start date
    """
    if end_date < start_date:
        raise ValidationError("End date cannot be before start date")
```

#### Frontend Implementation

```javascript
// frontend/src/components/AbsenceForm.jsx
/**
 * Absence form component.
 * Implement ONLY what's needed to pass tests.
 */
import React, { useState } from 'react';

const AbsenceForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    service_account: '',
    absence_type: '',
    start_date: '',
    end_date: ''
  });
  const [errors, setErrors] = useState({});

  const validateServiceAccount = (value) => {
    if (!value.startsWith('s.')) {
      return "Service account must start with 's.'";
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    const accountError = validateServiceAccount(formData.service_account);
    if (accountError) {
      newErrors.service_account = accountError;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="service_account">Service Account</label>
        <input
          id="service_account"
          name="service_account"
          value={formData.service_account}
          onChange={handleChange}
        />
        {errors.service_account && (
          <span className="error">{errors.service_account}</span>
        )}
      </div>

      <div>
        <label htmlFor="absence_type">Absence Type</label>
        <select
          id="absence_type"
          name="absence_type"
          value={formData.absence_type}
          onChange={handleChange}
        >
          <option value="">Select type</option>
          <option value="Urlaub">Vacation</option>
          <option value="Krankheit">Sick Leave</option>
        </select>
      </div>

      <div>
        <label htmlFor="start_date">Start Date</label>
        <input
          id="start_date"
          name="start_date"
          type="date"
          value={formData.start_date}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="end_date">End Date</label>
        <input
          id="end_date"
          name="end_date"
          type="date"
          value={formData.end_date}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default AbsenceForm;
```

**Run Tests (They Should PASS - GREEN Phase)**:
```bash
# Backend
cd backend
pytest -v
# ✓ All tests should PASS

# Frontend
cd frontend
npm test
# ✓ All tests should PASS
```

**Git Commit (GREEN Phase)**:
```bash
git add app/ src/
git commit -m "feat: implement absence validation (GREEN)"
```

---

### Phase 4: Refactor (REFACTOR Phase)

**Step 4: Improve Code Quality Without Changing Behavior**

#### Backend Refactoring

```python
# backend/app/validators/absence_validators.py
"""
Refactored validators with improved structure.
"""
import re
from typing import Any


class ValidationError(Exception):
    """Custom validation error exception."""
    pass


class ServiceAccountValidator:
    """Validator for service account format."""
    
    PATTERN = re.compile(r'^s\.\w+\.\w+$')
    
    @classmethod
    def validate(cls, service_account: str) -> None:
        """Validate service account format."""
        if not service_account:
            raise ValidationError("Service account is required")
        
        if not cls.PATTERN.match(service_account):
            raise ValidationError(
                "Service account must follow format: s.firstname.lastname"
            )


class DateRangeValidator:
    """Validator for date ranges."""
    
    @staticmethod
    def validate(start_date: Any, end_date: Any) -> None:
        """Validate date range."""
        if end_date < start_date:
            raise ValidationError("End date cannot be before start date")


# Public API - maintain backward compatibility
def validate_service_account(service_account: str) -> None:
    """Validate service account (backward compatible)."""
    ServiceAccountValidator.validate(service_account)


def validate_date_range(start_date: Any, end_date: Any) -> None:
    """Validate date range (backward compatible)."""
    DateRangeValidator.validate(start_date, end_date)
```

#### Frontend Refactoring

```javascript
// frontend/src/components/AbsenceForm.jsx
/**
 * Refactored form with extracted validation logic.
 */
import React, { useState } from 'react';
import { validateServiceAccount } from '../utils/validators';

const AbsenceForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    service_account: '',
    absence_type: '',
    start_date: '',
    end_date: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    
    try {
      validateServiceAccount(formData.service_account);
    } catch (error) {
      newErrors.service_account = error.message;
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="absence-form">
      <FormField
        label="Service Account"
        name="service_account"
        value={formData.service_account}
        onChange={handleChange}
        error={errors.service_account}
      />

      <FormField
        label="Absence Type"
        name="absence_type"
        type="select"
        value={formData.absence_type}
        onChange={handleChange}
        options={[
          { value: 'Urlaub', label: 'Vacation' },
          { value: 'Krankheit', label: 'Sick Leave' }
        ]}
      />

      <FormField
        label="Start Date"
        name="start_date"
        type="date"
        value={formData.start_date}
        onChange={handleChange}
      />

      <FormField
        label="End Date"
        name="end_date"
        type="date"
        value={formData.end_date}
        onChange={handleChange}
      />

      <button type="submit" className="btn-primary">
        Submit
      </button>
    </form>
  );
};

// Extracted reusable component
const FormField = ({ label, name, type = 'text', value, onChange, error, options }) => (
  <div className="form-field">
    <label htmlFor={name}>{label}</label>
    {type === 'select' ? (
      <select id={name} name={name} value={value} onChange={onChange}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
      />
    )}
    {error && <span className="error">{error}</span>}
  </div>
);

export default AbsenceForm;
```

**Run Tests Again (Should Still PASS)**:
```bash
# Verify refactoring didn't break anything
pytest -v
npm test
```

**Apply Code Formatters**:
```bash
# Backend
black app/ tests/
flake8 app/ tests/

# Frontend
npm run lint:fix
npx prettier --write src/
```

**Git Commit (REFACTOR Phase)**:
```bash
git add .
git commit -m "refactor: improve code structure and readability"
```

---

### Phase 5: Security Audit

**Step 5: Security Review**

#### Backend Security Checklist

```python
# backend/app/security/audit.py
"""
Security audit checklist for absence management.
"""

SECURITY_CHECKLIST = """
✅ SQL Injection Prevention:
   - Using SQLAlchemy ORM (parametrized queries)
   - No raw SQL strings with user input
   
✅ Input Validation:
   - All user inputs validated
   - Type checking enforced
   - Length limits on strings
   
✅ Authentication (Future):
   - [ ] Implement JWT or session-based auth
   - [ ] Require authentication for all endpoints
   
✅ Authorization (Future):
   - [ ] Role-based access control
   - [ ] Users can only modify own absences
   
✅ CORS Configuration:
   - Allowed origins configured
   - Credentials support enabled only for trusted origins
   
✅ Environment Variables:
   - Secrets not hardcoded
   - .env file not in version control
   - Production uses strong secrets
   
✅ Error Handling:
   - No sensitive data in error messages
   - Generic error messages for production
   - Detailed logs for debugging
   
✅ Rate Limiting (Future):
   - [ ] Implement rate limiting
   - [ ] Prevent brute force attacks
"""
```

**Git Commit**:
```bash
git add .
git commit -m "security: add security audit checklist"
```

---

### Phase 6: Accessibility Audit

**Step 6: WCAG Compliance**

#### Frontend Accessibility Checklist

```javascript
// frontend/src/utils/a11y-audit.js
/**
 * Accessibility audit checklist.
 */

export const A11Y_CHECKLIST = {
  keyboard: {
    description: 'All interactive elements accessible via keyboard',
    items: [
      '✅ Tab navigation works',
      '✅ Enter/Space activates buttons',
      '✅ Escape closes modals',
      '✅ Focus visible on all elements'
    ]
  },
  
  semanticHTML: {
    description: 'Proper HTML semantics used',
    items: [
      '✅ Headings in logical order (h1, h2, h3)',
      '✅ Forms use <form> element',
      '✅ Buttons use <button> element',
      '✅ Links use <a> element'
    ]
  },
  
  labels: {
    description: 'All form inputs have labels',
    items: [
      '✅ Visible labels present',
      '✅ Labels associated with inputs (htmlFor)',
      '✅ Required fields marked',
      '✅ Error messages announced'
    ]
  },
  
  colorContrast: {
    description: 'Sufficient color contrast (WCAG AA)',
    items: [
      '✅ Text has 4.5:1 contrast ratio',
      '✅ Large text has 3:1 contrast ratio',
      '✅ Icons have sufficient contrast',
      '✅ Focus indicators visible'
    ]
  },
  
  screenReaders: {
    description: 'Screen reader friendly',
    items: [
      '✅ Alt text for images',
      '✅ ARIA labels where needed',
      '✅ Live regions for dynamic content',
      '✅ Skip to main content link'
    ]
  }
};
```

**Test with Screen Reader**:
```bash
# macOS: Enable VoiceOver (Cmd + F5)
# Windows: Enable NVDA or JAWS
# Linux: Enable Orca

# Navigate through the app using only keyboard
# Verify all content is announced properly
```

**Git Commit**:
```bash
git add .
git commit -m "feat: improve accessibility (WCAG AA compliance)"
```

---

## Flask Best Practices

### 1. Project Structure

```
backend/
├── app/
│   ├── __init__.py              # Application factory
│   ├── models/                  # Database models
│   │   ├── __init__.py
│   │   └── absence.py
│   ├── routes/                  # API routes (blueprints)
│   │   ├── __init__.py
│   │   ├── absence_routes.py
│   │   └── health_routes.py
│   ├── services/                # Business logic
│   │   ├── __init__.py
│   │   └── absence_service.py
│   ├── validators/              # Input validation
│   │   ├── __init__.py
│   │   └── absence_validators.py
│   ├── schemas/                 # Marshmallow schemas (optional)
│   │   ├── __init__.py
│   │   └── absence_schema.py
│   └── utils/                   # Utilities
│       ├── __init__.py
│       └── helpers.py
├── tests/
│   ├── conftest.py             # Pytest fixtures
│   ├── test_models.py
│   ├── test_routes.py
│   ├── test_validators.py
│   └── test_services.py
├── migrations/                  # Database migrations
├── config.py                    # Configuration classes
├── run.py                       # Entry point
└── requirements.txt            # Dependencies
```

### 2. Application Factory Pattern

```python
# app/__init__.py
"""Application factory for creating Flask app instances."""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()


def create_app(config_name='development'):
    """
    Create and configure Flask application.
    
    Args:
        config_name (str): Configuration to use
        
    Returns:
        Flask: Configured application instance
    """
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(f'config.{config_name.capitalize()}Config')
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    from app.routes.absence_routes import absence_bp
    from app.routes.health_routes import health_bp
    
    app.register_blueprint(absence_bp, url_prefix='/api')
    app.register_blueprint(health_bp)
    
    # Error handlers
    register_error_handlers(app)
    
    return app


def register_error_handlers(app):
    """Register error handlers."""
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Resource not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'error': 'Internal server error'}, 500
```

### 3. Blueprint Organization

```python
# app/routes/absence_routes.py
"""Routes for absence management."""
from flask import Blueprint, request, jsonify
from app.services.absence_service import AbsenceService
from app.validators.absence_validators import ValidationError

absence_bp = Blueprint('absences', __name__)


@absence_bp.route('/absences', methods=['GET'])
def get_absences():
    """Get all absences with optional filters."""
    filters = {
        'service_account': request.args.get('service_account'),
        'absence_type': request.args.get('absence_type'),
        'start_date': request.args.get('start_date'),
        'end_date': request.args.get('end_date')
    }
    
    # Remove None values
    filters = {k: v for k, v in filters.items() if v is not None}
    
    absences = AbsenceService.get_all(filters)
    return jsonify({
        'success': True,
        'data': [a.to_dict() for a in absences]
    }), 200


@absence_bp.route('/absences', methods=['POST'])
def create_absence():
    """Create new absence."""
    data = request.get_json()
    
    try:
        absence = AbsenceService.create(data)
        return jsonify({
            'success': True,
            'data': absence.to_dict()
        }), 201
    except ValidationError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@absence_bp.errorhandler(ValidationError)
def handle_validation_error(error):
    """Handle validation errors."""
    return jsonify({
        'success': False,
        'error': str(error)
    }), 400
```

### 4. Service Layer Pattern

```python
# app/services/absence_service.py
"""Business logic for absence management."""
from app import db
from app.models.absence import EmployeeAbsence
from app.validators.absence_validators import validate_absence_data


class AbsenceService:
    """Service class for absence operations."""
    
    @staticmethod
    def get_all(filters=None):
        """
        Get all absences with optional filters.
        
        Args:
            filters (dict): Filter parameters
            
        Returns:
            list: List of EmployeeAbsence objects
        """
        query = EmployeeAbsence.query
        
        if filters:
            if 'service_account' in filters:
                query = query.filter(
                    EmployeeAbsence.service_account == filters['service_account']
                )
            if 'absence_type' in filters:
                query = query.filter(
                    EmployeeAbsence.absence_type == filters['absence_type']
                )
            # Add more filters as needed
        
        return query.order_by(EmployeeAbsence.start_date.desc()).all()
    
    @staticmethod
    def create(data):
        """
        Create new absence.
        
        Args:
            data (dict): Absence data
            
        Returns:
            EmployeeAbsence: Created absence
            
        Raises:
            ValidationError: If validation fails
        """
        # Validate data
        validated_data = validate_absence_data(data)
        
        # Create absence
        absence = EmployeeAbsence.from_dict(validated_data)
        
        # Save to database
        db.session.add(absence)
        db.session.commit()
        
        return absence
    
    @staticmethod
    def update(absence_id, data):
        """Update existing absence."""
        absence = EmployeeAbsence.query.get_or_404(absence_id)
        
        # Validate data
        validated_data = validate_absence_data(
            data,
            is_update=True,
            absence_id=absence_id
        )
        
        # Update absence
        absence.update_from_dict(validated_data)
        
        # Save changes
        db.session.commit()
        
        return absence
    
    @staticmethod
    def delete(absence_id):
        """Delete absence."""
        absence = EmployeeAbsence.query.get_or_404(absence_id)
        
        db.session.delete(absence)
        db.session.commit()
        
        return absence
```

### 5. Clean Code Principles

#### Single Responsibility Principle
```python
# BAD: Route doing too much
@app.route('/absences', methods=['POST'])
def create_absence():
    data = request.get_json()
    # Validation
    if not data.get('service_account'):
        return {'error': 'Service account required'}, 400
    # Business logic
    absence = EmployeeAbsence(**data)
    # Database operation
    db.session.add(absence)
    db.session.commit()
    return absence.to_dict(), 201


# GOOD: Separation of concerns
@absence_bp.route('/absences', methods=['POST'])
def create_absence():
    """Create absence (controller only)."""
    data = request.get_json()
    absence = AbsenceService.create(data)  # Service handles logic
    return jsonify(absence.to_dict()), 201
```

#### DRY (Don't Repeat Yourself)
```python
# BAD: Repeated validation
def create_absence(data):
    if not data.get('service_account'):
        raise ValueError('Required')
    if not data.get('absence_type'):
        raise ValueError('Required')
    # ... more fields

def update_absence(data):
    if not data.get('service_account'):
        raise ValueError('Required')
    if not data.get('absence_type'):
        raise ValueError('Required')
    # ... more fields


# GOOD: Reusable validation
def validate_required_fields(data, required_fields):
    """Validate that all required fields are present."""
    for field in required_fields:
        if not data.get(field):
            raise ValidationError(f'{field} is required')

def create_absence(data):
    validate_required_fields(data, ['service_account', 'absence_type'])
    # ... rest of logic

def update_absence(data):
    validate_required_fields(data, ['service_account', 'absence_type'])
    # ... rest of logic
```

### 6. Configuration Management

```python
# config.py
"""Configuration management."""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL')
    SQLALCHEMY_ECHO = True  # Log SQL queries


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://localhost/test_db'
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    # More strict settings
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
```

---

## Git Strategy (Clean Commits)

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **test**: Adding/updating tests
- **refactor**: Code refactoring
- **style**: Code style changes (formatting)
- **perf**: Performance improvements
- **chore**: Maintenance tasks

### Examples

```bash
# Architecture phase
git commit -m "docs: add absence feature architecture"

# RED phase (tests)
git commit -m "test: add absence validation tests (RED)"

# GREEN phase (implementation)
git commit -m "feat: implement absence validation (GREEN)"

# REFACTOR phase
git commit -m "refactor: extract validation logic to separate class"

# Security phase
git commit -m "security: add input sanitization for absence data"

# Accessibility phase
git commit -m "feat: improve form accessibility (WCAG AA)"

# Bug fix
git commit -m "fix: correct date range validation logic"
```

---

## RULES

### Development Rules
- ❌ NEVER write code without concrete functionality
- ❌ NEVER implement without failing tests first
- ❌ NEVER skip test phase
- ✅ ALWAYS write tests before implementation (TDD)
- ✅ ALWAYS refactor after tests pass
- ✅ ALWAYS run tests before committing

### Code Quality Rules
- ✅ ALWAYS apply Black formatter (backend)
- ✅ ALWAYS apply ESLint + Prettier (frontend)
- ✅ ALWAYS write docstrings for functions
- ✅ ALWAYS use type hints in Python (when beneficial)
- ✅ ALWAYS handle errors gracefully
- ✅ ALWAYS validate inputs

### Git Rules
- ❌ NEVER mention "Claude" in commits
- ❌ NEVER mention "AI" in commits
- ❌ NEVER create feature branches with "claude" in name
- ✅ ALWAYS use conventional commit format
- ✅ ALWAYS write clear, descriptive commit messages
- ✅ ALWAYS commit after each TDD phase

### Testing Rules
- ✅ Backend test coverage > 80%
- ✅ Frontend test coverage > 70%
- ✅ Test edge cases and error scenarios
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)

### Security Rules
- ✅ Never hardcode secrets
- ✅ Always validate user input
- ✅ Use parameterized queries (ORM)
- ✅ Configure CORS properly
- ✅ Log security events
- ✅ Use HTTPS in production

---

## Quick Reference Commands

### Backend Commands
```bash
# Setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run server
flask run

# Run tests
pytest -v
pytest --cov=app --cov-report=html

# Format code
black app/ tests/
flake8 app/ tests/

# Database migrations
flask db init
flask db migrate -m "message"
flask db upgrade

# Custom commands
flask init-db
flask seed-db
```

### Frontend Commands
```bash
# Setup
npm install

# Run dev server
npm run dev

# Run tests
npm test
npm run test:ui
npm run test:coverage

# Format code
npm run lint
npm run lint:fix
npx prettier --write src/

# Build for production
npm run build
```

---

## Summary

This guide provides a comprehensive TDD workflow with Flask best practices:

✅ Complete TDD cycle (RED → GREEN → REFACTOR)  
✅ Flask application factory pattern  
✅ Clean architecture with separation of concerns  
✅ Service layer for business logic  
✅ Comprehensive testing strategy  
✅ Security and accessibility audits  
✅ Clean code principles  
✅ Professional git workflow  

Follow this guide to build maintainable, testable, and high-quality applications.

---

**Version**: 2.0  
**Updated**: December 2025  
**Status**: ✅ Production Ready