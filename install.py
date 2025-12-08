#!/usr/bin/env python3
"""
AbsenceHub Installer
A comprehensive setup wizard for AbsenceHub on Linux, Windows, and macOS
"""

import os
import sys
import platform
import subprocess
import json
import shutil
from pathlib import Path
from typing import Dict, List, Tuple, Optional


class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

    @staticmethod
    def disable():
        """Disable colors for Windows CMD"""
        Colors.HEADER = ''
        Colors.BLUE = ''
        Colors.CYAN = ''
        Colors.GREEN = ''
        Colors.YELLOW = ''
        Colors.RED = ''
        Colors.ENDC = ''
        Colors.BOLD = ''
        Colors.UNDERLINE = ''


class SystemInfo:
    """Detect and provide system information"""

    @staticmethod
    def get_os() -> str:
        """Get operating system name"""
        system = platform.system()
        if system == 'Darwin':
            return 'macos'
        elif system == 'Windows':
            return 'windows'
        elif system == 'Linux':
            return 'linux'
        return 'unknown'

    @staticmethod
    def get_os_display() -> str:
        """Get human-readable OS name"""
        os_name = SystemInfo.get_os()
        names = {'linux': 'Linux', 'windows': 'Windows', 'macos': 'macOS'}
        return names.get(os_name, 'Unknown OS')

    @staticmethod
    def get_architecture() -> str:
        """Get system architecture"""
        return platform.machine()

    @staticmethod
    def check_command_exists(command: str) -> bool:
        """Check if a command exists in system PATH"""
        return shutil.which(command) is not None


