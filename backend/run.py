"""Entry point for Flask application."""
import os
import socket
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


app = create_app(os.environ.get("FLASK_ENV", "development"))

if __name__ == "__main__":
    # Try to use port 5000, but fall back to next available port if needed
    preferred_port = int(os.environ.get("FLASK_PORT", "5000"))
    port = find_available_port(preferred_port)

    if port != preferred_port:
        print(f"⚠ Port {preferred_port} is in use. Using port {port} instead.")

    print(f"Starting Flask server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=app.debug)
