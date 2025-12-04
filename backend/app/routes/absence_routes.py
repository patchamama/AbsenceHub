"""Absence management routes."""
from datetime import datetime
from flask import Blueprint, request, jsonify
from app.services.absence_service import AbsenceService
from app.validators.absence_validators import ValidationError, ALLOWED_ABSENCE_TYPES

absence_bp = Blueprint("absences", __name__)


@absence_bp.route("/absences", methods=["GET"])
def get_absences():
    """Get all absences with optional filters."""
    try:
        # Build filters from query parameters
        filters = {}
        service_account = request.args.get("service_account")
        absence_type = request.args.get("absence_type")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        if service_account:
            filters["service_account"] = service_account
        if absence_type:
            filters["absence_type"] = absence_type
        if start_date:
            filters["start_date"] = datetime.strptime(start_date, "%Y-%m-%d").date()
        if end_date:
            filters["end_date"] = datetime.strptime(end_date, "%Y-%m-%d").date()

        absences = AbsenceService.get_all(filters if filters else None)
        return (
            jsonify(
                {
                    "success": True,
                    "data": [absence.to_dict() for absence in absences],
                }
            ),
            200,
        )
    except Exception as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            400,
        )


@absence_bp.route("/absences/<int:absence_id>", methods=["GET"])
def get_absence(absence_id):
    """Get absence by ID."""
    try:
        absence = AbsenceService.get_by_id(absence_id)
        if not absence:
            return (
                jsonify({"success": False, "error": "Absence not found"}),
                404,
            )
        return (
            jsonify({"success": True, "data": absence.to_dict()}),
            200,
        )
    except Exception as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            400,
        )


@absence_bp.route("/absences", methods=["POST"])
def create_absence():
    """Create new absence."""
    try:
        data = request.get_json()

        # Convert date strings to date objects
        if data.get("start_date"):
            data["start_date"] = datetime.strptime(
                data["start_date"], "%Y-%m-%d"
            ).date()
        if data.get("end_date"):
            data["end_date"] = datetime.strptime(data["end_date"], "%Y-%m-%d").date()

        absence = AbsenceService.create(data)
        return (
            jsonify({"success": True, "data": absence.to_dict()}),
            201,
        )
    except ValidationError as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            400,
        )
    except Exception as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            400,
        )


@absence_bp.route("/absences/<int:absence_id>", methods=["PUT"])
def update_absence(absence_id):
    """Update existing absence."""
    try:
        data = request.get_json()

        # Convert date strings to date objects
        if data.get("start_date"):
            data["start_date"] = datetime.strptime(
                data["start_date"], "%Y-%m-%d"
            ).date()
        if data.get("end_date"):
            data["end_date"] = datetime.strptime(data["end_date"], "%Y-%m-%d").date()

        absence = AbsenceService.update(absence_id, data)
        return (
            jsonify({"success": True, "data": absence.to_dict()}),
            200,
        )
    except ValidationError as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            400,
        )
    except Exception as e:
        if "404" in str(type(e)):
            return (
                jsonify({"success": False, "error": "Absence not found"}),
                404,
            )
        return (
            jsonify({"success": False, "error": str(e)}),
            400,
        )


@absence_bp.route("/absences/<int:absence_id>", methods=["DELETE"])
def delete_absence(absence_id):
    """Delete absence."""
    try:
        absence = AbsenceService.delete(absence_id)
        return (
            jsonify({"success": True, "data": absence.to_dict()}),
            200,
        )
    except Exception as e:
        if "404" in str(type(e)):
            return (
                jsonify({"success": False, "error": "Absence not found"}),
                404,
            )
        return (
            jsonify({"success": False, "error": str(e)}),
            400,
        )


@absence_bp.route("/absence-types", methods=["GET"])
def get_absence_types():
    """Get list of valid absence types."""
    return (
        jsonify({"success": True, "data": ALLOWED_ABSENCE_TYPES}),
        200,
    )


@absence_bp.route("/statistics", methods=["GET"])
def get_statistics():
    """Get absence statistics."""
    try:
        stats = AbsenceService.get_statistics()
        return (
            jsonify({"success": True, "data": stats}),
            200,
        )
    except Exception as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            400,
        )
