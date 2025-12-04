"""Tests for API routes."""
import pytest
import json
from datetime import date
from app.models.absence import EmployeeAbsence
from app import db


class TestAbsenceRoutes:
    """Test suite for absence API routes."""

    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["status"] == "ok"

    def test_get_absences_empty(self, client):
        """Test getting absences when list is empty."""
        response = client.get("/api/absences")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert data["data"] == []

    def test_get_absences_with_data(self, client, app):
        """Test getting absences with data."""
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

        response = client.get("/api/absences")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert len(data["data"]) == 1

    def test_get_absence_by_id(self, client, app):
        """Test getting absence by ID."""
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

        response = client.get(f"/api/absences/{absence_id}")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert data["data"]["service_account"] == "s.john.doe"

    def test_get_absence_not_found(self, client):
        """Test getting non-existent absence."""
        response = client.get("/api/absences/999")
        assert response.status_code == 404

    def test_create_absence_success(self, client):
        """Test creating a valid absence."""
        payload = {
            "service_account": "s.john.doe",
            "employee_fullname": "John Doe",
            "absence_type": "Urlaub",
            "start_date": "2025-01-15",
            "end_date": "2025-01-20",
        }
        response = client.post(
            "/api/absences",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data["success"] is True
        assert data["data"]["service_account"] == "s.john.doe"

    def test_create_absence_invalid_service_account(self, client):
        """Test creating absence with invalid service account."""
        payload = {
            "service_account": "invalid",
            "employee_fullname": "John Doe",
            "absence_type": "Urlaub",
            "start_date": "2025-01-15",
            "end_date": "2025-01-20",
        }
        response = client.post(
            "/api/absences",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False

    def test_create_absence_invalid_dates(self, client):
        """Test creating absence with invalid date range."""
        payload = {
            "service_account": "s.john.doe",
            "employee_fullname": "John Doe",
            "absence_type": "Urlaub",
            "start_date": "2025-01-20",
            "end_date": "2025-01-15",
        }
        response = client.post(
            "/api/absences",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400

    def test_update_absence_success(self, client, app):
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

        payload = {
            "employee_fullname": "Jane Doe",
            "absence_type": "Krankheit",
        }
        response = client.put(
            f"/api/absences/{absence_id}",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert data["data"]["employee_fullname"] == "Jane Doe"
        assert data["data"]["absence_type"] == "Krankheit"

    def test_update_absence_not_found(self, client):
        """Test updating non-existent absence."""
        payload = {"employee_fullname": "Jane Doe"}
        response = client.put(
            "/api/absences/999",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 404

    def test_delete_absence_success(self, client, app):
        """Test deleting an absence."""
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

        response = client.delete(f"/api/absences/{absence_id}")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True

    def test_delete_absence_not_found(self, client):
        """Test deleting non-existent absence."""
        response = client.delete("/api/absences/999")
        assert response.status_code == 404

    def test_get_absence_types(self, client):
        """Test getting absence types."""
        response = client.get("/api/absence-types")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert len(data["data"]) == 4
        assert "Urlaub" in data["data"]

    def test_get_statistics(self, client, app):
        """Test getting statistics."""
        with app.app_context():
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

        response = client.get("/api/statistics")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert data["data"]["total_absences"] == 2
        assert data["data"]["unique_employees"] == 2

    def test_filter_absences_by_service_account(self, client, app):
        """Test filtering absences by service account."""
        with app.app_context():
            absence1 = EmployeeAbsence(
                service_account="s.john.doe",
                absence_type="Urlaub",
                start_date=date(2025, 1, 15),
                end_date=date(2025, 1, 20),
            )
            absence2 = EmployeeAbsence(
                service_account="s.jane.smith",
                absence_type="Urlaub",
                start_date=date(2025, 2, 10),
                end_date=date(2025, 2, 12),
            )
            db.session.add_all([absence1, absence2])
            db.session.commit()

        response = client.get("/api/absences?service_account=s.john.doe")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data["data"]) == 1
        assert data["data"][0]["service_account"] == "s.john.doe"

    def test_filter_absences_by_type(self, client, app):
        """Test filtering absences by type."""
        with app.app_context():
            absence1 = EmployeeAbsence(
                service_account="s.john.doe",
                absence_type="Urlaub",
                start_date=date(2025, 1, 15),
                end_date=date(2025, 1, 20),
            )
            absence2 = EmployeeAbsence(
                service_account="s.john.doe",
                absence_type="Krankheit",
                start_date=date(2025, 2, 10),
                end_date=date(2025, 2, 12),
            )
            db.session.add_all([absence1, absence2])
            db.session.commit()

        response = client.get("/api/absences?absence_type=Urlaub")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data["data"]) == 1
        assert data["data"][0]["absence_type"] == "Urlaub"
