from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*", ping_timeout=20, ping_interval=10)