"""Business logic for absence management."""
from app import db
from app.models.absence import EmployeeAbsence
from app.validators.absence_validators import (
    validate_service_account,
    validate_date_range,
    validate_absence_type,
    ValidationError,
)


class AbsenceService:
    """Service class for absence operations."""

    @staticmethod
    def create(data):
        """
        Create new absence with validation.

        Args:
            data (dict): Absence data

        Returns:
            EmployeeAbsence: Created absence

        Raises:
            ValidationError: If validation fails
        """
        # Validate individual fields
        validate_service_account(data.get("service_account"))
        validate_date_range(data.get("start_date"), data.get("end_date"))
        validate_absence_type(data.get("absence_type"))

        # Check for overlapping absences
        AbsenceService._check_overlap(
            data.get("service_account"),
            data.get("absence_type"),
            data.get("start_date"),
            data.get("end_date"),
        )

        # Create absence
        absence = EmployeeAbsence.from_dict(data)
        db.session.add(absence)
        db.session.commit()

        return absence

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
            if filters.get("service_account"):
                query = query.filter(
                    EmployeeAbsence.service_account == filters.get("service_account")
                )
            if filters.get("absence_type"):
                query = query.filter(
                    EmployeeAbsence.absence_type == filters.get("absence_type")
                )
            if filters.get("start_date"):
                query = query.filter(
                    EmployeeAbsence.start_date >= filters.get("start_date")
                )
            if filters.get("end_date"):
                query = query.filter(EmployeeAbsence.end_date <= filters.get("end_date"))

        return query.order_by(EmployeeAbsence.start_date.desc()).all()

    @staticmethod
    def get_by_id(absence_id):
        """
        Get absence by ID.

        Args:
            absence_id (int): Absence ID

        Returns:
            EmployeeAbsence: Absence or None if not found
        """
        return EmployeeAbsence.query.get(absence_id)

    @staticmethod
    def update(absence_id, data):
        """
        Update existing absence with validation.

        Args:
            absence_id (int): Absence ID
            data (dict): Data to update

        Returns:
            EmployeeAbsence: Updated absence

        Raises:
            ValidationError: If validation fails
        """
        absence = EmployeeAbsence.query.get_or_404(absence_id)

        # Validate fields that are being updated
        if "start_date" in data and "end_date" in data:
            validate_date_range(data.get("start_date"), data.get("end_date"))
        if "absence_type" in data:
            validate_absence_type(data.get("absence_type"))

        # Check for overlapping absences (exclude current record)
        if "start_date" in data or "end_date" in data or "absence_type" in data:
            start_date = data.get("start_date") or absence.start_date
            end_date = data.get("end_date") or absence.end_date
            absence_type = data.get("absence_type") or absence.absence_type

            AbsenceService._check_overlap(
                absence.service_account,
                absence_type,
                start_date,
                end_date,
                exclude_id=absence_id,
            )

        # Update fields
        if "employee_fullname" in data:
            absence.employee_fullname = data.get("employee_fullname")
        if "absence_type" in data:
            absence.absence_type = data.get("absence_type")
        if "start_date" in data:
            absence.start_date = data.get("start_date")
        if "end_date" in data:
            absence.end_date = data.get("end_date")

        db.session.commit()
        return absence

    @staticmethod
    def delete(absence_id):
        """
        Delete absence.

        Args:
            absence_id (int): Absence ID

        Returns:
            EmployeeAbsence: Deleted absence
        """
        absence = EmployeeAbsence.query.get_or_404(absence_id)
        db.session.delete(absence)
        db.session.commit()
        return absence

    @staticmethod
    def _check_overlap(service_account, absence_type, start_date, end_date, exclude_id=None):
        """
        Check for overlapping absences of the same type.

        Args:
            service_account (str): Employee service account
            absence_type (str): Type of absence
            start_date (date): Start date
            end_date (date): End date
            exclude_id (int): ID to exclude from check (for updates)

        Raises:
            ValidationError: If overlap is found
        """
        query = EmployeeAbsence.query.filter(
            EmployeeAbsence.service_account == service_account,
            EmployeeAbsence.absence_type == absence_type,
            EmployeeAbsence.start_date <= end_date,
            EmployeeAbsence.end_date >= start_date,
        )

        if exclude_id:
            query = query.filter(EmployeeAbsence.id != exclude_id)

        conflicting = query.first()
        if conflicting:
            raise ValidationError(
                f"This absence overlaps with existing {absence_type} absence "
                f"from {conflicting.start_date} to {conflicting.end_date}"
            )

    @staticmethod
    def get_statistics():
        """
        Get absence statistics.

        Returns:
            dict: Statistics about absences
        """
        total_absences = EmployeeAbsence.query.count()
        unique_employees = (
            db.session.query(EmployeeAbsence.service_account)
            .distinct()
            .count()
        )

        # Count by type
        by_type = {}
        for absence_type in [
            "Urlaub",
            "Krankheit",
            "Home Office",
            "Sonstige",
        ]:
            count = EmployeeAbsence.query.filter(
                EmployeeAbsence.absence_type == absence_type
            ).count()
            by_type[absence_type] = count

        return {
            "total_absences": total_absences,
            "unique_employees": unique_employees,
            "by_type": by_type,
        }
