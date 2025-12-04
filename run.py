#!/usr/bin/env python3
"""
AbsenceHub Application Launcher
Starts both backend and frontend with a single command
"""

import os
import sys
import platform
import subprocess
import json
import time
import webbrowser
from pathlib import Path
from typing import Dict, Optional


class AppLauncher:
    """Application launcher for AbsenceHub"""

    def __init__(self):
        self.project_dir = Path(__file__).parent
        self.backend_dir = self.project_dir / 'backend'
        self.frontend_dir = self.project_dir / 'frontend'
        self.config_file = self.project_dir / '.env.installer'
        self.processes = []

    def load_config(self) -> Optional[Dict]:
        """Load configuration from installer"""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    return json.load(f)
            except Exception:
                return None
        return None

    def check_prerequisites(self) -> bool:
        """Check if all prerequisites are installed"""
        print("Checking prerequisites...")

        # Check Node.js
        try:
            subprocess.run(['node', '--version'], capture_output=True, check=True, timeout=5)
            print("✓ Node.js found")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("✗ Node.js not found. Please install Node.js first.")
            return False

        # Check npm
        try:
            subprocess.run(['npm', '--version'], capture_output=True, check=True, timeout=5)
            print("✓ npm found")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("✗ npm not found. Please install npm first.")
            return False

        # Check Python
        if sys.version_info < (3, 9):
            print(f"✗ Python 3.9+ required, but {sys.version_info.major}.{sys.version_info.minor} found")
            return False
        print("✓ Python 3.9+ found")

        return True

    def start_backend(self):
        """Start backend server"""
        print("\n" + "=" * 60)
        print("Starting Backend Server...")
        print("=" * 60)

        try:
            process = subprocess.Popen(
                [sys.executable, 'run.py'],
                cwd=str(self.backend_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            self.processes.append(('backend', process))
            print("✓ Backend server started (PID: {})".format(process.pid))

            # Wait a bit for backend to start
            time.sleep(3)
            return True

        except Exception as e:
            print(f"✗ Failed to start backend: {str(e)}")
            return False

    def start_frontend(self):
        """Start frontend development server"""
        print("\n" + "=" * 60)
        print("Starting Frontend Development Server...")
        print("=" * 60)

        try:
            process = subprocess.Popen(
                ['npm', 'run', 'dev'],
                cwd=str(self.frontend_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            self.processes.append(('frontend', process))
            print("✓ Frontend development server started (PID: {})".format(process.pid))

            # Wait a bit for frontend to start
            time.sleep(3)
            return True

        except Exception as e:
            print(f"✗ Failed to start frontend: {str(e)}")
            return False

    def open_browser(self):
        """Open the application in default browser"""
        print("\n" + "=" * 60)
        print("Opening Application in Browser...")
        print("=" * 60)

        time.sleep(2)

        url = 'http://localhost:5173'
        print(f"Opening {url}...")

        try:
            webbrowser.open(url)
            print(f"✓ Browser opened at {url}")
        except Exception as e:
            print(f"⚠ Could not automatically open browser: {str(e)}")
            print(f"Please manually open {url}")

    def print_startup_info(self):
        """Print startup information"""
        print("\n" + "=" * 60)
        print("AbsenceHub Application Servers Running")
        print("=" * 60 + "\n")

        print("Frontend: http://localhost:5173")
        print("Backend:  http://localhost:5000\n")

        config = self.load_config()
        if config:
            print("Database Configuration:")
            print(f"  Type: {config.get('type', 'N/A')}")
            print(f"  Host: {config.get('host', 'N/A')}")
            print(f"  Port: {config.get('port', 'N/A')}")
            print(f"  Database: {config.get('database', 'N/A')}\n")

        print("Logs are displayed below.\n")
        print("To stop the servers:")
        print("  Press Ctrl+C in this terminal\n")
        print("=" * 60 + "\n")

    def run(self, skip_browser: bool = False):
        """Run the application"""
        try:
            print("\n" + "=" * 60)
            print("AbsenceHub Application Launcher")
            print("=" * 60 + "\n")

            # Check prerequisites
            if not self.check_prerequisites():
                sys.exit(1)

            # Start backend
            if not self.start_backend():
                sys.exit(1)

            # Start frontend
            if not self.start_frontend():
                # Kill backend if frontend failed
                for name, process in self.processes:
                    if name == 'backend':
                        process.terminate()
                sys.exit(1)

            # Print startup info
            self.print_startup_info()

            # Open browser
            if not skip_browser:
                self.open_browser()

            # Monitor processes
            self.monitor_processes()

        except KeyboardInterrupt:
            print("\n\nShutting down...")
            self.shutdown()
        except Exception as e:
            print(f"\n✗ Error: {str(e)}")
            self.shutdown()
            sys.exit(1)

    def monitor_processes(self):
        """Monitor running processes"""
        while True:
            # Check if processes are still running
            for name, process in self.processes:
                if process.poll() is not None:
                    print(f"\n✗ {name.capitalize()} process terminated unexpectedly")
                    # Try to read output
                    stdout, stderr = process.communicate(timeout=1)
                    if stderr:
                        print(f"Error output:\n{stderr}")

            # Print process output if available
            for name, process in self.processes:
                try:
                    # Non-blocking read from stdout
                    if process.stdout:
                        line = process.stdout.readline()
                        if line:
                            print(f"[{name.upper()}] {line.rstrip()}")
                except Exception:
                    pass

            time.sleep(0.1)

    def shutdown(self):
        """Shutdown all processes"""
        print("\nTerminating processes...")

        for name, process in self.processes:
            try:
                process.terminate()
                process.wait(timeout=5)
                print(f"✓ {name.capitalize()} terminated")
            except subprocess.TimeoutExpired:
                process.kill()
                print(f"✓ {name.capitalize()} killed")
            except Exception as e:
                print(f"⚠ Error terminating {name}: {str(e)}")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='AbsenceHub Application Launcher')
    parser.add_argument(
        '--skip-browser',
        action='store_true',
        help='Skip opening browser automatically'
    )

    args = parser.parse_args()

    launcher = AppLauncher()
    launcher.run(skip_browser=args.skip_browser)


if __name__ == '__main__':
    main()
