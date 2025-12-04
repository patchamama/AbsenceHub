#!/usr/bin/env python3
"""
AbsenceHub Seed Data Generator
Creates sample absence records for testing and demonstration
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app import create_app, db
from app.models.absence import EmployeeAbsence


def generate_sample_data():
    """Generate sample absence data"""

    # Sample employees and their service accounts
    employees = [
        ('s.john.doe', 'John Doe'),
        ('s.jane.smith', 'Jane Smith'),
        ('s.bob.johnson', 'Bob Johnson'),
        ('s.alice.williams', 'Alice Williams'),
        ('s.charlie.brown', 'Charlie Brown'),
        ('s.diana.prince', 'Diana Prince'),
        ('s.evan.hunt', 'Evan Hunt'),
        ('s.fiona.green', 'Fiona Green'),
    ]

    # Absence types
    absence_types = [
        'Urlaub',      # Vacation
        'Krankheit',   # Sick leave
        'Home Office',
        'Sonstige'     # Other
    ]

    # Generate absences
    today = datetime.now().date()
    absences = []

    # Create various absences
    for idx, (service_account, employee_name) in enumerate(employees):
        # Vacation (5 days)
        start = today + timedelta(days=idx * 10 + 5)
        end = start + timedelta(days=4)
        absences.append({
            'service_account': service_account,
            'employee_fullname': employee_name,
            'absence_type': 'Urlaub',
            'start_date': start,
            'end_date': end,
        })

        # Sick leave (1-2 days)
        start = today + timedelta(days=idx * 10 + 2)
        end = start + timedelta(days=1 if idx % 2 == 0 else 0)
        absences.append({
            'service_account': service_account,
            'employee_fullname': employee_name,
            'absence_type': 'Krankheit',
            'start_date': start,
            'end_date': end,
        })

        # Home Office (3 days, scattered)
        for day_offset in [1, 4, 7]:
            start = today + timedelta(days=idx * 10 + day_offset)
            absences.append({
                'service_account': service_account,
                'employee_fullname': employee_name,
                'absence_type': 'Home Office',
                'start_date': start,
                'end_date': start,
            })

    return absences


def insert_sample_data(app, data):
    """Insert sample data into database"""

    with app.app_context():
        try:
            # Check if data already exists
            count = db.session.query(EmployeeAbsence).count()
            if count > 0:
                print(f"Database already contains {count} records. Skipping insertion.")
                return True

            print(f"Inserting {len(data)} sample absence records...\n")

            for item in data:
                absence = EmployeeAbsence(
                    service_account=item['service_account'],
                    employee_fullname=item['employee_fullname'],
                    absence_type=item['absence_type'],
                    start_date=item['start_date'],
                    end_date=item['end_date']
                )
                db.session.add(absence)

                print(f"  • {item['service_account']:20} - {item['absence_type']:12} "
                      f"({item['start_date']} to {item['end_date']})")

            db.session.commit()
            print(f"\n✓ Successfully inserted {len(data)} sample records")
            return True

        except Exception as e:
            db.session.rollback()
            print(f"✗ Error inserting data: {str(e)}")
            return False


def main():
    """Main entry point"""

    print("=" * 70)
    print("AbsenceHub - Sample Data Generator".center(70))
    print("=" * 70 + "\n")

    try:
        # Create Flask app
        print("Initializing application...")
        app = create_app('development')

        # Generate sample data
        print("Generating sample data...\n")
        data = generate_sample_data()

        # Create tables if they don't exist
        with app.app_context():
            db.create_all()

        # Insert data
        success = insert_sample_data(app, data)

        if success:
            print("\n" + "=" * 70)
            print("Sample data insertion completed successfully!".center(70))
            print("=" * 70 + "\n")

            with app.app_context():
                count = db.session.query(EmployeeAbsence).count()
                print(f"Total records in database: {count}\n")

            return 0
        else:
            return 1

    except Exception as e:
        print(f"\n✗ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
