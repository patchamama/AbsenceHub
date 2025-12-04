#!/bin/bash

echo "Running backend tests..."
pytest -v --tb=short

echo ""
echo "Generating coverage report..."
pytest --cov=app --cov-report=html --cov-report=term

echo ""
echo "Checking code quality with Black..."
black --check app/ config.py run.py

echo ""
echo "Checking code style with Flake8..."
flake8 app/ config.py run.py

echo ""
echo "All checks complete!"
