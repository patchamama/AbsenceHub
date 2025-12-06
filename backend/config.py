"""Configuration classes for Flask application."""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration."""

    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-key-change-in-production"
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL"
    ) or "postgresql://localhost/absencehub_dev"
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "client_encoding": "utf8"
        }
    }
    SQLALCHEMY_ECHO = True
    CORS_ORIGINS = (
        os.environ.get("CORS_ORIGINS") or "http://localhost:5173,http://localhost:3000"
    )


class TestingConfig(Config):
    """Testing configuration."""

    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "TEST_DATABASE_URL"
    ) or "sqlite:///:memory:"
    SQLALCHEMY_ECHO = False
    WTF_CSRF_ENABLED = False
    CORS_ORIGINS = "*"


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    SQLALCHEMY_ECHO = False
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS") or ""


def get_config(environment=None):
    """Get configuration object based on environment."""
    if environment is None:
        environment = os.environ.get("FLASK_ENV", "development")

    config_map = {
        "development": DevelopmentConfig,
        "testing": TestingConfig,
        "production": ProductionConfig,
    }

    return config_map.get(environment, DevelopmentConfig)
