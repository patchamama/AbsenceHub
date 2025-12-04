#!/bin/bash

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
flask db init

# Create migration
flask db migrate -m "Initial migration - create employee_absences table"

# Apply migration
flask db upgrade

# Seed database
flask seed-db

echo "Setup complete!"
echo "To activate virtual environment: source venv/bin/activate"
echo "To run tests: pytest -v"
echo "To start server: flask run"
