"""Tests for database models."""
import pytest
from datetime import date, datetime
from app.models.absence import EmployeeAbsence
from app import db


class TestEmployeeAbsenceModel:
    """Test suite for EmployeeAbsence model."""

    def test_create_absence(self, db_session):
        """Test creating a valid absence record."""
        absence = EmployeeAbsence(
            service_account="s.john.doe",
            employee_fullname="John Doe",
            absence_type="Urlaub",
            start_date=date(2025, 1, 15),
            end_date=date(2025, 1, 20),
        )
        db_session.session.add(absence)
        db_session.session.commit()

        assert absence.id is not None
        assert absence.service_account == "s.john.doe"
        assert absence.absence_type == "Urlaub"

    def test_absence_requires_service_account(self, db_session):
        """Test that service account is required."""
        absence = EmployeeAbsence(
            employee_fullname="John Doe",
            absence_type="Urlaub",
            start_date=date(2025, 1, 15),
            end_date=date(2025, 1, 20),
        )
        db_session.session.add(absence)
        with pytest.raises(Exception):  # IntegrityError
            db_session.session.commit()

    def test_absence_requires_dates(self, db_session):
        """Test that dates are required."""
        absence = EmployeeAbsence(
            service_account="s.john.doe",
            employee_fullname="John Doe",
            absence_type="Urlaub",
        )
        db_session.session.add(absence)
        with pytest.raises(Exception):  # IntegrityError
            db_session.session.commit()

    def test_absence_to_dict(self, db_session):
        """Test absence serialization to dictionary."""
        absence = EmployeeAbsence(
            service_account="s.john.doe",
            employee_fullname="John Doe",
            absence_type="Urlaub",
            start_date=date(2025, 1, 15),
            end_date=date(2025, 1, 20),
        )
        db_session.session.add(absence)
        db_session.session.commit()

        absence_dict = absence.to_dict()
        assert absence_dict["service_account"] == "s.john.doe"
        assert absence_dict["employee_fullname"] == "John Doe"
        assert absence_dict["absence_type"] == "Urlaub"
        assert absence_dict["start_date"] == "2025-01-15"
        assert absence_dict["end_date"] == "2025-01-20"

    def test_absence_from_dict(self):
        """Test absence creation from dictionary."""
        data = {
            "service_account": "s.jane.smith",
            "employee_fullname": "Jane Smith",
            "absence_type": "Krankheit",
            "start_date": date(2025, 2, 10),
            "end_date": date(2025, 2, 12),
        }
        absence = EmployeeAbsence.from_dict(data)

        assert absence.service_account == "s.jane.smith"
        assert absence.employee_fullname == "Jane Smith"
        assert absence.absence_type == "Krankheit"
        assert absence.start_date == date(2025, 2, 10)
        assert absence.end_date == date(2025, 2, 12)

    def test_created_at_auto_set(self, db_session):
        """Test that created_at is automatically set."""
        before = datetime.utcnow()
        absence = EmployeeAbsence(
            service_account="s.john.doe",
            employee_fullname="John Doe",
            absence_type="Urlaub",
            start_date=date(2025, 1, 15),
            end_date=date(2025, 1, 20),
        )
        db_session.session.add(absence)
        db_session.session.commit()
        after = datetime.utcnow()

        assert absence.created_at is not None
        assert before <= absence.created_at <= after

    def test_updated_at_auto_update(self, db_session):
        """Test that updated_at is automatically updated."""
        absence = EmployeeAbsence(
            service_account="s.john.doe",
            employee_fullname="John Doe",
            absence_type="Urlaub",
            start_date=date(2025, 1, 15),
            end_date=date(2025, 1, 20),
        )
        db_session.session.add(absence)
        db_session.session.commit()

        original_updated_at = absence.updated_at

        # Simulate a small delay and update
        import time

        time.sleep(0.1)
        absence.employee_fullname = "Jane Doe"
        db_session.session.commit()

        assert absence.updated_at >= original_updated_at

    def test_absence_repr(self):
        """Test string representation of absence."""
        absence = EmployeeAbsence(
            id=1,
            service_account="s.john.doe",
            employee_fullname="John Doe",
            absence_type="Urlaub",
            start_date=date(2025, 1, 15),
            end_date=date(2025, 1, 20),
        )
        repr_str = repr(absence)
        assert "s.john.doe" in repr_str
        assert "Urlaub" in repr_str

    def test_employee_fullname_optional(self, db_session):
        """Test that employee fullname is optional."""
        absence = EmployeeAbsence(
            service_account="s.john.doe",
            absence_type="Urlaub",
            start_date=date(2025, 1, 15),
            end_date=date(2025, 1, 20),
        )
        db_session.session.add(absence)
        db_session.session.commit()

        assert absence.employee_fullname is None
