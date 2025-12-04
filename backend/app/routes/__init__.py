"""API routes."""
from .absence_routes import absence_bp
from .health_routes import health_bp

__all__ = ["absence_bp", "health_bp"]
