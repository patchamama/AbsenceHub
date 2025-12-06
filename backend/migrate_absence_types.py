"""Script to create absence_types table and migrate initial data."""
from app import create_app, db
from app.models.absence_type import AbsenceType

app = create_app()

# Default absence types with colors
DEFAULT_TYPES = [
    {
        "name": "Urlaub",
        "name_de": "Urlaub",
        "name_en": "Vacation",
        "color": "#10B981",  # Green
        "is_active": True,
    },
    {
        "name": "Krankheit",
        "name_de": "Krankheit",
        "name_en": "Sick Leave",
        "color": "#EF4444",  # Red
        "is_active": True,
    },
    {
        "name": "Home Office",
        "name_de": "Home Office",
        "name_en": "Home Office",
        "color": "#3B82F6",  # Blue
        "is_active": True,
    },
    {
        "name": "Sonstige",
        "name_de": "Sonstige",
        "name_en": "Other",
        "color": "#8B5CF6",  # Purple
        "is_active": True,
    },
]

with app.app_context():
    # Create absence_types table
    db.create_all()
    print("✓ Database tables created/updated successfully")

    # Check if absence types already exist
    existing_count = AbsenceType.query.count()

    if existing_count == 0:
        # Insert default absence types
        for type_data in DEFAULT_TYPES:
            absence_type = AbsenceType.from_dict(type_data)
            db.session.add(absence_type)

        db.session.commit()
        print(f"✓ Inserted {len(DEFAULT_TYPES)} default absence types")
    else:
        print(f"ℹ Absence types table already has {existing_count} records, skipping insertion")

    # Display all absence types
    print("\nCurrent absence types:")
    for at in AbsenceType.query.all():
        print(f"  - {at.name_de} / {at.name_en} ({at.color})")
