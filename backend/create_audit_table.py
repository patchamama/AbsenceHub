"""Create audit_logs table if it doesn't exist."""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection parameters
# Parse from DATABASE_URL if available
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL:
    # Parse postgresql://user:password@host:port/database
    import re
    match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', DATABASE_URL)
    if match:
        DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME = match.groups()
    else:
        raise ValueError("Invalid DATABASE_URL format")
else:
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5433')
    DB_NAME = os.getenv('DB_NAME', 'absencehub_dev')
    DB_USER = os.getenv('DB_USER', 'absencehub')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')

# SQL to create audit_logs table
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(20) NOT NULL,
    entity_type VARCHAR(50) NOT NULL DEFAULT 'EmployeeAbsence',
    entity_id INTEGER,
    "user" VARCHAR(100) DEFAULT 'system',
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT,

    CONSTRAINT check_action CHECK (action IN ('CREATE', 'UPDATE', 'DELETE'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs("user");

COMMENT ON TABLE audit_logs IS 'Audit trail for tracking all changes to employee absences';
COMMENT ON COLUMN audit_logs.action IS 'Type of action: CREATE, UPDATE, or DELETE';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity being audited (default: EmployeeAbsence)';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the entity (null if deleted)';
COMMENT ON COLUMN audit_logs.old_values IS 'JSON snapshot of values before change (null for CREATE)';
COMMENT ON COLUMN audit_logs.new_values IS 'JSON snapshot of values after change (null for DELETE)';
"""


def create_audit_table():
    """Create the audit_logs table in the database."""
    try:
        # Connect to database
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )

        cursor = conn.cursor()

        print("Creating audit_logs table...")
        cursor.execute(CREATE_TABLE_SQL)
        conn.commit()

        print("✓ audit_logs table created successfully!")

        # Verify table was created
        cursor.execute("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'audit_logs'
            ORDER BY ordinal_position
        """)

        columns = cursor.fetchall()
        print(f"\n✓ Table structure ({len(columns)} columns):")
        for col_name, col_type in columns:
            print(f"  - {col_name}: {col_type}")

        cursor.close()
        conn.close()

        print("\n✓ Migration completed successfully!")

    except Exception as e:
        print(f"✗ Error creating audit_logs table: {e}")
        raise


if __name__ == '__main__':
    create_audit_table()
