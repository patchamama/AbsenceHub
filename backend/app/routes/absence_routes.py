"""Absence management routes."""
from flask import Blueprint, request, jsonify

absence_bp = Blueprint("absences", __name__)


@absence_bp.route("/absences", methods=["GET"])
def get_absences():
    """Get all absences with optional filters."""
    pass


@absence_bp.route("/absences/<int:absence_id>", methods=["GET"])
def get_absence(absence_id):
    """Get absence by ID."""
    pass


@absence_bp.route("/absences", methods=["POST"])
def create_absence():
    """Create new absence."""
    pass


@absence_bp.route("/absences/<int:absence_id>", methods=["PUT"])
def update_absence(absence_id):
    """Update existing absence."""
    pass


@absence_bp.route("/absences/<int:absence_id>", methods=["DELETE"])
def delete_absence(absence_id):
    """Delete absence."""
    pass


@absence_bp.route("/absence-types", methods=["GET"])
def get_absence_types():
    """Get list of valid absence types."""
    pass


@absence_bp.route("/statistics", methods=["GET"])
def get_statistics():
    """Get absence statistics."""
    pass
