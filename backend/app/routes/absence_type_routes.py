"""Routes for absence type management."""
from flask import Blueprint, request, jsonify
from app.services.absence_type_service import AbsenceTypeService

absence_type_bp = Blueprint("absence_types", __name__)


@absence_type_bp.route("/absence-types", methods=["GET"])
def get_absence_types():
    """Get all absence types."""
    try:
        # Get query parameter for active_only (default: true)
        active_only = request.args.get("active_only", "true").lower() == "true"

        absence_types = AbsenceTypeService.get_all(active_only=active_only)

        return (
            jsonify(
                {
                    "success": True,
                    "data": [at.to_dict() for at in absence_types],
                }
            ),
            200,
        )
    except Exception as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            500,
        )


@absence_type_bp.route("/absence-types/<int:type_id>", methods=["GET"])
def get_absence_type(type_id):
    """Get single absence type by ID."""
    try:
        absence_type = AbsenceTypeService.get_by_id(type_id)

        if not absence_type:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": f"Absence type with ID {type_id} not found",
                    }
                ),
                404,
            )

        return (
            jsonify(
                {
                    "success": True,
                    "data": absence_type.to_dict(),
                }
            ),
            200,
        )
    except Exception as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            500,
        )


@absence_type_bp.route("/absence-types", methods=["POST"])
def create_absence_type():
    """Create new absence type."""
    try:
        data = request.get_json()

        if not data:
            return (
                jsonify({"success": False, "error": "No data provided"}),
                400,
            )

        absence_type = AbsenceTypeService.create(data)

        return (
            jsonify(
                {
                    "success": True,
                    "data": absence_type.to_dict(),
                    "message": "Absence type created successfully",
                }
            ),
            201,
        )
    except ValueError as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            400,
        )
    except Exception as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            500,
        )


@absence_type_bp.route("/absence-types/<int:type_id>", methods=["PUT"])
def update_absence_type(type_id):
    """Update existing absence type."""
    try:
        data = request.get_json()

        if not data:
            return (
                jsonify({"success": False, "error": "No data provided"}),
                400,
            )

        absence_type = AbsenceTypeService.update(type_id, data)

        return (
            jsonify(
                {
                    "success": True,
                    "data": absence_type.to_dict(),
                    "message": "Absence type updated successfully",
                }
            ),
            200,
        )
    except ValueError as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            400,
        )
    except Exception as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            500,
        )


@absence_type_bp.route("/absence-types/<int:type_id>", methods=["DELETE"])
def delete_absence_type(type_id):
    """Soft delete absence type."""
    try:
        # Check if hard delete is requested
        hard_delete = request.args.get("hard", "false").lower() == "true"

        if hard_delete:
            absence_type = AbsenceTypeService.hard_delete(type_id)
            message = "Absence type permanently deleted"
        else:
            absence_type = AbsenceTypeService.delete(type_id)
            message = "Absence type deactivated"

        return (
            jsonify(
                {
                    "success": True,
                    "data": absence_type.to_dict(),
                    "message": message,
                }
            ),
            200,
        )
    except ValueError as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            400,
        )
    except Exception as e:
        return (
            jsonify({"success": False, "error": str(e)}),
            500,
        )