class Logger:
    """Simple logging utility"""

    @staticmethod
    def header(text: str):
        """Print header"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.CYAN}{text.center(60)}{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.ENDC}\n")

    @staticmethod
    def section(text: str):
        """Print section header"""
        print(f"\n{Colors.BOLD}{Colors.BLUE}>>> {text}{Colors.ENDC}")

    @staticmethod
    def success(text: str):
        """Print success message"""
        print(f"{Colors.GREEN}✓ {text}{Colors.ENDC}")

    @staticmethod
    def error(text: str):
        """Print error message"""
        print(f"{Colors.RED}✗ {text}{Colors.ENDC}")

    @staticmethod
    def warning(text: str):
        """Print warning message"""
        print(f"{Colors.YELLOW}⚠ {text}{Colors.ENDC}")

    @staticmethod
    def info(text: str):
        """Print info message"""
        print(f"{Colors.CYAN}ℹ {text}{Colors.ENDC}")

    @staticmethod
    def prompt(text: str) -> str:
        """Print prompt and return user input"""
        return input(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.ENDC} ")

    @staticmethod
    def prompt_choice(text: str, options: List[str]) -> str:
        """Print choice prompt and return selected option"""
        print(f"\n{Colors.BOLD}{Colors.BLUE}{text}{Colors.ENDC}")
        for i, option in enumerate(options, 1):
            print(f"  {i}. {option}")

        while True:
            try:
                choice = int(Logger.prompt("Enter your choice (number): "))
                if 1 <= choice <= len(options):
                    return options[choice - 1]
                Logger.error(f"Please enter a number between 1 and {len(options)}")
            except ValueError:
                Logger.error("Invalid input. Please enter a number.")

    @staticmethod
    def prompt_bool(text: str, default: bool = True) -> bool:
        """Print boolean prompt"""
        default_text = "Y/n" if default else "y/N"
        response = Logger.prompt(f"{text} [{default_text}]: ").lower().strip()

        if not response:
            return default
        return response[0] == 'y'


class RequirementsChecker:
    """Check system requirements"""

    @staticmethod
    def check_python() -> Tuple[bool, str]:
        """Check Python version (3.9+)"""
        version = sys.version_info
        if version.major >= 3 and version.minor >= 9:
            return True, f"Python {version.major}.{version.minor}.{version.micro}"
        return False, f"Python {version.major}.{version.minor} (requires 3.9+)"

    @staticmethod
    def check_node() -> Tuple[bool, str]:
        """Check Node.js availability"""
        if SystemInfo.check_command_exists('node'):
            try:
                result = subprocess.run(['node', '--version'], capture_output=True, text=True, timeout=5)
                return True, result.stdout.strip()
            except Exception:
                return False, "Not found"
        return False, "Not found"

    @staticmethod
    def check_npm() -> Tuple[bool, str]:
        """Check npm availability"""
        if SystemInfo.check_command_exists('npm'):
            try:
                result = subprocess.run(['npm', '--version'], capture_output=True, text=True, timeout=5)
                return True, result.stdout.strip()
            except Exception:
                return False, "Not found"
        return False, "Not found"

    @staticmethod
    def check_docker() -> Tuple[bool, str]:
        """Check Docker availability"""
        if SystemInfo.check_command_exists('docker'):
            try:
                result = subprocess.run(['docker', '--version'], capture_output=True, text=True, timeout=5)
                return True, result.stdout.strip()
            except Exception:
                return False, "Not found"
        return False, "Not found"

    @staticmethod
    def check_git() -> Tuple[bool, str]:
        """Check Git availability"""
        if SystemInfo.check_command_exists('git'):
            try:
                result = subprocess.run(['git', '--version'], capture_output=True, text=True, timeout=5)
                return True, result.stdout.strip()
            except Exception:
                return False, "Not found"
        return False, "Not found"

    @staticmethod
    def print_requirements():
        """Print and check all requirements"""
        Logger.section("Checking System Requirements")

        requirements = {
            'Python 3.9+': RequirementsChecker.check_python(),
            'Node.js': RequirementsChecker.check_node(),
            'npm': RequirementsChecker.check_npm(),
            'Git': RequirementsChecker.check_git(),
        }

        missing = []
        for requirement, (available, version) in requirements.items():
            if available:
                Logger.success(f"{requirement}: {version}")
            else:
                Logger.warning(f"{requirement}: {version}")
                missing.append(requirement)

        docker_available, docker_version = RequirementsChecker.check_docker()
        if docker_available:
            Logger.success(f"Docker (optional): {docker_version}")
        else:
            Logger.info("Docker (optional): Not found - required only for Docker setup")

        return len(missing) == 0, missing


class DatabaseConfig:
    """Database configuration management"""

    def __init__(self):
        self.type: str = 'docker'  # 'docker' or 'external'
        self.host: str = 'localhost'
        self.port: int = 5432
        self.user: str = 'postgres'
        self.password: str = 'postgres'
        self.database: str = 'absencehub'

    def prompt_setup_type(self):
        """Prompt user for database setup type"""
        Logger.section("Database Setup Type")

        setup_type = Logger.prompt_choice(
            "How would you like to set up the database?",
            ["Use Docker (easiest)", "Connect to External PostgreSQL Server"]
        )

        self.type = 'docker' if setup_type == "Use Docker (easiest)" else 'external'

    def prompt_docker_config(self):
        """Prompt for Docker configuration"""
        Logger.section("Docker Database Configuration")

        self.database = Logger.prompt("Database name [absencehub]: ") or "absencehub"
        self.user = Logger.prompt("Database user [postgres]: ") or "postgres"
        self.password = Logger.prompt("Database password [postgres]: ") or "postgres"

        Logger.info(f"Docker will use port 5432 and create a PostgreSQL container")

    def prompt_external_config(self):
        """Prompt for external database configuration"""
        Logger.section("External PostgreSQL Server Configuration")

        self.host = Logger.prompt("Database host [localhost]: ") or "localhost"

        port_str = Logger.prompt("Database port [5432]: ") or "5432"
        try:
            self.port = int(port_str)
        except ValueError:
            Logger.warning("Invalid port number, using 5432")
            self.port = 5432

        self.user = Logger.prompt("Database user [postgres]: ") or "postgres"
        self.password = Logger.prompt("Database password: ")
        self.database = Logger.prompt("Database name [absencehub]: ") or "absencehub"

    def test_connection(self) -> Tuple[bool, str]:
        """Test database connection with UTF-8 handling for WSL"""
        Logger.section("Testing Database Connection")

        # Set UTF-8 environment variables for this process
        import locale
        env_backup = {}
        try:
            # Backup and set UTF-8 environment
            for var in ['LC_ALL', 'LANG', 'LANGUAGE']:
                env_backup[var] = os.environ.get(var)
                os.environ[var] = 'C.UTF-8'

            # Set Python's default encoding
            if hasattr(locale, 'getpreferredencoding'):
                locale.getpreferredencoding = lambda: 'UTF-8'

            import psycopg2
            from psycopg2 import extensions

            # Force UTF-8 encoding for the connection with error handling
            conn = psycopg2.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database='postgres',  # Connect to default database first
                client_encoding='UTF8'
            )

            # Set connection encoding
            conn.set_client_encoding('UTF8')

            # Test query
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            cursor.fetchone()
            cursor.close()
            conn.close()

            Logger.success("Database connection successful!")
            return True, "Connection successful"

        except ImportError:
            Logger.error("psycopg2 not installed. Installing...")
            subprocess.run([sys.executable, '-m', 'pip', 'install', 'psycopg2-binary'], check=False)
            return self.test_connection()

        except (UnicodeDecodeError, UnicodeEncodeError) as e:
            # Encoding error - try alternative approach
            Logger.warning(f"Encoding issue detected: {type(e).__name__}")
            return self._test_connection_alternative()

        except Exception as e:
            error_msg = str(e)
            # Check if it's an encoding-related exception message
            if 'utf-8' in error_msg.lower() or 'codec' in error_msg.lower():
                Logger.warning("Encoding error in error message itself")
                return self._test_connection_alternative()
            Logger.error(f"Connection failed: {error_msg}")
            return False, error_msg

        finally:
            # Restore environment variables
            for var, value in env_backup.items():
                if value is None:
                    os.environ.pop(var, None)
                else:
                    os.environ[var] = value

    def _test_connection_alternative(self) -> Tuple[bool, str]:
        """Alternative connection test using docker exec"""
        Logger.info("Trying alternative connection method...")

        try:
            # If using docker, test via docker exec
            if self.type == 'docker' and self.host == 'localhost':
                result = subprocess.run(
                    ['docker', 'exec', 'absencehub_db',
                     'psql', '-U', self.user, '-d', 'postgres',
                     '-c', 'SELECT 1;'],
                    capture_output=True,
                    text=True,
                    timeout=5,
                    env={'LANG': 'C', 'LC_ALL': 'C'}
                )

                if result.returncode == 0:
                    Logger.success("Database connection verified via docker exec!")
                    return True, "Connection successful (via docker)"
                else:
                    Logger.error(f"Docker exec test failed: {result.stderr}")
                    return False, "Docker exec failed"
            else:
                # For external database, encoding issue is more serious
                Logger.error("Cannot verify external database with encoding issues")
                return False, "Encoding error with external database"

        except Exception as e:
            Logger.error(f"Alternative test failed: {str(e)}")
            return False, str(e)

    def to_dict(self) -> Dict:
        """Convert config to dictionary"""
        return {
            'type': self.type,
            'host': self.host,
            'port': self.port,
            'user': self.user,
            'password': self.password,
            'database': self.database,
        }


class Installer:
    """Main installer class"""

    def __init__(self):
        self.project_dir = Path(__file__).parent
        self.db_config = DatabaseConfig()
        self.config_file = self.project_dir / '.env.installer'

    def run(self):
        """Run the complete installation"""
        try:
            # Set UTF-8 environment for WSL/Linux compatibility
            for var in ['LC_ALL', 'LANG', 'LANGUAGE']:
                if not os.environ.get(var) or 'UTF' not in os.environ.get(var, ''):
                    os.environ[var] = 'C.UTF-8'

            # Disable colors on Windows CMD
            if SystemInfo.get_os() == 'windows':
                Colors.disable()

            Logger.header(f"AbsenceHub Installer - {SystemInfo.get_os_display()}")
            Logger.info(f"System: {SystemInfo.get_os_display()} ({SystemInfo.get_architecture()})")
            Logger.info(f"Python: {platform.python_version()}")

            # Check requirements
            requirements_ok, missing = RequirementsChecker.print_requirements()
            if not requirements_ok:
                Logger.error("\nPlease install the following requirements:")
                for req in missing:
                    print(f"  - {req}")
                sys.exit(1)

            # Database setup
            self.db_config.prompt_setup_type()

            if self.db_config.type == 'docker':
                self.db_config.prompt_docker_config()
            else:
                self.db_config.prompt_external_config()

            # Test connection
            if self.db_config.type == 'external':
                connection_ok, message = self.db_config.test_connection()
                if not connection_ok:
                    retry = Logger.prompt_bool("Connection failed. Try again?")
                    if retry:
                        self.db_config.prompt_external_config()
                        self.db_config.test_connection()
                    else:
                        Logger.error("Aborting installation")
                        sys.exit(1)

            # Save configuration
            self.save_config()

            # Setup backend
            self.setup_backend()

            # Setup frontend
            self.setup_frontend()

            # Setup database
            if self.db_config.type == 'docker':
                self.setup_docker_database()

            # Create database and run migrations
            self.setup_database()

            # Insert seed data
            self.insert_seed_data()

            # Print completion message
            self.print_completion_message()

        except KeyboardInterrupt:
            print(f"\n{Colors.YELLOW}Installation cancelled by user{Colors.ENDC}")
            sys.exit(0)
        except Exception as e:
            Logger.error(f"Installation failed: {str(e)}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

    def save_config(self):
        """Save configuration to file"""
        Logger.section("Saving Configuration")

        config = self.db_config.to_dict()
        with open(self.config_file, 'w') as f:
            json.dump(config, f, indent=2)

        Logger.success(f"Configuration saved to {self.config_file}")

    def setup_backend(self):
        """Setup backend dependencies with fallback strategies for Python 3.13 compatibility"""
        Logger.section("Setting up Backend")

        backend_dir = self.project_dir / 'backend'
        if not backend_dir.exists():
            Logger.error("Backend directory not found")
            return

        # Install Python dependencies
        Logger.info("Installing Python dependencies...")
        requirements_file = backend_dir / 'requirements.txt'

        if requirements_file.exists():
            # Strategy 1: Standard pip install
            Logger.info("Attempting standard installation...")
            result = self._try_pip_install(backend_dir, requirements_file)

            if result['success']:
                Logger.success("Backend dependencies installed")
                return

            # Strategy 2: Try with --only-binary flag for pre-built wheels
            Logger.warning("Standard installation failed, trying pre-built wheels only...")
            result = self._try_pip_install(
                backend_dir,
                requirements_file,
                extra_args=['--only-binary', ':all:']
            )

            if result['success']:
                Logger.success("Backend dependencies installed with pre-built wheels")
                return

            # Strategy 3: Try allowing compilation with environment variables
            Logger.warning("Pre-built wheels failed, attempting compilation...")
            result = self._try_pip_install(
                backend_dir,
                requirements_file,
                allow_compilation=True
            )

            if result['success']:
                Logger.success("Backend dependencies installed with compilation")
                return

            # Strategy 4: macOS-specific handling for M1/M2
            if SystemInfo.get_os() == 'macos' and SystemInfo.get_architecture() == 'arm64':
                Logger.warning("macOS ARM64 detected. Attempting architecture-specific installation...")
                result = self._try_macos_arm64_install(backend_dir, requirements_file)

                if result['success']:
                    Logger.success("Backend dependencies installed with macOS-specific configuration")
                    return

            # Strategy 5: Final attempt - install without psycopg2, guide user
            Logger.warning("All standard installation methods failed.")
            self._handle_installation_failure(backend_dir, requirements_file, result)
        else:
            Logger.warning("requirements.txt not found")

    def _try_pip_install(self, backend_dir, requirements_file, extra_args=None, allow_compilation=False):
        """
        Attempt pip installation with optional flags.

        Args:
            backend_dir: Path to backend directory
            requirements_file: Path to requirements.txt
            extra_args: Additional pip arguments
            allow_compilation: If True, allow compilation from source

        Returns:
            dict: {'success': bool, 'stdout': str, 'stderr': str}
        """
        cmd = [sys.executable, '-m', 'pip', 'install']

        if extra_args:
            cmd.extend(extra_args)

        if not allow_compilation:
            cmd.extend(['--prefer-binary'])

        cmd.extend(['-r', str(requirements_file)])

        try:
            result = subprocess.run(
                cmd,
                cwd=str(backend_dir),
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )

            return {
                'success': result.returncode == 0,
                'stdout': result.stdout,
                'stderr': result.stderr
            }
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'stdout': '',
                'stderr': 'Installation timed out after 5 minutes'
            }
        except Exception as e:
            return {
                'success': False,
                'stdout': '',
                'stderr': str(e)
            }

    def _try_macos_arm64_install(self, backend_dir, requirements_file):
        """
        macOS ARM64 (M1/M2) specific installation strategy.

        Args:
            backend_dir: Path to backend directory
            requirements_file: Path to requirements.txt

        Returns:
            dict: {'success': bool, 'stdout': str, 'stderr': str}
        """
        # Set environment variables for ARM64 compilation
        env = os.environ.copy()
        env['ARCHFLAGS'] = '-arch arm64'
        env['LDFLAGS'] = '-L/opt/homebrew/lib'
        env['CPPFLAGS'] = '-I/opt/homebrew/include'

        cmd = [
            sys.executable, '-m', 'pip', 'install',
            '--no-cache-dir',
            '-r', str(requirements_file)
        ]

        try:
            result = subprocess.run(
                cmd,
                cwd=str(backend_dir),
                capture_output=True,
                text=True,
                env=env,
                timeout=300
            )

            return {
                'success': result.returncode == 0,
                'stdout': result.stdout,
                'stderr': result.stderr
            }
        except Exception as e:
            return {
                'success': False,
                'stdout': '',
                'stderr': str(e)
            }

    def _handle_installation_failure(self, backend_dir, requirements_file, last_result):
        """
        Handle installation failure with user guidance.

        Args:
            backend_dir: Path to backend directory
            requirements_file: Path to requirements.txt
            last_result: Result from last installation attempt
        """
        Logger.error("Failed to install backend dependencies")
        Logger.info("\nError Details:")
        Logger.info(last_result['stderr'][:500])  # Show first 500 chars of error

        os_name = SystemInfo.get_os()

        if os_name == 'macos':
            Logger.warning("\nFor macOS, you may need to install Xcode Command Line Tools:")
            Logger.info("  1. Run: xcode-select --install")
            Logger.info("  2. Then retry installation: python3 install.py")
            Logger.info("  3. Or use external PostgreSQL (skip Docker option)")
            Logger.info("\nAlternative: Install Python 3.11 or 3.12 (more compatible)")
        elif os_name == 'windows':
            Logger.warning("\nFor Windows, you may need Visual C++ Build Tools:")
            Logger.info("  1. Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/")
            Logger.info("  2. Install 'Desktop development with C++'")
            Logger.info("  3. Then retry installation: python install.py")
        else:  # Linux
            Logger.warning("\nFor Linux, you may need to install build tools:")
            Logger.info("  Ubuntu/Debian: sudo apt-get install python3-dev")
            Logger.info("  CentOS/RHEL: sudo yum install python3-devel")
            Logger.info("  Then retry installation: python3 install.py")

        Logger.warning("\nYou can continue with:")
        Logger.info("  - External PostgreSQL database (skip Docker)")
        Logger.info("  - Manual backend setup after resolving dependencies")

        user_input = input("\nContinue anyway? (y/n): ").strip().lower()
        if user_input != 'y':
            Logger.error("Installation cancelled")
            sys.exit(1)

    def setup_frontend(self):
        """Setup frontend dependencies"""
        Logger.section("Setting up Frontend")

        frontend_dir = self.project_dir / 'frontend'
        if not frontend_dir.exists():
            Logger.error("Frontend directory not found")
            return

        # Install npm dependencies
        Logger.info("Installing npm dependencies (this may take a few minutes)...")
        result = subprocess.run(
            ['npm', 'install'],
            cwd=str(frontend_dir),
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            Logger.success("Frontend dependencies installed")
        else:
            Logger.error(f"Failed to install frontend dependencies: {result.stderr}")

    def setup_docker_database(self):
        """Setup Docker database container using docker-compose"""
        Logger.section("Setting up Docker Database")

        Logger.info("Checking Docker...")
        docker_available, _ = RequirementsChecker.check_docker()

        if not docker_available:
            Logger.error("Docker is not available. Please install Docker first.")
            sys.exit(1)

        # Check if Docker daemon is running
        Logger.info("Checking if Docker daemon is running...")
        if not self._check_docker_daemon():
            Logger.error("Docker daemon is not running!")
            self._handle_docker_daemon_error()
            return

        # Check if docker-compose is available
        docker_compose_cmd = self._get_docker_compose_command()
        if not docker_compose_cmd:
            Logger.warning("docker-compose not found, falling back to docker run...")
            self._setup_docker_database_fallback()
            return

        Logger.info("Using docker-compose to set up PostgreSQL...")

        # Update database config to match docker-compose.yml defaults
        self.db_config.user = 'absencehub'
        self.db_config.password = 'password'
        self.db_config.database = 'absencehub_dev'
        self.db_config.host = 'localhost'
        self.db_config.port = 5432

        # Start PostgreSQL service using docker-compose
        result = subprocess.run(
            docker_compose_cmd + ['up', '-d', 'postgres'],
            cwd=str(self.project_dir),
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            Logger.success("PostgreSQL Docker container created and started")
            Logger.info("Waiting for database to be ready...")

            # Wait for database to be ready
            import time
            for i in range(30):
                time.sleep(1)
                conn_ok, _ = self.db_config.test_connection()
                if conn_ok:
                    Logger.success("Database is ready")
                    return
                if (i + 1) % 5 == 0:
                    Logger.info(f"Still waiting... ({i + 1}s)")

            Logger.warning("Database connection verification timed out, proceeding anyway...")
        else:
            # Check if it's a daemon issue or another error
            if 'daemon' in result.stderr.lower() or 'Cannot connect' in result.stderr:
                Logger.error("Docker daemon is not running!")
                self._handle_docker_daemon_error()
            else:
                Logger.error(f"Failed to start Docker container: {result.stderr}")
                Logger.info("Attempting fallback method...")
                self._setup_docker_database_fallback()

    def _get_docker_compose_command(self):
        """Get the appropriate docker-compose command"""
        # Try docker compose (v2 - plugin)
        if SystemInfo.check_command_exists('docker'):
            result = subprocess.run(
                ['docker', 'compose', 'version'],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                return ['docker', 'compose']

        # Try docker-compose (v1 - standalone)
        if SystemInfo.check_command_exists('docker-compose'):
            return ['docker-compose']

        return None

    def _setup_docker_database_fallback(self):
        """Fallback method using docker run directly"""
        Logger.info("Creating PostgreSQL Docker container using docker run...")

        # Stop and remove existing container if it exists
        subprocess.run(
            ['docker', 'stop', 'absencehub_db'],
            capture_output=True
        )
        subprocess.run(
            ['docker', 'rm', 'absencehub_db'],
            capture_output=True
        )

        # Create new container
        result = subprocess.run([
            'docker', 'run',
            '-d',
            '--name', 'absencehub_db',
            '-e', f'POSTGRES_USER={self.db_config.user}',
            '-e', f'POSTGRES_PASSWORD={self.db_config.password}',
            '-e', f'POSTGRES_DB={self.db_config.database}',
            '-e', 'POSTGRES_INITDB_ARGS=--encoding=UTF8 --locale=C',
            '-e', 'LC_ALL=C.UTF-8',
            '-e', 'LANG=C.UTF-8',
            '-p', '5432:5432',
            '--restart', 'unless-stopped',
            'postgres:15-alpine'
        ], capture_output=True, text=True)

        if result.returncode == 0:
            Logger.success("PostgreSQL Docker container created and started")
            Logger.info("Waiting for database to be ready...")

            # Wait for database to be ready
            import time
            for i in range(30):
                time.sleep(1)
                conn_ok, _ = self.db_config.test_connection()
                if conn_ok:
                    Logger.success("Database is ready")
                    return
                if (i + 1) % 5 == 0:
                    Logger.info(f"Still waiting... ({i + 1}s)")

            Logger.warning("Database connection verification timed out, proceeding anyway...")
        else:
            Logger.error(f"Failed to create Docker container: {result.stderr}")

    def _check_docker_daemon(self) -> bool:
        """Check if Docker daemon is running"""
        try:
            result = subprocess.run(
                ['docker', 'ps'],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception:
            return False

    def _handle_docker_daemon_error(self):
        """Handle Docker daemon not running error"""
        os_name = SystemInfo.get_os()

        Logger.warning("\nDocker daemon is not running. Options:")
        Logger.info("  1. Start Docker Desktop and retry installation")
        Logger.info("  2. Use external PostgreSQL database instead")
        Logger.info("  3. Cancel installation")

        if os_name == 'macos':
            Logger.warning("\nOn macOS, start Docker with:")
            Logger.info("  1. Open Docker.app from Applications folder")
            Logger.info("  2. Or use: open -a Docker")
            Logger.info("  3. Wait for Docker daemon to start (~30 seconds)")
            Logger.info("  4. Then retry: python3 install.py")

        elif os_name == 'windows':
            Logger.warning("\nOn Windows, start Docker with:")
            Logger.info("  1. Start Docker Desktop from Start Menu")
            Logger.info("  2. Or use: & 'C:\\Program Files\\Docker\\Docker\\Docker.exe'")
            Logger.info("  3. Wait for Docker daemon to start (~1 minute)")
            Logger.info("  4. Then retry: python install.py")

        else:  # linux
            Logger.warning("\nOn Linux, start Docker with:")
            Logger.info("  sudo systemctl start docker")
            Logger.info("  Then retry: python3 install.py")

        Logger.warning("\nAlternatively, use external PostgreSQL:")
        Logger.info("  1. Have PostgreSQL 13+ running on your system")
        Logger.info("  2. Run installer again: python3 install.py")
        Logger.info("  3. Choose: 'Connect to External PostgreSQL Server'")
        Logger.info("  4. Enter connection details")

        user_input = input("\nContinue anyway? (y/n): ").strip().lower()
        if user_input != 'y':
            Logger.error("Installation cancelled due to Docker daemon issue")
            sys.exit(1)

    def setup_database(self):
        """Setup database schema and migrations"""
        Logger.section("Setting up Database Schema")

        backend_dir = self.project_dir / 'backend'

        try:
            # Create database if not using Docker
            if self.db_config.type == 'external':
                Logger.info("Creating database...")
                self.create_database()

            # Check if tables already exist
            Logger.info("Checking for existing tables...")
            tables_exist = self.check_tables_exist(backend_dir)

            if tables_exist:
                Logger.warning("Database tables already exist!")
                Logger.info("Existing tables: employee_absence, audit_log")

                recreate = Logger.prompt_bool(
                    "Do you want to drop existing tables and create new ones?",
                    default=False
                )

                if recreate:
                    # Backup existing data
                    backup_file = self.backup_database_data(backend_dir)
                    if backup_file:
                        Logger.success(f"Data backed up to: {backup_file}")

                    # Drop existing tables
                    Logger.info("Dropping existing tables...")
                    self.drop_tables(backend_dir)
                    Logger.success("Tables dropped")
                else:
                    Logger.info("Keeping existing tables. Skipping table creation.")
                    return

            # Create all tables using db.create_all()
            Logger.info("Creating database tables...")
            result = subprocess.run(
                [sys.executable, '-c',
                 'from app import create_app, db; '
                 'from app.models.absence import EmployeeAbsence; '
                 'from app.models.audit_log import AuditLog; '
                 'app = create_app(); '
                 'with app.app_context(): db.create_all(); '
                 'print("Tables created successfully")'],
                cwd=str(backend_dir),
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                Logger.success("Database tables created (EmployeeAbsence, AuditLog)")
                if result.stdout:
                    Logger.info(result.stdout.strip())
            else:
                Logger.warning(f"Database table creation may have issues: {result.stderr}")

        except Exception as e:
            Logger.warning(f"Database setup encountered an issue: {str(e)}")


    def check_tables_exist(self, backend_dir):
        """Check if database tables already exist"""
        try:
            result = subprocess.run(
                [sys.executable, '-c',
                 'from app import create_app, db; '
                 'app = create_app(); '
                 'with app.app_context(): '
                 '    from sqlalchemy import inspect; '
                 '    inspector = inspect(db.engine); '
                 '    tables = inspector.get_table_names(); '
                 '    print("employee_absence" in tables or "audit_log" in tables)'],
                cwd=str(backend_dir),
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode == 0:
                return 'True' in result.stdout
            return False
        except Exception:
            return False

    def backup_database_data(self, backend_dir):
        """Backup database data to JSON file"""
        try:
            from datetime import datetime
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_file = self.project_dir / f'database_backup_{timestamp}.json'

            Logger.info("Backing up database data...")

            backup_script = f"""
