from flask import request
from flask_socketio import emit
from app.extensions import socketio
from .utils.processor import handle_incoming_result
from flask_socketio import join_room

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

    @socketio.on('slave_response')
    def handle_slave_response(data):
        handle_incoming_result(data) # This updates the internal event logic for waiting threads
        # This sends it back to the browser dashboard
        emit('final_result', data, broadcast=True)
        # And we use the event logic in the background (handled in step 1)

    @socketio.on('join')
    def on_join(data):
        # This works because it is a Socket.IO event
        user_sid = request.sid #type: ignore
        print(data)
        room = data['room']
        join_room(room)
        print(f"Client {user_sid} joined room {room}")