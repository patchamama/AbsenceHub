"""Database utilities for handling encoding issues in WSL2."""
import os
import sys


def setup_db_environment():
    """Configure environment variables for database connections in WSL2."""
    # Force C locale for PostgreSQL messages
    os.environ['LC_ALL'] = 'C'
    os.environ['LANG'] = 'C'
    os.environ['LANGUAGE'] = 'C'
    os.environ['LC_MESSAGES'] = 'C'
    os.environ['LC_CTYPE'] = 'C'

    # PostgreSQL client encoding
    os.environ['PGCLIENTENCODING'] = 'UTF8'

    # Patch psycopg2 to handle encoding errors gracefully
    try:
        import psycopg2
        from psycopg2 import extensions

        # Register a custom Unicode decoder that's more forgiving
        original_register_type = extensions.register_type

        def patched_register_type(*args, **kwargs):
            try:
                return original_register_type(*args, **kwargs)
            except UnicodeDecodeError:
                pass  # Ignore encoding errors during type registration

        extensions.register_type = patched_register_type
    except ImportError:
        pass  # psycopg2 not installed yet


# Call this immediately when module is imported
setup_db_environment()
