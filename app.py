import eventlet
eventlet.monkey_patch()
from app import create_app
import app.db
from app.extensions import socketio

app = create_app()

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5555)
