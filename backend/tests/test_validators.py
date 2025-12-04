"""Tests for absence validators."""
import pytest
from datetime import date
from app.validators.absence_validators import (
    validate_service_account,
    validate_date_range,
    validate_absence_type,
    ValidationError,
)


class TestServiceAccountValidation:
    """Test suite for service account validation."""

    def test_valid_service_account(self):
        """Test that valid service account passes validation."""
        validate_service_account("s.john.doe")

    def test_invalid_service_account_without_prefix(self):
        """Test that service account without 's.' prefix fails."""
        with pytest.raises(ValidationError, match="must start with 's.'"):
            validate_service_account("john.doe")

    def test_empty_service_account(self):
        """Test that empty service account fails."""
        with pytest.raises(ValidationError, match="required"):
            validate_service_account("")

    def test_service_account_wrong_format(self):
        """Test that service account with wrong format fails."""
        with pytest.raises(ValidationError, match="s.firstname.lastname"):
            validate_service_account("s.john")

    def test_service_account_with_valid_special_case(self):
        """Test service account with valid format variations."""
        validate_service_account("s.marie.von.neumann")

    def test_service_account_none(self):
        """Test that None service account fails."""
        with pytest.raises(ValidationError):
            validate_service_account(None)


class TestDateRangeValidation:
    """Test suite for date range validation."""

    def test_valid_date_range(self):
        """Test that valid date range passes."""
        start = date(2025, 1, 15)
        end = date(2025, 1, 20)
        validate_date_range(start, end)

    def test_same_day_absence(self):
        """Test that same-day absence is valid."""
        day = date(2025, 1, 15)
        validate_date_range(day, day)

    def test_end_before_start_fails(self):
        """Test that end date before start date fails."""
        start = date(2025, 1, 20)
        end = date(2025, 1, 15)
        with pytest.raises(ValidationError, match="cannot be before"):
            validate_date_range(start, end)

    def test_long_date_range(self):
        """Test long date ranges are valid."""
        start = date(2025, 1, 1)
        end = date(2025, 12, 31)
        validate_date_range(start, end)


class TestAbsenceTypeValidation:
    """Test suite for absence type validation."""

    def test_valid_absence_types(self):
        """Test that valid absence types pass."""
        for absence_type in ["Urlaub", "Krankheit", "Home Office", "Sonstige"]:
            validate_absence_type(absence_type)

    def test_invalid_absence_type(self):
        """Test that invalid absence type fails."""
        with pytest.raises(ValidationError, match="Invalid absence type"):
            validate_absence_type("InvalidType")

    def test_empty_absence_type(self):
        """Test that empty absence type fails."""
        with pytest.raises(ValidationError, match="required"):
            validate_absence_type("")

    def test_case_sensitive_absence_type(self):
        """Test that absence types are case-sensitive."""
        with pytest.raises(ValidationError):
            validate_absence_type("urlaub")

    def test_none_absence_type(self):
        """Test that None absence type fails."""
        with pytest.raises(ValidationError):
            validate_absence_type(None)
