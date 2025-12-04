"""Tests for business logic services."""
import pytest
from datetime import date
from app.services.absence_service import AbsenceService
from app.models.absence import EmployeeAbsence
from app.validators.absence_validators import ValidationError
from app import db


class TestAbsenceService:
    """Test suite for AbsenceService."""

    def test_create_absence_success(self, app):
        """Test creating a valid absence."""
        with app.app_context():
            data = {
                "service_account": "s.john.doe",
                "employee_fullname": "John Doe",
                "absence_type": "Urlaub",
                "start_date": date(2025, 1, 15),
                "end_date": date(2025, 1, 20),
            }
            absence = AbsenceService.create(data)

            assert absence.id is not None
            assert absence.service_account == "s.john.doe"
            assert absence.absence_type == "Urlaub"

    def test_create_absence_invalid_service_account(self, app):
        """Test that invalid service account raises error."""
        with app.app_context():
            data = {
                "service_account": "invalid",
                "employee_fullname": "John Doe",
                "absence_type": "Urlaub",
                "start_date": date(2025, 1, 15),
                "end_date": date(2025, 1, 20),
            }
            with pytest.raises(ValidationError):
                AbsenceService.create(data)

    def test_create_absence_invalid_dates(self, app):
        """Test that invalid date range raises error."""
        with app.app_context():
            data = {
                "service_account": "s.john.doe",
                "employee_fullname": "John Doe",
                "absence_type": "Urlaub",
                "start_date": date(2025, 1, 20),
                "end_date": date(2025, 1, 15),
            }
            with pytest.raises(ValidationError):
                AbsenceService.create(data)

    def test_get_all_absences(self, app):
        """Test getting all absences."""
        with app.app_context():
            # Create test data
            for i in range(3):
                absence = EmployeeAbsence(
                    service_account=f"s.employee{i}.test",
                    absence_type="Urlaub",
                    start_date=date(2025, 1, 15),
                    end_date=date(2025, 1, 20),
                )
                db.session.add(absence)
            db.session.commit()

            absences = AbsenceService.get_all()
            assert len(absences) == 3

    def test_get_absences_filtered_by_service_account(self, app):
        """Test filtering absences by service account."""
        with app.app_context():
            # Create test data
            absence1 = EmployeeAbsence(
                service_account="s.john.doe",
                absence_type="Urlaub",
                start_date=date(2025, 1, 15),
                end_date=date(2025, 1, 20),
            )
            absence2 = EmployeeAbsence(
                service_account="s.jane.smith",
                absence_type="Krankheit",
                start_date=date(2025, 2, 10),
                end_date=date(2025, 2, 12),
            )
            db.session.add_all([absence1, absence2])
            db.session.commit()

            filtered = AbsenceService.get_all(
                filters={"service_account": "s.john.doe"}
            )
            assert len(filtered) == 1
            assert filtered[0].service_account == "s.john.doe"

    def test_get_absences_filtered_by_type(self, app):
        """Test filtering absences by type."""
        with app.app_context():
            # Create test data
            absence1 = EmployeeAbsence(
                service_account="s.john.doe",
                absence_type="Urlaub",
                start_date=date(2025, 1, 15),
                end_date=date(2025, 1, 20),
            )
            absence2 = EmployeeAbsence(
                service_account="s.jane.smith",
                absence_type="Krankheit",
                start_date=date(2025, 2, 10),
                end_date=date(2025, 2, 12),
            )
            db.session.add_all([absence1, absence2])
            db.session.commit()

            filtered = AbsenceService.get_all(filters={"absence_type": "Urlaub"})
            assert len(filtered) == 1
            assert filtered[0].absence_type == "Urlaub"

    def test_get_by_id(self, app):
        """Test getting absence by ID."""
        with app.app_context():
            absence = EmployeeAbsence(
                service_account="s.john.doe",
                absence_type="Urlaub",
                start_date=date(2025, 1, 15),
                end_date=date(2025, 1, 20),
            )
            db.session.add(absence)
            db.session.commit()

            retrieved = AbsenceService.get_by_id(absence.id)
            assert retrieved.id == absence.id
            assert retrieved.service_account == "s.john.doe"

    def test_update_absence(self, app):
        """Test updating an absence."""
        with app.app_context():
            absence = EmployeeAbsence(
                service_account="s.john.doe",
                employee_fullname="John Doe",
                absence_type="Urlaub",
                start_date=date(2025, 1, 15),
                end_date=date(2025, 1, 20),
            )
            db.session.add(absence)
            db.session.commit()
            absence_id = absence.id

            data = {
                "employee_fullname": "Jane Doe",
                "absence_type": "Krankheit",
            }
            updated = AbsenceService.update(absence_id, data)

            assert updated.id == absence_id
            assert updated.employee_fullname == "Jane Doe"
            assert updated.absence_type == "Krankheit"
            assert updated.service_account == "s.john.doe"  # Should not change

    def test_delete_absence(self, app):
        """Test deleting an absence."""
        with app.app_context():
            absence = EmployeeAbsence(
                service_account="s.john.doe",
                absence_type="Urlaub",
                start_date=date(2025, 1, 15),
                end_date=date(2025, 1, 20),
            )
            db.session.add(absence)
            db.session.commit()
            absence_id = absence.id

            AbsenceService.delete(absence_id)

            deleted = EmployeeAbsence.query.get(absence_id)
            assert deleted is None

    def test_prevent_overlapping_absences(self, app):
        """Test that overlapping absences are prevented."""
        with app.app_context():
            # Create first absence
            absence1 = EmployeeAbsence(
                service_account="s.john.doe",
                absence_type="Urlaub",
                start_date=date(2025, 1, 15),
                end_date=date(2025, 1, 20),
            )
            db.session.add(absence1)
            db.session.commit()

            # Try to create overlapping absence of same type
            data = {
                "service_account": "s.john.doe",
                "absence_type": "Urlaub",
                "start_date": date(2025, 1, 18),
                "end_date": date(2025, 1, 25),
            }
            with pytest.raises(ValidationError, match="overlap"):
                AbsenceService.create(data)

    def test_allow_overlapping_different_types(self, app):
        """Test that overlapping different types are allowed."""
        with app.app_context():
            # Create first absence
            absence1 = EmployeeAbsence(
                service_account="s.john.doe",
                absence_type="Urlaub",
                start_date=date(2025, 1, 15),
                end_date=date(2025, 1, 20),
            )
            db.session.add(absence1)
            db.session.commit()

            # Create overlapping absence of different type
            data = {
                "service_account": "s.john.doe",
                "absence_type": "Home Office",
                "start_date": date(2025, 1, 18),
                "end_date": date(2025, 1, 25),
            }
            absence2 = AbsenceService.create(data)

            assert absence2.id is not None
            assert absence2.absence_type == "Home Office"

    def test_allow_same_dates_different_employees(self, app):
        """Test that same dates are allowed for different employees."""
        with app.app_context():
            # Create first absence
            absence1 = EmployeeAbsence(
                service_account="s.john.doe",
                absence_type="Urlaub",
                start_date=date(2025, 1, 15),
                end_date=date(2025, 1, 20),
            )
            db.session.add(absence1)
            db.session.commit()

            # Create absence for different employee with same dates
            data = {
                "service_account": "s.jane.smith",
                "absence_type": "Urlaub",
                "start_date": date(2025, 1, 15),
                "end_date": date(2025, 1, 20),
            }
            absence2 = AbsenceService.create(data)

            assert absence2.id is not None
            assert absence2.service_account == "s.jane.smith"