import json
from app import create_app, db
from app.models.absence import EmployeeAbsence
from app.models.audit_log import AuditLog

app = create_app()

with app.app_context():
    # Backup absences
    absences = EmployeeAbsence.query.all()
    absences_data = [{{
        'id': a.id,
        'service_account': a.service_account,
        'employee_fullname': a.employee_fullname,
        'absence_type': a.absence_type,
        'start_date': str(a.start_date),
        'end_date': str(a.end_date),
        'is_half_day': a.is_half_day,
        'created_at': str(a.created_at) if a.created_at else None,
        'updated_at': str(a.updated_at) if a.updated_at else None
    }} for a in absences]

    # Backup audit logs
    audit_logs = AuditLog.query.all()
    audit_data = [{{
        'id': log.id,
        'table_name': log.table_name,
        'entity_id': log.entity_id,
        'action': log.action,
        'old_values': log.old_values,
        'new_values': log.new_values,
        'timestamp': str(log.timestamp) if log.timestamp else None,
        'description': log.description
    }} for log in audit_logs]

    # Save to JSON
    backup = {{
        'backup_timestamp': '{timestamp}',
        'absences': absences_data,
        'audit_logs': audit_data,
        'total_absences': len(absences_data),
        'total_audit_logs': len(audit_data)
    }}

    with open(str('{backup_file}'), 'w', encoding='utf-8') as f:
        json.dump(backup, f, indent=2, ensure_ascii=False)

    print(f'Backup completed: {{len(absences_data)}} absences, {{len(audit_data)}} audit logs')
