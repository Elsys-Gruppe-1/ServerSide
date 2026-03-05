from flask import request
from flask_socketio import SocketIO, emit

socketio = SocketIO(cors_allowed_origins="*")
connected_slaves = set()

def get_active_slaves_count():
    """Returns the current number of connected processing units."""
    return len(connected_slaves)

def init_socket_events():
    @socketio.on('register_slave')
    def handle_register():
        connected_slaves.add(request.sid) #type: ignore
        emit('slave_count_update', {'count': len(connected_slaves)}, broadcast=True)

    @socketio.on('disconnect')
    def handle_disconnect():
        if request.sid in connected_slaves: #type: ignore
            connected_slaves.remove(request.sid) #type: ignore
            emit('slave_count_update', {'count': len(connected_slaves)}, broadcast=True)

    # --- THIS IS THE CRITICAL ADDITION ---
    @socketio.on('slave_response')
    def handle_slave_response(data):
        # This sends it back to the browser dashboard
        emit('final_result', data, broadcast=True)
        # And we use the event logic in the background (handled in step 1)