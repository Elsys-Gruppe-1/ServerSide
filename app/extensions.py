from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*", ping_timeout=20, ping_interval=10, max_http_buffer_size=64 * 1024 * 1024)