#!/usr/bin/env python3
"""
AbsenceHub System Verification Script
Verifies that the system meets all requirements and works correctly
"""

import os
import sys
import json
import time
import subprocess
import platform
import socket
from pathlib import Path
from typing import Tuple, List, Dict


class Colors:
    """ANSI color codes"""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

    @staticmethod
    def disable():
        Colors.HEADER = Colors.BLUE = Colors.CYAN = Colors.GREEN = ''
        Colors.YELLOW = Colors.RED = Colors.ENDC = Colors.BOLD = ''


class SystemVerifier:
    """Verify AbsenceHub system requirements"""

    def __init__(self):
        self.results = {
            'system': {},
            'requirements': {},
            'backend': {},
            'frontend': {},
            'database': {},
            'api': {},
        }
        self.project_dir = Path(__file__).parent
        self.config_file = self.project_dir / '.env.installer'

    def print_section(self, title: str):
        """Print section header"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.CYAN}{title.center(60)}{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.ENDC}\n")

    def print_test(self, name: str, passed: bool, details: str = ""):
        """Print test result"""
        status = f"{Colors.GREEN}✓ PASS{Colors.ENDC}" if passed else f"{Colors.RED}✗ FAIL{Colors.ENDC}"
        details_text = f" - {details}" if details else ""
        print(f"  {status} {name}{details_text}")

    def verify_system_info(self):
        """Verify system information"""
        self.print_section("System Information")

        system = platform.system()
        arch = platform.machine()
        python_version = platform.python_version()

        print(f"Operating System: {system} ({arch})")
        print(f"Python Version: {python_version}")

        self.results['system'] = {
            'os': system,
            'architecture': arch,
            'python_version': python_version,
        }

    def verify_requirements(self):
        """Verify system requirements"""
        self.print_section("System Requirements")

        # Python version
        py_ok = sys.version_info >= (3, 9)
        self.print_test("Python 3.9+", py_ok, f"Found {platform.python_version()}")
        self.results['requirements']['python'] = py_ok

        # Node.js
        node_ok, node_version = self._check_command('node', ['node', '--version'])
        self.print_test("Node.js", node_ok, node_version if node_ok else "Not found")
        self.results['requirements']['node'] = node_ok

        # npm
        npm_ok, npm_version = self._check_command('npm', ['npm', '--version'])
        self.print_test("npm", npm_ok, npm_version if npm_ok else "Not found")
        self.results['requirements']['npm'] = npm_ok

        # Git
        git_ok, git_version = self._check_command('git', ['git', '--version'])
        self.print_test("Git", git_ok, git_version if git_ok else "Not found")
        self.results['requirements']['git'] = git_ok

        # Docker (optional)
        docker_ok, docker_version = self._check_command('docker', ['docker', '--version'])
        self.print_test("Docker (optional)", docker_ok, docker_version if docker_ok else "Not found")
        self.results['requirements']['docker'] = docker_ok

        return all(self.results['requirements'].values())

    def verify_backend_setup(self):
        """Verify backend setup"""
        self.print_section("Backend Setup")

        backend_dir = self.project_dir / 'backend'

        # Check directory
        dir_ok = backend_dir.exists()
        self.print_test("Backend directory exists", dir_ok, str(backend_dir))
        self.results['backend']['directory'] = dir_ok

        if not dir_ok:
            return False

        # Check requirements.txt
        req_file = backend_dir / 'requirements.txt'
        req_ok = req_file.exists()
        self.print_test("requirements.txt exists", req_ok)
        self.results['backend']['requirements_file'] = req_ok

        # Check Python dependencies
        try:
            import flask
            import sqlalchemy
            import psycopg2
            deps_ok = True
            self.print_test("Flask installed", True)
            self.print_test("SQLAlchemy installed", True)
            self.print_test("psycopg2 installed", True)
        except ImportError as e:
            deps_ok = False
            self.print_test("Python dependencies", False, str(e))

        self.results['backend']['dependencies'] = deps_ok

        # Check main files
        run_file = backend_dir / 'run.py'
        app_init = backend_dir / 'app' / '__init__.py'

        run_ok = run_file.exists()
        app_ok = app_init.exists()

        self.print_test("run.py exists", run_ok)
        self.print_test("app/__init__.py exists", app_ok)

        self.results['backend']['main_files'] = run_ok and app_ok

        return dir_ok and req_ok and deps_ok and run_ok and app_ok

    def verify_frontend_setup(self):
        """Verify frontend setup"""
        self.print_section("Frontend Setup")

        frontend_dir = self.project_dir / 'frontend'

        # Check directory
        dir_ok = frontend_dir.exists()
        self.print_test("Frontend directory exists", dir_ok, str(frontend_dir))
        self.results['frontend']['directory'] = dir_ok

        if not dir_ok:
            return False

        # Check package.json
        pkg_file = frontend_dir / 'package.json'
        pkg_ok = pkg_file.exists()
        self.print_test("package.json exists", pkg_ok)
        self.results['frontend']['package_json'] = pkg_ok

        # Check node_modules
        nm_dir = frontend_dir / 'node_modules'
        nm_ok = nm_dir.exists()
        self.print_test("node_modules installed", nm_ok)
        self.results['frontend']['dependencies'] = nm_ok

        # Check main files
        vite_config = frontend_dir / 'vite.config.js'
        tailwind_config = frontend_dir / 'tailwind.config.js'
        src_dir = frontend_dir / 'src'

        vite_ok = vite_config.exists()
        tailwind_ok = tailwind_config.exists()
        src_ok = src_dir.exists()

        self.print_test("vite.config.js exists", vite_ok)
        self.print_test("tailwind.config.js exists", tailwind_ok)
        self.print_test("src directory exists", src_ok)

        self.results['frontend']['configuration'] = vite_ok and tailwind_ok and src_ok

        return dir_ok and pkg_ok and nm_ok and vite_ok and tailwind_ok and src_ok

    def verify_database_setup(self):
        """Verify database setup"""
        self.print_section("Database Setup")

        if not self.config_file.exists():
            self.print_test("Configuration file", False, "Run install.py first")
            self.results['database']['config'] = False
            return False

        try:
            with open(self.config_file, 'r') as f:
                config = json.load(f)
        except Exception as e:
            self.print_test("Configuration file", False, str(e))
            return False

        self.print_test("Configuration file exists", True)
        self.results['database']['config'] = True

        # Test database connection
        db_ok, message = self._test_database_connection(config)
        self.print_test("Database connection", db_ok, message)
        self.results['database']['connection'] = db_ok

        return True

    def verify_ports(self):
        """Verify that required ports are available"""
        self.print_section("Port Availability")

        ports = {
            'Backend (5000)': 5000,
            'Frontend (5173)': 5173,
            'PostgreSQL (5432)': 5432,
        }

        all_available = True
        for name, port in ports.items():
            available = self._is_port_available(port)
            self.print_test(name, available, "Available" if available else "In use")
            all_available = all_available and available

        self.results['api']['ports'] = all_available
        return all_available

    def verify_frontend_build(self):
        """Verify frontend can be built"""
        self.print_section("Frontend Build Verification")

        frontend_dir = self.project_dir / 'frontend'

        print("Running: npm run build (this may take a minute)...\n")

        result = subprocess.run(
            ['npm', 'run', 'build'],
            cwd=str(frontend_dir),
            capture_output=True,
            text=True,
            timeout=120
        )

        build_ok = result.returncode == 0
        self.print_test("Frontend build", build_ok)

        if not build_ok and result.stderr:
            print(f"\n{Colors.YELLOW}Build output:{Colors.ENDC}")
            print(result.stderr[:500])

        self.results['frontend']['build'] = build_ok
        return build_ok

    def print_summary(self):
        """Print verification summary"""
        self.print_section("Verification Summary")

        all_passed = True

        for section, tests in self.results.items():
            if not tests:
                continue

            passed = sum(1 for v in tests.values() if v is True)
            total = len([v for v in tests.values() if isinstance(v, bool)])

            if total > 0:
                section_ok = passed == total
                status = f"{Colors.GREEN}✓{Colors.ENDC}" if section_ok else f"{Colors.RED}✗{Colors.ENDC}"
                print(f"  {status} {section.capitalize()}: {passed}/{total} passed")
                all_passed = all_passed and section_ok

        print()

        if all_passed:
            print(f"{Colors.GREEN}{Colors.BOLD}✓ All checks passed! System is ready.{Colors.ENDC}\n")
        else:
            print(f"{Colors.RED}{Colors.BOLD}✗ Some checks failed. Please review above.{Colors.ENDC}\n")

        return all_passed

    def generate_report(self):
        """Generate and save verification report"""
        report_file = self.project_dir / 'verification_report.json'

        with open(report_file, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"Report saved to: {report_file}\n")

    @staticmethod
    def _check_command(name: str, cmd: List[str]) -> Tuple[bool, str]:
        """Check if a command exists and get its version"""
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                version = result.stdout.strip()
                return True, version
            return False, ""
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False, ""

    @staticmethod
    def _test_database_connection(config: Dict) -> Tuple[bool, str]:
        """Test database connection"""
        try:
            import psycopg2

            conn = psycopg2.connect(
                host=config.get('host', 'localhost'),
                port=config.get('port', 5432),
                user=config.get('user', 'postgres'),
                password=config.get('password', ''),
                database=config.get('database', 'absencehub'),
                timeout=5
            )
            conn.close()
            return True, "Connected"
        except ImportError:
            return False, "psycopg2 not installed"
        except Exception as e:
            return False, str(e)

    @staticmethod
    def _is_port_available(port: int) -> bool:
        """Check if a port is available"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            return result != 0
        except Exception:
            return False

    def run(self):
        """Run all verifications"""
        try:
            if platform.system() == 'Windows':
                Colors.disable()

            print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.ENDC}")
            print(f"{Colors.BOLD}{Colors.CYAN}AbsenceHub System Verification{Colors.ENDC}")
            print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.ENDC}")

            # Run all checks
            self.verify_system_info()
            self.verify_requirements()
            self.verify_backend_setup()
            self.verify_frontend_setup()
            self.verify_database_setup()
            self.verify_ports()

            # Optional: verify build
            if sys.argv[1:] and sys.argv[1] == '--full':
                self.verify_frontend_build()

            # Print summary
            all_passed = self.print_summary()

            # Generate report
            self.generate_report()

            return 0 if all_passed else 1

        except KeyboardInterrupt:
            print(f"\n{Colors.YELLOW}Verification cancelled by user{Colors.ENDC}")
            return 1
        except Exception as e:
            print(f"\n{Colors.RED}Verification failed: {str(e)}{Colors.ENDC}")
            import traceback
            traceback.print_exc()
            return 1


def main():
    """Main entry point"""
    verifier = SystemVerifier()
    sys.exit(verifier.run())


if __name__ == '__main__':
    main()
