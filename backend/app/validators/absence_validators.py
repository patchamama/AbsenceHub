"""Validators for absence data."""
import re
from datetime import date

ALLOWED_ABSENCE_TYPES = ["Urlaub", "Krankheit", "Home Office", "Sonstige"]


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
    if not service_account:
        raise ValidationError("Service account is required")

    if not service_account.startswith("s."):
        raise ValidationError("Service account must start with 's.'")

    parts = service_account.split(".")
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


def validate_absence_type(absence_type):
    """
    Validate absence type.

    Args:
        absence_type (str): Type of absence

    Raises:
        ValidationError: If type is not valid
    """
    if not absence_type:
        raise ValidationError("Absence type is required")

    if absence_type not in ALLOWED_ABSENCE_TYPES:
        raise ValidationError(
            f"Invalid absence type. Allowed types: {', '.join(ALLOWED_ABSENCE_TYPES)}"
        )
