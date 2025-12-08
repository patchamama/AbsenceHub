#!/usr/bin/env python3
"""
Frontend Build Script for AbsenceHub
Builds the frontend and copies it to backend/static for production deployment
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path


def print_header(text):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f"{text.center(60)}")
    print(f"{'='*60}\n")


def print_success(text):
    """Print success message"""
    print(f"✓ {text}")


def print_error(text):
    """Print error message"""
    print(f"✗ {text}")


def print_info(text):
    """Print info message"""
    print(f"ℹ {text}")


def run_command(cmd, cwd=None, description=""):
    """Run shell command and return result"""
    if description:
        print_info(description)

    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        if result.returncode == 0:
            return True, result.stdout
        else:
            return False, result.stderr
    except subprocess.TimeoutExpired:
        return False, "Command timed out after 5 minutes"
    except Exception as e:
        return False, str(e)


def main():
    """Main build process"""
    project_dir = Path(__file__).parent
    frontend_dir = project_dir / 'frontend'
    backend_dir = project_dir / 'backend'
    static_dir = backend_dir / 'static'

    print_header("AbsenceHub Frontend Build Script")

    # Check if frontend directory exists
    if not frontend_dir.exists():
        print_error("Frontend directory not found!")
        sys.exit(1)

    # Ask user if they want to run npm install
    print_info("This script will:")
    print("  1. Run 'npm install' (optional)")
    print("  2. Build the frontend (npm run build)")
    print("  3. Copy dist/ to backend/static/\n")

    run_install = input("Do you want to run 'npm install'? (y/N): ").strip().lower()

    if run_install == 'y':
        print_header("Step 1: Installing npm dependencies")
        success, output = run_command(
            ['npm', 'install'],
            cwd=str(frontend_dir),
            description="Running npm install..."
        )

        if success:
            print_success("npm dependencies installed")
        else:
            print_error(f"Failed to install dependencies: {output[:200]}")
            sys.exit(1)
    else:
        print_info("Skipping npm install...")

    # Build frontend
    print_header("Step 2: Building Frontend")
    success, output = run_command(
        ['npm', 'run', 'build'],
        cwd=str(frontend_dir),
        description="Running npm run build..."
    )

    if success:
        print_success("Frontend built successfully")
    else:
        print_error(f"Build failed: {output[:200]}")
        sys.exit(1)

    # Copy to backend/static
    print_header("Step 3: Copying to backend/static")

    dist_dir = frontend_dir / 'dist'

    if not dist_dir.exists():
        print_error("Build output directory (dist/) not found!")
        sys.exit(1)

    # Remove old static directory if it exists
    if static_dir.exists():
        print_info(f"Removing old static directory...")
        shutil.rmtree(static_dir)
        print_success("Old static directory removed")

    # Copy dist to static
    print_info(f"Copying {dist_dir} to {static_dir}...")
    shutil.copytree(dist_dir, static_dir)
    print_success(f"Frontend copied to {static_dir}")

    # Verify files
    index_html = static_dir / 'index.html'
    if index_html.exists():
        print_success("Verified: index.html exists")
    else:
        print_error("Warning: index.html not found in static directory")

    # Count files
    file_count = len(list(static_dir.rglob('*')))
    print_success(f"Total files copied: {file_count}")

    print_header("Build Complete!")
    print_success("Frontend successfully built and deployed to backend/static/")
    print_info("\nYou can now:")
    print("  1. Start the backend: cd backend && python run.py")
    print("  2. Access the app at: http://localhost:5000")
    print("\nThe backend will serve the frontend from /static/")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nBuild cancelled by user")
        sys.exit(0)
    except Exception as e:
        print_error(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
