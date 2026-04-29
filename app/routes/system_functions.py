
from flask import Blueprint, request, abort
system_bp = Blueprint("system_functions", __name__)
import subprocess

@system_bp.route('/update_server')
def webhook():
    """
    Endpoint to handle GitHub webhook for automatic updates
    """
    # Optional: Add secret token check here for security
    try:
        # Pull latest code
        subprocess.run(['git', 'pull', 'origin', 'main'], check=True)
        # Restart the systemd service to apply changes
        # Note: The 'root' user or sudoers permissions are required for this
        subprocess.run(['systemctl', 'restart', 'stimle'], check=True)
        return 'Updated successfully', 200
    except Exception as e:
        return str(e), 500
    else:
        abort(400)


