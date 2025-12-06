"""Application factory for creating Flask app instances."""
# IMPORTANT: Import db_utils first to configure environment for database
from app import db_utils  # noqa: F401

from flask import Flask, jsonify
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
    app = Flask(__name__)

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

    app.register_blueprint(absence_bp, url_prefix="/api")
    app.register_blueprint(absence_type_bp, url_prefix="/api")
    app.register_blueprint(health_bp)

    # Error handlers
    register_error_handlers(app)

    # Shell context for flask shell
    @app.shell_context_processor
    def make_shell_context():
        from app.models.absence import EmployeeAbsence

        return {
            "db": db,
            "EmployeeAbsence": EmployeeAbsence,
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
