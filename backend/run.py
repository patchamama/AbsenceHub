"""Entry point for Flask application."""
import os
import sys
import socket
from pathlib import Path

# Force UTF-8 encoding for WSL2 compatibility
os.environ.setdefault('LC_ALL', 'C.UTF-8')
os.environ.setdefault('LANG', 'C.UTF-8')
os.environ.setdefault('LANGUAGE', 'C.UTF-8')

# Set Python's default encoding to UTF-8
if sys.version_info >= (3, 7):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from app import create_app


def find_available_port(preferred_port: int = 5000, max_attempts: int = 10) -> int:
    """Find an available port starting from preferred_port"""
    for port in range(preferred_port, preferred_port + max_attempts):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('127.0.0.1', port))
            sock.close()
            if result != 0:  # Port is available
                return port
        except Exception:
            continue
    return preferred_port  # Return preferred if all else fails


def save_port_info(port: int):
    """Save the current port to a file for frontend discovery"""
    project_root = Path(__file__).parent.parent
    port_file = project_root / '.backend-port'
    try:
        with open(port_file, 'w') as f:
            f.write(f"{port}\n")
    except Exception as e:
        print(f"Warning: Could not save port info: {e}")


app = create_app(os.environ.get("FLASK_ENV", "development"))

if __name__ == "__main__":
    # Try to use port 5000, but fall back to next available port if needed
    preferred_port = int(os.environ.get("FLASK_PORT", "5000"))
    port = find_available_port(preferred_port)

    if port != preferred_port:
        print(f"⚠  Port {preferred_port} is in use. Using port {port} instead.")

    # Save port info for frontend
    save_port_info(port)

    print(f"✓ Flask backend running on http://localhost:{port}")
    print(f"✓ API endpoints available at http://localhost:{port}/api")

    app.run(host="0.0.0.0", port=port, debug=app.debug)
