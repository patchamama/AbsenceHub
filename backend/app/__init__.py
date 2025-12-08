"""Application factory for creating Flask app instances."""
# IMPORTANT: Import db_utils first to configure environment for database
from app import db_utils  # noqa: F401

import os
from pathlib import Path
from flask import Flask, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

from config import get_config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()


def create_app(config_name=None):
    """
    Create and configure Flask application.

    Args:
        config_name (str): Configuration to use ('development', 'testing', 'production')

    Returns:
        Flask: Configured application instance
    """
    # Determine static folder path (frontend build)
    static_folder = Path(__file__).parent.parent / 'static'

    app = Flask(__name__, static_folder=str(static_folder), static_url_path='')

    # Load configuration
    config = get_config(config_name)
    app.config.from_object(config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Configure CORS
    cors_origins = app.config.get("CORS_ORIGINS", "").split(",")
    CORS(app, origins=cors_origins if cors_origins[0] else "*")

    # Register blueprints
    from app.routes import absence_bp, health_bp
    from app.routes.absence_type_routes import absence_type_bp
    from app.routes.audit_routes import audit_bp

    app.register_blueprint(absence_bp, url_prefix="/api")
    app.register_blueprint(absence_type_bp, url_prefix="/api")
    app.register_blueprint(audit_bp, url_prefix="/api")
    app.register_blueprint(health_bp, url_prefix="/api")

    # Serve frontend static files (SPA support)
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        """Serve the React SPA for all non-API routes."""
        # Don't interfere with API routes
        if path.startswith('api/'):
            return jsonify({"success": False, "error": "API endpoint not found"}), 404

        # Serve static files if they exist
        if path and static_folder.exists():
            file_path = static_folder / path
            if file_path.exists() and file_path.is_file():
                return send_from_directory(str(static_folder), path)

        # Otherwise, serve index.html (for client-side routing)
        index_path = static_folder / 'index.html'
        if index_path.exists():
            return send_from_directory(str(static_folder), 'index.html')

        # If no static files exist, return helpful message
        return jsonify({
            "message": "Frontend not built yet. Run 'npm run build' in frontend directory.",
            "instructions": "1. cd frontend\n2. npm run build\n3. The build will be automatically copied to backend/static"
        }), 200

    # Error handlers
    register_error_handlers(app)

    # Shell context for flask shell
    @app.shell_context_processor
    def make_shell_context():
        from app.models.absence import EmployeeAbsence
        from app.models.audit_log import AuditLog

        return {
            "db": db,
            "EmployeeAbsence": EmployeeAbsence,
            "AuditLog": AuditLog,
        }

    # CLI commands
    register_cli_commands(app)

    return app


def register_error_handlers(app):
    """Register error handlers for the application."""

    @app.errorhandler(400)
    def bad_request(error):
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Bad request",
                    "message": str(error),
                }
            ),
            400,
        )

    @app.errorhandler(404)
    def not_found(error):
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Resource not found",
                }
            ),
            404,
        )

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Internal server error",
                }
            ),
            500,
        )


def register_cli_commands(app):
    """Register CLI commands for the application."""

    @app.cli.command()
    def init_db():
        """Initialize the database."""
        db.create_all()
        print("Database initialized.")

    @app.cli.command()
    def seed_db():
        """Seed the database with sample data."""
        from app.utils.seed_data import seed_database

        seed_database()
        print("Database seeded with sample data.")

    @app.cli.command()
    def drop_db():
        """Drop all database tables."""
        if input("Are you sure you want to drop all tables? (y/n): ").lower() == "y":
            db.drop_all()
            print("All tables dropped.")
        else:
            print("Cancelled.")
