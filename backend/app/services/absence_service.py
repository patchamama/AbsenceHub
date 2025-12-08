"""Business logic for absence management."""
from app import db
from app.models.absence import EmployeeAbsence
from app.models.audit_log import AuditLog
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
        db.session.flush()  # Flush to get the ID before logging

        # Log the creation
        AuditLog.log_create(
            entity_type='EmployeeAbsence',
            entity_id=absence.id,
            new_values=absence.to_dict(),
            description=f'Created absence for {absence.service_account} ({absence.absence_type})'
        )

        db.session.commit()

        return absence

    @staticmethod
    def _apply_filters(query, filters):
        """
        Apply filters to a query.

        Args:
            query: SQLAlchemy query object
            filters (dict): Filter parameters

        Returns:
            query: Filtered query object
        """
        if not filters:
            return query

        # LIKE search for service_account
        if filters.get("service_account"):
            service_account = filters.get("service_account")
            query = query.filter(
                EmployeeAbsence.service_account.ilike(f"%{service_account}%")
            )

        # LIKE search for employee_fullname
        if filters.get("employee_fullname"):
            fullname = filters.get("employee_fullname")
            query = query.filter(
                EmployeeAbsence.employee_fullname.ilike(f"%{fullname}%")
            )

        # Exact match for absence_type
        if filters.get("absence_type"):
            query = query.filter(
                EmployeeAbsence.absence_type == filters.get("absence_type")
            )

        # Filter by month (YYYY-MM format)
        if filters.get("month"):
            from datetime import datetime
            month_str = filters.get("month")
            try:
                # Parse month (format: YYYY-MM)
                year, month = map(int, month_str.split("-"))
                # Get first day of month
                from calendar import monthrange
                last_day = monthrange(year, month)[1]
                start_of_month = datetime(year, month, 1).date()
                end_of_month = datetime(year, month, last_day).date()

                query = query.filter(
                    EmployeeAbsence.start_date <= end_of_month,
                    EmployeeAbsence.end_date >= start_of_month
                )
            except (ValueError, AttributeError):
                pass  # Invalid month format, skip filter

        # Filter by year (YYYY format)
        elif filters.get("year"):
            from datetime import datetime
            year_str = filters.get("year")
            try:
                year = int(year_str)
                start_of_year = datetime(year, 1, 1).date()
                end_of_year = datetime(year, 12, 31).date()

                query = query.filter(
                    EmployeeAbsence.start_date <= end_of_year,
                    EmployeeAbsence.end_date >= start_of_year
                )
            except (ValueError, AttributeError):
                pass  # Invalid year format, skip filter

        # Date range filters (if month/year not provided)
        elif filters.get("start_date") or filters.get("end_date"):
            if filters.get("start_date"):
                query = query.filter(
                    EmployeeAbsence.start_date >= filters.get("start_date")
                )
            if filters.get("end_date"):
                query = query.filter(
                    EmployeeAbsence.end_date <= filters.get("end_date")
                )

        return query

    @staticmethod
    def get_all(filters=None):
        """
        Get all absences with optional filters.

        Args:
            filters (dict): Filter parameters
                - service_account: Exact match or LIKE search
                - employee_fullname: LIKE search
                - absence_type: Exact match
                - start_date: Filter by date >= start_date
                - end_date: Filter by date <= end_date
                - month: Filter by specific month (YYYY-MM format)
                - year: Filter by specific year (YYYY format)

        Returns:
            list: List of EmployeeAbsence objects
        """
        query = EmployeeAbsence.query
        query = AbsenceService._apply_filters(query, filters)
        return query.order_by(EmployeeAbsence.updated_at.desc()).all()

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

        # Capture old values for audit log
        old_values = absence.to_dict()

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
        if "is_half_day" in data:
            absence.is_half_day = data.get("is_half_day")
            # If half day, set end_date = start_date
            if absence.is_half_day and absence.start_date:
                absence.end_date = absence.start_date

        # Log the update
        new_values = absence.to_dict()
        AuditLog.log_update(
            entity_type='EmployeeAbsence',
            entity_id=absence.id,
            old_values=old_values,
            new_values=new_values,
            description=f'Updated absence for {absence.service_account} ({absence.absence_type})'
        )

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

        # Capture values before deletion for audit log
        old_values = absence.to_dict()

        # Log the deletion
        AuditLog.log_delete(
            entity_type='EmployeeAbsence',
            entity_id=absence_id,
            old_values=old_values,
            description=f'Deleted absence for {absence.service_account} ({absence.absence_type})'
        )

        db.session.delete(absence)
        db.session.commit()
        return absence

    @staticmethod
    def _check_overlap(service_account, absence_type, start_date, end_date, exclude_id=None):
        """
        Check for overlapping absences for the same employee (ANY type).

        Args:
            service_account (str): Employee service account
            absence_type (str): Type of absence (for error message)
            start_date (date): Start date
            end_date (date): End date
            exclude_id (int): ID to exclude from check (for updates)

        Raises:
            ValidationError: If overlap is found
        """
        # Check for ANY overlapping absence for this employee (regardless of type)
        query = EmployeeAbsence.query.filter(
            EmployeeAbsence.service_account == service_account,
            EmployeeAbsence.start_date <= end_date,
            EmployeeAbsence.end_date >= start_date,
        )

        if exclude_id:
            query = query.filter(EmployeeAbsence.id != exclude_id)

        conflicting = query.first()
        if conflicting:
            # Return error in English/German (frontend will handle translation)
            raise ValidationError(
                f"OVERLAP_ERROR|{conflicting.absence_type}|{conflicting.id}|"
                f"{conflicting.start_date}|{conflicting.end_date}|{start_date}|{end_date}"
            )

    @staticmethod
    def get_statistics(filters=None):
        """
        Get absence statistics calculating days instead of count.

        Args:
            filters (dict): Optional filters to apply

        Returns:
            dict: Statistics about absences in days
        """
        # Start with base query
        query = EmployeeAbsence.query

        # Apply filters if provided
        if filters:
            query = AbsenceService._apply_filters(query, filters)

        # Get all filtered absences
        absences = query.all()

        # Calculate total days
        total_days = sum(absence.calculate_days() for absence in absences)

        # Count unique employees
        unique_employees = len(set(absence.service_account for absence in absences))

        # Calculate days by type
        by_type = {}
        for absence in absences:
            absence_type = absence.absence_type
            if absence_type not in by_type:
                by_type[absence_type] = 0
            by_type[absence_type] += absence.calculate_days()

        return {
            "total_days": total_days,
            "unique_employees": unique_employees,
            "by_type": by_type,
        }