"""

            result = subprocess.run(
                [sys.executable, '-c', backup_script],
                cwd=str(backend_dir),
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0 and backup_file.exists():
                Logger.info(result.stdout.strip())
                return backup_file
            else:
                Logger.warning(f"Backup may have failed: {result.stderr}")
                return None

        except Exception as e:
            Logger.warning(f"Backup failed: {str(e)}")
            return None

    def drop_tables(self, backend_dir):
        """Drop all database tables"""
        try:
            result = subprocess.run(
                [sys.executable, '-c',
                 'from app import create_app, db; '
                 'from app.models.absence import EmployeeAbsence; '
                 'from app.models.audit_log import AuditLog; '
                 'app = create_app(); '
                 'with app.app_context(): db.drop_all(); '
                 'print("All tables dropped")'],
                cwd=str(backend_dir),
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                return True
            else:
                Logger.warning(f"Drop tables may have failed: {result.stderr}")
                return False
        except Exception as e:
            Logger.warning(f"Drop tables failed: {str(e)}")
            return False

    def create_database(self):
        """Create database on external server"""
        try:
            # Set UTF-8 environment
            env_backup = {}
            for var in ['LC_ALL', 'LANG', 'LANGUAGE']:
                env_backup[var] = os.environ.get(var)
                os.environ[var] = 'C.UTF-8'

            import psycopg2
            from psycopg2 import sql

            conn = psycopg2.connect(
                host=self.db_config.host,
                port=self.db_config.port,
                user=self.db_config.user,
                password=self.db_config.password,
                database='postgres',
                client_encoding='UTF8'
            )
            conn.set_client_encoding('UTF8')
            conn.autocommit = True
            cursor = conn.cursor()

            # Check if database exists
            cursor.execute(
                "SELECT 1 FROM pg_database WHERE datname = %s",
                (self.db_config.database,)
            )
            exists = cursor.fetchone()

            if not exists:
                cursor.execute(sql.SQL("CREATE DATABASE {}").format(
                    sql.Identifier(self.db_config.database)
                ))
                Logger.success(f"Database '{self.db_config.database}' created")
            else:
                Logger.success(f"Database '{self.db_config.database}' already exists")

            cursor.close()
            conn.close()

            # Restore environment
            for var, value in env_backup.items():
                if value is None:
                    os.environ.pop(var, None)
                else:
                    os.environ[var] = value

        except Exception as e:
            error_msg = str(e) if 'utf-8' not in str(e).lower() else "Database creation error (encoding issue)"
            Logger.warning(f"Could not create database: {error_msg}")

    def insert_seed_data(self):
        """Insert sample data into database"""
        Logger.section("Inserting Sample Data")

        if not Logger.prompt_bool("Insert sample data?", default=True):
            Logger.info("Skipping sample data insertion")
            return

        backend_dir = self.project_dir / 'backend'

        try:
            Logger.info("Inserting sample absences...")
            result = subprocess.run(
                [sys.executable, '-m', 'app.utils.seed_data'],
                cwd=str(backend_dir),
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                Logger.success("Sample data inserted successfully")
            else:
                # Try alternative method
                Logger.info("Using alternative data insertion method...")
                seed_script = Path(__file__).parent / 'backend' / 'seed_data.py'
                if seed_script.exists():
                    result = subprocess.run(
                        [sys.executable, str(seed_script)],
                        cwd=str(backend_dir),
                        capture_output=True,
                        text=True,
                        timeout=30
                    )
                    if result.returncode == 0:
                        Logger.success("Sample data inserted successfully")
                    else:
                        Logger.warning("Sample data insertion skipped")
                else:
                    Logger.warning("Seed data script not found")

        except Exception as e:
            Logger.warning(f"Sample data insertion failed: {str(e)}")

    def print_completion_message(self):
        """Print installation completion message"""
        Logger.header("Installation Complete!")

        print(f"\n{Colors.GREEN}AbsenceHub has been successfully installed!{Colors.ENDC}\n")

        print(f"{Colors.BOLD}To start the application:{Colors.ENDC}\n")

        print(f"  {Colors.CYAN}1. Start the Backend:{Colors.ENDC}")
        print(f"     cd backend")
        print(f"     python run.py\n")

        print(f"  {Colors.CYAN}2. Start the Frontend (in a new terminal):{Colors.ENDC}")
        print(f"     cd frontend")
        print(f"     npm run dev\n")

        print(f"  {Colors.CYAN}3. Open your browser:{Colors.ENDC}")
        print(f"     http://localhost:5173\n")

        if self.db_config.type == 'docker':
            print(f"{Colors.BOLD}Docker Database Commands:{Colors.ENDC}")
            print(f"  Stop:    docker-compose stop postgres")
            print(f"  Start:   docker-compose start postgres")
            print(f"  Restart: docker-compose restart postgres")
            print(f"  Logs:    docker-compose logs -f postgres\n")

        print(f"{Colors.BOLD}Database Configuration:{Colors.ENDC}")
        print(f"  Host: {self.db_config.host}")
        print(f"  Port: {self.db_config.port}")
        print(f"  Database: {self.db_config.database}")
        print(f"  User: {self.db_config.user}\n")

        print(f"{Colors.CYAN}Configuration saved to: {self.config_file}{Colors.ENDC}\n")


def main():
    """Main entry point"""
    installer = Installer()
    installer.run()


if __name__ == '__main__':
    main()
