"""Add is_half_day column to employee_absences table."""
from app import create_app, db
from sqlalchemy import text

def add_half_day_column():
    """Add is_half_day column if it doesn't exist."""
    app = create_app()
    
    with app.app_context():
        # Check if column exists
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('employee_absences')]
        
        if 'is_half_day' not in columns:
            print("Adding is_half_day column...")
            # Add column using raw SQL
            with db.engine.connect() as conn:
                conn.execute(text(
                    "ALTER TABLE employee_absences ADD COLUMN is_half_day BOOLEAN NOT NULL DEFAULT FALSE"
                ))
                conn.commit()
            print("✅ Column is_half_day added successfully")
        else:
            print("✅ Column is_half_day already exists")

if __name__ == "__main__":
    add_half_day_column()
