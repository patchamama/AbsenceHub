"""Seed database with sample data."""
from datetime import datetime, timedelta
from faker import Faker
from app import db
from app.models.absence import EmployeeAbsence

fake = Faker()

ABSENCE_TYPES = ["Urlaub", "Krankheit", "Home Office", "Sonstige"]
FIRST_NAMES = ["John", "Jane", "Michael", "Sarah", "David", "Emma", "James", "Lisa"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller"]


def generate_service_account():
    """Generate a realistic service account."""
    first_name = fake.random_element(FIRST_NAMES).lower()
    last_name = fake.random_element(LAST_NAMES).lower()
    return f"s.{first_name}.{last_name}"


def seed_database():
    """Seed the database with sample absence records."""
    # Clear existing data
    EmployeeAbsence.query.delete()

    today = datetime.now().date()
    absences = []

    # Generate 25 sample absences
    for i in range(25):
        # Random start date within the last 6 months or next 3 months
        days_offset = fake.random_int(min=-180, max=90)
        start_date = today + timedelta(days=days_offset)

        # Random duration (1-10 days)
        duration = fake.random_int(min=1, max=10)
        end_date = start_date + timedelta(days=duration)

        absence = EmployeeAbsence(
            service_account=generate_service_account(),
            employee_fullname=fake.name(),
            absence_type=fake.random_element(ABSENCE_TYPES),
            start_date=start_date,
            end_date=end_date,
        )
        absences.append(absence)

    # Add to database
    db.session.add_all(absences)
    db.session.commit()

    print(f"Successfully seeded database with {len(absences)} absence records.")
