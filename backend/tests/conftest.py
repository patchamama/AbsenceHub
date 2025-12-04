"""Pytest configuration and fixtures."""
import pytest
import os
from app import create_app, db
from app.models.absence import EmployeeAbsence


@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app("testing")

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Test client for making requests."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Test runner for CLI commands."""
    return app.test_cli_runner()


@pytest.fixture
def db_session(app):
    """Database session for tests."""
    with app.app_context():
        yield db


@pytest.fixture
def sample_absence(db_session):
    """Create a sample absence for testing."""
    from datetime import date

    absence = EmployeeAbsence(
        service_account="s.john.doe",
        employee_fullname="John Doe",
        absence_type="Urlaub",
        start_date=date(2025, 1, 15),
        end_date=date(2025, 1, 20),
    )
    db_session.session.add(absence)
    db_session.session.commit()
    return absence
